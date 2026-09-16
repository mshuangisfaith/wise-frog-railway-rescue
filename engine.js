'use strict';

window.RailwayEngine = (() => {
  const tidy=value=>String(value||'').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
  const words=value=>tidy(value).toLowerCase().replace(/[^a-z0-9']+/g,' ').trim().split(' ').filter(Boolean);
  const wordString=value=>words(value).join(' ');
  const distance=(a,b)=>{const m=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length];};
  const closest=(answer,solutions)=>solutions.map(s=>({s,d:distance(wordString(answer),wordString(s))})).sort((x,y)=>x.d-y.d)[0];
  const properNounIssue=value=>{const v=tidy(value);if(/\bprince zak\b/i.test(v)&&!v.includes('Prince Zak'))return 'Write the name with capital letters: “Prince Zak”.';if(/\bwise frog\b/i.test(v)&&!v.includes('Wise Frog'))return 'Write the character name with capital letters: “Wise Frog”.';if(/(^|[^A-Za-z])i([^A-Za-z]|$)/.test(v))return 'The pronoun “I” must always be a capital letter.';return '';};
  function punctuationIssue(answer,solution){const a=tidy(answer),s=tidy(solution);if(!/^[A-Z]/.test(a))return 'Begin the sentence with a capital letter.';const proper=properNounIssue(a);if(proper)return proper;if(!/[.!?]$/.test(a))return 'Add a full stop at the end of the sentence.';if(/^(If|When)\b/.test(s)){const connector=s.match(/^(If|When)/)[1].toLowerCase(),expected=s.indexOf(',');if(!a.includes(','))return `Add a comma after the opening ${connector}-clause.`;if(a.indexOf(',')!==expected)return `The comma belongs after the complete opening ${connector}-clause.`;}else if(/,\s*(if|when)\b/i.test(a))return 'Do not put a comma before an if-clause or when-clause that comes at the end.';return 'Check the capital letters and punctuation against the sentence pattern.';}
  function languageIssue(answer,solution){const aw=words(answer),sw=words(solution);if(aw.length===sw.length){const errors=[];for(let i=0;i<sw.length;i++)if(aw[i]!==sw[i]&&distance(aw[i],sw[i])<=2)errors.push(`“${aw[i]}” should be “${sw[i]}”`);if(errors.length)return `Check the spelling: ${errors.slice(0,2).join('; ')}.`;}const missing=[...new Set(sw.filter(w=>!aw.includes(w)))];if(missing.length&&missing.length<=4)return `Your sentence is missing or has changed: ${missing.map(w=>`“${w}”`).join(', ')}.`;return 'Some words are missing, added or out of order. Keep the complete ideas and check the grammar.';}
  function activeForms(actor,action,present){
    const singular=actor.toLowerCase()==='he'||actor.toLowerCase()==='she'||actor.toLowerCase()==='it'||actor.toLowerCase()==='prince zak';
    const helpers=['will','would','can','could','may','might','must','should','ought to',singular?'has to':'have to',singular?'needs to':'need to',actor.toLowerCase()==='i'?'am going to':singular?'is going to':'are going to','will have to','may have to','might have to'];
    const short=actor.toLowerCase()==='he'?[`he'll ${action}`,`he's going to ${action}`]:actor.toLowerCase()==='we'?[`we'll ${action}`,`we're going to ${action}`]:actor.toLowerCase()==='you'?[`you'll ${action}`,`you're going to ${action}`]:actor.toLowerCase()==='i'?[`I'll ${action}`,`I'm going to ${action}`]:[];
    return [`${actor} ${present}`,...helpers.map(helper=>`${actor} ${helper} ${action}`),...short];
  }
  function completionForms(q){
    const g=q.grammar;let mains=[];
    if(g.passive){const actor=g.actor,verb=g.participle;mains=[`${actor} are ${verb}`,`${actor} get ${verb}`,...['will','would','can','could','may','might','must','should'].flatMap(helper=>[`${actor} ${helper} be ${verb}`,`${actor} ${helper} get ${verb}`]),`${actor} have to be ${verb}`,`${actor} need to be ${verb}`,`${actor} are going to be ${verb}`];}
    else if(g.imperative)mains=[g.action,`Please ${g.action}`,...activeForms('You',g.action,g.action)];
    else mains=activeForms(g.actor,g.action,g.present);
    return mains.map(main=>g.position==='opening'?`${q.stem} ${main}.`:`${main[0].toUpperCase()+main.slice(1)} ${g.condition}.`);
  }
  function evaluateComplete(q,raw){
    const forms=completionForms(q),exact=forms.find(form=>tidy(form)===raw);
    if(exact)return {correct:true,kind:'correct',message:q.explanation,model:exact};
    const lexical=forms.find(form=>wordString(raw)===wordString(form));
    if(lexical)return {correct:false,kind:'punctuation',message:punctuationIssue(raw,lexical),model:lexical};
    const g=q.grammar,model=q.answers[0];
    if(!/^[A-Z]/.test(raw))return {correct:false,kind:'punctuation',message:'Begin the sentence with a capital letter.',model};
    const proper=properNounIssue(raw);if(proper)return {correct:false,kind:'punctuation',message:proper,model};
    if(!/[.!?]$/.test(raw))return {correct:false,kind:'punctuation',message:'Add a full stop at the end of the sentence.',model};
    if(g.position==='opening'&&!raw.startsWith(q.stem))return {correct:false,kind:'meaning',message:'Keep the given if-clause at the beginning. Put a comma after that complete clause.',model};
    if(g.position==='final'&&/,\s*if\b/i.test(raw))return {correct:false,kind:'punctuation',message:'Do not put a comma before an if-clause at the end.',model};
    if(g.position==='final'&&!raw.toLowerCase().endsWith(`${g.condition}.`.toLowerCase()))return {correct:false,kind:'meaning',message:'Keep the given if-clause at the end of your sentence.',model};
    const main=g.position==='opening'?raw.slice(q.stem.length).trim().replace(/[.!?]$/,''):raw.slice(0,-(`${g.condition}.`.length)).trim();
    if(g.passive&&new RegExp(`\\b${g.participle}\\b`,'i').test(main)&&!new RegExp(`\\b(?:be|are|is|were|was|been|being|get|gets|got)\\s+${g.participle}\\b`,'i').test(main))return {correct:false,kind:'grammar',message:`“${g.participle}” needs a helping verb here, such as “be”: “${model.replace(/ if\b.*$/i,'')}”.`,model};
    const near=closest(raw,forms);return {correct:false,kind:'language',message:languageIssue(raw,near.s),model:near.s};
  }
  function sequenceIssue(q,answer){if(q.type!=='combine')return '';const n=wordString(answer),a=wordString(q.a),b=wordString(q.b),c=q.connector;if(!new RegExp(`\\b${c}\\b`).test(n))return `Use the required connector “${c}”.`;if(n===`${a} ${c} ${b}`||n===`${c} ${b} ${a}`)return `The sequence has been reversed. ${q.hint} This version changes the original meaning.`;return '';}
  function evaluate(q,answer){const raw=tidy(answer);if(!raw)return {correct:false,kind:'empty',message:'Type a complete sentence before checking.'};if(q.type==='complete'&&q.grammar)return evaluateComplete(q,raw);for(const solution of q.answers)if(raw===tidy(solution))return {correct:true,kind:'correct',message:q.explanation,model:solution};const lexical=q.answers.find(solution=>wordString(raw)===wordString(solution));if(lexical)return {correct:false,kind:'punctuation',message:punctuationIssue(raw,lexical),model:lexical};const sequence=sequenceIssue(q,raw);if(sequence)return {correct:false,kind:'meaning',message:sequence,model:q.answers[0]};const near=closest(raw,q.answers);return {correct:false,kind:'language',message:languageIssue(raw,near.s),model:near.s};}
  function createRecord(q){return {id:q.id,skill:q.skill,attempts:[],hint:false,model:false,completed:false};}
  function submit(state,q,record,answer){if(record.completed)return null;const result=evaluate(q,answer),independent=record.attempts.length===0&&!record.hint&&!record.model;record.attempts.push({answer:tidy(answer),correct:result.correct,kind:result.kind,independent});let bonus=false;if(result.correct){record.completed=true;if(independent){state.streak++;if(state.streak===3){state.lives++;state.streak=0;bonus=true;}}else state.streak=0;}else{state.streak=0;state.lives=Math.max(0,state.lives-1);}return {...result,bonus};}
  function support(state,record,kind){if(!record.completed){record[kind]=true;state.streak=0;}}
  function stats(records){return {independent:records.filter(r=>r.attempts[0]?.correct&&r.attempts[0]?.independent).length,retries:records.filter(r=>r.attempts.length>1).length,hints:records.filter(r=>r.hint).length,models:records.filter(r=>r.model).length};}
  function eggCount(records){return Math.min(5,Math.floor((records||[]).filter(r=>r.completed).length/3));}
  return {tidy,words,wordString,distance,evaluate,createRecord,submit,support,stats,eggCount};
})();
