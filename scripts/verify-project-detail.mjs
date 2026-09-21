import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
const base='http://localhost:3000';
const password=readFileSync('data/acesso-local.txt','utf8').match(/Palavra-passe: (.+)/)[1].trim();
const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password})});
assert.equal(login.status,200);
const headers={'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0]};
const fixture={title:'Projeto de verificação',type:'projeto',material:'Mármore',description:'Descrição de teste para verificar a composição com várias fotografias e materiais.',image:'/assets/interior.jpg',published:false,images:['/assets/stone.jpg','/assets/marble.jpg'],materials:[{name:'Mármore',image:'/assets/marble.jpg',format:'60 × 60 cm',finish:'Polido',thickness:'20 mm'},{name:'Granito',image:'/assets/stone.jpg',format:'À medida',finish:'Escovado',thickness:'30 mm'}]};
const created=await fetch(base+'/api/admin/catalogue',{method:'POST',headers,body:JSON.stringify(fixture)});assert.equal(created.status,201);const {id}=await created.json();
let browser;
try{
 const saved=(await(await fetch(base+'/api/admin/catalogue',{headers})).json()).find(i=>i.id===id);
 assert.deepEqual(saved.images,fixture.images);assert.deepEqual(saved.materials,fixture.materials);
 assert.equal((await(await fetch(base+'/api/catalogue')).json()).some(i=>i.id===id),false);
 for(const patch of [{images:['https://invalid.example/image.jpg']},{materials:[{name:''}]}])assert.equal((await fetch(base+`/api/admin/catalogue/${id}`,{method:'PUT',headers,body:JSON.stringify({...fixture,...patch})})).status,400);
 assert.equal((await fetch(base+`/api/admin/catalogue/${id}`,{method:'PUT',headers,body:JSON.stringify({...fixture,description:'Descrição atualizada'})})).status,200);
 const updated=(await(await fetch(base+'/api/admin/catalogue',{headers})).json()).find(i=>i.id===id);assert.equal(updated.description,'Descrição atualizada');assert.deepEqual(updated.materials,fixture.materials);
 browser=await chromium.launch({channel:'msedge'});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const real=(await(await fetch(base+'/api/catalogue')).json()).find(i=>i.type==='projeto');
 await page.goto(base+`/catalogo/${real.id}`);await page.waitForLoadState('networkidle');assert.equal(await page.locator('.project-information h1').textContent(),real.title);
 await page.route('**/api/catalogue',route=>route.fulfill({json:[{...fixture,id}]}));await page.goto(base+`/catalogo/${id}`);await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('.project-photo-picker button').count(),3);await page.getByRole('button',{name:'Mostrar fotografia 2'}).click();assert.equal(await page.locator('.project-photograph img').getAttribute('src'),fixture.images[0]);
 await page.getByRole('button',{name:'Granito',exact:true}).click();assert.equal(await page.locator('.project-material-image').getAttribute('src'),fixture.materials[1].image);assert.match(await page.locator('.project-specifications').textContent(),/30 mm/);
 await page.getByRole('button',{name:'Mármore',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'Mármore',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Mostrar fotografia 1'}).click();
 const dir='.impeccable/project-detail';mkdirSync(dir,{recursive:true});await page.screenshot({path:dir+'/desktop.png',fullPage:true});
 for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('.project-material-image').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Granito',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Granito',exact:true}).getAttribute('aria-pressed'),'true');await page.screenshot({path:dir+`/mobile-${width}.png`,fullPage:true});await page.locator('footer').scrollIntoViewIfNeeded();assert.ok(await page.locator('footer').isVisible());}
 assert.deepEqual(errors,[]);console.log('PASS: draft persistence, validation, existing detail, photos, materials, keyboard, responsive widths, footer and browser errors. Screenshots: '+dir);
}finally{await browser?.close();await fetch(base+`/api/admin/catalogue/${id}`,{method:'DELETE',headers});await fetch(base+'/api/logout',{method:'POST',headers});}
