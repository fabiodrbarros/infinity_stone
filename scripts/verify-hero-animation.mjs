import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const dir=`.impeccable/hero-animation/${Date.now()}`;mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const state=()=>page.locator('.stone-hero').getAttribute('data-state');
const y=()=>page.evaluate(()=>scrollY);
async function shot(name){await page.screenshot({path:`${dir}/${name}.png`});}
await page.goto('http://localhost:3000');await page.waitForLoadState('networkidle');
assert.equal(await state(),'logo');await shot('desktop-initial');
await page.mouse.move(720,480);await page.mouse.wheel(0,90);
await page.waitForTimeout(420);
assert.equal(await state(),'transitioning');
assert.ok(Number(await page.locator('.hero-slogan').evaluate(el=>getComputedStyle(el).opacity))<.25);
await shot('desktop-opening');await page.waitForTimeout(650);await shot('desktop-title-emerging');
// An uninterrupted tail extends beyond the end of the transition.
for(let i=0;i<15;i++){await page.mouse.wheel(0,10);await page.waitForTimeout(80);}
assert.equal(await state(),'materials');assert.equal(await y(),0);await shot('desktop-final');
assert.equal(await page.locator('.wordmark').evaluate(el=>getComputedStyle(el).visibility),'hidden');
assert.equal(await page.locator('.material-title').evaluate(el=>getComputedStyle(el).opacity),'1');
// End remains a direct, accessible route to the footer; wheel continuation is
// covered by verify-project-continuation.mjs.
await page.keyboard.press('End');await page.waitForTimeout(500);
assert.ok(await y()>100);await shot('desktop-footer');
await page.mouse.wheel(0,-2000);await page.waitForTimeout(500);
assert.equal(await y(),0);assert.equal(await state(),'materials');
await page.waitForTimeout(300);await page.mouse.wheel(0,-90);await page.waitForTimeout(900);await shot('desktop-reversing');
await page.waitForTimeout(1000);assert.equal(await state(),'logo');
assert.equal(await page.locator('.hero-slogan').evaluate(el=>getComputedStyle(el).opacity),'1');
await page.getByRole('button',{name:'Abrir menu'}).click();
assert.equal(await page.locator('dialog[open]').count(),1);
await page.keyboard.press('Escape');await page.waitForTimeout(250);
await page.locator('#main').focus();
await page.keyboard.press('PageDown');await page.waitForTimeout(1900);assert.equal(await state(),'materials');
await page.keyboard.press('End');await page.waitForTimeout(400);assert.ok(await y()>100);
await page.keyboard.press('Home');await page.waitForTimeout(400);
await page.keyboard.press('PageUp');await page.waitForTimeout(1900);assert.equal(await state(),'logo');
// Resize and check every transformed face, including intermediate perspective.
for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});await page.waitForTimeout(100);
  await shot(`width-${width}-initial`);
  await page.keyboard.press('PageDown');await page.waitForTimeout(1000);
  const bounds=await page.locator('.piece').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
  const heroBounds=await page.locator('.stone-hero').boundingBox();
  assert.ok(bounds.every(r=>r.left>=heroBounds.x&&r.right<=heroBounds.x+heroBounds.width&&r.top>=88&&r.bottom<=850),JSON.stringify({width,bounds}));
  await page.waitForTimeout(900);await shot(`width-${width}-final`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.keyboard.press('PageUp');await page.waitForTimeout(1900);
}
// Genuine Chromium touch input (default scrolling and prevented gestures included).
const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await mobile.goto('http://localhost:3000');await mobile.waitForLoadState('networkidle');
const cdp=await mobile.context().newCDPSession(mobile);
async function swipe(from,to){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:from}]});
  for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:from+(to-from)*i/8}]});await mobile.waitForTimeout(25);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
await swipe(650,250);await mobile.waitForTimeout(1900);
assert.equal(await mobile.locator('.stone-hero').getAttribute('data-state'),'materials');
assert.equal(await mobile.evaluate(()=>scrollY),0);
await mobile.screenshot({path:`${dir}/mobile-final.png`});
await swipe(250,650);await mobile.waitForTimeout(1900);
assert.equal(await mobile.locator('.stone-hero').getAttribute('data-state'),'logo');
await page.emulateMedia({reducedMotion:'reduce'});
await page.keyboard.press('PageDown');await page.waitForTimeout(50);assert.equal(await state(),'materials');
await page.keyboard.press('PageUp');await page.waitForTimeout(50);assert.equal(await state(),'logo');
// Unmount during playback; other pages must retain ordinary scrolling.
await page.emulateMedia({reducedMotion:'no-preference'});
await page.keyboard.press('PageDown');await page.waitForTimeout(200);
await page.locator('.company-persistent').click();await page.waitForTimeout(300);
await page.mouse.wheel(0,700);await page.waitForTimeout(400);assert.ok(await y()>100);
assert.deepEqual(errors,[]);
console.log('PASS: initial, complete/reverse animation, text layers, inertia, footer, keyboard, touch, responsive bounds, reduced motion, menu and unmount.');
console.log(`Screenshots: ${dir}`);
await browser.close();
