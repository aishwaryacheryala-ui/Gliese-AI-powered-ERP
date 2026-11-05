import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript'})[file.split('.').pop()]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end('Not found');}}).listen(5173,'127.0.0.1',()=>console.log('Xenia demo: http://127.0.0.1:5173'));
