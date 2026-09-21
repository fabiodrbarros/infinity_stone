import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000');
await page.getByRole('navigation').getByRole('link',{name:'Catálogo',exact:true}).focus();
await page.keyboard.press('Enter');
await page.waitForFunction(()=>document.activeElement?.id==='main');
await page.getByRole('button',{name:/Produtos/}).click();
await page.getByRole('status').filter({hasText:'3 resultados encontrados'}).waitFor();
await page.getByRole('textbox',{name:'Pesquisar no catálogo'}).fill('no-match');
await page.getByRole('status').filter({hasText:'0 resultados encontrados'}).waitFor();
for(const viewport of [{width:375,height:812},{width:667,height:375},{width:768,height:1024}]){
  await page.setViewportSize(viewport);
  for(const route of ['/','/catalogo','/contactos','/admin']){
    await page.goto('http://localhost:3000'+route);await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${viewport.width}`);
    if(route==='/contactos'&&viewport.width<=700){
      assert.equal(await page.getByLabel('Email',{exact:true}).evaluate(e=>getComputedStyle(e).fontSize),'16px');
      await page.screenshot({path:`.impeccable/review/usability-contacts-${viewport.width}.png`,fullPage:true});
    }
  }
  if(viewport.width<=700){
    await page.goto('http://localhost:3000');
    await page.getByRole('button',{name:'Abrir menu'}).click();
    const link=page.getByRole('navigation').getByRole('link',{name:'Contactos',exact:true});
    await link.focus();await page.keyboard.press('Enter');
    await page.getByRole('heading',{name:'Contactos',exact:true}).waitFor();
    await page.waitForFunction(()=>document.activeElement?.id==='main');
  }
}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS keyboard route focus, contextual result count, 16px mobile fields, portrait/landscape/tablet routes, menu access and no overflow.');
