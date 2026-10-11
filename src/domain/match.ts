import type {Answers,Book,Catalog,Match,Question,Weights} from './types';

export function profile(questions:Question[],answers:Answers):Weights{
 const result:Weights={};
 for(const q of questions){const option=q.options.find(o=>o.id===answers[q.id]);if(!option)continue;
  for(const [tag,weight]of Object.entries(option.weights))result[tag]=(result[tag]||0)+weight;
 }return result;
}
export function similarity(a:Weights,b:Weights):number{
 const dot=Object.entries(a).reduce((sum,[tag,w])=>sum+w*(b[tag]||0),0);
 const norm=(v:Weights)=>Math.sqrt(Object.values(v).reduce((sum,w)=>sum+w*w,0));
 return dot/((norm(a)*norm(b))||1);
}
export function eligible(catalog:Catalog,topicId?:string):Book[]{
 return catalog.books.filter(b=>b.verified&&b.cover.reviewed&&(!topicId||b.topicIds.includes(topicId)));
}
export function recommend(catalog:Catalog,questions:Question[],answers:Answers,topicId?:string):Match[]{
 if(questions.length!==10||questions.some(q=>!q.options.some(o=>o.id===answers[q.id])))throw new Error('La partida requiere diez respuestas válidas');
 const interests=profile(questions,answers);
 const candidates:Match[]=eligible(catalog,topicId).map(book=>({book,score:similarity(interests,book.weights),matchedTags:Object.keys(interests).filter(t=>interests[t]>0&&book.weights[t]>0).sort((a,b)=>(interests[b]*book.weights[b])-(interests[a]*book.weights[a])||a.localeCompare(b))})).filter(m=>m.score>0);
 const selected:Match[]=[];
 const conjunciones=catalog.collections.find(c=>c.name==='Conjunciones')?.id;
 while(candidates.length&&selected.length<5){
  const max=Math.max(...candidates.map(m=>m.score));
  // Banda absoluta 0.05 en escala coseno [0,1]. No promover scores nulos.
  const comparable=candidates.filter(m=>max-m.score<=0.05);
  const diversity=(m:Match)=>selected.reduce((sum,s)=>sum+(s.book.authorIds.some(a=>m.book.authorIds.includes(a))?1:0)+(s.matchedTags[0]===m.matchedTags[0]?0.25:0),0);
  comparable.sort((a,b)=>Number(b.book.collectionId===conjunciones)-Number(a.book.collectionId===conjunciones)||diversity(a)-diversity(b)||b.score-a.score||a.book.id.localeCompare(b.book.id));
  const next=comparable[0];selected.push(next);
  for(let i=candidates.length-1;i>=0;i--)if(candidates[i].book.workId===next.book.workId)candidates.splice(i,1);
 }
 if(selected.length<3)throw new Error('Cobertura inválida: no hay tres obras pertinentes');
 return selected;
}
export function justification(match:Match,catalog:Catalog):string{
 // Preferir coincidencias específicas; el área general puede justificar afinidades amplias honestamente.
 const specific=match.matchedTags.filter(id=>!catalog.topics.some(t=>t.tag===id));
 const labels=(specific.length?specific:match.matchedTags).slice(0,2).map(id=>catalog.tags.find(t=>t.id===id)?.label).filter(Boolean);
 return `Por tu interés en ${labels.join(' y ')}.`;
}
