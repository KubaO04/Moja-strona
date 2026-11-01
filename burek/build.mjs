/* Generuje 10 zwykłych plików HTML. Nie wymaga bibliotek ani instalacji npm. */
import {readFile,writeFile,mkdir,cp,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const context=vm.createContext({window:{},Date});
for(const file of ['data','characters','art','render'])vm.runInContext(await readFile(path.join(root,`js/${file}.js`),'utf8'),context,{filename:`${file}.js`});
const {UI,STORE}=context.window;
const pages=['index',...STORE.categories.map(c=>c.id),'promocje','poradnik','o-nas','kontakt'];
const descriptions={index:'Burek — sklep zoologiczny z miłości do zwierząt. Odkryj świat psów, kotów i małych przyjaciół.',poradnik:'Poznaj proste pomysły na codzienność z pupilem. Poradnik dobrego opiekuna od Burka.',kontakt:'Kontakt i pomoc w projekcie sklepu zoologicznego Burek. Częste pytania i formularz wiadomości.'};
function documentHTML(id,base=''){
 const category=STORE.categories.find(c=>c.id===id),title=UI.titles[id]||`${category.name} — Burek`,description=descriptions[id]||category?.description||'Poznaj Burek — autorski projekt sklepu zoologicznego. Małe łapki, wielka miłość.';
 return `<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n${base?`  <base href="${base}">\n`:''}  <title>${UI.esc(title)}</title>\n  <meta name="description" content="${UI.esc(description)}">\n  <meta name="theme-color" content="#414d3c">\n  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">\n  <link rel="stylesheet" href="css/style.css">\n  <script src="js/data.js" defer></script>\n  <script src="js/art.js" defer></script>\n  <script src="js/render.js" defer></script>\n  <script src="js/app.js" defer></script>\n</head>\n<body data-page="${id}">\n${UI.header(id)}\n<main id="main" tabindex="-1">\n${UI.page(id)}\n</main>\n${UI.footer()}\n</body>\n</html>\n`;
}
function extraAssets(html){return html.replace('  <script src="js/art.js" defer></script>','  <script src="js/characters.js" defer></script>\n  <script src="js/art.js" defer></script>').replace('  <script src="js/app.js" defer></script>','  <script src="js/motion.js" defer></script>\n  <script src="js/app.js" defer></script>').replace('</head>','  <link rel="stylesheet" href="css/effects.css">\n  <link rel="stylesheet" href="css/motion.css">\n  <script src="js/carousel.js" defer></script>\n  <script src="js/animal-effects.js" defer></script>\n</head>');}
for(const id of pages)await writeFile(path.join(root,`${id}.html`),extraAssets(documentHTML(id)));
await mkdir(path.join(root,'dist'),{recursive:true});
for(const id of pages)await cp(path.join(root,`${id}.html`),path.join(root,'dist',`${id}.html`));
for(const directory of ['css','js','assets'])await cp(path.join(root,directory),path.join(root,'dist',directory),{recursive:true});
console.log(`Gotowe: ${pages.length} podstron HTML i dist/.`);
if(process.argv.includes('--workspace-entry')){
 await writeFile(path.join(root,'..','index.html'),extraAssets(documentHTML('index','./burek/')));
 console.log('Zaktualizowano także index.html w katalogu głównym.');
}
