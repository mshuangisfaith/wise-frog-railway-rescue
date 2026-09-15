'use strict';
// Pure assessment logic, shared by the classroom UI and regression checks.
window.RailwayEngine = {
 createRecord(q){return {id:q.id,skill:q.skill,type:q.type,attempts:[],hint:false,model:false,completed:false};},
 validOrder(q,order){
  const key=order.join('');
  return (q.word==='if'?['WAB','BWA']:['WAB','AWB','WBA','BWA']).includes(key);
 },
 evaluate(q,response){
  if(q.type==='connector') {const correct=this.validOrder(q,response);return {correct,inference:null,evidence:null};}
  const inference=response.answer===q.answer,evidence=response.proof===q.proof;
  return {correct:inference&&evidence,inference,evidence};
 },
 submit(state,q,record,response){
  if(record.completed) return null;
  const result=this.evaluate(q,response);
  const first=record.attempts.length===0;
  const independent=first&&!record.hint&&!record.model;
  record.attempts.push({response:JSON.parse(JSON.stringify(response)),...result,independent});
  let bonus=false;
  if(result.correct){
   record.completed=true;
   if(independent){state.streak++;if(state.streak===3){state.lives++;state.streak=0;bonus=true;}}
   else state.streak=0;
  }else {state.streak=0;state.lives=Math.max(0,state.lives-1);}
  return {...result,bonus};
 },
 support(state,record,kind){if(!record.completed){record[kind]=true;state.streak=0;}},
 stats(records){
  return {independent:records.filter(r=>r.attempts[0]?.correct&&r.attempts[0]?.independent).length,first:records.filter(r=>r.attempts[0]?.correct).length,hints:records.filter(r=>r.hint).length,models:records.filter(r=>r.model).length,retries:records.filter(r=>r.attempts.length>1).length,completed:records.filter(r=>r.completed).length};
 }
};
