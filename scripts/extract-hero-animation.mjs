import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

// Extract bytes and the approved projection/rendering code, without running the demo.
const html=readFileSync(process.argv[2], 'utf8');
const dir='public/assets/hero-animation';
mkdirSync(dir,{recursive:true});
let index=0;
const source=html.replace(/data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)/g,(_,type,data)=>{
  const name=`${index++}.${type==='jpeg'?'jpg':'png'}`;
  writeFileSync(`${dir}/${name}`,Buffer.from(data,'base64'));
  return `/assets/hero-animation/${name}`;
});
const assets=source.slice(source.indexOf('const textures='),source.indexOf('const initial='));
const geometry=source.slice(source.indexOf('const initial='),source.indexOf('const pieces='));
const projection=source.slice(source.indexOf('function project('),source.indexOf('let p=0'));
const render=source.slice(source.indexOf('function render(value)'),source.indexOf('function resize()'))
  .replace('p=clamp(value);','const p=clamp(value);')
  .replace("const wordmark=document.querySelector('#wordmark');",'')
  .replace("const title=document.querySelector('#material-title');",'');
writeFileSync('src/hero-animation-art.js',`// Geometry, images and rendering preserved from infinity-stone-transicao(1).html.\n${assets}${geometry}${projection}\nexport {textures,finalTextures,clamp,ease,project,flat};\nexport function createRenderer(pieces,wordmark,title){\n${render}\nreturn render;\n}\n`);
