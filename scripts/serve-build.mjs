import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let path=decodeURIComponent(url.pathname);
 if(path==='/evento') {res.writeHead(301,{Location:'/evento/'});res.end();return;}
 if(path.startsWith('/evento/'))path=path.slice('/evento'.length);
 const file=resolve(root,'.'+path+(path.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 const info=await stat(file);if(!info.isFile())throw new Error('No file');
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Build estático en http://127.0.0.1:4173 y /evento/'));
