import {useEffect} from 'react';

export function useCompanySectionScroll(root){
  useEffect(()=>{
    const controller=new AbortController(),options={signal:controller.signal};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,busy=false,lastWheel=-Infinity,used=false,total=0,touch=null,timer=0;
    const blocked=e=>document.querySelector('dialog[open]')||e.target.closest?.('input,textarea,select,[contenteditable="true"]');
    const positions=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      return [...root.current.querySelectorAll('.company-chapter'),document.querySelector('.site-footer')]
        .filter(Boolean).map(el=>Math.min(max,el.getBoundingClientRect().top+scrollY));
    };
    function destination(direction){
      const stops=positions(),y=scrollY;
      if(y<stops[0]-2||y>stops.at(-1)+2)return null;
      return direction>0?stops.find(s=>s>y+2):stops.findLast(s=>s<y-2);
    }
    function move(to){
      if(to==null||busy)return;
      clearTimeout(timer);
      const from=scrollY,start=performance.now();busy=true;
      const finish=()=>{scrollTo({top:to,behavior:'instant'});busy=false;};
      if(reduced.matches){finish();return;}
      function tick(now){
        const t=Math.min(1,(now-start)/1800),ease=t*t*(3-2*t);
        scrollTo({top:from+(to-from)*ease,behavior:'instant'});
        if(t<1)frame=requestAnimationFrame(tick);else finish();
      }
      frame=requestAnimationFrame(tick);
    }
    function wheel(e){
      if(blocked(e)||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY)return;
      const now=performance.now();
      if(now-lastWheel>260){used=false;total=0;}
      lastWheel=now;
      const to=destination(Math.sign(e.deltaY));
      if(!busy&&!used&&to==null)return;
      e.preventDefault();
      if(busy||used){used=true;return;}
      total+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
      if(Math.abs(total)>=18){used=true;move(to);}
    }
    function key(e){
      if(blocked(e)||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('a,button'))return;
      const down=['ArrowDown','PageDown'].includes(e.key)||(e.key===' '&&!e.shiftKey);
      const up=['ArrowUp','PageUp'].includes(e.key)||(e.key===' '&&e.shiftKey);
      if(!up&&!down)return;
      const to=destination(down?1:-1);
      if(to==null&&!busy)return;
      e.preventDefault();if(!busy&&!e.repeat)move(to);
    }
    function touchstart(e){
      touch=!blocked(e)&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,used:false}:null;
    }
    function touchmove(e){
      if(!touch||e.touches.length!==1||blocked(e))return;
      const dy=touch.y-e.touches[0].clientY,dx=touch.x-e.touches[0].clientX;
      if(Math.abs(dx)>Math.abs(dy))return;
      const to=destination(Math.sign(dy));
      if(!busy&&!touch.used&&to==null)return;
      e.preventDefault();
      if(!busy&&!touch.used&&Math.abs(dy)>24){touch.used=true;move(to);}
    }
    // Settle scrollbar/native scroll input too, without trapping footer navigation
    // or moving the page when a visitor tabs to an interactive element.
    function settle(){
      clearTimeout(timer);
      if(busy||document.documentElement.dataset.input==='keyboard')return;
      timer=setTimeout(()=>{
        if(busy||document.querySelector('dialog[open]'))return;
        const stops=positions();
        if(scrollY<stops[0]||scrollY>=stops.at(-1))return;
        const nearest=stops.reduce((a,b)=>Math.abs(b-scrollY)<Math.abs(a-scrollY)?b:a);
        if(Math.abs(nearest-scrollY)>2)move(nearest);
      },180);
    }
    window.addEventListener('wheel',wheel,{...options,passive:false});
    window.addEventListener('keydown',key,options);
    window.addEventListener('touchstart',touchstart,{...options,passive:true});
    window.addEventListener('touchmove',touchmove,{...options,passive:false});
    for(const type of ['touchend','touchcancel'])window.addEventListener(type,()=>{touch=null;},options);
    window.addEventListener('scroll',settle,{...options,passive:true});
    return()=>{controller.abort();cancelAnimationFrame(frame);clearTimeout(timer);};
  },[root]);
}
