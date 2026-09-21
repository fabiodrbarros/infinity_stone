import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';

const easeOut='cubic-bezier(0.23, 1, 0.32, 1)';
const running=new Set();
export function allowMotion(){return !window.matchMedia('(prefers-reduced-motion: reduce)').matches&&document.documentElement.dataset.input!=='keyboard';}
export function animate(element,frames,{duration=220,...options}={}){
  if(!element||!allowMotion())return null;
  const animation=element.animate(frames,{duration,easing:easeOut,...options});
  running.add(animation);
  const clear=()=>running.delete(animation);
  animation.addEventListener('finish',clear,{once:true});
  animation.addEventListener('cancel',clear,{once:true});
  return animation;
}
export function useInputMotion(){
  useEffect(()=>{
    const root=document.documentElement;
    root.dataset.input='pointer';
    const cancel=()=>{for(const animation of running)animation.cancel();};
    const keyboard=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;root.dataset.input='keyboard';cancel();};
    const pointer=()=>{root.dataset.input='pointer';};
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference=()=>{if(query.matches)cancel();};
    document.addEventListener('keydown',keyboard,true);
    document.addEventListener('pointerdown',pointer,true);
    query.addEventListener('change',preference);
    return()=>{document.removeEventListener('keydown',keyboard,true);document.removeEventListener('pointerdown',pointer,true);query.removeEventListener('change',preference);cancel();};
  },[]);
}
export function useMobile(){
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 700px)').matches);
  useEffect(()=>{const query=window.matchMedia('(max-width: 700px)');const change=()=>setMobile(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
  return mobile;
}
// Read the painted object-fit area, rather than the taller header link box.
function logoRect(image){
  const box=image.getBoundingClientRect();
  const ratio=(image.naturalWidth||350)/(image.naturalHeight||351);
  const width=Math.min(box.width,box.height*ratio),height=width/ratio;
  return {left:box.left+(box.width-width)/2,top:box.top+(box.height-height)/2,width,height};
}
// Same on-screen easing as --motion-shift, evaluated for a moving destination.
function transferEase(progress){
  const bezier=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
  let low=0,high=1;
  for(let i=0;i<16;i++){const mid=(low+high)/2;if(bezier(mid,.77,.175)<progress)low=mid;else high=mid;}
  return bezier((low+high)/2,0,1);
}
export function useLogoTransfer(scrolled,path){
  const previous=useRef(scrolled),interrupted=useRef(null);
  useLayoutEffect(()=>{
    const changed=previous.current!==scrolled;previous.current=scrolled;
    if(!changed||path!=='/'||!allowMotion()){interrupted.current=null;return;}
    const hero=document.querySelector('.hero-logo'),brand=document.querySelector('.header .brand img');
    if(!hero||!brand)return;
    // A page entrance must not compete with the shared logo transfer.
    for(const animation of hero.closest('.tura-title').getAnimations())animation.cancel();
    const source=interrupted.current||logoRect(scrolled?hero:brand);
    interrupted.current=null;
    const ghost=hero.cloneNode();
    ghost.removeAttribute('class');ghost.alt='';ghost.setAttribute('aria-hidden','true');
    Object.assign(ghost.style,{position:'fixed',left:'0',top:'0',width:source.width+'px',height:source.height+'px',filter:getComputedStyle(hero).filter,mixBlendMode:getComputedStyle(hero).mixBlendMode,pointerEvents:'none',zIndex:50,transformOrigin:'top left'});
    document.getElementById('root').appendChild(ghost);
    hero.style.visibility='hidden';brand.style.visibility='hidden';
    let frame,finished=false,current=source;
    const draw=rect=>{ghost.style.transform='translate('+rect.left+'px,'+rect.top+'px) scale('+rect.width/source.width+')';};
    draw(source);
    const restore=()=>{
      if(finished)return;
      finished=true;cancelAnimationFrame(frame);ghost.remove();
      hero.style.removeProperty('visibility');brand.style.removeProperty('visibility');
    };
    const started=performance.now();
    const tick=now=>{
      if(!allowMotion()){restore();return;}
      const progress=Math.min(1,(now-started)/450),ease=transferEase(progress);
      // The central logo moves with scroll; follow it until the actual handoff.
      const target=logoRect(scrolled?brand:hero);
      current={left:source.left+(target.left-source.left)*ease,top:source.top+(target.top-source.top)*ease,width:source.width+(target.width-source.width)*ease,height:source.height+(target.height-source.height)*ease};
      draw(current);
      if(progress===1)restore();else frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop=()=>{if(!allowMotion())restore();};
    document.addEventListener('keydown',stop);
    preference.addEventListener('change',stop);
    return()=>{
      if(!finished)interrupted.current=current;
      restore();
      document.removeEventListener('keydown',stop);
      preference.removeEventListener('change',stop);
    };
  },[scrolled,path]);
}
export function useRouteFocus(path){
  const previous=useRef(path);
  useEffect(()=>{
    if(previous.current===path)return;
    previous.current=path;
    if(document.documentElement.dataset.input==='keyboard')document.getElementById('main')?.focus({preventScroll:true});
  },[path]);
}
// The image underneath is already updated and usable. The retiring image is
// decorative, cannot receive input, and is removed on finish or interruption.
export function GalleryImage({src,alt,direction=1}){
  const container=useRef(),previous=useRef(src);
  useLayoutEffect(()=>{
    const old=previous.current;previous.current=src;
    if(old===src||!allowMotion())return;
    const node=container.current,image=node.querySelector('img');
    const ghost=image.cloneNode();ghost.src=old;ghost.alt='';ghost.setAttribute('aria-hidden','true');ghost.className='gallery-image-previous';
    node.appendChild(ghost);
    const entering=animate(image,[{opacity:.55,translate:`${direction*12}px 0`},{opacity:1,translate:'0px 0'}]);
    const leaving=animate(ghost,[{opacity:1,translate:'0px 0'},{opacity:0,translate:`${direction*-8}px 0`}]);
    const remove=()=>ghost.remove();
    leaving?.addEventListener('finish',remove,{once:true});leaving?.addEventListener('cancel',remove,{once:true});
    return()=>{entering?.cancel();leaving?.cancel();remove();};
  },[src,direction]);
  return <span className="gallery-image-surface" ref={container}><img src={src} alt={alt}/></span>;
}
export function usePageEntry(path,scope){
  useEffect(()=>{
    if(path.startsWith('/admin'))return;
    const title=scope.current?.querySelector('.tura-title, .page-hero h1, .tura-contact-panel:not(.embedded) h1, .detail-heading');
    const entry=animate(title,[{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:path==='/'?420:220});
    return()=>entry?.cancel();
  },[path,scope]);
}
export function revealService(element){
  if(!element)return;
  for(const animation of element.getAnimations())animation.cancel();
  animate(element,[{opacity:.5,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180});
}
