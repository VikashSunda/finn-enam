"""Reproducible public-data snapshot. Never inserts synthetic financial facts.

Screener is used ONLY to discover primary documents, not as research evidence.
Run: python scripts/collect.py [--tickers INFY TCS ITC MARUTI]
Requires PyMuPDF (pip install pymupdf). Downloads remain in ignored .cache/.
"""
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import html
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
CACHE.mkdir(exist_ok=True)
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bseindia.com/'}


def fetch(url, limit=24_000_000):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as res:
        data = res.read(limit + 1)
    if len(data) > limit:
        raise ValueError('Document exceeds snapshot size limit')
    return data


def clean(s):
    return html.unescape(re.sub('<[^>]+>', ' ', s)).strip()


def discover(ticker):
    url = 'https://www.screener.in/company/' + urllib.parse.quote(ticker) + '/consolidated/'
    raw = fetch(url).decode()
    docs = []
    annual = raw.split('<h3>Annual reports</h3>', 1)
    if len(annual) > 1:
        for u, label in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)</a>', annual[1].split('</ul>', 1)[0]):
            if 'Annual Report' in clean(label):
                docs.append({'type': 'annual_report', 'label': clean(label), 'url': html.unescape(u)})
                break
    for li in re.findall(r'<li\b[^>]*>([\s\S]*?)</li>', raw):
        if 'Raw Transcript' not in li:
            continue
        links = re.findall(r'<a\b([^>]+)>([\s\S]*?)</a>', li)
        for attrs, label in links:
            if 'Raw Transcript' in attrs:
                u = re.search(r'href="([^"]+)"', attrs)
                month = re.search(r'>([A-Z][a-z]{2} \d{4})</div>', li)
                if u:
                    docs.append({'type': 'transcript', 'label': 'Earnings call · ' + (month[1] if month else 'date unverified'), 'url': html.unescape(u[1])})
                break
        if sum(d['type'] == 'transcript' for d in docs) == 4:
            break
    if ticker == 'INFY':
        # Company-hosted equivalent of the latest linked annual report.
        for d in docs:
            if d['type'] == 'annual_report' and '2026' in d['label']:
                d['url'] = 'https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/infosys-ar-26.pdf'
    try:
        anns = json.loads(fetch('https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=' + urllib.parse.quote(ticker)))
        transcripts = []
        for row in anns:
            text = str(row.get('attchmntText') or '')
            if row.get('symbol') != ticker or not re.search('transcript', text, re.I) or re.search('agm|annual general|investor day|ai day', text, re.I):
                continue
            transcripts.append({'type': 'transcript', 'label': 'Earnings call · ' + str(row.get('sort_date') or row.get('an_dt'))[:10], 'url': row['attchmntFile']})
            if len(transcripts) == 4:
                break
        if transcripts:
            docs = [d for d in docs if d['type'] == 'annual_report'] + transcripts
    except Exception:
        pass
    return docs


def parse_doc(doc):
    import fitz
    source = doc['url']
    match = re.search(r'Pname=([^&]+)', source, re.I)
    download = 'https://www.bseindia.com/xml-data/corpfiling/AttachHis/' + match[1] if match else source
    key = hashlib.sha256(source.encode()).hexdigest()[:20]
    file = CACHE / (key + '.pdf')
    try:
        if not file.exists():
            data = fetch(download)
            if not data.startswith(b'%PDF') and match:
                data = fetch(download.replace('/AttachHis/', '/AttachLive/'))
            if not data.startswith(b'%PDF'):
                raise ValueError('Source did not return a PDF')
            file.write_bytes(data)
        pdf = fitz.open(file)
        pages = []
        for i, page in enumerate(pdf):
            text = re.sub(r'\s+', ' ', page.get_text()).strip()
            if len(text) >= 80:
                pages.append({'page': i + 1, 'text': text[:16000]})
        if doc['type'] == 'transcript' and len(pdf) <= 2 and re.search(r'(?:uploaded|available).{0,100}(?:website|link)|below link', ' '.join(p['text'] for p in pages), re.I):
            return {**doc, 'id': key, 'pages': [], 'status': 'link_notice', 'error': 'Filing is a link notice, not the transcript itself.'}
        return {**doc, 'id': key, 'pages': pages, 'pageCount': len(pdf), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'status': 'parsed' if pages else 'no_text'}
    except Exception as exc:
        return {**doc, 'id': key, 'pages': [], 'status': 'unavailable', 'error': str(exc)}


def research(ticker):
    try:
        docs = discover(ticker)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            parsed = list(pool.map(parse_doc, docs))
        print(ticker, [(d['label'], d['status'], len(d['pages'])) for d in parsed], flush=True)
        return ticker, {'ticker': ticker, 'documents': parsed, 'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat()}
    except Exception as exc:
        print(ticker, str(exc), flush=True)
        return ticker, {'ticker': ticker, 'documents': [], 'error': str(exc)}


def market(company):
    ticker = company['ticker']
    errors = []
    for host in ['query1', 'query2']:
        try:
            url = f'https://{host}.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(ticker)}.NS?range=3mo&interval=1d'
            raw = json.loads(fetch(url))['chart']['result'][0]
            q = raw['indicators']['quote'][0]
            bars = [{'date': dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime('%Y-%m-%d'), 'close': q['close'][i], 'volume': q['volume'][i]} for i, t in enumerate(raw['timestamp']) if q['close'][i] is not None and q['volume'][i] is not None]
            return ticker, {'ticker': ticker, 'bars': bars, 'source': url, 'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat()}
        except Exception as exc:
            errors.append(str(exc))
    return ticker, {'ticker': ticker, 'bars': [], 'error': '; '.join(errors)}


def filings(company):
    today = dt.datetime.now(dt.timezone.utc).date()
    start = today - dt.timedelta(days=30)
    params = {'pageno': '1', 'strCat': '-1', 'strPrevDate': start.strftime('%Y%m%d'), 'strScrip': company['bse'], 'strSearch': 'P', 'strToDate': today.strftime('%Y%m%d'), 'strType': 'C', 'subcategory': ''}
    url = 'https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?' + urllib.parse.urlencode(params)
    try:
        nse_url = 'https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=' + urllib.parse.quote(company['ticker'])
        raw = json.loads(fetch(nse_url))
        items = []
        for row in raw:
            date = str(row.get('sort_date') or '')
            if row.get('symbol') != company['ticker'] or date[:10] < start.isoformat() or not row.get('attchmntFile'):
                continue
            items.append({'id': str(row.get('seq_id') or row['attchmntFile']), 'ticker': company['ticker'], 'headline': clean(row.get('attchmntText') or row.get('desc')), 'description': clean(row.get('desc')), 'date': date, 'url': row['attchmntFile']})
        return company['ticker'], {'items': items, 'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': nse_url, 'coverage': 'NSE response filtered to the last 30 days.'}
    except Exception:
        pass
    try:
        raw = json.loads(fetch(url))
        items = []
        for row in raw.get('Table', []):
            att = row.get('ATTACHMENTNAME') or row.get('AttachmentName')
            if not att:
                continue
            headline = row.get('NEWSSUB') or row.get('HEADLINE') or row.get('NewsSub') or ''
            items.append({'id': str(row.get('NEWSID') or att), 'ticker': company['ticker'], 'headline': clean(headline), 'description': clean(row.get('MORE') or row.get('HEADLINE') or ''), 'date': row.get('NEWS_DT') or row.get('DT_TM') or '', 'url': 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/' + att})
        return company['ticker'], {'items': items, 'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': url, 'coverage': 'First exchange page; may be incomplete in busy periods.'}
    except Exception as exc:
        return company['ticker'], {'items': [], 'error': str(exc)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--tickers', nargs='+', default=['INFY', 'TCS', 'ITC', 'MARUTI'])
    parser.add_argument('--research-only', action='store_true')
    args = parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        result = dict(pool.map(research, args.tickers))
    dest = ROOT / 'data/research.json'
    existing = json.loads(dest.read_text()) if dest.exists() else {}
    existing.update(result)
    dest.write_text(json.dumps(existing, ensure_ascii=False))
    if not args.research_only:
        companies = json.loads((ROOT / 'data/companies.json').read_text())
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            prices = dict(pool.map(market, companies))
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            announcements = dict(pool.map(filings, companies))
        (ROOT / 'data/snapshot.json').write_text(json.dumps({'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'prices': prices, 'filings': announcements}, ensure_ascii=False))
        print('Snapshot:', sum(bool(v['bars']) for v in prices.values()), 'prices;', sum(len(v['items']) for v in announcements.values()), 'filings', flush=True)
