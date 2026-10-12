import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { dictionaries } from './src/i18n.js';
const require = createRequire(process.env.MC_TEST_DEPENDENCIES + '/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const base = process.env.MC_TEST_URL || 'http://127.0.0.1:4174';
const context = await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',acceptDownloads:true});
const page = await context.newPage();
const errors = [];
const external = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console',m => {if(m.type()==='error')errors.push(m.text());});
page.on('request',r => {if(!r.url().startsWith(base)) external.push(r.url());});
await page.goto(base);
await page.locator('.brain-anchor').first().waitFor();
assert.equal(await page.locator('.brain-anchor').count(),6);
assert.equal(await page.locator('html').getAttribute('lang'),'en');
for(const r of ['memory','personality','values','reasoning','emotion','language']) {
  const anchor = page.locator(`[data-brain-region=${r}]`);
  await anchor.hover();
  assert.ok(await page.locator(`[data-brain-part=${r}]`).evaluate(e=>e.classList.contains('hovered')));
  await anchor.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(`[data-brain-region=${r}]`).getAttribute('aria-pressed'),'true');
  assert.ok((await page.locator('.region-body').innerText()).includes(dictionaries.en['region.'+r]));
}
await page.locator('#explore-records').click();
await page.locator('.empty-records').waitFor();
assert.ok((await page.locator('.empty-records').innerText()).includes('No reliable memory found'));
await page.locator('[data-brain-region=memory]').click();
await page.mouse.move(750,430);
assert.notEqual(await page.locator('.brain-stage').evaluate(e=>e.style.getPropertyValue('--tilt-y')),'');
await page.mouse.move(100,100);
await page.screenshot({path:'screenshots/overview-desktop.png',fullPage:true});
for(const locale of ['zh','en','ja']) {
  await page.locator(`[data-language=${locale}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-CN':locale);
  assert.ok((await page.locator('.hero>h2').innerText()).includes(dictionaries[locale]['home.headline']));
  await page.screenshot({path:`screenshots/overview-${locale}.png`,fullPage:true});
  for(const route of ['clone','builder','dashboard','settings']) {
    await page.locator(`nav a[data-page=${route}]`).click();
      await page.waitForFunction(title => document.querySelector("h1")?.textContent.includes(title), route === "home" ? "MindClone" : dictionaries[locale]["nav."+route]);
    assert.ok((await page.locator('h1').innerText()).includes(dictionaries[locale]['nav.'+route]));
    assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-CN':locale);
  }
  await page.locator('nav a[data-page=home]').click();
}
await page.reload();
assert.equal(await page.locator('html').getAttribute('lang'),'ja');
await page.locator('[data-language=en]').click();
await page.locator('nav a[data-page=clone]').click();
await page.locator('#query').fill('Draft text stays on language change');
await page.locator('[data-language=ja]').click();
assert.equal(await page.locator('#query').inputValue(),'Draft text stays on language change');
await page.locator('#query').fill(dictionaries.ja['clone.sample']);
await page.locator('#chat-form').evaluate(e=>e.requestSubmit());
await page.locator('.clone-message').waitFor();
assert.ok((await page.locator('.clone-message').innerText()).includes(dictionaries.ja['clone.replyKnown']));
assert.equal(await page.locator('.brain-part.pulse').count(),2);
await page.locator('[data-language=zh]').click();
assert.ok((await page.locator('.clone-message').innerText()).includes(dictionaries.zh['clone.replyKnown']));
await page.locator('#query').fill('Where was I born?');
await page.locator('#chat-form').evaluate(e=>e.requestSubmit());
await page.locator('.clone-message').nth(1).waitFor();
assert.ok((await page.locator('.clone-message').nth(1).innerText()).includes(dictionaries.zh['clone.replyMissing']));
assert.equal(await page.locator('.brain-part.pulse').count(),0);
await page.locator('[data-language=en]').click();
await page.locator('#query').blur();
await page.evaluate(()=>window.scrollTo(0,0));
await page.screenshot({path:'screenshots/my-clone-desktop.png',fullPage:true});
await page.locator('nav a[data-page=builder]').click();
assert.equal(await page.locator('progress').getAttribute('value'),'0');
assert.equal(await page.locator('.neuron').count(),0);
await page.locator('#start').click();
await page.locator('#answer').fill('Unsent draft 原文');
await page.locator('[data-language=zh]').click();
assert.equal(await page.locator('#answer').inputValue(),'Unsent draft 原文');
for(let i=0;i<5;i++) {
  await page.locator('#sample-answer').click();
  await page.locator('#answer-form').evaluate(e=>e.requestSubmit());
  await page.waitForFunction(n=>document.querySelector('progress').value===n,i+1);
  assert.ok(await page.locator('.neuron').count()>0);
}
assert.equal(await page.locator('progress').getAttribute('value'),'5');
await page.locator('#end').click();
await page.locator('#generate').click();
await page.locator('.memory-capsule').waitFor();
assert.deepEqual(await page.locator('.shard-counts b').allTextContents(),['2','3','2','4','3']);
await page.locator('[data-language=ja]').click();
assert.ok((await page.locator('.memory-capsule').innerText()).includes(dictionaries.ja['fragment.title']));
await page.locator('#view-fragment').click();
assert.equal(await page.locator('.candidate-list>div').count(),14);
let pending = page.waitForEvent('download');
await page.locator('#download-json').click();
const jsonDownload = await pending;
assert.match(jsonDownload.suggestedFilename(),/^MC_FRAGMENT_\d{8}_F0001.json$/);
const fragment = JSON.parse(await readFile(await jsonDownload.path(),'utf8'));
assert.equal(fragment.synthetic,true);
assert.equal(fragment.raw_answers[0].answer,dictionaries.zh['sample.0']);
assert.equal(fragment.personality_evidence[0].kind,'AI_INFERENCE');
assert.ok(fragment.personality_evidence.every(e=>e.demo && e.confidence===null));
pending = page.waitForEvent('download');
await page.locator('#download-md').click();
const mdDownload = await pending;
assert.ok((await readFile(await mdDownload.path(),'utf8')).includes(dictionaries.ja['fragment.exportHeading']));
await page.locator('[data-language=en]').click();
await page.locator('#view-fragment').click();
await page.evaluate(()=>window.scrollTo(0,0));
await page.screenshot({path:'screenshots/clone-builder-desktop.png',fullPage:true});
await page.locator('nav a[data-page=dashboard]').click();
await page.locator('.metrics strong').first().waitFor();
assert.deepEqual(await page.locator('.metrics strong').allTextContents(),['0','0','0','0']);
await page.screenshot({path:'screenshots/dashboard-desktop.png',fullPage:true});
for(const width of [375,390,768,1024,1440]) {
  await page.setViewportSize({width,height:844});
  for(const locale of ['en','zh','ja']) {
    await page.locator(`[data-language=${locale}]`).click();
    for(const route of ['home','clone','builder','dashboard','settings']) {
      await page.locator(`nav a[data-page=${route}]`).click();
      await page.waitForFunction(title => document.querySelector("h1")?.textContent.includes(title), route === "home" ? "MindClone" : dictionaries[locale]["nav."+route]);
      const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
      assert.ok(dims.scroll<=dims.width,`${route}/${locale} overflow at ${width}: ${dims.scroll}`);
      if(width===390 && locale==='zh' && route!=='settings') {
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:`screenshots/${route}-mobile.png`,fullPage:true});
      }
    }
  }
}
await page.locator('[data-language=en]').click();
await page.locator('nav a[data-page=settings]').click();
await page.locator('#motion-toggle').check();
await page.locator('nav a[data-page=home]').click();
assert.equal(await page.locator('.brain-model svg').evaluate(e=>getComputedStyle(e).animationName),'none');
await page.mouse.move(150,420);
assert.equal(await page.locator('.brain-stage').evaluate(e=>e.style.getPropertyValue('--tilt-y')),'');
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await page.locator('.brain-model svg').evaluate(e=>getComputedStyle(e).animationName),'none');
await page.locator('nav a[data-page=builder]').click();
await page.locator('#reset').click();
await page.locator('#start').click();
const custom='  <img src=x onerror=alert(1)> 原始回答  ';
await page.locator('#answer').fill(custom);
await page.locator('#answer-form').evaluate(e=>e.requestSubmit());
await page.locator('#end').click();
await page.locator('#generate').click();
await page.locator('#view-fragment').click();
assert.equal(await page.locator('.fragment-detail img').count(),0);
assert.ok((await page.locator('.fragment-detail pre').innerText()).includes(custom));
assert.deepEqual(await page.locator('.shard-counts b').allTextContents(),['0','0','0','0','0']);
pending=page.waitForEvent('download');await page.locator('#download-json').click();
const privateDownload=await pending;
const privateFragment=JSON.parse(await readFile(await privateDownload.path(),'utf8'));
assert.equal(privateFragment.privacy_level,'PRIVATE');
assert.equal(privateFragment.raw_answers[0].answer,custom);
assert.equal(privateFragment.synthetic,false);
assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['mindclone.language']);
await page.reload();
await page.locator('#start').waitFor();
assert.equal(await page.locator('progress').getAttribute('value'),'0');
for(const [locale,expected] of [['zh-CN','zh-CN'],['ja-JP','ja'],['fr-FR','en']]) {
  const c=await browser.newContext({locale});const p=await c.newPage();
  await p.goto(base);await p.locator('.brain-anchor').first().waitFor();
  assert.equal(await p.locator('html').getAttribute('lang'),expected);
  await c.close();
}
assert.deepEqual(external,[]);
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: 3 locales × 5 routes × 5 widths; locale detection/persistence; preserved drafts/raw text; 6 keyboard/hover/select brain regions; exact sample vs private custom fragments; both exports; reduced motion; zero real archive counts; no external requests or browser errors.');
