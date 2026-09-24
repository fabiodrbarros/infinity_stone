import {useI18n} from './i18n.jsx';
import React,{useLayoutEffect,useRef,useMemo} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {textures,finalTextures,clamp,ease,createRenderer} from './hero-animation-art.js';
import {createProjectRenderer} from './hero-projects.js';
import './stone-hero.css';

export default function StoneHero({items=[]}){
  const {t}=useI18n();
  const projects=useMemo(()=>items.filter(item=>item.type==='projeto'),[items]);
  const root=useRef(),savedProgress=useRef(0);
  const cornerLogoRef=useRef();
  useLayoutEffect(()=>{
    const hero=root.current, scene=hero.querySelector('.stone-scene');
    const slogan=hero.querySelector('.hero-slogan');
    const cornerLogo=cornerLogoRef.current;
    const updateLogoVisibility=()=>{
      const insideHero=Math.abs(hero.getBoundingClientRect().top)<=2;
      cornerLogo.style.visibility=insideHero&&Number(cornerLogo.style.opacity)>0?'visible':'hidden';
    };
    const renderArt=createRenderer([...hero.querySelectorAll('.piece')],hero.querySelector('.wordmark'),hero.querySelector('.material-title'));
    const renderProjects=createProjectRenderer(hero,projects);
    const gallery=hero.querySelector('.hero-projects');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const controller=new AbortController(), options={signal:controller.signal};
    let progress=Math.min(savedProgress.current,projects.length?projects.length+1:1),target=progress,frame=0,busy=false,initialScale=1,finalScale=1,finalShift=0,projectScale=1,projectShift=0,keyboardNavigation=false,transitionFrom=0;
    const last=projects.length?projects.length+1:1;
    let lastWheel=-Infinity,wheelConsumed=false,wheelEligible=false,wheelTotal=0,keyConsumed=null,touch=null;
    let departingProject=null;
    const atHero=()=>Math.abs(hero.getBoundingClientRect().top)<=2;
    const interactive=event=>event.target instanceof Element&&event.target.closest('a,button,input,textarea,select,[contenteditable="true"],dialog');
    const overCarousel=event=>{
      if(event.target?.closest?.('.hero-project-meta'))return true;
      const r=gallery.getBoundingClientRect();
      const inset=r.width*.05;
      return event.clientX>=r.left+inset&&event.clientX<=r.right-inset&&event.clientY>=r.top&&event.clientY<=r.bottom;
    };
    const canHandle=event=>!document.querySelector('dialog[open]')&&(!interactive(event)||event.target.closest('.hero-project-meta'));
    function render(value){
      progress=value; renderArt(value);
      renderProjects(value,busy,departingProject);
      // Fit the expanding faces before they become upright on narrow screens.
      const fan=ease(clamp(value-1));
      scene.style.setProperty('--stone-scale',value<=1?initialScale+(finalScale-initialScale)*ease(clamp(value/.5)):finalScale+(projectScale-finalScale)*fan);
      scene.style.setProperty('--stone-shift',`${value<=1?finalShift*ease(value):finalShift+(projectShift-finalShift)*fan}px`);
      slogan.style.opacity=1-ease(clamp(value/.16));
      slogan.style.visibility=value>=.16?'hidden':'visible';
      slogan.setAttribute('aria-hidden',String(value>=.16));
      let logoOpacity=ease(clamp((value-.54)/.46)),logoX=-80*(1-logoOpacity);
      if(busy&&transitionFrom>=1&&target>=1&&Math.min(transitionFrom,target)<2){
        const phase=clamp((value-transitionFrom)/(target-transitionFrom)),direction=Math.sign(target-transitionFrom);
        if(phase<.5){const exit=ease(clamp(phase/.45));logoOpacity=1-exit;logoX=-direction*80*exit;}
        else{const enter=ease(clamp((phase-.55)/.45));logoOpacity=enter;logoX=direction*80*(1-enter);}
      }
      cornerLogo.style.opacity=logoOpacity;
      cornerLogo.style.transform=`translateX(${logoX}px)`;
      updateLogoVisibility();
      hero.dataset.state=busy?'transitioning':value>=2?'projects':value===1?'materials':'logo';
    }
    function finish(){
      cancelAnimationFrame(frame);busy=false;departingProject=null;render(target);
      if(keyboardNavigation&&target>=2)gallery.focus({preventScroll:true});
      else if(keyboardNavigation&&target<2)document.getElementById('main')?.focus({preventScroll:true});
    }
    function go(direction,keyboard=false,previousSection=false){
      if(busy)return;
      keyboardNavigation=keyboard;
      departingProject=previousSection?Math.max(0,progress-2):null;
      if(previousSection)progress=2;
      target=previousSection?1:Math.max(0,Math.min(last,target+Math.sign(direction)));
      if(target===progress)return;
      transitionFrom=progress;
      if(reduced.matches){finish();return;}
      const from=progress,started=performance.now(),duration=Math.min(from,target)<1?1800:Math.min(from,target)<2?1200:800;busy=true;
      function tick(now){
        const t=clamp((now-started)/duration);
        render(from+(target-from)*ease(t));
        if(t<1)frame=requestAnimationFrame(tick);else finish();
      }
      frame=requestAnimationFrame(tick);
    }
    const needsTransition=direction=>busy||(direction>0?progress<last:progress>0);
    function wheel(event){
      if(event.ctrlKey)return;
      const delta=progress>=2&&Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(!delta)return;
      const now=performance.now();
      // A burst that brought the visitor back to the hero cannot also reverse it.
      if(now-lastWheel>240){wheelConsumed=false;wheelTotal=0;wheelEligible=atHero();}
      lastWheel=now;
      if(document.querySelector('dialog[open]')||!atHero()||!wheelEligible)return;
      const outside=progress>=2&&!overCarousel(event);
      if(outside&&event.deltaY<0&&!busy&&!wheelConsumed){
        event.preventDefault();
        wheelTotal+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
        if(wheelTotal<=-18){wheelConsumed=true;go(-1,false,true);}
        return;
      }
      if(!canHandle(event))return;
      const direction=Math.sign(delta);
      if(!wheelConsumed&&!needsTransition(direction))return;
      event.preventDefault();
      if(wheelConsumed||busy){wheelConsumed=true;return;}
      wheelTotal+=delta*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      if(Math.abs(wheelTotal)>=18){wheelConsumed=true;go(Math.sign(wheelTotal));}
    }
    function keydown(event){
      if(!canHandle(event)||!atHero()||event.ctrlKey||event.metaKey||event.altKey)return;
      if(interactive(event)&&[' ','Enter'].includes(event.key))return;
      const direction=['ArrowDown','PageDown','ArrowRight'].includes(event.key)||(event.key===' '&&!event.shiftKey)?1:
        ['ArrowUp','PageUp','ArrowLeft'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:0;
      // Home/End retain their normal document navigation semantics.
      if(!direction)return;
      if(keyConsumed===event.key||busy){event.preventDefault();return;}
      if(progress>=2&&direction<0&&!event.target.closest('.hero-projects,.hero-project-meta')){
        event.preventDefault();
        if(!event.repeat){keyConsumed=event.key;go(-1,true,true);}
        return;
      }
      if(event.repeat||!needsTransition(direction))return;
      event.preventDefault();keyConsumed=event.key;go(direction,true);
    }
    function touchstart(event){
      touch=event.touches.length===1&&!document.querySelector('dialog[open]')&&(progress>=2||canHandle(event))&&atHero()?{x:event.touches[0].clientX,y:event.touches[0].clientY,consumed:false,inside:overCarousel({target:event.target,clientX:event.touches[0].clientX,clientY:event.touches[0].clientY})}:null;
    }
    function touchmove(event){
      if(!touch||event.touches.length!==1||!atHero()||document.querySelector('dialog[open]'))return;
      const dy=touch.y-event.touches[0].clientY,dx=touch.x-event.touches[0].clientX;
      if(progress>=2&&!touch.inside&&dy<0&&Math.abs(dy)>=Math.abs(dx)&&!touch.consumed&&!busy){
        event.preventDefault();
        if(dy<-18){touch.consumed=true;go(-1,false,true);}
        return;
      }
      if(progress<2&&Math.abs(dx)>Math.abs(dy)&&!touch.consumed)return;
      const delta=progress>=2&&Math.abs(dx)>Math.abs(dy)?dx:dy;
      if(touch.consumed||busy){event.preventDefault();touch.consumed=true;return;}
      if(!needsTransition(Math.sign(delta)))return;
      event.preventDefault();
      if(Math.abs(delta)>18){touch.consumed=true;go(Math.sign(delta));}
    }
    function resize(){
      const slot=hero.querySelector('.stone-logo-slot');
      initialScale=slot.getBoundingClientRect().width/525;
      const margin=Math.max(32,Math.min(96,hero.clientWidth*.06));
      finalScale=.81*Math.min((hero.clientWidth-2*margin)/900,(hero.clientHeight-160)/460);
      const originalTop=slot.getBoundingClientRect().top-hero.getBoundingClientRect().top+scene.offsetTop;
      finalShift=(hero.clientHeight-452*finalScale)/2+30-originalTop;
      // The 900-unit carousel window shares the materials' 826-unit visible width.
      projectScale=Math.min(hero.clientWidth/1050,hero.clientHeight/700,1.25,finalScale*826/900);
      projectShift=(hero.clientHeight-640*projectScale)/2-originalTop;
      render(progress);
      updateLogoVisibility();
    }
    window.addEventListener('scroll',updateLogoVisibility,{...options,passive:true});
    window.addEventListener('wheel',wheel,{...options,passive:false});
    window.addEventListener('keydown',keydown,options);
    window.addEventListener('keyup',()=>{keyConsumed=null;},options);
    window.addEventListener('touchstart',touchstart,{...options,passive:true});
    window.addEventListener('touchmove',touchmove,{...options,passive:false});
    for(const type of ['touchend','touchcancel'])window.addEventListener(type,()=>{touch=null;},options);
    reduced.addEventListener('change',()=>{if(reduced.matches&&busy)finish();},options);
    const observer=new ResizeObserver(resize);observer.observe(hero);
    resize();
    return()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);savedProgress.current=target;};
  },[projects]);
  return <section ref={root} className="tura-hero stone-hero" aria-label={t("Infinity Stone — Pedra natural")}>
    <div className="stone-composition">
      <h1 className="sr-only">Infinity Stone</h1>
      <div className="stone-logo-slot">
        <div className="stone-scene">
          <img className="wordmark" src="/assets/hero-animation/0.png" alt="" width="302" height="87"/>
          <div className="material-title" aria-hidden="true">{t("A pedra natural reflete")}<br/><span>{t("a singularidade da natureza.")}</span></div>
          <h2 className="projects-title"><span className="projects-heading-desktop">{t("Cada projeto nasce de uma relação única")}<br/><span>{t("entre matéria e espaço.")}</span></span><span className="projects-heading-mobile">{t("Cada projeto nasce de uma relação")}<br/><span>{t("única entre matéria e espaço.")}</span></span></h2>
          <div className="stone-pieces" aria-hidden="true">{textures.map((url,i)=><div className="piece" key={url}>
            <div className="edge"/><div className="surface first" style={{backgroundImage:`url(${url})`}}/>
            <div className="surface finish" style={{backgroundImage:`url(${finalTextures[i]})`}}/>
          </div>)}</div>
          <div className="hero-projects" tabIndex={0} role="region" aria-roledescription={t("carrossel")} aria-label={t("Projetos")}>
            {projects.length>0&&Array.from({length:projects.length+4},(_,i)=>i-2).map(slot=>{
              const item=projects[((slot%projects.length)+projects.length)%projects.length];
              return <div className="hero-project-card" data-slot={slot} key={slot}>
                <img src={item.image} alt={item.title}/><strong>{item.title}</strong>
              </div>;
            })}
          </div>
          <div className="hero-project-meta"><div className="hero-project-action"><Link className="button" to="/projetos">{t("Ver projetos")}<ArrowUpRight aria-hidden="true" size={17}/></Link></div></div>
        </div>
      </div>
      <p className="hero-slogan">{t("DA NATUREZA NASCE A MATÉRIA.")}<br/>{t("DA TRANSFORMAÇÃO NASCE O ESPAÇO.")}</p>
    </div>
    {createPortal(<img ref={cornerLogoRef} className="hero-corner-logo" src="/assets/logo.png" alt="" aria-hidden="true" width="350" height="351"/>,document.body)}
  </section>;
}
