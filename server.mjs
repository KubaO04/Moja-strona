/* Mały serwer podglądu: node server.mjs [port]. */
import http from 'node:http';
import {readFile,writeFile,mkdir,rename,stat} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.argv[2]||4173);
const notesDirectory=path.join(root,'.review');
const notesFile=path.join(notesDirectory,'uwagi.json');
let notesQueue=Promise.resolve();
async function readNotes(){try{return JSON.parse(await readFile(notesFile,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function noteRequest(req,res){
 if(req.method==='GET'){json(res,200,{notes:await readNotes()});return;}
 if(req.method!=='POST'){json(res,405,{error:'Niedozwolona metoda.'});return;}
 if(req.headers.origin!==`http://${req.headers.host}`||!req.headers['content-type']?.startsWith('application/json')){json(res,403,{error:'Zapis uwag jest dostępny tylko z lokalnego podglądu.'});return;}
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16000){json(res,413,{error:'Uwaga jest zbyt długa.'});return;}}
 let data;try{data=JSON.parse(body);}catch{json(res,400,{error:'Niepoprawne dane uwagi.'});return;}
 if(!data||typeof data!=='object'||Array.isArray(data)){json(res,400,{error:'Niepoprawne dane uwagi.'});return;}
 const string=(key,max)=>typeof data[key]==='string'?data[key].trim().slice(0,max):'';
 const note={id:randomUUID(),createdAt:new Date().toISOString(),status:'open',page:string('page',500),pageTitle:string('pageTitle',200),selector:string('selector',1200),element:string('element',50),text:string('text',400),comment:string('comment',3000),viewport:{width:Number(data.viewport?.width)||0,height:Number(data.viewport?.height)||0},rectangle:{}};
 if(!note.comment||!note.selector||!note.page.startsWith('/')||note.page.startsWith('//')){json(res,400,{error:'Zaznacz element i wpisz, co zmienić.'});return;}
 for(const key of ['x','y','width','height'])note.rectangle[key]=Math.round(Number(data.rectangle?.[key])||0);
 const write=notesQueue.then(async()=>{const notes=await readNotes();notes.push(note);await mkdir(notesDirectory,{recursive:true});const temporary=path.join(notesDirectory,'uwagi.tmp');await writeFile(temporary,JSON.stringify(notes,null,2),'utf8');await rename(temporary,notesFile);return note;});
 notesQueue=write.catch(()=>{});
 try{json(res,201,{note:await write});}catch{json(res,500,{error:'Nie udało się zapisać uwagi. Spróbuj ponownie.'});}
}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
 try{
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){res.writeHead(403);res.end('Forbidden');return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/__burek-review/notes'){await noteRequest(req,res);return;}
  if(pathname.split('/').some(segment=>segment.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
  const devFiles={'/__burek-review/client.js':'/dev/review.js','/__burek-review/style.css':'/dev/review.css'};
  const target=path.resolve(root,`.${devFiles[pathname]||(pathname==='/'?'/index.html':pathname)}`);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const info=await stat(target);if(!info.isFile())throw Error('Not a file');
  let bytes=await readFile(target);
  if(path.extname(target)==='.html')bytes=Buffer.from(bytes.toString('utf8').replace('</body>','<script src="/__burek-review/client.js" defer></script></body>'));
  const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416);res.end();return;}const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):bytes.length-1,bytes.length-1);if(start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));return;}
  res.writeHead(200,{...headers,'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Nie znaleziono strony.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Burek: http://127.0.0.1:${port}`));
