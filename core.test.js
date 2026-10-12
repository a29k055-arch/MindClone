import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoCore, fragmentFilename, fragmentMarkdown } from './src/core.js';
import { dictionaries, detectLanguage, translate } from './src/i18n.js';

const examples = locale => Array.from({length:5},(_,i)=>({question:translate(`question.${i}`,locale),answer:translate(`sample.${i}`,locale),locale}));
test('unsupported biography and compound queries never invent memories',async()=>{
  for(const query of ['Where was I born?','How do you learn? Where was I born?','我出生在哪里？','私はどこで生まれましたか？']) {
    const r=await new DemoCore().chat(query);
    assert.equal(r.memories.length,0);assert.equal(r.answer_key,'clone.replyMissing');assert.equal(r.confidence,null);assert.deepEqual(r.regions,[]);
  }
});
test('all supported language queries retain synthetic provenance',async()=>{
  for(const locale of ['en','zh','ja']) {
    const r=await new DemoCore().chat(translate('clone.sample',locale));
    assert.equal(r.memories[0].demo,true);assert.equal(r.source,'DEMO-S001');assert.equal(r.confidence,null);assert.deepEqual(r.regions,['memory','reasoning']);
  }
});
test('all locales have the same complete translation keys',()=>{
  const keys=Object.keys(dictionaries.en).sort();assert.ok(keys.length>180);
  for(const locale of ['zh','ja']) {
    assert.deepEqual(Object.keys(dictionaries[locale]).sort(),keys);
    assert.ok(Object.values(dictionaries[locale]).every(s=>typeof s==='string'&&s.trim()));
  }
  assert.equal(detectLanguage('ja-JP'),'ja');assert.equal(detectLanguage('zh-Hant'),'zh');assert.equal(detectLanguage('fr-FR'),'en');
});
test('only exact complete fictional specimens create demo evidence',async()=>{
  for(const locale of ['en','zh','ja']) {
    const answers=examples(locale);const f=await new DemoCore().generateFragment(answers);
    assert.equal(f.synthetic,true);
    assert.deepEqual([f.candidate_memories.length,f.values.length,f.reasoning_patterns.length,f.personality_evidence.length,f.language_features.length],[2,3,2,4,3]);
    assert.equal(f.status,'UNCONFIRMED');
    for(const entry of Object.values(f).filter(Array.isArray).slice(1).flat())assert.equal(entry.confidence,null);
    assert.equal(f.raw_answers[0].answer,answers[0].answer);
    assert.ok(fragmentMarkdown(f,locale).includes(translate('fragment.exportHeading',locale)));
  }
});
test('synthetic flag cannot promote arbitrary text to extracted evidence',async()=>{
  const raw=examples('en');raw[2].answer='My personal life story';
  const f=await new DemoCore().generateFragment(raw,{synthetic:true});
  assert.equal(f.synthetic,false);assert.equal(f.privacy_level,'PRIVATE');assert.deepEqual(f.personality_evidence,[]);
  assert.ok(Object.values(new DemoCore().previewCapture(raw).counts).every(n=>n===0));
});
test('partial samples do not generate a complete specimen',async()=>{
  const f=await new DemoCore().generateFragment(examples('en').slice(0,2));
  assert.equal(f.synthetic,false);assert.equal(f.privacy_level,'PRIVATE');assert.equal(f.candidate_memories.length,0);
  assert.ok(new DemoCore().previewCapture(examples('en').slice(0,2)).counts.values>0);
});
test('fragment preserves exact raw text independent of source array',async()=>{
  const original=[{question:'Why?',answer:'  <script>test</script> 原始回答  ',locale:'zh'}];
  const f=await new DemoCore().generateFragment(original);original[0].answer='changed';
  assert.equal(f.raw_answers[0].answer,'  <script>test</script> 原始回答  ');assert.match(fragmentMarkdown(f),/原始回答/);
  assert.equal(fragmentFilename('2026-10-12','json'),'MC_FRAGMENT_20261012_F0001.json');
});
test('dashboard counts only represent the disconnected real archive',async()=>{
  const core=new DemoCore();await core.generateFragment(examples('en'));
  assert.ok(Object.values(await core.getProgress()).every(n=>n===0));
});
