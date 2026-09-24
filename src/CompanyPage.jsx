import {useI18n} from './i18n.jsx';
import React,{useLayoutEffect,useRef} from 'react';
import './company-page.css';
import {useCompanySectionScroll} from './useCompanySectionScroll.js';

function StoneProcessIcon({step}){
  const drawings={
    analysis:<><rect x="5" y="6" width="8" height="36"/><path d="M9 12h4M9 18h4M9 24h4M9 30h4M9 36h4M20 7v35h23ZM26 27v9h6"/></>,
    advice:<><path d="M7 31H4V5h27v5"/><rect x="12" y="13" width="30" height="30"/><path d="M21 13c0 7 10 8 7 15s-7 9-4 15M33 13c-3 6 1 10 9 13M4 16l8 4"/></>,
    cutting:<><path d="M5 29h38v12H5ZM5 36h38M25 30v11"/><circle cx="25" cy="18" r="11"/><circle cx="25" cy="18" r="2.5"/><path d="M25 7V4M33 10l2-2M36 18h3M33 26l2 2M17 26l-2 2M14 18h-3M17 10l-2-2"/></>,
    finishing:<><path d="m5 29 17-9 21 9-17 10ZM5 29v5l21 10 17-10v-5M26 39v5"/><path d="m30 4 2.5 7.5L40 14l-7.5 2.5L30 24l-2.5-7.5L20 14l7.5-2.5ZM12 9v8M8 13h8"/></>,
    solution:<><path d="M5 40V6h38v34M5 34h38M5 40h38M10 34V12h28v22M19 12v22M29 12v22M5 40l5-6M43 40l-5-6"/><path d="m13 17 3 5-3 6M33 20l2 4-2 5"/></>
  };
  return <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawings[step]}</svg>;
}

export default function CompanyPage(){
  const {t}=useI18n();
  const root=useRef(),mark=useRef();
  useCompanySectionScroll(root);
  useLayoutEffect(()=>{
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const chapters=[...root.current.querySelectorAll('.company-chapter')];
    const clamp=value=>Math.max(0,Math.min(1,value));
    const ease=value=>value*value*(3-2*value);
    let frame=0,lastTransform='';
    function draw(){
      frame=0;
      const mobile=innerWidth<=700;
      const arrival=chapter=>{
        const top=chapter.getBoundingClientRect().top;
        return preference.matches?Number(top<innerHeight*.55):ease(clamp((innerHeight*.9-top)/(innerHeight*.65)));
      };
      const second=arrival(chapters[1]),third=arrival(chapters[2]);
      const distance=mobile?(mark.current.parentElement.clientWidth-mark.current.clientWidth)/2:
        chapters[1].offsetLeft-chapters[0].offsetLeft;
      // Move one intact, upright logo between the two columns.
      const rawX=mobile?distance*(1-2*second+2*third):distance*(-second+third);
      const pixelRatio=window.devicePixelRatio||1;
      const x=Math.round(rawX*pixelRatio)/pixelRatio;
      const leaving=Math.max(0,-chapters[2].getBoundingClientRect().top);
      // Sticky owns the vertical position; avoid feeding its measurements back into a transform.
      const transform=`translateX(${x}px)`;
      if(transform!==lastTransform){mark.current.style.transform=transform;lastTransform=transform;}
      mark.current.style.opacity=preference.matches?Number(leaving<=2):1-ease(clamp(leaving/100));
      mark.current.style.visibility=leaving>=100?'hidden':'visible';
      chapters.slice(1).forEach((chapter,index)=>{
        const amount=index===0?second:third;
        chapter.style.setProperty('--copy-x',`${preference.matches?0:(index===0?1:-1)*(mobile?36:100)*(1-amount)}px`);
        chapter.style.setProperty('--copy-opacity',preference.matches?1:amount);
      });
    }
    const update=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);preference.addEventListener('change',update);draw();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);preference.removeEventListener('change',update);};
  },[]);
  return <div ref={root} className="company-story">
    <div className="company-journey">
      <section className="company-chapter company-opening" aria-labelledby="company-heading">
        <span className="company-eyebrow">{t("A nossa essência")}</span>
        <h1 id="company-heading"><span className="company-heading-line">{t("Da natureza, a matéria.")}</span><span className="company-heading-line">{t("Da transformação, o espaço.")}</span></h1>
        <p>{t("Somos especializados na produção e corte de pedra natural, desenvolvendo soluções à medida para construção, decoração e design de interiores e exteriores. Trabalhamos cada material de acordo com as exigências de cada aplicação, combinando experiência, tecnologia e conhecimento técnico para garantir um resultado cuidado em todas as etapas.")}</p>
        <div className="company-signature">{t("Pedra Natural")} <span>·</span> {t("Transformação")} <span>·</span> {t("Elegância")}</div>
      </section>
      <figure className="company-emblem"><img ref={mark} src="/assets/logo.png" alt="Infinity Stone" width="350" height="351"/></figure>
      <section className="company-chapter" aria-labelledby="company-matter">
        <span className="company-eyebrow">{t("A matéria")}</span>
        <h2 id="company-matter"><span className="company-heading-line">{t("A natureza não se repete.")}</span><span className="company-heading-line">{t("A pedra também não.")}</span></h2>
        <p>{t("Trabalhamos cada pedra como um elemento capaz de definir a identidade de um espaço. Os veios, as tonalidades e as texturas tornam cada material único, permitindo-nos criar soluções que reforçam o carácter de cada ambiente.")}</p>
      </section>
      <section className="company-chapter" aria-labelledby="company-space">
        <span className="company-eyebrow">{t("O processo")}</span>
        <h2 id="company-space">{t("A pedra é natural.")}<br/><span>{t("O espaço é seu.")}</span></h2>
        <p>{t("Cada trabalho começa pela compreensão do que é necessário. A partir daí, ajudamos a identificar as soluções mais adequadas ao material, às medidas, ao acabamento e à aplicação pretendida, preparando cada peça para o resultado final.")}</p>
        <ol className="company-process" aria-label={t("Etapas de cada trabalho")}>
          {[['analysis','Análise'],['advice','Aconselhamento'],['cutting','Corte'],['finishing','Acabamento'],['solution','Solução final']].map(([step,label])=><li key={step}><StoneProcessIcon step={step}/><span>{t(label)}</span></li>)}
        </ol>
      </section>
    </div>
  </div>;
}
