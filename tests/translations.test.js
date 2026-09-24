import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {DatabaseSync} from 'node:sqlite';
import {registerTranslations} from '../server/translations.js';

test('translation drafts, review, stale originals, private entries and automatic proposals',async()=>{
 const db=new DatabaseSync(':memory:');
 db.exec("CREATE TABLE items (id INTEGER PRIMARY KEY,title TEXT,description TEXT,material TEXT,published INTEGER,details TEXT);INSERT INTO items VALUES (1,'Cozinha','Pedra clara','Mármore',1,'{}'),(2,'Privado','Descrição privada','Granito',0,'{}')");
 let calls=[];
 const app=express();app.use(express.json());
 registerTranslations(app,db,(req,res,next)=>req.headers.authorization==='test'?next():res.sendStatus(401),{apiKey:'test:fx',fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({translations:JSON.parse(options.body).text.map(text=>({text:'Translated '+text}))})};}});
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=(url,body,method='POST',authenticated=true)=>fetch(base+url,{method,headers:{'Content-Type':'application/json',...(authenticated?{Authorization:'test'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const publicData=async()=> (await request('/api/translations',null,'GET',false)).json();
 const placeholder={key:'site:Ver projeto — {title}',source:'Ver projeto — {title}',value:'View project'};
 const entry={key:'item:1:title',source:'Cozinha',value:'Kitchen'};
 try{
  assert.equal((await request('/api/admin/translations?lang=en',null,'GET',false)).status,401);
  assert.equal((await request('/api/admin/translations',{lang:'en',entries:[entry],publish:false},'PUT')).status,200);
  assert.deepEqual((await publicData()).en,{});
  assert.equal((await request('/api/admin/translations',{lang:'en',entries:[placeholder],publish:true},'PUT')).status,400);
  assert.equal((await request('/api/admin/translations',{lang:'en',entries:[entry],publish:true},'PUT')).status,200);
  assert.equal((await publicData()).en[entry.key].value,'Kitchen');
  await request('/api/admin/translations',{lang:'en',entries:[{...entry,value:'Draft kitchen'}],publish:false},'PUT');
  assert.equal((await publicData()).en[entry.key].value,'Kitchen');
  await request('/api/admin/translations',{lang:'en',entries:[{key:'item:2:title',source:'Privado',value:'Private'}],publish:true},'PUT');
  assert.equal((await publicData()).en['item:2:title'],undefined);
  const generated=await request('/api/admin/translations/generate',{lang:'fr',keys:['item:1:title']});
  assert.equal(generated.status,200);assert.equal((await generated.json()).entries[0].value,'Translated Cozinha');
  assert.equal(calls[0].url,'https://api-free.deepl.com/v2/translate');assert.equal(JSON.parse(calls[0].options.body).target_lang,'FR');
  assert.deepEqual((await publicData()).fr,{});
  db.prepare('UPDATE items SET title=? WHERE id=1').run('Nova cozinha');
  assert.equal((await publicData()).en[entry.key],undefined);
  assert.equal((await request('/api/admin/translations',{lang:'en',entries:[entry],publish:true},'PUT')).status,409);
  assert.equal((await request('/api/admin/translations',{lang:'en',entries:[{key:'unknown',value:'bad'}],publish:true},'PUT')).status,409);
  assert.equal((await request('/api/admin/translations/generate',{lang:'pt',keys:['item:1:title']})).status,400);
  assert.equal((await request('/api/admin/translations/generate',{lang:'en',keys:['unknown']})).status,400);
 }finally{await new Promise(resolve=>server.close(resolve));db.close();}
});

test('missing provider supports site defaults and reports unavailable content generation',async()=>{
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE items (id INTEGER PRIMARY KEY,title TEXT,description TEXT,material TEXT,published INTEGER,details TEXT);INSERT INTO items VALUES (1,'Cozinha','','',1,'{}')");
 const app=express();app.use(express.json());registerTranslations(app,db,(req,res,next)=>next(),{apiKey:''});
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const generate=keys=>fetch(`http://127.0.0.1:${server.address().port}/api/admin/translations/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:'en',keys})});
 try{assert.equal((await generate(['site:Projetos'])).status,200);assert.equal((await generate(['item:1:title'])).status,503);}finally{await new Promise(resolve=>server.close(resolve));db.close();}
});
