import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {cover} from './hero-projects.js';
import './projects-gallery.css';

export default function ProjectsGallery({items}){
  const projects=useMemo(()=>items.filter(item=>item.type==='projeto'),[items]);
  const [position,setPosition]=useState(0),[busy,setBusy]=useState(false),[size,setSize]=useState({scale:1,mobile:false});
  const stage=useRef(),frame=useRef(0),active=useRef(0),locked=useRef(false),touch=useRef(null),suppressClick=useRef(0);
  const wrap=n=>((n%projects.length)+projects.length)%projects.length;
  const selected=projects[wrap(Math.round(position))];
  useEffect(()=>{
    const element=stage.current;if(!element)return;
    const update=()=>setSize({scale:element.clientWidth/900,mobile:innerWidth<650});
    const observer=new ResizeObserver(update);observer.observe(element);update();
    return()=>{observer.disconnect();cancelAnimationFrame(frame.current);};
  },[projects.length]);
  function go(direction){
    if(locked.current||projects.length<2)return;
    const from=active.current,to=from+direction;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){active.current=to;setPosition(to);return;}
    locked.current=true;setBusy(true);const started=performance.now();
    const tick=now=>{const t=Math.min(1,(now-started)/800),ease=t*t*(3-2*t);setPosition(from+(to-from)*ease);
      if(t<1)frame.current=requestAnimationFrame(tick);else{active.current=to;locked.current=false;setBusy(false);}};
    frame.current=requestAnimationFrame(tick);
  }
  if(!selected)return <section className="projects-empty"><p>Ainda não existem projetos publicados.</p></section>;
  const slots=projects.length===1?[0]:Array.from({length:5},(_,i)=>Math.floor(position)-2+i);
  return <section className="projects-gallery" aria-label="Projetos Infinity Stone" onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();go(event.key==='ArrowRight'?1:-1);}}}>
    <h1 className="projects-page-title"><span className="projects-page-heading-desktop">Cada projeto nasce de uma relação única<br/><span>entre matéria e espaço.</span></span><span className="projects-page-heading-mobile">Cada projeto nasce de uma relação<br/><span>única entre matéria e espaço.</span></span></h1>
    <div className="projects-page-stage" ref={stage} style={{height:380*size.scale}} role="region" aria-roledescription="carrossel" aria-label="Projetos" tabIndex={0} aria-busy={busy}
      onTouchStart={e=>{touch.current=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;}}
      onTouchEnd={e=>{if(!touch.current)return;const dx=touch.current.x-e.changedTouches[0].clientX,dy=touch.current.y-e.changedTouches[0].clientY;touch.current=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){suppressClick.current=Date.now()+500;go(dx>0?1:-1);}}}>
      <div className="projects-page-viewport"><div className="projects-page-scene" style={{transform:`translateX(-50%) scale(${size.scale})`}}>
        {slots.map(slot=>{const item=projects[wrap(slot)],c=cover(slot-position,size.mobile),central=Math.round(position)===slot;return <Link key={slot} className="projects-page-card" to={`/catalogo/${item.id}`} tabIndex={central&&!busy?0:-1} aria-hidden={!central} aria-label={`Ver projeto — ${item.title}`}
          onClick={e=>{if(busy||Date.now()<suppressClick.current||!central)e.preventDefault();}}
          style={{width:c.w,height:c.h,left:c.x-c.w/2,top:c.y-c.h/2-110,zIndex:100-Math.round(c.a*10),opacity:c.opacity,filter:`brightness(${1-Math.min(c.a,1)*.23}) blur(${Math.min(c.a,1)*2.5}px)`,pointerEvents:central&&!busy?'auto':'none'}}>
          <img src={item.image} alt=""/><strong style={{opacity:1-Math.min(c.a,1)}}>{item.title}</strong>
        </Link>;})}
      </div></div>
    <div className="projects-page-controls">
      <button type="button" disabled={busy||projects.length<2} onClick={()=>go(-1)} aria-label="Projeto anterior"><ArrowLeft size={20}/></button>
      <button type="button" disabled={busy||projects.length<2} onClick={()=>go(1)} aria-label="Projeto seguinte"><ArrowRight size={20}/></button>
    </div>
    </div>
    <p className="projects-page-counter" aria-label={`Projeto ${wrap(Math.round(position))+1} de ${projects.length}`}><span>{String(wrap(Math.round(position))+1).padStart(2,'0')}</span><span aria-hidden="true">/</span><span>{String(projects.length).padStart(2,'0')}</span></p>
    <span className="sr-only" role="status" aria-live="polite">{!busy&&selected.title}</span>
  </section>;
}
