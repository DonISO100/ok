import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";import{n as s,r as c,t as l}from"./SettingsGrid-B84ehmak.js";import{t as u}from"./EditDialog-cJb7hPwJ.js";async function d(){try{let e=await fetch(`${n}/api/admin/export-series`,{credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();return(Array.isArray(t)?t:t.series||t).map(e=>({id:e.id,name:e.name,bookCount:e.bookCount??0}))}catch(e){return console.error(`Failed to fetch series:`,e),[]}}async function f(e){try{let t=await fetch(`${n}/api/admin/export-series/${e}`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return await t.json()}catch(e){return console.error(`Failed to fetch series settings:`,e),null}}async function p(e){try{let t=await fetch(`${n}/api/admin/export-series/${e}/books`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let r=await t.json();return(Array.isArray(r)?r:r.books||r).map(e=>({id:e.id,seriesId:e.seriesId,name:e.name}))}catch(e){return console.error(`Failed to fetch books:`,e),[]}}async function m(){try{let e=await fetch(`${n}/api/admin/export-formats`,{credentials:`include`});if(!e.ok)return console.warn(`Export formats endpoint returned ${e.status}`),[];let t=e.headers.get(`content-type`);return!t||!t.includes(`application/json`)?(console.warn(`Export formats endpoint did not return JSON`),[]):await e.json()}catch(e){return console.error(`Failed to fetch export formats:`,e),[]}}async function h(e){try{let t=await fetch(`${n}/api/admin/series`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({name:e})});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let r=await t.json();return r.success?{id:r.id,name:e,bookCount:0}:(console.error(`Failed to create series:`,r.message),null)}catch(e){return console.error(`Failed to create series:`,e),null}}async function g(e,t){try{let r=await fetch(`${n}/api/admin/series/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({name:t})});return r.ok?(await r.json()).success===!0:!1}catch(e){return console.error(`Failed to update series:`,e),!1}}async function _(e){try{let t=await(await fetch(`${n}/api/admin/series/${e}`,{method:`DELETE`,credentials:`include`})).json();return t.success?!0:(alert(t.message||`Failed to delete series`),!1)}catch(e){return console.error(`Failed to delete series:`,e),!1}}async function v(e,t){try{let r=await fetch(`${n}/api/admin/export-series/${e}/settings`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(t)});return r.ok?(await r.json()).success===!0:(console.error(`Failed to save series settings:`,r.status),!1)}catch(e){return console.error(`Failed to save series settings:`,e),!1}}function y(e,t){document.querySelectorAll(`#mainTabs .tab-pane`).forEach(e=>e.classList.remove(`show`,`active`)),document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>e.classList.remove(`active`)),document.getElementById(e)?.classList.add(`show`,`active`),document.querySelector(`#mainTabsNav .nav-link[data-tab="${e}"]`)?.classList.add(`active`),e===`books-tab`&&t.onBooksTab&&t.onBooksTab(),e===`default-settings-tab`&&t.onDefaultSettingsTab&&t.onDefaultSettingsTab()}function b(e,t){document.querySelectorAll(`#defaultSettingsTabs .tab-pane`).forEach(e=>e.classList.remove(`show`,`active`)),document.querySelectorAll(`#defaultSettingsTabsNav .nav-link`).forEach(e=>e.classList.remove(`active`)),document.getElementById(e)?.classList.add(`show`,`active`),document.querySelector(`#defaultSettingsTabsNav .nav-link[data-tab="${e}"]`)?.classList.add(`active`),t&&setTimeout(()=>t(e),50)}function x(e){let t=e||{languageCode1:``,languageCode2:``,languageCode3:``,metadataLanguageCode1:``,metadataLanguageCode2:``,metadataLanguageCode3:``};return`
        <div class="settings-form">
            <div class="form-group">
                <label for="langCode1" data-i18n="First Language Code">First Language Code</label>
                <input type="text" id="langCode1" class="form-control" value="${t.languageCode1||``}" placeholder="e.g., en" data-i18n-placeholder="e.g., en" />
            </div>
            <div class="form-group">
                <label for="langCode2" data-i18n="Second Language Code">Second Language Code</label>
                <input type="text" id="langCode2" class="form-control" value="${t.languageCode2||``}" placeholder="e.g., es" data-i18n-placeholder="e.g., es" />
            </div>
            <div class="form-group">
                <label for="langCode3" data-i18n="Third Language Code">Third Language Code</label>
                <input type="text" id="langCode3" class="form-control" value="${t.languageCode3||``}" placeholder="e.g., fr" data-i18n-placeholder="e.g., fr" />
            </div>
            <div class="form-group">
                <label for="metaLangCode1" data-i18n="First Metadata Language Code">First Metadata Language Code</label>
                <input type="text" id="metaLangCode1" class="form-control" value="${t.metadataLanguageCode1||``}" placeholder="e.g., en" data-i18n-placeholder="e.g., en" />
            </div>
            <div class="form-group">
                <label for="metaLangCode2" data-i18n="Second Metadata Language Code">Second Metadata Language Code</label>
                <input type="text" id="metaLangCode2" class="form-control" value="${t.metadataLanguageCode2||``}" placeholder="e.g., es" data-i18n-placeholder="e.g., es" />
            </div>
            <div class="form-group">
                <label for="metaLangCode3" data-i18n="Third Metadata Language Code">Third Metadata Language Code</label>
                <input type="text" id="metaLangCode3" class="form-control" value="${t.metadataLanguageCode3||``}" placeholder="e.g., fr" data-i18n-placeholder="e.g., fr" />
            </div>
        </div>
    `}function S(e){let t=e?.defaultBookObjectsSettings||[],n=``,r=``;return t.forEach((e,t)=>{let i=`object-settings-${t}`;n+=`<li class="nav-item"><button class="nav-link" data-tab="${i}" type="button">${e.name} <span data-i18n="Settings">Settings</span></button></li>`,r+=`
            <div class="tab-pane" id="${i}" role="tabpanel">
                <div id="settings-grid-${i}" class="grid-container settings-grid"></div>
            </div>
        `}),`
        <ul class="nav nav-tabs" id="defaultSettingsTabsNav" role="tablist">
            <li class="nav-item">
                <button class="nav-link active" data-tab="language-defaults-tab" type="button" data-i18n="Language Defaults">Language Defaults</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" data-tab="shared-settings-tab" type="button" data-i18n="Shared Settings">Shared Settings</button>
            </li>
            ${n}
        </ul>
        <div class="tab-content" id="defaultSettingsTabs">
            <div class="tab-pane show active" id="language-defaults-tab" role="tabpanel">
                ${x(e?.defaultTextSettings)}
            </div>
            <div class="tab-pane" id="shared-settings-tab" role="tabpanel">
                <div id="settings-grid-shared-settings-tab" class="grid-container settings-grid"></div>
            </div>
            ${r}
        </div>
    `}function C(e){return e.map(e=>`<option value="${e.namespace}">${e.description}</option>`).join(``)}function w(t){let n=document.getElementById(`seriesDropdown`),r=document.getElementById(`seriesCount`);if(n){let r=n.value;n.innerHTML=`<option value="" data-i18n="Select a Series">Select a Series</option>`+t.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``),e.translateIn(n),n.value=r}r&&(r.textContent=String(t.length))}function T(){return[{field:`id`,headerName:`ID`,width:100,cellStyle:{textAlign:`center`}},{field:`name`,headerName:`Name`,flex:1,cellRenderer:e=>e.data?`<a href="${n}/admin/books/${e.data.seriesId}/${e.data.id}" target="_blank">${e.value}</a>`:``}]}function E(e){return[{field:`name`,headerName:`Name`,flex:1,filter:`agTextColumnFilter`},{field:`namespace`,headerName:`Format`,flex:1,cellRenderer:t=>e.find(e=>e.namespace===t.value)?.description||t.value||``},{headerName:``,colId:`actions`,width:90,sortable:!1,resizable:!1,pinned:`right`,cellRenderer:e=>e.data?`
                    <button class="grid-icon-btn icon-edit btn-edit-object" data-id="${e.data.id}" title="Edit"><i class="fa fa-pencil"></i></button>
                    <button class="grid-icon-btn icon-delete btn-delete-object" data-id="${e.data.id}" title="Delete"><i class="fa fa-trash"></i></button>
                `:``}]}function D(){return{theme:r,columnDefs:T(),defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,domLayout:`autoHeight`}}function O(e){return{theme:r,columnDefs:E(e),defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,domLayout:`autoHeight`,getRowId:e=>e.data.id}}i.registerModules([o]);var k=[],A=null,j=null,M=[],N=null,P=null,F=new Map,I=[];async function L(){return!A||!j?!1:v(A.id,j)}function R(e,t){F.forEach((n,r)=>{if(r!==t&&(n.updateSettings([e],!1),j)){if(r===`shared-settings-tab`)j.defaultSharedBookSettings.settings=n.getSettingsWithValues();else{let e=parseInt(r.replace(`object-settings-`,``),10);j.defaultBookObjectsSettings[e]&&(j.defaultBookObjectsSettings[e].settings=n.getSettingsWithValues())}}})}async function z(){F.forEach(e=>e.destroy()),F.clear();let e=document.getElementById(`settings-grid-shared-settings-tab`);if(e&&I.length>0){let t=j?.defaultSharedBookSettings?.settings||[],n=new l({container:e,gridId:`shared-settings-tab`,onSettingsChange:async(e,t)=>{j&&(j.defaultSharedBookSettings.settings=e.filter(e=>e.hasValue),t?.isShared&&R(t,`shared-settings-tab`),await L())}});n.setSettings(I),n.mergeSettings(t),F.set(`shared-settings-tab`,n)}let t=j?.defaultBookObjectsSettings||[];for(let e=0;e<t.length;e++){let n=t[e],r=`object-settings-${e}`,i=document.getElementById(`settings-grid-${r}`);if(i&&n.namespace){let t=await s(n.namespace),a=new l({container:i,gridId:r,onSettingsChange:async(t,n)=>{j&&j.defaultBookObjectsSettings[e]&&(j.defaultBookObjectsSettings[e].settings=t.filter(e=>e.hasValue),n?.isShared&&R(n,r),await L())}}),o=(j?.defaultSharedBookSettings?.settings||[]).filter(e=>e.isShared);a.setSettings(t),a.mergeSettings([...o,...n.settings||[]]),F.set(r,a)}}}function B(){let t=document.getElementById(`defaultSettingsContainer`);t&&(t.innerHTML=S(j),e.translateIn(t),V(),z())}function V(){document.querySelectorAll(`#defaultSettingsTabsNav .nav-link`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.getAttribute(`data-tab`);t&&b(t,e=>{let t=F.get(e);t&&t.refresh()})})}),[`langCode1`,`langCode2`,`langCode3`,`metaLangCode1`,`metaLangCode2`,`metaLangCode3`].forEach(e=>{document.getElementById(e)?.addEventListener(`change`,async t=>{if(!j)return;let n=t.target.value;switch(e){case`langCode1`:j.defaultTextSettings.languageCode1=n;break;case`langCode2`:j.defaultTextSettings.languageCode2=n;break;case`langCode3`:j.defaultTextSettings.languageCode3=n;break;case`metaLangCode1`:j.defaultTextSettings.metadataLanguageCode1=n;break;case`metaLangCode2`:j.defaultTextSettings.metadataLanguageCode2=n;break;case`metaLangCode3`:j.defaultTextSettings.metadataLanguageCode3=n}await L()})})}async function H(e){A=e,j=await f(e.id)||{defaultTextSettings:{languageCode1:``,languageCode2:``,languageCode3:``,metadataLanguageCode1:``,metadataLanguageCode2:``,metadataLanguageCode3:``},defaultSharedBookSettings:{id:``,name:`Shared`,namespace:``,settings:[]},defaultBookObjectsSettings:[]};let n=document.getElementById(`seriesDropdown`);n&&(n.value=String(e.id));let r=document.getElementById(`seriesDetailSection`);r&&(r.style.display=`block`);let i=document.getElementById(`seriesNameInput`);i&&(i.value=e.name);let a=document.getElementById(`deleteSeriesBtn`);a&&(a.style.display=e.bookCount>0?`none`:`inline-block`),P&&P.setGridOption(`rowData`,j.defaultBookObjectsSettings),B();let o=await p(e.id);N&&N.setGridOption(`rowData`,o);let s=document.querySelector(`#mainTabsNav .nav-link[data-tab="books-tab"]`);s&&(s.textContent=t(`Books ({0})`,[o.length])),a&&(a.style.display=o.length>0?`none`:`inline-block`),localStorage.setItem(`LastSeriesId`,String(e.id))}function U(){document.getElementById(`seriesDropdown`)?.addEventListener(`change`,async e=>{let t=parseInt(e.target.value,10);if(t){let e=k.find(e=>e.id===t);e&&await H(e)}else document.getElementById(`seriesDetailSection`).style.display=`none`,A=null,j=null}),document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.getAttribute(`data-tab`);t&&y(t,{onBooksTab:()=>setTimeout(()=>N?.sizeColumnsToFit(),50),onDefaultSettingsTab:()=>b(`language-defaults-tab`,e=>{let t=F.get(e);t&&t.refresh()})})})}),document.getElementById(`saveSeriesNameBtn`)?.addEventListener(`click`,async()=>{if(!A)return;let e=document.getElementById(`seriesNameInput`)?.value?.trim();if(!e)alert(t(`Series name cannot be empty`));else if(await g(A.id,e)){A.name=e;let n=document.querySelector(`#seriesDropdown option[value="${A.id}"]`);n&&(n.textContent=e),alert(t(`Series name updated`))}else alert(t(`Failed to update series name`))}),document.getElementById(`deleteSeriesBtn`)?.addEventListener(`click`,async()=>{A&&confirm(t(`Delete the series "{0}"?`,[A.name]))&&await _(A.id)&&(k=k.filter(e=>e.id!==A.id),w(k),document.getElementById(`seriesDetailSection`).style.display=`none`,A=null,j=null)});let e=document.getElementById(`createSeriesModal`);document.getElementById(`createSeriesBtn`)?.addEventListener(`click`,()=>{e&&(e.style.display=`flex`),document.getElementById(`newSeriesName`).value=``}),document.getElementById(`closeModalBtn`)?.addEventListener(`click`,()=>{e&&(e.style.display=`none`)}),document.getElementById(`cancelCreateBtn`)?.addEventListener(`click`,()=>{e&&(e.style.display=`none`)}),document.getElementById(`confirmCreateBtn`)?.addEventListener(`click`,async()=>{let n=document.getElementById(`newSeriesName`).value.trim();if(!n){alert(t(`Please enter a series name`));return}let r=await h(n);r?(k.push({...r,bookCount:0}),w(k),e&&(e.style.display=`none`),await H(k[k.length-1])):alert(t(`Failed to create series`))}),e?.addEventListener(`click`,t=>{t.target===e&&(e.style.display=`none`)});let n=document.getElementById(`addExportObjectModal`);document.getElementById(`addExportObjectBtn`)?.addEventListener(`click`,()=>{n&&(n.style.display=`flex`),document.getElementById(`exportObjectName`).value=``,document.getElementById(`exportObjectFormat`).value=``}),document.getElementById(`closeExportObjectModalBtn`)?.addEventListener(`click`,()=>{n&&(n.style.display=`none`)}),document.getElementById(`cancelAddExportObjectBtn`)?.addEventListener(`click`,()=>{n&&(n.style.display=`none`)}),document.getElementById(`confirmAddExportObjectBtn`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`exportObjectName`).value.trim(),r=document.getElementById(`exportObjectFormat`).value;if(!e||!r){alert(t(`Please enter a name and select a format`));return}if(!j)return;let i={id:crypto.randomUUID(),name:e,namespace:r,settings:[]};j.defaultBookObjectsSettings.push(i),await L(),P?.setGridOption(`rowData`,j.defaultBookObjectsSettings),B(),n&&(n.style.display=`none`)}),n?.addEventListener(`click`,e=>{e.target===n&&(n.style.display=`none`)}),document.getElementById(`exportObjectsGrid`)?.addEventListener(`click`,async e=>{let n=e.target.closest(`.btn-edit-object`);if(n){let e=n.getAttribute(`data-id`);if(!e||!j)return;let r=j.defaultBookObjectsSettings.find(t=>t.id===e);if(!r)return;let i=await u({title:t(`Edit Export Object: {0}`,[r.name]),fields:[{key:`name`,label:t(`Name`),type:`text`}],values:{name:r.name}});if(!i)return;r.name=i.name,await L(),P?.setGridOption(`rowData`,j.defaultBookObjectsSettings),B();return}let r=e.target.closest(`.btn-delete-object`);if(r){let e=r.getAttribute(`data-id`);if(!e||!j)return;let n=j.defaultBookObjectsSettings.find(t=>t.id===e);if(!n||!confirm(t(`Delete the export object "{0}"?`,[n.name])))return;j.defaultBookObjectsSettings=j.defaultBookObjectsSettings.filter(t=>t.id!==e),await L(),P?.setGridOption(`rowData`,j.defaultBookObjectsSettings),B()}})}async function W(t){[k,M,I]=await Promise.all([d(),m(),c()]);let n=k.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);t.innerHTML=`
        <div class="series-page">
            <div class="card">
                <div class="card-header">
                    <div class="header-row">
                        <div class="header-col">
                            <i class="fa fa-database"></i> <span data-i18n="Publishing Series">Publishing Series</span> (<span id="seriesCount">${k.length}</span>)
                        </div>
                        <div class="header-col flex-grow">
                            <select id="seriesDropdown" class="form-control">
                                <option value="" data-i18n="Select a Series">Select a Series</option>
                                ${n}
                            </select>
                        </div>
                        <div class="header-col">
                            <button class="btn btn-success" id="createSeriesBtn"><i class="fa fa-plus"></i> <span data-i18n="Create Series">Create Series</span></button>
                        </div>
                    </div>
                </div>
                
                <div id="seriesDetailSection" class="card-body" style="display: none;">
                    <!-- Main Tabs: Properties, Default Settings, Books -->
                    <ul class="nav nav-tabs" id="mainTabsNav" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" data-tab="properties-tab" type="button" data-i18n="Properties">Properties</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-tab="default-settings-tab" type="button" data-i18n="Default Settings">Default Settings</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-tab="books-tab" type="button" data-i18n="Books (0)">Books (0)</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content" id="mainTabs">
                        <!-- Properties Tab -->
                        <div class="tab-pane show active" id="properties-tab" role="tabpanel">
                            <div class="properties-section">
                                <div class="form-group">
                                    <label for="seriesNameInput" data-i18n="Series Name">Series Name</label>
                                    <input type="text" id="seriesNameInput" class="form-control" />
                                    <button class="btn btn-primary btn-sm mt-2" id="saveSeriesNameBtn" data-i18n="Save Name">Save Name</button>
                                </div>
                            </div>
                            
                            <div class="export-objects-section">
                                <div class="section-header">
                                    <h5><i class="fa fa-book"></i> <span data-i18n="Export Objects">Export Objects</span></h5>
                                    <button class="btn btn-success btn-sm" id="addExportObjectBtn"><i class="fa fa-plus"></i> <span data-i18n="Add">Add</span></button>
                                </div>
                                <div id="exportObjectsGrid" class="grid-container"></div>
                            </div>
                            
                            <div class="delete-section">
                                <button class="btn btn-danger" id="deleteSeriesBtn"><i class="fa fa-trash"></i> <span data-i18n="Delete This Series">Delete This Series</span></button>
                            </div>
                        </div>
                        
                        <!-- Default Settings Tab -->
                        <div class="tab-pane" id="default-settings-tab" role="tabpanel">
                            <div id="defaultSettingsContainer">
                                <!-- Nested tabs rendered dynamically -->
                            </div>
                        </div>
                        
                        <!-- Books Tab -->
                        <div class="tab-pane" id="books-tab" role="tabpanel">
                            <div id="booksGrid" class="grid-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Create Series Modal -->
        <div id="createSeriesModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="Create a Publishing Series">Create a Publishing Series</h3>
                    <button class="modal-close" id="closeModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="newSeriesName" data-i18n="Series Name">Series Name</label>
                        <input type="text" id="newSeriesName" class="form-control" placeholder="Enter series name" data-i18n-placeholder="Enter series name" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmCreateBtn" data-i18n="Create Series">Create Series</button>
                    <button class="btn btn-secondary" id="cancelCreateBtn" data-i18n="Cancel">Cancel</button>
                </div>
            </div>
        </div>
        
        <!-- Add Export Object Modal -->
        <div id="addExportObjectModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="Add Export Object">Add Export Object</h3>
                    <button class="modal-close" id="closeExportObjectModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="exportObjectName" data-i18n="Name">Name</label>
                        <input type="text" id="exportObjectName" class="form-control" placeholder="Enter object name" data-i18n-placeholder="Enter object name" />
                    </div>
                    <div class="form-group">
                        <label for="exportObjectFormat" data-i18n="Format">Format</label>
                        <select id="exportObjectFormat" class="form-control">
                            <option value="" data-i18n="Select a Format">Select a Format</option>
                            ${C(M)}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmAddExportObjectBtn" data-i18n="Add">Add</button>
                    <button class="btn btn-secondary" id="cancelAddExportObjectBtn" data-i18n="Cancel">Cancel</button>
                </div>
            </div>
        </div>
    `,e.translateIn(t);let r=document.getElementById(`booksGrid`);r&&(N=a(r,D()));let i=document.getElementById(`exportObjectsGrid`);i&&(P=a(i,O(M))),U();let o=localStorage.getItem(`LastSeriesId`);if(o){let e=k.find(e=>e.id===parseInt(o,10));e&&await H(e)}}function G(){N&&=(N.destroy(),null),P&&=(P.destroy(),null),F.forEach(e=>e.destroy()),F.clear(),A=null,j=null,k=[],M=[],I=[]}export{G as cleanup,W as render};