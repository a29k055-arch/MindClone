import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.env.MC_TEST_DEPENDENCIES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1080}});
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');
await page.getByRole('heading',{name:/MindClone/}).waitFor();
await page.screenshot({path:'screenshots/overview-desktop.png',fullPage:true});
await page.getByRole('link',{name:'Talk to My Clone'}).click();
await page.getByRole('button',{name:/How do you learn/}).click();
await page.getByText('Exact demo topic matched',{exact:false}).count();
await page.getByLabel('Message to Demo Clone').fill('Where was I born?');
await page.getByRole('button',{name:'Send message'}).click();
await page.getByText('No reliable memory found.',{exact:false}).waitFor();
await page.screenshot({path:'screenshots/my-clone-desktop.png',fullPage:true});
await page.locator('nav a[data-page=builder]').click();
await page.getByRole('button',{name:/Start Interview/}).click();
for(let i=0;i<5;i++){await page.getByRole('button',{name:'Use fictional sample'}).click();await page.getByRole('button',{name:/Continue/}).click();}
await page.getByRole('button',{name:'End Session',exact:true}).click();
await page.getByRole('button',{name:/Generate Memory Fragment/}).click();
await page.getByRole('heading',{name:'Demo Memory Fragment'}).waitFor();
const downloadPromise=page.waitForEvent('download');
await page.getByRole('button',{name:/Download .json/}).click();
const download=await downloadPromise;
assert.match(download.suggestedFilename(),/^MC_FRAGMENT_\d{8}_F0001.json$/);
await page.evaluate(()=>window.scrollTo(0,0));
await page.screenshot({path:'screenshots/clone-builder-desktop.png',fullPage:true});
await page.locator('nav a[data-page=dashboard]').click();
await page.screenshot({path:'screenshots/dashboard-desktop.png',fullPage:true});
for(const width of [390,375,768,1440]){
 await page.setViewportSize({width,height:844});
 for(const route of ['home','clone','builder','dashboard']){
  await page.goto('http://127.0.0.1:4173/#'+route);
  await page.locator('h1').waitFor();
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(dims.scroll<=dims.width,`${route} overflows at ${width}: ${dims.scroll}`);
  if(width===390)await page.screenshot({path:`screenshots/${route}-mobile.png`,fullPage:true});
 }
}
await page.goto('http://127.0.0.1:4173/#builder');
await page.reload();
await page.getByRole('button',{name:/Start Interview/}).click();
await page.getByLabel('Your answer').fill('<img src=x onerror=alert(1)>');
await page.getByRole('button',{name:/Continue/}).click();
await page.getByRole('button',{name:'End Session',exact:true}).click();
await page.getByRole('button',{name:/Generate Memory Fragment/}).click();
assert.equal(await page.locator('.fragment img').count(),0);
assert.ok((await page.locator('.fragment pre').innerText()).includes('<img src=x onerror=alert(1)>'));
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: desktop/mobile routes, chat evidence/no-record, five-question interview, JSON download, input escaping; no browser errors.');



