import {useState} from 'react';
import type {Catalog,Match} from '../domain/types';
import {justification} from '../domain/match';
const url=(file:string)=>`${import.meta.env.BASE_URL}covers/${file}`;
export function BookCard({match,catalog,index}:{match:Match;catalog:Catalog;index:number}){
 const {book}=match;const [fallback,setFallback]=useState(false);
 const institutional=fallback||book.cover.kind==='institucional';
 return <article className="book-card" aria-labelledby={`title-${book.id}`}>
  <div className={`book-image ${institutional?'institutional':''}`}>
   <img src={url(institutional?'n_portada.svg':book.cover.file)} alt={institutional?'Imagen institucional de Noveduc':`Portada de ${book.title}`} onError={()=>setFallback(true)} width="120" height="176"/>
   {book.cover.kind==='otra_edicion'&&!fallback&&<span className="edition-note">Portada de otra edición</span>}
  </div>
  <div className="book-copy">
   <div className="book-kicker"><span className="result-number">{String(index+1).padStart(2,'0')}</span><span>{catalog.topics.find(t=>t.id===book.topicIds[0])?.shortLabel}</span></div>
   <h2 id={`title-${book.id}`}>{book.title}</h2>
   <p className="author">{book.authorIds.map(id=>catalog.authors.find(a=>a.id===id)?.name).filter(Boolean).join(' · ')}</p>
   <p className="summary">{book.summary}</p>
   <p className="reason">{justification(match,catalog)} <a href={book.productUrl} target="_blank" rel="noopener noreferrer" aria-label={`LINK: ficha de ${book.title} en Noveduc, abre otra pestaña`}>LINK <span aria-hidden="true">↗</span></a></p>
  </div>
 </article>;
}
