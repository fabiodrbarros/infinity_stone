import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base='http://localhost:3000';
test('public access, authentication, origin protection and persistent catalogue lifecycle',async()=>{
 assert.equal((await fetch(base+'/api/admin/catalogue')).status,401);
 assert.equal((await fetch(base+'/api/admin/catalogue',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 assert.equal((await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'invalid'})})).status,401);
 const password=readFileSync('data/acesso-local.txt','utf8').match(/Palavra-passe: (.+)/)[1].trim();
 const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];const headers={'Content-Type':'application/json',Cookie:cookie};
 assert.equal((await fetch(base+'/api/admin/catalogue',{method:'POST',headers:{...headers,Origin:'https://untrusted.example'},body:'{}'})).status,403);
 const item={title:'API test draft',type:'produto',material:'Teste',description:'Test',image:'/assets/stone.jpg',published:false};
 const created=await fetch(base+'/api/admin/catalogue',{method:'POST',headers,body:JSON.stringify(item)});assert.equal(created.status,201);const {id}=await created.json();
 try{assert.equal((await (await fetch(base+'/api/catalogue')).json()).some(x=>x.id===id),false);assert.equal((await fetch(base+`/api/admin/catalogue/${id}`,{method:'PUT',headers,body:JSON.stringify({...item,published:true})})).status,200);assert.equal((await (await fetch(base+'/api/catalogue')).json()).some(x=>x.id===id),true);assert.equal((await fetch(base+'/api/admin/upload',{method:'POST',headers,body:JSON.stringify({data:'data:image/png;base64,aGVsbG8='})})).status,400);}finally{assert.equal((await fetch(base+`/api/admin/catalogue/${id}`,{method:'DELETE',headers})).status,200)}
 await fetch(base+'/api/logout',{method:'POST',headers});assert.equal((await fetch(base+'/api/session',{headers})).status,401);
});
