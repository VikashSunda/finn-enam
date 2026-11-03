import test from 'node:test';import assert from 'node:assert/strict';import {compareGuidance} from '../worker/comparison.js';
const g={period:'FY26',metric:'growth',unit:'percent',basis:'constant currency',low:3,high:3.5};const a={...g,value:3.1};
test('aligned annual result can be evaluated against guidance',()=>assert.equal(compareGuidance(g,a).status,'within_range'));
test('quarter, currency-basis and metric mismatches never receive delivery scores',()=>{for(const field of ['period','basis','metric','unit'])assert.equal(compareGuidance(g,{...a,[field]:'different'}).status,'not_comparable');});
test('missing results and invalid ranges are not scored',()=>{assert.equal(compareGuidance(g,null).status,'pending');assert.equal(compareGuidance({...g,low:5},a).status,'not_comparable');});

test('below and above range results retain distinct outcomes',()=>{assert.equal(compareGuidance(g,{...a,value:2}).status,'below_range');assert.equal(compareGuidance(g,{...a,value:4}).status,'above_range');});
