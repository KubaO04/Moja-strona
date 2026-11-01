/* Sprawdza komplet podstron i lokalne odwołania bez dodatkowych bibliotek. */
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=path.dirname(fileURLToPath(import.meta.url));
const files=(await readdir(root)).filter(n=>n.endsWith('.html'));
if(files.length!==10)throw Error(`Oczekiwano 10 podstron, znaleziono ${files.length}`);
for(const file of files){
 const html=await readFile(path.join(root,file),'utf8');
 if((html.match(/<h1[\s>]/g)||[]).length!==1)throw Error(`${file}: wymagany jeden nagłówek H1`);
 if(!html.includes('<html lang="pl">'))throw Error(`${file}: brak polskiego języka`);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)throw Error(`${file}: powtórzone identyfikatory HTML`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=match[1];if(/^(https?:|data:|#|mailto:|tel:)/.test(url))continue;
  const target=path.resolve(root,url.split(/[?#]/)[0]);
  if(!(await stat(target).catch(()=>null))?.isFile())throw Error(`${file}: brak ${url}`);
 }
 const balance=(html.match(/<main\b/g)||[]).length-(html.match(/<\/main>/g)||[]).length;
 if(balance)throw Error(`${file}: niezamknięty main`);
}
for(const file of await readdir(path.join(root,'js')))if(file.endsWith('.js'))new Script(await readFile(path.join(root,'js',file),'utf8'),{filename:file});
console.log(`OK: ${files.length} stron, jeden H1 na stronę, lokalne odnośniki, identyfikatory HTML i składnia JavaScript.`);
