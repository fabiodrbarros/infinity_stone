import React,{createContext,useContext,useState,useEffect,useCallback,useMemo} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import defaults from '../shared/translations.json';
const Context=createContext(null);
const valid=value=>['pt','en','fr'].includes(value);
export function LanguageProvider({children}){
  const navigate=useNavigate(),route=useLocation();
  const [locale,updateLocale]=useState(()=>{try{const query=new URLSearchParams(location.search).get('lang');return valid(query)?query:(valid(localStorage.getItem('language'))?localStorage.getItem('language'):'pt');}catch{return 'pt';}});
  const setLocale=useCallback(lang=>{if(!valid(lang))return;updateLocale(lang);const query=new URLSearchParams(route.search);query.set('lang',lang);navigate({...route,search:'?'+query.toString()},{replace:true});},[navigate,route]);
  const [published,setPublished]=useState({}),[revision,setRevision]=useState(0);
  useEffect(()=>{document.documentElement.lang=locale;try{localStorage.setItem('language',locale);}catch{}},[locale]);
  useEffect(()=>{const controller=new AbortController();fetch('/api/translations',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(setPublished).catch(()=>{});return()=>controller.abort();},[revision]);
  const translate=useCallback((key,source,fallback=source)=>{const saved=published[locale]?.[key];return saved?.source===source?saved.value:fallback;},[locale,published]);
  const t=useCallback((source,values={})=>{const result=locale==='pt'?source:translate('site:'+source,source,defaults[source]?.[locale]||source);return result.replace(/\{(\w+)\}/g,(all,key)=>values[key]??all);},[locale,translate]);
  const translateItem=useCallback(item=>{
    if(locale==='pt')return item;
    const field=(key,value='')=>translate(`item:${item.id}:${key}`,value,t(value));
    return {...item,title:field('title',item.title),description:field('description',item.description),material:field('material',item.material),materials:item.materials?.map((m,i)=>({...m,...Object.fromEntries(['name','format','finish','thickness'].map(k=>[k,field(`materials.${i}.${k}`,m[k])]))}))};
  },[locale,translate,t]);
  const refresh=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{document.querySelector('meta[name="description"]')?.setAttribute('content',t('DA NATUREZA NASCE A MATÉRIA. DA TRANSFORMAÇÃO NASCE O ESPAÇO.'));},[t]);
  const value=useMemo(()=>({locale,setLocale,t,translateItem,refresh}),[locale,setLocale,t,translateItem,refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useI18n=()=>useContext(Context);
export function LanguageSelector(){const {locale,setLocale}=useI18n();return <div className="language-selector" role="group" aria-label="PT / EN / FR">{['pt','en','fr'].map(lang=><button type="button" key={lang} lang={lang} aria-label={{pt:'Português',en:'English',fr:'Français'}[lang]} aria-pressed={locale===lang} onClick={()=>setLocale(lang)}>{lang.toUpperCase()}</button>)}</div>;}
