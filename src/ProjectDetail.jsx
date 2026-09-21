import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import './project-detail.css';

export default function ProjectDetail({item}){
  const photos=[...new Set([item.image,...(item.images||[])])];
  const materials=item.materials?.length?item.materials:[{name:item.material}];
  const [photo,setPhoto]=useState(0),[material,setMaterial]=useState(0);
  const selected=materials[material]||materials[0];
  const specs=[['Formato',selected.format],['Acabamento',selected.finish],['Espessura',selected.thickness]].filter(([,value])=>value);
  return <article className="project-detail">
    <Link className="project-back" to="/projetos"><ArrowLeft size={17} aria-hidden="true"/>Todos os projetos</Link>
    <div className="project-detail-layout">
      <div className="project-photographs">
        <figure className="project-photograph"><img src={photos[photo]||photos[0]} alt={`${item.title} — fotografia ${photo+1}`}/></figure>
        {photos.length>1&&<nav className="project-photo-picker" aria-label="Fotografias do projeto">{photos.map((src,i)=><button key={src} type="button" aria-label={`Mostrar fotografia ${i+1}`} aria-pressed={photo===i} onClick={()=>setPhoto(i)}><img src={src} alt="" loading="lazy"/></button>)}</nav>}
      </div>
      <div className="project-information">
        <span className="project-kicker">Projeto · Infinity Stone</span>
        <h1>{item.title}</h1>
        {item.description&&<p className="project-description">{item.description}</p>}
        <section className="project-materials" aria-label="Materiais do projeto">
          <h2>{materials.length>1?'Materiais':'Material'}</h2>
          {materials.length>1?<div className="project-material-picker" role="group" aria-label="Selecionar material">{materials.map((m,i)=><button key={i} type="button" aria-pressed={material===i} onClick={()=>setMaterial(i)}>{m.name}</button>)}</div>:<h3 className="project-material-name">{selected.name}</h3>}
          {selected.image&&<img className="project-material-image" src={selected.image} alt={`Amostra de ${selected.name}`}/>}
          {specs.length>0&&<dl className="project-specifications">{specs.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
        </section>
      </div>
    </div>
  </article>;
}
