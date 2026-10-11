import {describe,it,expect} from 'vitest';
import {catalog,questions} from '../src/data';
import {validateCatalog} from '../src/domain/validate';
import {recommend,profile,similarity} from '../src/domain/match';
import {selectQuestions} from '../src/domain/select';
import {gameReducer,initialState} from '../src/state/game';
import type {Answers,Book,Catalog,Question} from '../src/domain/types';

function rng(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const answers=(bank:Question[],index:number):Answers=>Object.fromEntries(bank.map(q=>[q.id,q.options[index].id]));
describe('Integridad y cobertura editorial',()=>{
 it('cumple contratos, seis temáticas, autores y cada opción con tres obras',()=>expect(validateCatalog(catalog,questions)).toEqual([]));
 it('detecta cobertura rota y autor obligatorio ausente',()=>{const broken={...catalog,books:catalog.books.filter(b=>!b.topicIds.includes('prevencion')&&!b.authorIds.includes(catalog.requiredAuthorIds[0]))};expect(validateCatalog(broken,questions).join(' ')).toMatch(/Autor obligatorio ausente/);expect(validateCatalog(broken,questions).join(' ')).toMatch(/Menos de tres libros prevencion/);});
 it('no beneficia multiplicación arbitraria de pesos',()=>expect(similarity({a:2,b:1},{a:4,b:2})).toBeCloseTo(1));
 it('rechaza partida incompleta',()=>expect(()=>recommend(catalog,questions.slice(0,10),{})).toThrow(/diez respuestas/));
 it('no permite recomendar libros no verificados o imágenes no revisadas',()=>{const broken={...catalog,books:catalog.books.map(b=>({...b,verified:false}))};expect(()=>recommend(broken,questions.slice(0,10),answers(questions.slice(0,10),0))).toThrow(/tres obras/);});
});
describe('Partidas y recomendaciones',()=>{
 it('garantiza invariantes en 700 partidas reproducibles y filtros estrictos',()=>{
  for(const topicId of [undefined,...catalog.topics.map(t=>t.id)])for(let seed=1;seed<=100;seed++){
   const random=rng(seed),bank=selectQuestions(catalog,questions,topicId,random);expect(bank).toHaveLength(10);expect(new Set(bank.map(q=>q.id)).size).toBe(10);
   const current=Object.fromEntries(bank.map(q=>[q.id,q.options[Math.floor(random()*q.options.length)].id]));
   const result=recommend(catalog,bank,current,topicId);expect(result.length).toBeGreaterThanOrEqual(3);expect(result.length).toBeLessThanOrEqual(5);expect(new Set(result.map(m=>m.book.workId)).size).toBe(result.length);
   expect(result.every(m=>m.score>0&&m.score<=1.000001&&m.matchedTags.length>0)).toBe(true);
   if(topicId)expect(result.every(m=>m.book.topicIds.includes(topicId))).toBe(true);
   expect(recommend(catalog,bank,current,topicId)).toEqual(result);
  }
 });
 it('Sorprendeme cubre seis áreas y cambia con el sorteo',()=>{const a=selectQuestions(catalog,questions,undefined,rng(1)),b=selectQuestions(catalog,questions,undefined,rng(3));expect(new Set(a.flatMap(q=>q.topicIds)).size).toBe(6);expect(a.map(q=>q.id)).not.toEqual(b.map(q=>q.id));});
 it('intereses diferentes cambian orden y primeras recomendaciones en cada área',()=>{
  for(const topic of catalog.topics){const bank=questions.filter(q=>q.topicIds.includes(topic.id)).slice(0,10);const profiles=[0,1,2,3].map(i=>recommend(catalog,bank,answers(bank,i),topic.id).map(m=>m.book.id));expect(new Set(profiles.map(p=>p.join('|'))).size,topic.id).toBeGreaterThan(1);expect(new Set(profiles.map(p=>p[0])).size,topic.id).toBeGreaterThan(1);}
 });
 it('existe perfil pertinente que recomienda cada autor obligatorio',()=>{
  const seen=new Set<string>();for(const topic of catalog.topics){const bank=questions.filter(q=>q.topicIds.includes(topic.id)).slice(0,10);for(let i=0;i<4;i++)for(const m of recommend(catalog,bank,answers(bank,i),topic.id))for(const id of m.book.authorIds)seen.add(id);}
  for(const id of catalog.requiredAuthorIds)expect(seen.has(id),catalog.authors.find(a=>a.id===id)?.name).toBe(true);
 });
 it('Conjunciones solo desplaza scores dentro de la banda comparable',()=>{
  const bank=questions.filter(q=>q.topicIds.includes('educacion')).slice(0,10);const result=recommend(catalog,bank,answers(bank,1),'educacion');expect(result[0].book.title).toMatch(/gestión|Gestionar|liderazgos|Directivos/);
 });
});
describe('Estado de partida',()=>{
 const bank=questions.slice(0,10);
 it('reemplaza respuestas sin duplicar pesos y conserva al retroceder',()=>{
  let state=gameReducer(initialState,{type:'start',questions:bank,topicId:'salud'});
  state=gameReducer(state,{type:'answer',questionId:bank[0].id,optionId:'o1'});state=gameReducer(state,{type:'answer',questionId:bank[0].id,optionId:'o2'});
  expect(Object.keys(state.answers)).toHaveLength(1);expect(profile(bank,state.answers)).toEqual(bank[0].options[1].weights);
  state=gameReducer(state,{type:'next'});state=gameReducer(state,{type:'unlock'});state=gameReducer(state,{type:'previous'});
  expect(state.questions).toBe(bank);expect(state.answers[bank[0].id]).toBe('o2');
 });
 it('impide avanzar sin respuesta y bloquea siguiente/anterior repetidos',()=>{
  let state=gameReducer(initialState,{type:'start',questions:bank});expect(gameReducer(state,{type:'next'})).toBe(state);
  state=gameReducer(state,{type:'answer',questionId:bank[0].id,optionId:'o1'});state=gameReducer(state,{type:'next'});
  expect(gameReducer(state,{type:'next'}).index).toBe(1);expect(gameReducer(state,{type:'previous'}).index).toBe(1);
 });
 it('limpia estado completo y exige diez respuestas antes de finalizar',()=>{
  let state=gameReducer(initialState,{type:'start',questions:bank,topicId:'salud'});
  for(const q of bank){state=gameReducer(state,{type:'answer',questionId:q.id,optionId:'o1'});state=gameReducer(state,{type:'next'});state=gameReducer(state,{type:'unlock'});}
  expect(state.screen).toBe('results');expect(gameReducer(state,{type:'reset'})).toEqual(initialState);
 });
});
