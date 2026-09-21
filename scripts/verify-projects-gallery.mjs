import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const dir=`.impeccable/project-page-${Date.now()}`;mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000/catalogo?tipo=projeto');await page.waitForLoadState('networkidle');
const items=await page.evaluate(async()=> (await (await fetch('/api/catalogue')).json()).filter(i=>i.type==='projeto'));
const link=()=>page.locator('.projects-main-image').getAttribute('href');
assert.equal(await page.locator('.header').count(),1);assert.equal(await page.locator('.honeycomb').count(),1);
assert.equal(await page.locator('.projects-thumbnail').count(),items.length);
assert.ok(await page.locator('.projects-main-image img').first().evaluate(i=>i.complete&&i.naturalWidth>0));
await page.screenshot({path:`${dir}/desktop.png`});
await page.mouse.move(530,500);await page.mouse.wheel(0,90);
for(let i=0;i<16;i++){await page.waitForTimeout(80);await page.mouse.wheel(0,5);}
assert.equal(await link(),`/catalogo/${items[1].id}`);assert.equal(await page.evaluate(()=>scrollY),0);
await page.waitForTimeout(300);await page.mouse.wheel(0,-90);await page.waitForTimeout(950);
assert.equal(await link(),`/catalogo/${items[0].id}`);
await page.locator('.projects-thumbnail').last().click();await page.waitForTimeout(950);
assert.equal(await link(),`/catalogo/${items.at(-1).id}`);
await page.locator('.projects-main-image').click();await page.waitForURL(`**/catalogo/${items.at(-1).id}`);
assert.equal(await page.locator('.project-information h1').textContent(),items.at(-1).title);
await page.goto('http://localhost:3000/catalogo?tipo=projeto');await page.waitForLoadState('networkidle');
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.projects-gallery').focus();
for(let i=1;i<items.length;i++){await page.keyboard.press('ArrowDown');await page.waitForTimeout(100);}
await page.mouse.move(500,500);await page.mouse.wheel(0,1100);await page.waitForTimeout(350);
assert.ok(await page.evaluate(()=>scrollY)>100);await page.screenshot({path:`${dir}/footer.png`});
await page.getByRole('button',{name:'Abrir menu'}).click();assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape');
for(const width of [320,390,768]){
 await page.setViewportSize({width,height:844});await page.goto('http://localhost:3000/catalogo?tipo=projeto');await page.waitForLoadState('networkidle');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`${dir}/width-${width}.png`});
}
const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await mobile.goto('http://localhost:3000/catalogo?tipo=projeto');await mobile.waitForLoadState('networkidle');
const cdp=await mobile.context().newCDPSession(mobile);
async function swipe(from,to){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:from}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:from+(to-from)*i/8}]});await mobile.waitForTimeout(25);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(950);
}
await swipe(580,350);assert.equal(await mobile.locator('.projects-main-image').getAttribute('href'),`/catalogo/${items[1].id}`);
assert.equal(await mobile.evaluate(()=>scrollY),0);
await swipe(350,580);assert.equal(await mobile.locator('.projects-main-image').getAttribute('href'),`/catalogo/${items[0].id}`);
await mobile.locator('.projects-thumbnail').last().tap();await mobile.waitForTimeout(950);
await mobile.locator('.projects-main-image').tap();await mobile.waitForURL(`**/catalogo/${items.at(-1).id}`);
await page.goto('http://localhost:3000/');await page.waitForLoadState('networkidle');
assert.equal(await page.locator('.stone-hero').getAttribute('data-state'),'logo');
assert.deepEqual(errors,[]);console.log(`PASS: images, wheel/reverse/inertia, thumbnails, correct links, keyboard, reduced motion, touch, menu, footer and home. ${dir}`);
await browser.close();
