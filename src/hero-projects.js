import {clamp,ease,project,flat} from './hero-animation-art.js';

const mix=(a,b,t)=>a+(b-a)*t;
// Lower cards, with a clear gap between the central photograph and its neighbours.
export function cover(d,mobile){
  const a=Math.abs(d),scale=Math.pow(.82,Math.min(a,4));
  return {d,a,w:(mobile?480:380)*scale,h:(mobile?300:275)*scale,
    x:500+d*(mobile?465:370),y:300+Math.min(a,3)*12,opacity:1-clamp((a-1)/.65)};
}
function rectQuad(c){
  const x=c.x-c.w/2,y=c.y-c.h/2,tilt=Math.sign(c.d)*Math.min(c.a,1)*14;
  return [[x,y+tilt],[x+c.w,y-tilt],[x+c.w,y+c.h+tilt],[x,y+c.h-tilt]];
}
export function createProjectRenderer(hero,projects){
  const pieces=[...hero.querySelectorAll('.piece')],cards=[...hero.querySelectorAll('.hero-project-card')];
  const material=hero.querySelector('.material-title'),title=hero.querySelector('.projects-title');
  const gallery=hero.querySelector('.hero-projects'),meta=hero.querySelector('.hero-project-meta');
  return (p,busy,departingProject=null)=>{
    const fan=ease(clamp(p-1)),active=departingProject??Math.max(0,p-2),mobile=innerWidth<650;
    pieces.forEach((el,i)=>{
      el.style.opacity=1;el.style.visibility='visible';el.style.zIndex='';
      if(p<=1)return;
      const c=cover(((i+2.5)%5+5)%5-2.5,mobile),target=rectQuad(c);
      const q=flat[i].map((corner,j)=>corner.map((n,k)=>mix(n,target[j][k],fan)));
      el.style.transform=project(q);el.style.zIndex=String(100-Math.round(c.a*10));
      el.style.opacity=mix(1,c.opacity,fan)*(1-fan);
      el.style.visibility=p>=2?'hidden':'visible';
      el.style.filter=`drop-shadow(8px 15px 9px rgba(48,39,24,.26)) brightness(${mix(1,1-Math.min(c.a,2)*.10,fan)})`;
      el.children[0].style.opacity=1-fan*.7;
    });
    if(p>1){
      material.style.transform=`translate(-50%,${22+100*fan}px)`;
      material.style.opacity=1-fan;material.style.visibility=p>=2?'hidden':'visible';
    }
    title.style.transform=`translate(-50%,${105-83*fan}px)`;
    title.style.opacity=fan;title.style.visibility=p<=1?'hidden':'visible';
    const enabled=p>=2&&!busy;
    gallery.inert=!enabled;gallery.setAttribute('aria-hidden',String(p<2));
    cards.forEach(el=>{
      const slot=Number(el.dataset.slot),c=cover(slot-active,mobile),entry=(1-fan)*160;
      el.style.width=`${c.w}px`;el.style.height=`${c.h}px`;
      el.style.transform=`translate(${c.x-c.w/2+entry}px,${c.y-c.h/2-95}px)`;
      el.style.zIndex=String(100-Math.round(c.a*10));
      el.style.opacity=c.opacity*fan;el.style.filter=`brightness(${1-Math.min(c.a,1)*.23}) blur(${Math.min(c.a,1)*2.5}px)`;
      el.querySelector('strong').style.opacity=String(1-clamp(c.a));
      el.style.visibility=p<=1||c.opacity===0?'hidden':'visible';
      el.setAttribute('aria-hidden',String(Math.round(active)!==slot));
    });
    meta.style.opacity=ease(clamp((p-1.55)/.45));
    meta.style.visibility=p>=1.999?'visible':'hidden';meta.inert=!enabled;
    hero.dataset.project=String(Math.round(active));
  };
}
