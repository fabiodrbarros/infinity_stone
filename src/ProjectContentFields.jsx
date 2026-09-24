import {useI18n} from './i18n.jsx';
import React from 'react';

export default function ProjectContentFields({item,setItem,busy,setBusy,setError}){
  const {t}=useI18n();
  const materials=item.materials||[],images=item.images||[];
  function changeMaterial(index,patch){setItem(old=>({...old,materials:(old.materials||[]).map((m,i)=>i===index?{...m,...patch}:m)}));}
  async function upload(event,materialIndex=null){
    const files=[...event.target.files];event.target.value='';if(!files.length)return;
    if(materialIndex===null&&images.length+files.length>20){setError('Pode adicionar até 20 fotografias.');return;}
    setBusy(true);setError('');
    try{
      for(const file of files){
        if(file.size>5*1024*1024)throw new Error('Cada imagem deve ter no máximo 5 MB.');
        const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
        const response=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data})});
        const result=await response.json();if(!response.ok)throw new Error(result.error);
        if(materialIndex===null)setItem(old=>({...old,images:[...(old.images||[]),result.image]}));
        else changeMaterial(materialIndex,{image:result.image});
      }
    }catch(error){setError(error.message);}finally{setBusy(false);}
  }
  return <fieldset className="project-content-fields" disabled={busy}>
    <legend>{t("Fotografias e materiais do projeto")}</legend>
    <p>{t("A imagem principal é a capa. Acrescente outras fotografias e os materiais utilizados.")}</p>
    <div className="project-admin-photos">{images.map((src,i)=><div key={`${src}-${i}`}><img src={src} alt={t("Fotografia adicional {number}",{number:i+1})}/><button type="button" onClick={()=>setItem(old=>({...old,images:old.images.filter((_,n)=>n!==i)}))}>{t("Remover fotografia {number}",{number:i+1})}</button></div>)}</div>
    <label>{t("Adicionar fotografias")}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload}/></label>
    {materials.map((m,i)=><div className="project-admin-material" key={i}>
      <label>{t("Nome do material")}<input required maxLength={80} value={m.name} onChange={e=>changeMaterial(i,{name:e.target.value})}/></label>
      <div className="two-fields"><label>{t("Formato")}<input maxLength={120} value={m.format||''} onChange={e=>changeMaterial(i,{format:e.target.value})}/></label><label>{t("Acabamento")}<input maxLength={120} value={m.finish||''} onChange={e=>changeMaterial(i,{finish:e.target.value})}/></label></div>
      <label>{t("Espessura")}<input maxLength={120} value={m.thickness||''} onChange={e=>changeMaterial(i,{thickness:e.target.value})}/></label>
      {m.image&&<><img className="project-admin-swatch" src={m.image} alt={m.name}/><button type="button" onClick={()=>changeMaterial(i,{image:''})}>{t("Remover imagem do material")}</button></>}
      <label>{t("Fotografia do material")}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e,i)}/></label>
      <button type="button" onClick={()=>setItem(old=>({...old,materials:old.materials.filter((_,n)=>n!==i)}))}>{t("Remover material")}</button>
    </div>)}
    <button type="button" disabled={materials.length>=12} onClick={()=>setItem(old=>({...old,materials:[...(old.materials||[]),{name:'',image:'',format:'',finish:'',thickness:''}]}))}>{t("Adicionar material")}</button>
  </fieldset>;
}
