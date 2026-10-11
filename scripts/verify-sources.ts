import {mkdir,writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {catalog} from '../src/data/index';
const result=[];
for(const book of catalog.books){
 const response=await fetch(book.productUrl,{signal:AbortSignal.timeout(30000)});
 const $=load(await response.text());const title=$('li').map((_,e)=>$(e).text().replace(/\s+/g,' ').trim()).get().find(t=>t.startsWith('Título:'))?.slice(7).trim();
 if(!response.ok||title!==book.title)throw new Error(`Ficha no coincide ${book.id}: ${response.status}/${title}`);
 result.push({id:book.id,url:book.productUrl,status:response.status,titleVerified:true});
 await new Promise(resolve=>setTimeout(resolve,400));
}
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/source-verification.json',JSON.stringify(result,null,2));
console.log(`Verificadas ${result.length} fichas oficiales.`);
