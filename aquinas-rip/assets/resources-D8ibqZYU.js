import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";async function s(e,t){try{let t=await fetch(e,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return await t.json()}catch(n){return console.error(`Failed to fetch ${e}:`,n),t}}async function c(e,t,n){try{let r=await fetch(e,{method:t,headers:n===void 0?void 0:{"Content-Type":`application/json`},credentials:`include`,body:n===void 0?void 0:JSON.stringify(n)}),i=null;try{i=await r.json()}catch{}return!r.ok||i?.success!==!0?{ok:!1,message:i?.message??`HTTP ${r.status}`}:{ok:!0}}catch(n){return console.error(`Failed ${t} ${e}:`,n),{ok:!1,message:n instanceof Error?n.message:String(n)}}}function l(){return s(`${n}/api/admin/resources/cultures`,[])}function u(){return s(`${n}/api/admin/resources/sources`,[])}function d(e){return s(e?`${n}/api/admin/resources/pivot?source=${encodeURIComponent(e)}`:`${n}/api/admin/resources/pivot`,[])}function ee(){return s(`${n}/api/admin/resources/targets`,{works:[],data:[]})}function f(e,t,r){return c(`${n}/api/admin/resources/${encodeURIComponent(e)}/${t}`,`PUT`,{values:r})}function p(e,t){return c(`${n}/api/admin/resources/${encodeURIComponent(e)}/${t}`,`DELETE`)}var m=[{key:`workinfo`,label:t(`Work info`),description:t(`Description of a work, shown in the editor's work info dialog (HTML).`),target:`work`,multiline:!0},{key:`datainfo`,label:t(`Data info`),description:t(`Description of one data column, shown under the work info (HTML).`),target:`data`,multiline:!0},{key:`workpublink`,label:t(`Work public link`),description:t(`URL of the published work (the "Get book" link).`),target:`work`,multiline:!1},{key:`seriespublink`,label:t(`Series public link`),description:t(`URL of the published series.`),target:`work`,multiline:!1}],h=new Map(m.map(e=>[e.key,e]));function g(e){return h.get(e)??{key:e,label:e,description:``,target:null,multiline:!0}}function _(e){let t=h.get(e);return t?`${t.label} (${e})`:e}function v(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function y(e,t,n){let r=[];n!==null&&r.push(`<option value="">${v(n)}</option>`);for(let n of e)r.push(`<option value="${v(n)}" ${n===t?`selected`:``}>${v(_(n))}</option>`);return r.join(``)}function b(e,n){return y(e,n,t(`All sources`))}function x(e,n,r){let i=r.map(e=>`${e.name} (${e.code})`).join(`, `),a=n?g(n).description:``;return`
        <div class="resources-page">
            <div class="card">
                <div class="card-header">
                    <span class="card-title"><span data-i18n="Resources / Translations">Resources / Translations</span> <span class="resources-count">${t(`(loading...)`)}</span></span>
                    <div class="resources-filters">
                        <label for="source-filter" data-i18n="Source:">Source:</label>
                        <select id="source-filter" class="rs-select">${b(e,n)}</select>
                        <input type="search" id="resources-quick-filter" class="quick-filter" placeholder="${t(`Quick filter...`)}" />
                    </div>
                    <div class="card-actions">
                        <button class="btn-refresh" id="btn-add-resource" data-i18n="Add Resource">Add Resource</button>
                        <button class="btn-refresh" id="btn-refresh-resources" data-i18n="Refresh">Refresh</button>
                    </div>
                </div>
                <div class="resources-subheader">
                    <span id="source-description" class="resources-source-description">${v(a)}</span>
                    <span class="resources-cultures-info">
                        <span class="label" data-i18n="Languages:">Languages:</span>
                        <span class="value">${v(i)||t(`None configured`)}</span>
                        <span class="hint" data-i18n="The default (_) is shown when no translation matches the reader's language.">The default (_) is shown when no translation matches the reader's language.</span>
                    </span>
                </div>
                <div class="card-body">
                    <div id="resources-grid" class="resources-grid"></div>
                </div>
            </div>
        </div>
    `}function S(e,n,r){let i=r?6:1;return[{code:`_`,name:t(`Default`),hint:t(`Used when no translation matches the reader's language.`)},...e].map(e=>`
        <div class="rs-lang-row ${e.code===`_`?`rs-lang-default`:``}">
            <label for="rs-lang-${v(e.code)}">
                <span class="rs-lang-name">${v(e.name)}</span>
                <code class="rs-lang-code">${v(e.code)}</code>
                ${e.hint?`<span class="rs-lang-hint">${v(e.hint)}</span>`:``}
            </label>
            <textarea id="rs-lang-${v(e.code)}" class="rs-control rs-lang-input ${r?`rs-multiline`:``}"
                data-lang="${v(e.code)}" rows="${i}" spellcheck="false">${v(n[e.code]??``)}</textarea>
        </div>
    `).join(``)}function C(e,n){let r=g(e.source),i=e.isNew?t(`Add {0}`,[r.label]):t(`Edit {0}`,[r.label]),a;return a=e.orphan?`<span class="cell-orphan">${t(`(deleted #{0})`,[e.resourceId])}</span>`:e.label?v(e.label):`#${e.resourceId}`,`
        <div class="rs-dialog-backdrop" id="rs-dialog-backdrop">
            <div class="rs-dialog ${r.multiline?`rs-dialog-wide`:``}" role="dialog" aria-modal="true">
                <div class="rs-dialog-header">
                    <h3>${v(i)}</h3>
                    <button type="button" class="rs-dialog-close" id="rs-dialog-close" aria-label="${t(`Close`)}">&times;</button>
                </div>
                <div class="rs-dialog-body">
                    <div class="rs-meta">
                        <div class="rs-meta-item"><span class="rs-meta-label" data-i18n="Describes">Describes</span><span class="rs-meta-value">${a}</span></div>
                        <div class="rs-meta-item"><span class="rs-meta-label" data-i18n="Source">Source</span><span class="rs-meta-value"><code>${v(e.source)}</code></span></div>
                        <div class="rs-meta-item"><span class="rs-meta-label" data-i18n="ID">ID</span><span class="rs-meta-value"><code>${e.resourceId}</code></span></div>
                    </div>
                    ${r.description?`<p class="rs-description">${v(r.description)}</p>`:``}
                    <div class="rs-languages" id="rs-languages">
                        ${S(n,e.values,r.multiline)}
                    </div>
                </div>
                <div class="rs-dialog-footer">
                    ${e.isNew?`<span></span>`:`<button type="button" class="rs-btn rs-btn-danger" id="rs-dialog-delete" data-i18n="Delete all languages">Delete all languages</button>`}
                    <div class="rs-dialog-footer-right">
                        <button type="button" class="rs-btn rs-btn-secondary" id="rs-dialog-cancel" data-i18n="Cancel">Cancel</button>
                        <button type="button" class="rs-btn rs-btn-primary" id="rs-dialog-save" data-i18n="Save">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `}var w=`__other__`;function T(e){let n=m.map(e=>e.key),r=e.filter(e=>!n.includes(e)),i=[...m.map(e=>`<option value="${v(e.key)}">${v(_(e.key))}</option>`),...r.map(e=>`<option value="${v(e)}">${v(e)}</option>`),`<option value="${w}">${t(`Other (type a source name)…`)}</option>`].join(``);return`
        <div class="rs-dialog-backdrop" id="rs-dialog-backdrop">
            <div class="rs-dialog rs-dialog-wide" role="dialog" aria-modal="true">
                <div class="rs-dialog-header">
                    <h3 data-i18n="Add Resource">Add Resource</h3>
                    <button type="button" class="rs-dialog-close" id="rs-dialog-close" aria-label="${t(`Close`)}">&times;</button>
                </div>
                <div class="rs-dialog-body">
                    <div class="rs-form-row">
                        <label for="rs-source" data-i18n="Source">Source</label>
                        <select id="rs-source" class="rs-control">${i}</select>
                        <input type="text" id="rs-source-custom" class="rs-control" style="display:none" maxlength="512" placeholder="${t(`Source name`)}" />
                        <div class="rs-form-hint" id="rs-source-description"></div>
                    </div>
                    <div class="rs-form-row">
                        <label for="rs-target" id="rs-target-label" data-i18n="Describes">Describes</label>
                        <div id="rs-target-area"></div>
                    </div>
                    <div class="rs-languages" id="rs-languages"></div>
                </div>
                <div class="rs-dialog-footer">
                    <span></span>
                    <div class="rs-dialog-footer-right">
                        <button type="button" class="rs-btn rs-btn-secondary" id="rs-dialog-cancel" data-i18n="Cancel">Cancel</button>
                        <button type="button" class="rs-btn rs-btn-primary" id="rs-dialog-save" data-i18n="Create">Create</button>
                    </div>
                </div>
            </div>
        </div>
    `}function E(e,n){if(e.target===`work`&&n){let e=new Map;for(let r of n.works){let n=r.series||t(`(no series)`);e.has(n)||e.set(n,[]),e.get(n).push(r)}let r=[...e.entries()].map(([e,t])=>`<optgroup label="${v(e)}">${t.map(e=>`<option value="${e.id}">${v(e.name)} (#${e.id})</option>`).join(``)}</optgroup>`).join(``);return`<select id="rs-target" class="rs-control"><option value="">${t(`Select a work…`)}</option>${r}</select>`}if(e.target===`data`&&n){let e=new Map(n.works.map(e=>[e.id,e.label])),r=new Map;for(let e of n.data)r.has(e.workId)||r.set(e.workId,[]),r.get(e.workId).push(e);let i=[...r.entries()].sort((t,n)=>(e.get(t[0])??``).localeCompare(e.get(n[0])??``)).map(([t,n])=>`<optgroup label="${v(e.get(t)??`#${t}`)}">${n.map(e=>`<option value="${e.id}">${v(e.label)} (#${e.id})</option>`).join(``)}</optgroup>`).join(``);return`<select id="rs-target" class="rs-control"><option value="">${t(`Select a data column…`)}</option>${i}</select>`}return`<input type="number" id="rs-target" class="rs-control" min="0" placeholder="${t(`Numeric ID`)}" />`}function D(e,t){if(typeof e!=`string`||!e)return``;let n=e.replace(/<[^>]*>/g,` `).replace(/&nbsp;/g,` `).replace(/\s+/g,` `).trim();return n.length>t?n.slice(0,t-1)+`…`:n}function O(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function k(e,n){return{field:e,headerName:n,flex:1,minWidth:180,filter:`agTextColumnFilter`,tooltipValueGetter:e=>D(e.value,600)||null,cellRenderer:e=>{let n=D(e.value,110);return n?`<span class="cell-value">${O(n)}</span>`:`<span class="cell-empty">${t(`(empty)`)}</span>`}}}function A(e){let n=[{field:`source`,headerName:t(`Source`),width:170,pinned:`left`,filter:`agTextColumnFilter`,valueFormatter:e=>_(e.value),getQuickFilterText:e=>`${e.value} ${_(e.value)}`},{field:`resourceId`,headerName:t(`ID`),width:80,pinned:`left`,filter:`agNumberColumnFilter`,cellStyle:{color:`red`}},{field:`label`,headerName:t(`Describes`),width:260,minWidth:160,pinned:`left`,filter:`agTextColumnFilter`,tooltipField:`label`,cellRenderer:e=>e.data?e.data.orphan?`<span class="cell-orphan" title="${t(`The work or data column this describes was deleted`)}">${t(`(deleted #{0})`,[e.data.resourceId])}</span>`:e.data.label?O(e.data.label):`<span class="cell-empty">—</span>`:``},k(`_`,t(`Default (_)`))];for(let t of e)n.push(k(t.code,`${t.name} (${t.code})`));return n.push({headerName:``,colId:`actions`,width:90,sortable:!1,filter:!1,resizable:!1,pinned:`right`,cellClass:`grid-actions-cell`,cellRenderer:e=>e.data?`<button class="grid-icon-btn icon-edit btn-edit-resource" title="${t(`Edit all languages`)}"><i class="fa fa-pencil"></i></button><button class="grid-icon-btn icon-delete btn-delete-resource" title="${t(`Delete in all languages`)}"><i class="fa fa-trash"></i></button>`:``}),n}function j(e,t){return`${e}-${t}`}function M(e,t,n){return{theme:r,columnDefs:A(e),defaultColDef:{resizable:!0,sortable:!0,filter:!0},rowData:void 0,animateRows:!1,rowHeight:36,tooltipShowDelay:300,rowSelection:{mode:`singleRow`,checkboxes:!1,enableClickSelection:!0},onRowDoubleClicked:e=>{e.data&&t(e.data)},onCellClicked:e=>{if(!e.data||e.colDef.colId!==`actions`)return;let r=e.event?.target;r?.closest(`.btn-edit-resource`)?t(e.data):r?.closest(`.btn-delete-resource`)&&n(e.data)},getRowId:e=>j(e.data.source,e.data.resourceId)}}i.registerModules([o]);var N=[],P=[],F=null,I=null,L=null,R=null;async function z(t){R=t;let r=new URLSearchParams(window.location.search),i=r.get(`source`),a=parseInt(r.get(`id`)??``,10);[N,P]=await Promise.all([l(),u()]),i&&(F=i,P.includes(i)||(P=[...P,i].sort())),R.innerHTML=x(P,F,N),e.translateIn(R),B(),G(),await V(),i&&!isNaN(a)&&(history.replaceState(null,``,`${n}/admin/resources?source=${encodeURIComponent(i)}`),await W(i,a))}function B(){let e=document.getElementById(`resources-grid`);e&&(L=a(e,M(N,Z,ne)))}async function V(){if(!L)return;let e=await d(F??void 0);L.setGridOption(`rowData`,e),te(e.length)}function te(e){let t=R?.querySelector(`.resources-count`);t&&(t.textContent=`(${e})`)}async function H(){return I||=await ee(),I}async function U(e,t){let n=g(e).target;if(!n)return{label:null,orphan:!1};let r=await H(),i=n===`work`?r.works.find(e=>e.id===t)?.label:r.data.find(e=>e.id===t)?.label;return i?{label:i,orphan:!1}:{label:null,orphan:!0}}async function W(e,t){let n=L?.getRowNode(j(e,t));if(n?.data){n.setSelected(!0),L?.ensureNodeVisible(n,`middle`),Z(n.data);return}let{label:r,orphan:i}=await U(e,t);Q(C({source:e,resourceId:t,label:r,orphan:i,values:{},isNew:!0},N),{source:e,resourceId:t,isNew:!0})}function G(){let e=document.getElementById(`source-filter`);e?.addEventListener(`change`,async()=>{F=e.value||null;let t=document.getElementById(`source-description`);t&&(t.textContent=F?g(F).description:``),history.replaceState(null,``,F?`${n}/admin/resources?source=${encodeURIComponent(F)}`:`${n}/admin/resources`),await V()}),document.getElementById(`resources-quick-filter`)?.addEventListener(`input`,e=>{L?.setGridOption(`quickFilterText`,e.target.value)}),document.getElementById(`btn-refresh-resources`)?.addEventListener(`click`,async()=>{I=null,await V()}),document.getElementById(`btn-add-resource`)?.addEventListener(`click`,()=>re())}function K(){document.getElementById(`rs-dialog-backdrop`)?.remove(),document.removeEventListener(`keydown`,q)}function q(e){e.key===`Escape`&&(e.preventDefault(),K())}function J(t){K();let n=document.createElement(`div`);n.innerHTML=t;let r=n.firstElementChild;return e.translateIn(r),document.body.appendChild(r),r.addEventListener(`click`,e=>{e.target===r&&K()}),r.querySelector(`#rs-dialog-close`)?.addEventListener(`click`,K),r.querySelector(`#rs-dialog-cancel`)?.addEventListener(`click`,K),document.addEventListener(`keydown`,q),r}function Y(e){let t={};return e.querySelectorAll(`.rs-lang-input`).forEach(e=>{let n=e.dataset.lang;n&&(t[n]=e.value)}),t}function X(e){return Object.values(e).some(e=>e.trim().length>0)}function Z(e){let t={};for(let n of[`_`,...N.map(e=>e.code)]){let r=e[n];typeof r==`string`&&(t[n]=r)}Q(C({source:e.source,resourceId:e.resourceId,label:e.label,orphan:e.orphan,values:t,isNew:!1},N),{source:e.source,resourceId:e.resourceId,isNew:!1})}function Q(e,n){let r=J(e);r.querySelector(`#rs-dialog-delete`)?.addEventListener(`click`,async()=>{if(!confirm(t(`Delete this resource in every language? This cannot be undone.`)))return;let e=await p(n.source,n.resourceId);e.ok?(K(),await V()):alert(t(`Failed to delete resource: {0}`,[e.message??``]))}),r.querySelector(`#rs-dialog-save`)?.addEventListener(`click`,async()=>{let e=Y(r);if(!X(e)){let e=n.isNew?t(`Please enter text for at least one language.`):t(`Every language is empty, which removes this resource entirely. Continue?`);if(n.isNew){alert(e);return}if(!confirm(e))return}let i=await f(n.source,n.resourceId,e);i.ok?(K(),await $(n.source)):alert(t(`Failed to save: {0}`,[i.message??``]))}),r.querySelector(`.rs-lang-input`)?.focus()}async function $(e){if(!P.includes(e)){P=await u();let e=document.getElementById(`source-filter`);e&&(e.innerHTML=b(P,F))}await V()}async function ne(e){let n=e.label??`${e.source} #${e.resourceId}`;if(!confirm(t(`Delete "{0}" in every language? This cannot be undone.`,[n])))return;let r=await p(e.source,e.resourceId);r.ok?await V():alert(t(`Failed to delete resource: {0}`,[r.message??``]))}async function re(){let e=J(T(P)),n=e.querySelector(`#rs-source`),r=e.querySelector(`#rs-source-custom`),i=e.querySelector(`#rs-source-description`),a=e.querySelector(`#rs-target-area`),o=e.querySelector(`#rs-languages`),s=()=>n.value===`__other__`?r.value.trim():n.value,c=async()=>{let t=n.value===w;r.style.display=t?``:`none`;let c=g(s());i.textContent=c.description;let l=Y(e);a.innerHTML=c.target?E(c,await H()):E(c,null),o.innerHTML=S(N,l,c.multiline)};n.addEventListener(`change`,c),m.length>0&&(n.value=m[0].key),await c(),e.querySelector(`#rs-dialog-save`)?.addEventListener(`click`,async()=>{let n=s();if(!n){alert(t(`Source is required`));return}let r=e.querySelector(`#rs-target`),i=parseInt(r?.value??``,10);if(isNaN(i)||i<0){alert(g(n).target?t(`Please choose what this resource describes.`):t(`Resource ID must be a non-negative number`));return}let a=Y(e);if(!X(a)){alert(t(`Please enter text for at least one language.`));return}let o=await f(n,i,a);o.ok?(K(),await $(n)):alert(t(`Failed to save: {0}`,[o.message??``]))})}function ie(){L&&=(L.destroy(),null),K(),R=null,N=[],P=[],F=null,I=null}export{ie as cleanup,z as render};