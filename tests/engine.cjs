const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const sandbox={window:{}};vm.createContext(sandbox);for(const f of ['questions.js','engine.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8'),sandbox);
const E=sandbox.window.RailwayEngine,P=sandbox.window.RailwayPacks;
assert.equal(P.connectors.length,12);assert.equal(P.inference.length,8);
let n=0;function check(x){assert.ok(x);n++}
for(const q of P.connectors){check(E.validOrder(q,['W','A','B']));check(E.validOrder(q,['B','W','A']));check(!E.validOrder(q,['A','B','W']));check(!E.validOrder(q,['B','A','W']));check(E.validOrder(q,['A','W','B'])===(q.word!=='if'));check(E.validOrder(q,['W','B','A'])===(q.word!=='if'));}
let s={lives:3,streak:0};const q=P.connectors[0],r=E.createRecord(q);E.submit(s,q,r,['A','W','B']);check(s.lives===2);const first=JSON.stringify(r.attempts[0]);E.submit(s,q,r,['W','A','B']);check(JSON.stringify(r.attempts[0])===first);check(E.stats([r]).independent===0);check(s.streak===0);check(E.submit(s,q,r,['W','A','B'])===null);
s={lives:3,streak:0};for(let i=0;i<3;i++)E.submit(s,q,E.createRecord(q),['W','A','B']);check(s.lives===4&&s.streak===0);
const h=E.createRecord(q);E.support(s,h,'hint');E.submit(s,q,h,['W','A','B']);check(E.stats([h]).independent===0);check(s.streak===0);
s={lives:1,streak:0};const z=E.createRecord(q);E.submit(s,q,z,['A','W','B']);E.submit(s,q,z,['A','B','W']);check(s.lives===0);E.submit(s,q,z,['W','A','B']);check(z.completed&&s.lives===0);
for(const i of P.inference){const rr=E.createRecord(i),st={lives:3,streak:0};const result=E.submit(st,i,rr,{answer:i.answer,proof:(i.proof+1)%3});check(result.inference&&!result.evidence&&!result.correct);E.submit(st,i,rr,{answer:i.answer,proof:i.proof});check(rr.completed&&!rr.attempts[0].correct);}
console.log(`${n} assessment assertions passed.`);
// Teacher review must describe the original response even after retries or models.
const iq=P.inference[0],ir=E.createRecord(iq),is={lives:3,streak:0};
E.submit(is,iq,ir,{answer:iq.answer,proof:(iq.proof+1)%3});
E.submit(is,iq,ir,{answer:iq.answer,proof:iq.proof});
const before=JSON.stringify(ir),review=E.review(iq,ir);
assert.equal(review.first.evidence,false);assert.equal(review.first.inference,true);
assert.match(review.focus,/inference is correct/);assert.equal(JSON.stringify(ir),before);
assert.equal(review.support,'Before any hint or model answer');
const hr=E.createRecord(q),hs={lives:3,streak:0};E.support(hs,hr,'hint');E.submit(hs,q,hr,['W','A','B']);
assert.equal(E.review(q,hr).support,'After support');assert.match(E.review(q,hr).focus,/without a hint/);
const mr=E.createRecord(q);E.support(hs,mr,'model');mr.completed=true;assert.equal(E.review(q,mr).first,null);
const wr=E.createRecord(q);E.submit(hs,q,wr,['A','W','B']);E.support(hs,wr,'model');wr.completed=true;
assert.equal(E.review(q,wr).first.correct,false);assert.match(E.review(q,wr).focus,/condition/);
console.log('10 teacher-review assertions passed.');
