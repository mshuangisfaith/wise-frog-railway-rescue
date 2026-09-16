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

// New sentence-completion items have original story content and accept common valid forms.
const [q11,q12,q13,q14,q15]=Q.slice(10);
assert(!Q.slice(10).some(q=>/homework|computer games|weather|beach|miss the bus|taxi|sleepy|go to bed|misbehave|punished/i.test(`${q.stem} ${q.prompt}`)));
for(const [q,valid] of [
  [q11,['If the Wise Frog spots a crack in the track, he will warn Prince Zak.','If the Wise Frog spots a crack in the track, he has to warn Prince Zak.','If the Wise Frog spots a crack in the track, he warns Prince Zak.']],
  [q12,['If the station lantern goes out, we can light a spare lantern.','If the station lantern goes out, we have to light a spare lantern.']],
  [q13,['If the bridge is too narrow, Prince Zak has to slow down.','If the bridge is too narrow, Prince Zak should slow down.','If the bridge is too narrow, Prince Zak slows down.']],
  [q14,['Hold the handrail if the train slows suddenly.','Please hold the handrail if the train slows suddenly.','You should hold the handrail if the train slows suddenly.']],
  [q15,['The passengers will be informed if the train is late.','The passengers must be informed if the train is late.','The passengers are informed if the train is late.']]
])for(const answer of valid)assert.equal(E.evaluate(q,answer).correct,true,`${q.id} rejected grammatical answer: ${answer}`);
for(const [q,wrong,kind] of [
  [q11,'If the Wise Frog spots a crack in the track he will warn Prince Zak.','punctuation'],
  [q11,'if the Wise Frog spots a crack in the track, he will warn Prince Zak.','punctuation'],
  [q11,'If the Wise Frog spots a crack in the track, he will warns Prince Zak.','language'],
  [q12,'If the station lantern goes out, we can lights a spare lantern.','language'],
  [q13,'If the bridge is too narrow, Prince Zak has to slows down.','language'],
  [q14,'Hold the handrail, if the train slows suddenly.','punctuation'],
  [q15,'The passengers will informed if the train is late.','grammar']
])assert.equal(E.evaluate(q,wrong).kind,kind,`${q.id} error kind for ${wrong}`);
assert.match(E.evaluate(q11,'If the Wise Frog spots a crack in the track he will warn Prince Zak.').message,/comma/i);
assert.match(E.evaluate(q14,'Hold the handrail, if the train slows suddenly.').message,/Do not put a comma/i);
assert.match(E.evaluate(q15,'The passengers will informed if the train is late.').message,/helping verb/i);

// The two valid pupil answers that exposed the old exact-answer problem.
const earlierQ13={type:'complete',stem:'If I miss the bus,',grammar:{position:'opening',actor:'I',action:'take a taxi',present:'take a taxi'},answers:['If I miss the bus, I will take a taxi.'],explanation:'A taxi is one possible result.'};
const earlierQ14={type:'complete',stem:'____________________ if you feel sleepy.',grammar:{position:'final',condition:'if you feel sleepy',imperative:true,action:'go to bed'},answers:['Go to bed if you feel sleepy.'],explanation:'This is a valid command.'};
assert.equal(E.evaluate(earlierQ13,'If I miss the bus, I have to take a taxi.').correct,true);
assert.equal(E.evaluate(earlierQ14,'Go to bed if you feel sleepy.').correct,true);

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
const journey=Q.map(E.createRecord),journeyState={lives:3,streak:0};
for(let i=0;i<10;i++){
  if(i===3||i===6){E.submit(journeyState,Q[i],journey[i],'Incorrect first answer.');}
  if(i===8)E.support(journeyState,journey[i],'hint');
  E.submit(journeyState,Q[i],journey[i],Q[i].answers[0]);
  assert.equal(E.eggCount(journey),Math.floor((i+1)/3),`Egg count after ${i+1} completed questions`);
}
assert.equal(E.eggCount(journey),3,'Ten completed questions earn three eggs despite retries and hints');
for(let i=10;i<15;i++){E.submit(journeyState,Q[i],journey[i],Q[i].answers[0]);}
assert.equal(E.eggCount(journey),5);
console.log('All sentence, meaning, punctuation, spelling and assessment checks passed.');
