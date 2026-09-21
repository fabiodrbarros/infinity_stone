import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const dir=`.impeccable/projects-${Date.now()}`;mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000');await page.waitForLoadState('networkidle');
const items=await page.evaluate(async()=> (await (await fetch('/api/catalogue')).json()).filter(i=>i.type==='projeto'));
const state=()=>page.locator('.stone-hero').getAttribute('data-state');
const index=()=>page.locator('.stone-hero').getAttribute('data-project');
const y=()=>page.evaluate(()=>scrollY);
const shot=name=>page.screenshot({path:`${dir}/${name}.png`});
async function gesture(delta,x=720,y=500){await page.waitForTimeout(300);await page.mouse.move(x,y);await page.mouse.wheel(0,delta);}
await shot('logo');await gesture(90);await page.waitForTimeout(1900);assert.equal(await state(),'materials');await shot('materials');
await gesture(90);await page.waitForTimeout(600);await shot('transition');await page.waitForTimeout(700);
assert.equal(await state(),'projects');assert.equal(await index(),'0');assert.equal(await y(),0);await shot('projects-first');
const sides=await page.locator('.hero-project-card[data-slot="-1"],.hero-project-card[data-slot="1"]').evaluateAll(els=>els.map(e=>({opacity:getComputedStyle(e).opacity,rect:e.getBoundingClientRect().toJSON()})));
assert.ok(sides.every(s=>Number(s.opacity)>0&&s.rect.right>0&&s.rect.left<1440));
await gesture(150,720,150);await page.waitForTimeout(300);assert.equal(await index(),'0');assert.equal(await y(),0);
await gesture(90);for(let i=0;i<18;i++){await page.waitForTimeout(70);await page.mouse.wheel(0,8);}
assert.equal(await index(),'1');assert.equal(await y(),0);assert.equal(await page.locator('.hero-project-meta a').getAttribute('href'),'/catalogo?tipo=projeto');
await shot('projects-second');await gesture(-90);await page.waitForTimeout(900);assert.equal(await index(),'0');
await gesture(-90);await page.waitForTimeout(1300);assert.equal(await state(),'materials');
await gesture(-90);await page.waitForTimeout(1900);assert.equal(await state(),'logo');
// Keyboard enters the gallery and puts focus in its interaction area.
await page.locator('#main').focus();await page.keyboard.press('PageDown');await page.waitForTimeout(1900);
await page.keyboard.press('PageDown');await page.waitForTimeout(1300);
assert.ok(await page.locator('.hero-projects').evaluate(e=>e===document.activeElement));
await page.keyboard.press('ArrowRight');await page.waitForTimeout(900);assert.equal(await index(),'1');
await page.locator('.hero-project-meta a').click();await page.waitForURL('**/catalogo?tipo=projeto');
assert.ok((await page.locator('.filters .selected').innerText()).startsWith('Projetos'));
await page.goto('http://localhost:3000');await page.waitForLoadState('networkidle');await page.emulateMedia({reducedMotion:'reduce'});
await page.locator('#main').focus();await page.keyboard.press('PageDown');await page.keyboard.press('PageDown');
assert.equal(await state(),'projects');
for(let i=1;i<items.length;i++)await page.keyboard.press('ArrowRight');
await gesture(90,720,150);assert.equal(await y(),0);
await gesture(1100);await page.waitForTimeout(400);assert.ok(await y()>100);await shot('footer');
// Touch including horizontal swipes and gestures outside the carousel.
const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await mobile.goto('http://localhost:3000');await mobile.waitForLoadState('networkidle');
const cdp=await mobile.context().newCDPSession(mobile);
async function swipe(x,y,dx,dy){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});await mobile.waitForTimeout(25);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
await swipe(195,520,0,-150);await mobile.waitForTimeout(1900);await swipe(195,520,0,-150);await mobile.waitForTimeout(1300);
assert.equal(await mobile.locator('.stone-hero').getAttribute('data-state'),'projects');await mobile.screenshot({path:`${dir}/mobile-first.png`});
await swipe(195,180,0,-80);assert.equal(await mobile.evaluate(()=>scrollY),0);assert.equal(await mobile.locator('.stone-hero').getAttribute('data-project'),'0');
await swipe(260,420,-150,0);await mobile.waitForTimeout(900);assert.equal(await mobile.locator('.stone-hero').getAttribute('data-project'),'1');
await swipe(110,420,150,0);await mobile.waitForTimeout(900);await swipe(110,420,150,0);await mobile.waitForTimeout(1300);
assert.equal(await mobile.locator('.stone-hero').getAttribute('data-state'),'materials');
await swipe(195,420,0,130);await mobile.waitForTimeout(1900);assert.equal(await mobile.locator('.stone-hero').getAttribute('data-state'),'logo');
assert.deepEqual(errors,[]);console.log(`PASS: sequence, inertia, outside/inside wheel, reverse, project link, keyboard, reduced motion, footer and mobile touch. Screenshots: ${dir}`);
await browser.close();
