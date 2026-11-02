# Origins and attribution

This standalone application was copied exclusively from `finn/` at
`VikashSunda/sector-intelligence-monitor`, commit
`35f02ba9320c35495d7527fb374a763dec04800a` (branch `finn-enam-prototype`).
The original repository history and older Python application were not imported.

- [Sector Intelligence Monitor](https://github.com/VikashSunda/sector-intelligence-monitor): source application and ingestion/research architecture ideas. Its `pipeline/ingestion/pdf_parser.py` was reviewed for page-level provenance and explicit parsing status. FINN retains its own Worker implementation and one-based PDF page references.
- [Nifty Market Breadth Intelligence](https://github.com/chaudharypriyanshu606-max/nifty-market-breadth-intelligence), by `chaudharypriyanshu606-max`: monitoring/dashboard, refresh, data-quality and insufficient-history ideas. `app/main.py` was reviewed during this continuation. No additional Python implementation was copied from that project.

The upstream decision log is preserved as historical context. This file does not
assert ownership of upstream work or grant rights to third-party source data.
No upstream LICENSE file was present in either repository's inspected default-branch file tree; do not assign an invented upstream license.

Runtime dependencies `unpdf` and `esbuild` retain their respective package licenses.
Original company reports, exchange filings and price data remain attributable to
their linked publishers; collection does not transfer ownership.
