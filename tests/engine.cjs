const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['questions.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
const Q=sandbox.window.RailwayQuestions,E=sandbox.window.RailwayEngine;
assert.equal(Q.length,15);assert.deepEqual([...new Set(Q.map(q=>q.part))],[1,2,3]);
for(const q of Q){for(const answer of q.answers)assert.equal(E.evaluate(q,answer).correct,true,`${q.id}: ${answer}`);}

// Meaning must remain fixed: condition/time-event A cannot become result B.
for(const q of Q.filter(q=>q.type==='combine')){
  const a=q.a.replace(/\.$/,''),b=q.b.replace(/\.$/,'');
  const reversed=`${a} ${q.connector} ${b}.`;
  const result=E.evaluate(q,reversed);
  assert.equal(result.correct,false,`${q.id} wrongly accepted reversed meaning`);
  assert.equal(result.kind,'meaning');
}

// Q11 and every completion item accept only approved, complete meanings.
const q11=Q[10];
for(const wrong of [
  'If you complete your homework early, computer games may play you.',
  'If computer games play you, you may complete your homework early.',
  'If you complete your homework early you may play computer games.',
  'if you complete your homework early, you may play computer games.',
  'If you complete your homework early, you may play computer game.',
  'If you complete your homework early, you may plays computer games.'
])assert.equal(E.evaluate(q11,wrong).correct,false,`Q11 wrongly accepted: ${wrong}`);

assert.equal(E.evaluate(q11,'If you complete your homework early you may play computer games.').kind,'punctuation');
assert.match(E.evaluate(q11,'If you complete your homework early you may play computer games.').message,/comma/i);
assert.match(E.evaluate(q11,'if you complete your homework early, you may play computer games.').message,/capital/i);
assert.match(E.evaluate(q11,'If you complete your homework early, you may paly computer games.').message,/spelling/i);
assert.match(E.evaluate(Q[13],'You should go to bed, if you feel sleepy.').message,/Do not put a comma/i);
assert.match(E.evaluate(Q[14],'You will punished if you continue to misbehave.').message,/“be”/i);

// Q6 must combine the ideas with when and replace the repeated noun with “it”.
const q6=Q[5];
assert.equal(E.evaluate(q6,'When the water reaches the rubber ball, it begins to float upwards.').correct,true);
assert.equal(E.evaluate(q6,'The rubber ball begins to float upwards when the water reaches it.').correct,true);
assert.equal(E.evaluate(q6,'When the water reaches the rubber ball, the rubber ball begins to float upwards.').correct,false);
assert.equal(E.evaluate(q6,'The water reaches the rubber ball when it begins to float upwards.').correct,false);

// First-attempt assessment cannot be overwritten by retry or hint use.
let state={lives:3,streak:0},record=E.createRecord(Q[0]);
E.submit(state,Q[0],record,'You help the Wise Frog if he will show you the safest track.');
const first=JSON.stringify(record.attempts[0]);E.submit(state,Q[0],record,Q[0].answers[0]);
assert.equal(JSON.stringify(record.attempts[0]),first);assert.equal(E.stats([record]).independent,0);
state={lives:3,streak:0};for(let i=0;i<3;i++){const r=E.createRecord(Q[i]);E.submit(state,Q[i],r,Q[i].answers[0]);}
assert.equal(state.lives,4);assert.equal(state.streak,0);
record=E.createRecord(Q[1]);E.support(state,record,'hint');E.submit(state,Q[1],record,Q[1].answers[0]);assert.equal(record.attempts[0].independent,false);
console.log('All sentence, meaning, punctuation, spelling and assessment checks passed.');
