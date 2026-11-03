import test from 'node:test';
import assert from 'node:assert/strict';
import {validateClaims} from '../worker/claims.js';
const evidence=[{id:'one',label:'Q1 FY27 call',text:'Management reported free cash flow of $955 million, at 116.5% of net profit. Client interest increased but adoption is not a large part of activity.'}];
const claim={text:'In Q1 FY27 management reported $955 million of free cash flow.',kind:'fact',sources:['one'],support:[{sourceId:'one',quote:'Management reported free cash flow of $955 million, at 116.5% of net profit.'}]};
test('a disclosure month cannot be turned into a financial quarter end',()=>{const e={id:'date',label:'Earnings call 2026-07-19',text:'Management reported revenue growth of 12% year on year in this business.'},c={kind:'fact',text:'Revenue grew 12% in the quarter ending July 2026.',sources:['date'],support:[{sourceId:'date',quote:e.text}]};assert.throws(()=>validateClaims({claims:[c]},[e]),/period end/);});
test('an explicitly stated reporting period end remains valid',()=>{const e={id:'date',label:'Results',text:'For the quarter ended June 30, 2026, management reported revenue growth of 12%.'},c={kind:'fact',text:'Revenue grew 12% in the quarter ending June 2026.',sources:['date'],support:[{sourceId:'date',quote:e.text}]};assert.equal(validateClaims({claims:[c]},[e])[0].verification,'quotes_and_numbers_checked');});
test('support validation accepts a copied passage and disclosed numbers',()=>{
 const result=validateClaims({claims:[claim]},evidence);assert.equal(result[0].verification,'quotes_and_numbers_checked');
});
test('valid source IDs alone cannot admit an invented supporting quote',()=>{
 assert.throws(()=>validateClaims({claims:[{...claim,support:[{sourceId:'one',quote:'Management guarantees a significant future profit.'}]}]},evidence),/does not match/);
});
test('copied support cannot admit an unreported numeric claim',()=>{
 assert.throws(()=>validateClaims({claims:[{...claim,text:'Management reported $999 million.'}]},evidence),/numeric claim/);
});
test('every cited passage must have its own matching support',()=>{
 assert.throws(()=>validateClaims({claims:[{...claim,sources:['one','two']}]},[...evidence,{id:'two',label:'Other',text:'A second primary passage with no supporting quote.'}]),/lacks a supporting quote/);
});
test('absence limitations are scoped rather than pretending a quote proves nonexistence',()=>{
 assert.equal(validateClaims({claims:[{text:'These passages do not establish FY2035 profit.',kind:'limitation',sources:['one']}]},evidence)[0].verification,'scope_only');
});
test('an inference still needs a real supporting passage',()=>{
 assert.throws(()=>validateClaims({claims:[{...claim,kind:'inference',support:[]}]},evidence),/no verifiable/);
});

test('whitespace cannot masquerade as a copied source quotation',()=>{
 assert.throws(()=>validateClaims({claims:[{...claim,support:[{sourceId:'one',quote:' '.repeat(30)}]}]},evidence),/does not match/);
});

test('limitation labels cannot bypass support checks with arbitrary factual assertions',()=>{
 const result=validateClaims({claims:[{text:'The company guarantees 999% returns and has never issued a forecast.',kind:'limitation',sources:['one']}]},evidence);
 assert.equal(result[0].text,'The retrieved passages do not establish the requested answer.');
 assert.ok(!result[0].text.includes('999'));
});
