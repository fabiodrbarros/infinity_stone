import defaults from '../shared/translations.json' with {type:'json'};
import {withDetails} from './project-details.js';
export function registerTranslations(app,db,auth,{fetcher=fetch,apiKey=process.env.DEEPL_API_KEY||''}={}){
  db.exec('CREATE TABLE IF NOT EXISTS translations (key TEXT NOT NULL, lang TEXT NOT NULL, source TEXT NOT NULL, draft TEXT NOT NULL, published TEXT, published_source TEXT, PRIMARY KEY(key,lang))');
  const languages=['en','fr'];
  function sources(publicOnly=false){
    const result=Object.entries(defaults).map(([source,base])=>({key:'site:'+source,source,base,group:'site',label:'Textos do site'}));
    for(const item of db.prepare(`SELECT * FROM items ${publicOnly?'WHERE published=1':''}`).all().map(withDetails)){
      const add=(field,value)=>{if(value)result.push({key:`item:${item.id}:${field}`,source:value,base:{},group:`item:${item.id}`,label:item.title});};
      for(const field of ['title','description','material'])add(field,item[field]);
      item.materials?.forEach((m,i)=>['name','format','finish','thickness'].forEach(field=>add(`materials.${i}.${field}`,m[field])));
    }return result;
  }
  app.get('/api/translations',(req,res)=>{const allowed=new Map(sources(true).map(s=>[s.key,s.source]));const result={en:{},fr:{}};for(const row of db.prepare('SELECT * FROM translations WHERE published IS NOT NULL').all())if(allowed.get(row.key)===row.published_source)result[row.lang][row.key]={source:row.published_source,value:row.published};res.json(result);});
  app.get('/api/admin/translations',auth,(req,res)=>{const lang=req.query.lang;if(!languages.includes(lang))return res.status(400).json({error:'Idioma inválido.'});const saved=new Map(db.prepare('SELECT * FROM translations WHERE lang=?').all(lang).map(row=>[row.key,row]));res.json({automatic:!!apiKey,entries:sources().map(s=>({...s,base:s.base[lang]||'',saved:saved.get(s.key)||null}))});});
  app.put('/api/admin/translations',auth,(req,res)=>{
    const {lang,entries,publish}=req.body||{};if(!languages.includes(lang)||!Array.isArray(entries)||!entries.length||entries.length>400||typeof publish!=='boolean')return res.status(400).json({error:'Traduções inválidas.'});
    const current=new Map(sources().map(s=>[s.key,s.source]));const seen=new Set();const tokens=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join('|');
    for(const e of entries){if(!e||typeof e.key!=='string'||seen.has(e.key)||typeof e.value!=='string'||e.value.length>12000||!e.value.trim())return res.status(400).json({error:'Traduções inválidas.'});seen.add(e.key);if(!current.has(e.key)||typeof e.source!=='string'||current.get(e.key)!==e.source)return res.status(409).json({error:'O original foi alterado. Atualize antes de traduzir.'});if(tokens(e.source)!==tokens(e.value))return res.status(400).json({error:'Mantenha os campos entre chavetas na tradução.'});}
    const statement=db.prepare('INSERT INTO translations (key,lang,source,draft,published,published_source) VALUES (?,?,?,?,?,?) ON CONFLICT(key,lang) DO UPDATE SET source=excluded.source,draft=excluded.draft,published=CASE WHEN ? THEN excluded.published ELSE translations.published END,published_source=CASE WHEN ? THEN excluded.published_source ELSE translations.published_source END');
    db.exec('BEGIN');try{for(const e of entries)statement.run(e.key,lang,e.source,e.value,publish?e.value:null,publish?e.source:null,+publish,+publish);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}res.json({ok:true});
  });
  let generating=false;
  app.post('/api/admin/translations/generate',auth,async(req,res)=>{
    const {lang,keys}=req.body||{};if(!languages.includes(lang)||!Array.isArray(keys)||!keys.length||keys.length>50||new Set(keys).size!==keys.length)return res.status(400).json({error:'Traduções inválidas.'});
    const current=new Map(sources().map(s=>[s.key,s]));const selected=keys.map(key=>current.get(key));if(selected.some(s=>!s))return res.status(400).json({error:'Traduções inválidas.'});
    if(!apiKey){if(selected.some(s=>!s.base[lang]))return res.status(503).json({error:'Configure DEEPL_API_KEY no servidor para gerar traduções de projetos.'});return res.json({entries:selected.map(s=>({key:s.key,source:s.source,value:s.base[lang]}))});}
    if(generating)return res.status(429).json({error:'Já existe uma tradução em curso. Tente novamente.'});generating=true;
    try{const host=apiKey.endsWith(':fx')?'api-free.deepl.com':'api.deepl.com';const response=await fetcher(`https://${host}/v2/translate`,{method:'POST',headers:{Authorization:`DeepL-Auth-Key ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({text:selected.map(s=>s.source),source_lang:'PT',target_lang:lang==='en'?'EN-GB':'FR',preserve_formatting:true}),signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error();const data=await response.json();if(data.translations?.length!==selected.length||data.translations.some(r=>typeof r.text!=='string'||!r.text.trim()||r.text.length>12000))throw Error();res.json({entries:selected.map((s,i)=>({key:s.key,source:s.source,value:data.translations[i].text}))});}
    catch{res.status(502).json({error:'Não foi possível gerar a tradução. Verifique a configuração e a quota DeepL.'});}finally{generating=false;}
  });
}
