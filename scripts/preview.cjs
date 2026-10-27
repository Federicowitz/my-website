const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end();return}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname))}catch{res.writeHead(400).end();return}
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
  if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return}
  file=path.join(file,'index.html');
 }
 if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Pagina non trovata');return}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+server.address().port));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
