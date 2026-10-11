import type {Catalog,Question} from './types';
import {eligible,similarity} from './match';
export function validateCatalog(catalog:Catalog,questions:Question[]):string[]{
 const errors:string[]=[];const assert=(value:unknown,message:string)=>{if(!value)errors.push(message);};
 const unique=(ids:string[],label:string)=>assert(new Set(ids).size===ids.length,`Duplicados: ${label}`);
 unique(catalog.books.map(b=>b.id),'libros');unique(catalog.books.map(b=>b.workId),'obras');unique(questions.map(q=>q.id),'preguntas');
 unique(catalog.topics.map(t=>t.id),'temáticas');unique(catalog.tags.map(t=>t.id),'etiquetas');unique(catalog.authors.map(a=>a.id),'autores');unique(catalog.collections.map(c=>c.id),'colecciones');
 const tags=new Set(catalog.tags.map(t=>t.id));const authors=new Set(catalog.authors.map(a=>a.id));const topics=new Set(catalog.topics.map(t=>t.id));
 const checkWeights=(weights:Record<string,number>,label:string)=>{assert(Object.keys(weights).length>0,`Pesos vacíos ${label}`);for(const [tag,w]of Object.entries(weights))assert(tags.has(tag)&&Number.isFinite(w)&&w>0,`Peso inválido ${label}/${tag}`);};
 assert(catalog.topics.filter(t=>t.enabled).length>=6,'Menos de seis temáticas habilitadas');
 for(const book of catalog.books){
  assert(book.verified&&book.title&&book.evidence&&book.verifiedAt,`Verificación incompleta ${book.id}`);
  assert(/^https:\/\/www\.noveduc\.com\/(?:es\/|us\/)?productos\/[^/]+\/$/.test(book.productUrl),`Ficha inválida ${book.id}`);
  assert(book.authorIds.length&&book.authorIds.every(id=>authors.has(id)),`Autoría inválida ${book.id}`);
  assert(book.topicIds.length&&book.topicIds.every(id=>topics.has(id)),`Temática inválida ${book.id}`);
  assert(book.collectionId===null||catalog.collections.some(c=>c.id===book.collectionId),`Colección inválida ${book.id}`);
  assert(book.cover.reviewed&&['original','otra_edicion','institucional'].includes(book.cover.kind),`Imagen sin revisar ${book.id}`);
  assert(/^[a-z0-9-]+\.(webp|jpg|png|svg)$/.test(book.cover.file),`Archivo inválido ${book.id}`);
  if(book.cover.kind==='otra_edicion')assert(book.cover.editionNote,`Edición sin identificar ${book.id}`);
  if(book.cover.kind==='institucional')assert(book.cover.file==='n_portada.svg'&&book.cover.attempts.length,`Institucional sin trazabilidad ${book.id}`);
  checkWeights(book.weights,book.id);
  assert(!/\b(?:precio|descuento|stock|promoción|carrito)\b/i.test(book.summary),`Contenido comercial ${book.id}`);
 }
 assert(catalog.requiredAuthorIds.length===4,'Lista de autores obligatorios alterada');
 for(const id of catalog.requiredAuthorIds)assert(eligible(catalog).some(b=>b.authorIds.includes(id)),`Autor obligatorio ausente ${id}`);
 for(const topic of catalog.topics.filter(t=>t.enabled)){
  const books=eligible(catalog,topic.id),bank=questions.filter(q=>q.topicIds.includes(topic.id));
  assert(books.length>=3,`Menos de tres libros ${topic.id}`);assert(bank.length>=10,`Menos de diez preguntas ${topic.id}`);
  assert(tags.has(topic.tag)&&topic.facets.every(id=>tags.has(id)),`Etiquetas de temática inválidas ${topic.id}`);
  for(const q of bank)for(const option of q.options)assert(books.filter(b=>similarity(option.weights,b.weights)>0).length>=3,`Cobertura insuficiente ${topic.id}/${q.id}/${option.id}`);
 }
 for(const q of questions){
  assert(q.text&&q.topicIds.length&&q.topicIds.every(id=>topics.has(id)),`Pregunta inválida ${q.id}`);assert(q.options.length>=4&&q.options.length<=6,`Opciones inválidas ${q.id}`);unique(q.options.map(o=>o.id),q.id);
  for(const o of q.options){assert(o.text,`Opción vacía ${q.id}`);checkWeights(o.weights,`${q.id}/${o.id}`);assert(eligible(catalog).filter(b=>similarity(o.weights,b.weights)>0).length>=3,`Cobertura libre insuficiente ${q.id}/${o.id}`);}
 }
 return errors;
}
