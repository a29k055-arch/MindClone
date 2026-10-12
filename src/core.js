import {memory,questions} from './sample-data.js';
/** MindClone Core port: replace the demo adapter with an authenticated API adapter. */
export class DemoCore {
 async chat(query){const supported=/^(how do you learn\??|你如何学习[？?]?)$/i.test(query.trim());return supported?{answer:'In this fictional demo, I learn by making a small prototype, then reflecting on what did not work.',memories:[memory],source:memory.source_session,confidence:null,why:'Exact demo topic matched to an explicit synthetic opinion. No inference about your life.'}:{answer:'No reliable memory found. I do not have evidence to answer that question about you.',memories:[],source:null,confidence:null,why:'No supported demo topic matched. Missing evidence is preserved instead of inventing a memory.'};}
 async getProgress(){return {memory:0,personality:0,values:0,reasoning:0,language:0,sessions:0,fragments:0,memories:0,opinions:0};}
 async nextQuestion(answers){return questions[answers.length]??null;}
 async generateFragment(answers,{synthetic=false}={}){return {schema_version:'0.1-demo',demo:true,synthetic,fragment_id:'DEMO-F0001',source_session:'DEMO-SESSION',created_at:new Date().toISOString(),privacy_level:synthetic?'PUBLIC':'PRIVATE',status:'UNCONFIRMED',confidence:null,raw_answers:answers.map(a=>({...a})),candidate_memories:[],values:[],reasoning_patterns:[],personality_evidence:[],note:'Demo capture only. Raw answers are preserved; extraction and persona inference require a future reviewed engine.'};}
}
export const core=new DemoCore();
export function fragmentFilename(date,ext){return `MC_FRAGMENT_${date.replaceAll('-','')}_F0001.${ext}`;}
export function fragmentMarkdown(f){return `# Demo Memory Fragment\n\nDEMO · UNCONFIRMED · ${f.privacy_level}\n\nSource: ${f.source_session}\nCreated: ${f.created_at}\nConfidence: unknown\n\n${f.note}\n\n## Raw Interview\n\n`+f.raw_answers.map((a,i)=>`### Question ${i+1}\n${a.question}\n\n${a.answer}\n`).join('\n')+'\n## Candidate memories / Values / Reasoning / Personality\nNo validated extraction.\n';}
