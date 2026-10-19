import {createRequire} from 'node:module';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.MC_TEST_DEPENDENCIES+'/package.json')('playwright');
const base=process.env.MC_TEST_URL||'http://127.0.0.1:4180';const fixtures=process.env.MC_AUDIO_FIXTURES;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:fixtures?['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',`--use-file-for-fake-audio-capture=${fixtures}/en.wav`]:[]});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:fixtures?['microphone']:[]});const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('503'))errors.push(m.text());});
await page.goto(base);await page.locator('canvas').waitFor();
assert.deepEqual(await page.locator('nav [data-page]').evaluateAll(es=>es.map(e=>e.dataset.page)),['home','builder','dashboard','clone']);
assert.equal(await page.locator('nav [data-page=settings]').count(),0);assert.equal(await page.locator('.profile .settings-link').count(),1);
assert.equal(await page.locator('.hero-actions a').count(),1);await page.locator('.hero-actions a').click();await page.locator('#free-input').waitFor();
assert.equal(await page.locator('#mode-free').getAttribute('aria-selected'),'true');
assert.equal(await page.locator('[data-consent]:checked').count(),0);
await page.locator('#free-input').fill('我喜欢在周末学习新的知识');await page.locator('#free-form').evaluate(e=>e.requestSubmit());await page.locator('.free-message.assistant').waitFor();
assert.equal(await page.locator('html').getAttribute('lang'),'ja');assert.equal(await page.locator('.free-message.assistant').last().getAttribute('lang'),'zh');
await page.locator('#conversation-language').selectOption('en');await page.locator('#free-input').fill('私は旅行が好きです');await page.locator('#free-form').evaluate(e=>e.requestSubmit());await page.waitForFunction(()=>document.querySelectorAll('.free-message.assistant').length===2);assert.equal(await page.locator('.free-message.assistant').last().getAttribute('lang'),'en');
await page.locator('#free-mic').click();await page.locator('[role=status]').last().waitFor();assert.ok(await page.locator('[role=status]').last().isVisible());
if(fixtures){
 await page.locator('#conversation-language').selectOption('auto');await page.locator('[data-consent=consent_for_transcription]').check();await page.locator('#free-mic').click();await page.waitForFunction(()=>document.querySelector('#free-mic').textContent.includes('停止'));await page.waitForTimeout(3500);await page.locator('#free-mic').click();await page.waitForFunction(()=>document.querySelector('#transcript-edit')?.value.length>0,{},{timeout:60000});assert.ok((await page.locator('#free-input').inputValue()).length>0);
}
await page.locator('#mode-upload').click();await page.locator('#audio-file').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('not audio')});await page.locator('[role=status]').last().waitFor();assert.equal(await page.locator('.audio-asset').count(),fixtures?1:0);
if(fixtures){
 for(const locale of ['en','zh','ja']){
  await page.locator('#conversation-language').selectOption('auto');await page.locator('[data-consent=consent_for_transcription]').check();await page.locator('#audio-file').setInputFiles(`${fixtures}/${locale}.wav`);await page.waitForFunction(name=>document.querySelector('.audio-asset strong')?.textContent===name,locale+'.wav');
  await page.locator('#transcribe-audio').click();await page.waitForFunction(()=>!document.querySelector('#transcribe-audio').disabled,{},{timeout:60000});assert.ok((await page.locator('#transcript-edit').inputValue()).trim().length>0);
 }
 const enId=await page.locator('#audio-library option').evaluateAll(es=>es.find(e=>e.textContent.includes('en.wav')).value);await page.locator('#audio-library').selectOption(enId);
 await page.locator('#authorize-existing').check();await page.locator('#collect-existing').click();await page.waitForFunction(()=>document.querySelectorAll('[data-remove-sample]').length===1);
 await page.locator('#voice-record').click();assert.equal(await page.locator('[data-remove-sample]').count(),1);
 await page.locator('#voice-consent').check();await page.locator('#voice-record').click();await page.waitForTimeout(1200);await page.locator('#voice-record').click();await page.waitForFunction(()=>document.querySelectorAll('[data-remove-sample]').length===2);
 await page.locator('[data-remove-sample]').last().click();await page.waitForFunction(()=>document.querySelectorAll('[data-remove-sample]').length===1);
 await page.reload();await page.locator('#free-input').waitFor();await page.locator('#mode-upload').click();const jaId=await page.locator('#audio-library option').evaluateAll(es=>es.find(e=>e.textContent.includes('ja.wav')).value);await page.locator('#audio-library').selectOption(jaId);assert.ok((await page.locator('#transcript-edit').inputValue()).length>0);
}
for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});for(const locale of ['ja','zh','en']){await page.locator(`[data-language=${locale}]`).click();for(const mode of ['free','interview','upload']){await page.locator('#mode-'+mode).click();assert.ok(await page.locator('#capture-pane').isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}assert.ok(await page.locator('.voice-collection').isVisible());}}
await page.locator('nav [data-page=dashboard]').click();await page.locator('.capture-progress-grid').waitFor();assert.ok(!/\d\s*[%％]/.test(await page.locator('#app').innerText()));
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: Builder-first navigation, default free conversation, separate response language, three input modes, consent, microphone / local ASR when fixtures supplied, voice references, locale/responsive matrix.');
