// Geometry, images and rendering preserved from infinity-stone-transicao(1).html.
const textures=["/assets/hero-animation/1.png", "/assets/hero-animation/2.png", "/assets/hero-animation/3.png", "/assets/hero-animation/4.png", "/assets/hero-animation/5.png"],finalTextures=["/assets/hero-animation/6.jpg", "/assets/hero-animation/7.jpg", "/assets/hero-animation/8.jpg", "/assets/hero-animation/9.jpg", "/assets/hero-animation/10.jpg"];
const initial=[[[25, 77], [101, 27], [101, 126], [25, 176]], [[25, 176], [101, 126], [176, 176], [101, 225]], [[101, 27], [249, 126], [249, 225], [101, 126]], [[175, 77], [249, 27], [324, 77], [249, 126]], [[249, 126], [324, 77], [324, 175], [249, 225]]].map(q=>q.map(([x,y])=>[(x-25)*1.5+275,(y-27)*1.5+65]));
const opened=initial.map((q,i)=>q.map(([x,y])=>[x+[-88,-45,0,52,95][i],y+[-12,38,-8,-34,28][i]]));
const standing=initial.map((_,i)=>{let x=88+i*168,y=120+[0,18,0,20,36][i];return [[x,y+42],[x+133,y-20],[x+139,y+240],[x+6,y+302]]});
const flat=initial.map((_,i)=>{let x=87+i*170;return [[x,99],[x+146,99],[x+146,391],[x,391]]});
const states=[initial,opened,standing,flat], stops=[0,.32,.67,1];
function project(q){const [a,b,c,d]=q;let dx1=b[0]-c[0],dx2=d[0]-c[0],dx3=a[0]-b[0]+c[0]-d[0],dy1=b[1]-c[1],dy2=d[1]-c[1],dy3=a[1]-b[1]+c[1]-d[1],den=dx1*dy2-dx2*dy1;let g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den;let A=b[0]-a[0]+g*b[0],B=d[0]-a[0]+h*d[0],D=b[1]-a[1]+g*b[1],E=d[1]-a[1]+h*d[1];return `matrix3d(${A/180},${D/180},0,${g/180},${B/300},${E/300},0,${h/300},0,0,1,0,${a[0]},${a[1]},0,1)`}
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x);

export {textures,finalTextures,clamp,ease,project,flat};
export function createRenderer(pieces,wordmark,title){
function render(value){
 const p=clamp(value);
 const s=p<.32?0:p<.67?1:2,t=clamp((p-stops[s])/(stops[s+1]-stops[s]));
 let bottom=0;
 pieces.forEach((el,i)=>{
  const q=states[s][i].map((v,j)=>v.map((n,k)=>n+(states[s+1][i][j][k]-n)*t));
  bottom=Math.max(bottom,...q.map(corner=>corner[1]));
  el.style.transform=project(q);
  const depth=ease(clamp(p/.25));
  el.style.setProperty('--depth',depth);
  el.style.filter=`drop-shadow(${8*depth}px ${15*depth}px ${9*depth}px rgba(48,39,24,${.26*depth}))`;
  el.children[0].style.opacity=depth;
  el.children[2].style.opacity=ease(clamp((p-.65)/.3));
 });
 // Both text layers sit behind the moving stone faces. The change occurs under them.
 
 const sink=ease(clamp((p-.04)/.48));
 wordmark.style.top='389px';
 wordmark.style.transform=`translate(-50%,${-215*sink}px) scale(${1-.08*sink})`;
 wordmark.style.opacity=1-ease(clamp((p-.34)/.2));
 wordmark.style.visibility=p>=.54?'hidden':'visible';
 
 const rise=ease(clamp((p-.52)/.48));
 title.style.transform=`translate(-50%,${190-168*rise}px)`;
 title.style.opacity=ease(clamp((p-.52)/.18));
 title.style.visibility=p<=.52?'hidden':'visible';

}

return render;
}
