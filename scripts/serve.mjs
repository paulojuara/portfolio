import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  let relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if(relative.split(/[\\/]/).some(p=>p.startsWith('.')))throw new Error('Forbidden');
  let file=path.resolve(root,relative||'index.html');
  if(!file.startsWith(root+path.sep))throw new Error('Forbidden');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}}).listen(port,'127.0.0.1',()=>console.log(`Portfolio: http://127.0.0.1:${port}/projetos/thomson-reuters/`));
