import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";i.registerModules([o]);var s=null,c=[],l=null,u=e=>t=>t.value?`<code class="${e}">${t.value.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</code>`:``,d=[{field:`group`,headerName:t(`Group`),width:150,filter:`agTextColumnFilter`},{field:`name`,headerName:t(`Name`),flex:1,minWidth:150,filter:`agTextColumnFilter`},{field:`type`,headerName:t(`Type`),width:110,filter:`agTextColumnFilter`},{field:`lang`,headerName:t(`Lang`),width:80,filter:`agTextColumnFilter`},{field:`search`,headerName:t(`Search`),flex:2,minWidth:200,filter:`agTextColumnFilter`,cellRenderer:u(`regex-pattern`)},{field:`replace`,headerName:t(`Replace`),flex:2,minWidth:200,filter:`agTextColumnFilter`,cellRenderer:u(`replace-pattern`)}],f={theme:r,columnDefs:d,defaultColDef:{sortable:!0,resizable:!0,filter:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`,enableClickSelection:!0,checkboxes:!1},getRowId:e=>String(e.data?.toolid??``),onRowSelected:e=>{e.node.isSelected()&&e.data&&(l=e.data,h())}};async function p(){try{let e=await fetch(`${n}/api/tools/list`,{method:`GET`,credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();return t.success&&Array.isArray(t.tools)?t.tools:(console.error(`Failed to fetch tools:`,t.message||`Unknown error`),[])}catch(e){return console.error(`Failed to fetch tools:`,e),[]}}function m(e){return(e||``).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function h(){let n=document.getElementById(`toolDetailPanel`);if(!n)return;if(!l){n.innerHTML=`
            <div class="detail-empty">
                <p data-i18n="Select a tool to view details">Select a tool to view details</p>
            </div>
        `,e.translateIn(n);return}let r=e=>(e||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),i=l.type===`group`;n.innerHTML=`
        <div class="detail-content">
            <form id="toolEditForm">
                <div class="detail-header">
                    <div class="detail-section">
                        <label for="toolName" data-i18n="Name">Name</label>
                        <input type="text" id="toolName" class="detail-input" value="${m(l.name)}" />
                    </div>
                    <div class="detail-section">
                        <label for="toolGroup" data-i18n="Group">Group</label>
                        <input type="text" id="toolGroup" class="detail-input" value="${m(l.group)}" />
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-section">
                        <label for="toolType" data-i18n="Type">Type</label>
                        <select id="toolType" class="detail-input">
                            ${[`regexreplace`,`wordreplace`,`find`,`method`,`group`,``].map(e=>`<option value="${e}" ${l.type===e?`selected`:``}>${e||t(`(default: HTML cleanup)`)}</option>`).join(``)}
                        </select>
                    </div>
                    <div class="detail-section">
                        <label for="toolFlags" data-i18n="Flags">Flags</label>
                        <input type="text" id="toolFlags" class="detail-input" value="${m(l.flags)}" placeholder="e.g., ig" data-i18n-placeholder="e.g., ig" />
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-section">
                        <label for="toolMethod" data-i18n="Method">Method</label>
                        <input type="text" id="toolMethod" class="detail-input" value="${m(l.method)}" />
                    </div>
                    <div class="detail-section">
                        <label for="toolLang" data-i18n="Language">Language</label>
                        <input type="text" id="toolLang" class="detail-input" value="${m(l.lang)}" placeholder="e.g., la / en (empty = all)" data-i18n-placeholder="e.g., la / en (empty = all)" />
                    </div>
                </div>
                <div class="detail-section" ${i?``:`hidden`}>
                    <label for="toolDisplayName" data-i18n="Group Display Name">Group Display Name</label>
                    <input type="text" id="toolDisplayName" class="detail-input" value="${m(l.displayName)}" />
                </div>
                <div class="detail-section">
                    <label for="toolSearch" data-i18n="Search Pattern">Search Pattern</label>
                    <textarea id="toolSearch" class="detail-textarea" rows="4" placeholder="Enter regex pattern..." data-i18n-placeholder="Enter regex pattern...">${r(l.search)}</textarea>
                </div>
                <div class="detail-section">
                    <label for="toolReplace" data-i18n="Replace Pattern">Replace Pattern</label>
                    <textarea id="toolReplace" class="detail-textarea" rows="4" placeholder="Enter replacement..." data-i18n-placeholder="Enter replacement...">${r(l.replace)}</textarea>
                </div>
                <div class="detail-actions">
                    <button type="submit" class="btn btn-primary" id="saveTool" data-i18n="Save Changes">Save Changes</button>
                    <button type="button" class="btn btn-secondary" id="cancelEdit" data-i18n="Cancel">Cancel</button>
                    <button type="button" class="btn btn-danger" id="deleteTool" data-i18n="Delete">Delete</button>
                </div>
            </form>
        </div>
    `,e.translateIn(n),_()}function g(){let e=e=>document.getElementById(e)?.value||``;return{name:e(`toolName`),group:e(`toolGroup`),type:e(`toolType`),flags:e(`toolFlags`),method:e(`toolMethod`),lang:e(`toolLang`),search:e(`toolSearch`),replace:e(`toolReplace`),displayName:e(`toolDisplayName`)}}function _(){let e=document.getElementById(`toolEditForm`);e&&(e.addEventListener(`submit`,async e=>{e.preventDefault(),await v()}),document.getElementById(`cancelEdit`)?.addEventListener(`click`,()=>{h()}),document.getElementById(`deleteTool`)?.addEventListener(`click`,async()=>{await b()}))}async function v(){if(!l)return;let e=g();if(e.search&&(e.type===`regexreplace`||e.type===`find`))try{new RegExp(e.search,e.flags)}catch(e){alert(t(`Invalid regular expression: `)+e.message);return}let r={...l,...e};try{let t=await fetch(`${n}/api/tools/${l.toolid}`,{method:`PUT`,credentials:`include`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let i=await t.json();if(!i.success)throw Error(i.message||`Save failed`);l=r;let a=c.findIndex(e=>e.toolid===r.toolid);a>=0&&(c[a]=r),s?.setGridOption(`rowData`,c),y()}catch(e){console.error(`Failed to save tool:`,e),alert(t(`Failed to save changes: `)+e.message)}}function y(){let e=document.getElementById(`saveTool`);if(e){let n=e.textContent;e.textContent=t(`Saved!`),e.classList.add(`btn-success`),e.classList.remove(`btn-primary`),setTimeout(()=>{e.textContent=n,e.classList.remove(`btn-success`),e.classList.add(`btn-primary`)},2e3)}}async function b(){if(l&&confirm(t(`Delete tool "{0}/{1}"?`,[l.group,l.name])))try{let e=await fetch(`${n}/api/tools/${l.toolid}`,{method:`DELETE`,credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();if(!t.success)throw Error(t.message||`Delete failed`);c=c.filter(e=>e.toolid!==l.toolid),l=null,s?.setGridOption(`rowData`,c),h(),C()}catch(e){console.error(`Failed to delete tool:`,e),alert(t(`Failed to delete tool: `)+e.message)}}async function x(){let e=prompt(t(`Group key for the new tool (e.g. HTMLCleanup):`));if(e===null)return;let r=prompt(t(`Name for the new tool:`));if(r!==null&&r.trim()!==``)try{let t=await fetch(`${n}/api/tools/create`,{method:`POST`,credentials:`include`,headers:{"Content-Type":`application/json`},body:JSON.stringify({group:e,name:r,type:`regexreplace`,lang:``,search:``,flags:`ig`,replace:``,method:``,displayName:``})});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let i=await t.json();if(!i.success)throw Error(i.message||`Create failed`);c.push(i.tool),s?.setGridOption(`rowData`,c),C(),l=i.tool,h()}catch(e){console.error(`Failed to create tool:`,e),alert(t(`Failed to create tool: `)+e.message)}}function S(e){if(s){if(e===``)s.setGridOption(`rowData`,c);else{let t=c.filter(t=>t.group===e);s.setGridOption(`rowData`,t)}C()}}function C(){let e=document.querySelector(`.tools-count`);if(e&&s){let t=0;s.forEachNode(e=>{e.data&&t++}),e.textContent=`(${t})`}}function w(){let e=document.getElementById(`groupFilter`);if(!e)return;for(;e.options.length>1;)e.remove(1);let t=[...new Set(c.map(e=>e.group).filter(e=>e))];for(let n of t){let t=document.createElement(`option`);t.value=n,t.textContent=c.find(e=>e.type===`group`&&e.name===n)?.displayName||n,e.appendChild(t)}}async function T(n){n.innerHTML=`
        <div class="tools-page">
            <div class="tools-main">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><span data-i18n="Regex Tools">Regex Tools</span> <span class="tools-count">${t(`(loading...)`)}</span></span>
                        <div class="card-filters">
                            <select id="groupFilter" class="group-filter">
                                <option value="" data-i18n="All Groups">All Groups</option>
                            </select>
                            <input type="search" id="quickFilter" class="quick-filter" placeholder="Quick filter..." data-i18n-placeholder="Quick filter..." />
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-success" id="addTool">
                                <span class="icon-plus"></span> <span data-i18n="Add Tool">Add Tool</span>
                            </button>
                            <button class="btn-refresh" id="refreshTools" data-i18n="Refresh">Refresh</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="toolsGrid" class="tools-grid"></div>
                    </div>
                </div>
            </div>
            <div class="tools-detail">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title" data-i18n="Tool Details">Tool Details</span>
                    </div>
                    <div class="card-body" id="toolDetailPanel">
                        <div class="detail-empty">
                            <p data-i18n="Select a tool to view details">Select a tool to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(n);let r=document.getElementById(`toolsGrid`);r&&(s=a(r,f),c=await p(),s.setGridOption(`rowData`,c),w(),document.getElementById(`groupFilter`)?.addEventListener(`change`,e=>{let t=e.target.value;S(t)}),C(),document.getElementById(`quickFilter`)?.addEventListener(`input`,e=>{let t=e.target.value;s?.setGridOption(`quickFilterText`,t)}),document.getElementById(`refreshTools`)?.addEventListener(`click`,async()=>{c=await p(),w();let e=document.getElementById(`groupFilter`)?.value||``;if(e){let t=c.filter(t=>t.group===e);s?.setGridOption(`rowData`,t)}else s?.setGridOption(`rowData`,c);C()}),document.getElementById(`addTool`)?.addEventListener(`click`,()=>{x()}))}function E(){s&&=(s.destroy(),null),c=[],l=null}export{E as cleanup,T as render};