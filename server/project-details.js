const imagePath=value=>typeof value==='string'&&value.length<=200&&/^\/(assets|uploads)\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/.test(value);
export function validateDetails(body){
  const images=body.images??[],materials=body.materials??[];
  if(!Array.isArray(images)||images.length>20||!images.every(imagePath)||!Array.isArray(materials)||materials.length>12)return null;
  const result=[];
  for(const value of materials){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const {name,image='',format='',finish='',thickness=''}=value;
    if(typeof name!=='string'||!name.trim()||name.length>80||![format,finish,thickness].every(v=>typeof v==='string'&&v.length<=120)||(image!==''&&!imagePath(image)))return null;
    result.push({name:name.trim(),image,format,finish,thickness});
  }
  return JSON.stringify({images:[...new Set(images)],materials:result});
}
export function withDetails(row){
  const {details,...item}=row;
  return {...item,...JSON.parse(details||'{"images":[],"materials":[]}')};
}
