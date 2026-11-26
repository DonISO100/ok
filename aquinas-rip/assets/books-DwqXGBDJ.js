import{n as e,r as t,t as n}from"./HubConnectionBuilder-CFo-bU28.js";import{i as r,l as i,p as a}from"./i18n-fj3F4Jw9.js";import{i as o,n as s,r as c,t as l}from"./main.esm-vKLlLbDv.js";import{t as u}from"./SettingsGrid-B84ehmak.js";var d=class{container;objectName;onExport;onCancel;isExporting=!1;progressValue=0;progressTotal=0;showDetail=!0;showStatus=!1;statusLogs=[];errorLogs=[];constructor(e){this.container=e.container,this.objectName=e.objectName,this.onExport=e.onExport,this.onCancel=e.onCancel,this.render(),this.attachEventHandlers()}setProgress(e,t){this.progressValue=e,this.progressTotal=t,this.updateProgressBar()}logStatus(e){this.statusLogs.unshift({type:`status`,message:e,timestamp:new Date}),this.updateStatusPanel()}logDetail(e){this.statusLogs.unshift({type:`detail`,message:e,timestamp:new Date}),this.updateStatusPanel()}logError(e){this.errorLogs.unshift({type:`error`,message:e,timestamp:new Date}),this.updateErrorPanel()}clearLogs(){this.statusLogs=[],this.errorLogs=[],this.updateStatusPanel(),this.updateErrorPanel()}setExporting(e){this.isExporting=e,this.updateButtonStates()}setObjectName(e){this.objectName=e;let t=this.container.querySelector(`.btn-export`);t&&(t.innerHTML=`<i class="fa fa-cloud-download-alt"></i>&ensp;${i(`Export {0}`,[e])}`)}destroy(){this.container.innerHTML=``}render(){this.container.classList.add(`export-panel`),this.container.innerHTML=`
            <div class="export-panel-row">
                <button class="btn btn-success btn-export" ${this.isExporting?`disabled`:``}>
                    <i class="fa fa-cloud-download-alt"></i>&ensp;${i(`Export {0}`,[this.objectName])}
                </button>
                <select class="form-control quality-select">
                    <option value="Test" data-i18n="Test">Test</option>
                    <option value="Draft" data-i18n="Draft">Draft</option>
                    <option value="Final" selected data-i18n="Final">Final</option>
                </select>
                <button class="btn btn-danger btn-cancel" ${this.isExporting?``:`disabled`}>
                    <i class="fa fa-ban"></i>&ensp;${i(`Cancel Export`)}
                </button>
                <div class="progress-container">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar ${this.progressTotal===0?`indeterminate`:``}" style="width: ${this.getProgressPercent()}%"></div>
                        <span class="progress-text">${this.getProgressText()}</span>
                    </div>
                </div>
            </div>
            
            <div class="output-section">
                <div class="output-header">
                    <div class="output-toggle">
                        <label data-i18n="Detail">Detail</label>
                        <label class="switch">
                            <input type="checkbox" class="toggle-detail" ${this.showDetail?`checked`:``} />
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="output-toggle">
                        <label data-i18n="Status">Status</label>
                        <label class="switch">
                            <input type="checkbox" class="toggle-status" ${this.showStatus?`checked`:``} />
                            <span class="slider"></span>
                        </label>
                    </div>
                    <button class="btn btn-info btn-sm btn-clear-logs" style="margin-left: auto;" data-i18n="Clear">Clear</button>
                </div>
                <div class="output-body">
                    <div class="status-panel" id="statusPanel"></div>
                    <div class="error-panel" id="errorPanel"></div>
                </div>
            </div>
        `,r.translateIn(this.container)}attachEventHandlers(){this.container.querySelector(`.btn-export`)?.addEventListener(`click`,async()=>{if(this.onExport&&!this.isExporting){let e=this.container.querySelector(`.quality-select`).value;this.setExporting(!0),await this.onExport(e)}}),this.container.querySelector(`.btn-cancel`)?.addEventListener(`click`,()=>{this.onCancel&&this.isExporting&&this.onCancel()}),this.container.querySelector(`.toggle-detail`)?.addEventListener(`change`,e=>{this.showDetail=e.target.checked,this.updateStatusPanel()}),this.container.querySelector(`.toggle-status`)?.addEventListener(`change`,e=>{this.showStatus=e.target.checked,this.updateStatusPanel()}),this.container.querySelector(`.btn-clear-logs`)?.addEventListener(`click`,()=>{this.clearLogs()})}updateButtonStates(){let e=this.container.querySelector(`.btn-export`),t=this.container.querySelector(`.btn-cancel`);e&&(e.disabled=this.isExporting),t&&(t.disabled=!this.isExporting)}updateProgressBar(){let e=this.container.querySelector(`.progress-bar`),t=this.container.querySelector(`.progress-text`);e&&(this.progressTotal===0?(e.classList.add(`indeterminate`),e.style.width=`100%`):(e.classList.remove(`indeterminate`),e.style.width=`${this.getProgressPercent()}%`)),t&&(t.textContent=this.getProgressText())}updateStatusPanel(){let e=this.container.querySelector(`#statusPanel`);if(e){let t=this.showDetail?``:`display: none;`,n=this.showStatus?``:`display: none;`;e.innerHTML=this.statusLogs.map(e=>{let r=e.type===`detail`?t:e.type===`status`?n:``;return`<p class="log-${e.type}" style="${r}">${e.message}</p>`}).join(``)}}updateErrorPanel(){let e=this.container.querySelector(`#errorPanel`);e&&(e.innerHTML=this.errorLogs.map(e=>`<p class="log-error">${e.message}</p>`).join(``))}getProgressPercent(){return this.progressTotal===0?0:Math.round(this.progressValue/this.progressTotal*100)}getProgressText(){return`${this.progressValue}/${this.progressTotal}`}},f=class{container;bookObjectSettings;availableLayouts;onSettingsChange;onExport;onCancel;settingsGrid=null;layoutSettingsGrids=new Map;exportPanel=null;constructor(e){this.container=e.container,this.bookObjectSettings=e.bookObjectSettings,this.availableLayouts=e.availableLayouts??[],this.onSettingsChange=e.onSettingsChange,this.onExport=e.onExport,this.onCancel=e.onCancel}async init(){this.render(),this.attachEventHandlers(),await this.initializeTabContent()}getSettings(){if(this.settingsGrid){let e=this.settingsGrid.getSettingsWithValues();this.bookObjectSettings.settings=e}return this.layoutSettingsGrids.forEach((e,t)=>{let n=this.bookObjectSettings.layoutsSettings.find(e=>e.textName===t);n&&(n.settings=e.getSettingsWithValues())}),this.bookObjectSettings}destroy(){this.settingsGrid?.destroy(),this.layoutSettingsGrids.forEach(e=>e.destroy()),this.layoutSettingsGrids.clear(),this.exportPanel?.destroy(),this.container.innerHTML=``}getExportPanel(){return this.exportPanel}updateSettings(e){this.bookObjectSettings=e,this.settingsGrid&&this.settingsGrid.updateSettings(e.settings);for(let t of e.layoutsSettings){let e=this.layoutSettingsGrids.get(t.textName);e&&e.updateSettings(t.settings)}}applySharedSetting(e){e.isShared&&this.settingsGrid&&this.settingsGrid.updateSettings([e],!1)}activateFirstTab(){this.switchTab(`export`)}render(){this.container.classList.add(`book-object-tabs-container`);let e=this.bookObjectSettings.layoutsSettings.map((e,t)=>`<li class="nav-item">
                <button class="nav-link" data-tab="layout-${t}" type="button">${e.textName}</button>
            </li>`).join(``),t=this.bookObjectSettings.layoutsSettings.map((e,t)=>`<div class="tab-pane" id="layout-${t}" role="tabpanel">
                <div class="layout-settings-section">
                    ${this.renderLayoutBody(e,t)}
                </div>
            </div>`).join(``);this.container.innerHTML=`
            <div class="nested-tabs-container">
                <ul class="nav nav-tabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" data-tab="export" type="button" data-i18n="Export">Export</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" data-tab="export-settings" type="button" data-i18n="Export Settings">Export Settings</button>
                    </li>
                    ${e}
                </ul>
                <div class="tab-content">
                    <div class="tab-pane show active" id="export" role="tabpanel">
                        <div id="export-panel-container"></div>
                    </div>
                    <div class="tab-pane" id="export-settings" role="tabpanel">
                        <div id="settings-grid-container" class="grid-container settings-grid"></div>
                    </div>
                    ${t}
                </div>
            </div>
        `,r.translateIn(this.container)}renderLayoutBody(e,t){return this.availableLayouts.length===0?`<label class="layout-no-texts" data-i18n="This export object does not use texts.">This export object does not use texts.</label>`:`
            <div class="layout-dropdown">
                <label data-i18n="Layout">Layout</label>
                <select class="form-control layout-select" data-layout-index="${t}">
                    ${[`<option value="" data-i18n="&mdash; Select a Layout &mdash;">&mdash; Select a Layout &mdash;</option>`].concat(this.availableLayouts.map(t=>`<option value="${t.layoutClassName}" ${t.layoutClassName===e.layoutClassName?`selected`:``}>${t.description}</option>`)).join(``)}
                </select>
            </div>
            <div id="layout-settings-grid-${t}" class="grid-container settings-grid"></div>`}attachEventHandlers(){this.container.querySelectorAll(`.nav-link`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.getAttribute(`data-tab`);t&&this.switchTab(t)})}),this.container.querySelectorAll(`.layout-select`).forEach(e=>{e.addEventListener(`change`,async e=>{let t=e.target,n=parseInt(t.getAttribute(`data-layout-index`)||`-1`,10);n>=0&&await this.onLayoutChanged(n,t.value)})})}async onLayoutChanged(e,t){let n=this.bookObjectSettings.layoutsSettings[e];if(!n)return;let r=this.availableLayouts.find(e=>e.layoutClassName===t);n.layoutClassName=t,n.description=r?.description||``,n.settings=r?r.settings.map(e=>({...e})):[],this.layoutSettingsGrids.get(n.textName)?.destroy(),this.layoutSettingsGrids.delete(n.textName);let i=this.container.querySelector(`#layout-settings-grid-${e}`);if(i){let t=new u({container:i,gridId:`layout-settings-${this.bookObjectSettings.id}-${e}`,settings:n.settings,onSettingsChange:async()=>{this.onSettingsChange&&await this.onSettingsChange(this.getSettings())}});this.layoutSettingsGrids.set(n.textName,t)}this.onSettingsChange&&await this.onSettingsChange(this.getSettings())}switchTab(e){this.container.querySelectorAll(`.nav-link`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)}),this.container.querySelectorAll(`.tab-pane`).forEach(t=>{let n=t.id===e;t.classList.toggle(`show`,n),t.classList.toggle(`active`,n)}),setTimeout(()=>{if(e===`export-settings`)this.settingsGrid?.refresh();else if(e.startsWith(`layout-`)){let t=parseInt(e.replace(`layout-`,``),10),n=this.bookObjectSettings.layoutsSettings[t];n&&this.layoutSettingsGrids.get(n.textName)?.refresh()}},50)}async initializeTabContent(){let e=this.container.querySelector(`#export-panel-container`);e&&(this.exportPanel=new d({container:e,objectName:this.bookObjectSettings.name,onExport:async e=>{this.onExport&&await this.onExport(this.getSettings(),e)},onCancel:()=>{this.onCancel&&this.onCancel()}}));let t=this.container.querySelector(`#settings-grid-container`);t&&(this.settingsGrid=new u({container:t,gridId:`object-settings-${this.bookObjectSettings.id}`,settings:this.bookObjectSettings.settings,onSettingsChange:async(e,t)=>{this.onSettingsChange&&await this.onSettingsChange(this.getSettings(),t)}}));for(let e=0;e<this.bookObjectSettings.layoutsSettings.length;e++){let t=this.bookObjectSettings.layoutsSettings[e],n=this.container.querySelector(`#layout-settings-grid-${e}`);if(n){let r=new u({container:n,gridId:`layout-settings-${this.bookObjectSettings.id}-${e}`,settings:t.settings,onSettingsChange:async()=>{this.onSettingsChange&&await this.onSettingsChange(this.getSettings())}});this.layoutSettingsGrids.set(t.textName,r)}}}},p=class{connection=null;callbacks={};isConnected=!1;constructor(){this.connection=new n().withUrl(`${a}/hubs/export`).withAutomaticReconnect().configureLogging(t.Information).build(),this.setupHandlers()}setupHandlers(){this.connection&&(this.connection.on(`ExportStatus`,e=>{this.callbacks.onStatus?.(e)}),this.connection.on(`ExportDetail`,e=>{this.callbacks.onDetail?.(e)}),this.connection.on(`ExportError`,e=>{this.callbacks.onError?.(e)}),this.connection.on(`ExportProgress`,e=>{this.callbacks.onProgress?.(e)}),this.connection.on(`ExportProgressTotal`,e=>{this.callbacks.onProgressTotal?.(e)}),this.connection.on(`ExportComplete`,(e,t)=>{this.callbacks.onComplete?.(e,t)}),this.connection.onclose(e=>{console.log(`Export hub connection closed`,e),this.isConnected=!1}),this.connection.onreconnecting(e=>{console.log(`Export hub reconnecting`,e),this.callbacks.onStatus?.(`Reconnecting...`)}),this.connection.onreconnected(e=>{console.log(`Export hub reconnected`,e),this.callbacks.onStatus?.(`Reconnected`)}))}async connect(){if(!this.isConnected)try{await this.connection?.start(),this.isConnected=!0,console.log(`Connected to export hub`)}catch(e){throw console.error(`Failed to connect to export hub:`,e),e}}async disconnect(){if(this.isConnected)try{await this.connection?.stop(),this.isConnected=!1}catch(e){console.error(`Failed to disconnect from export hub:`,e)}}setCallbacks(e){this.callbacks=e}async startExport(e,t,n,r){this.isConnected||await this.connect();try{await this.connection?.invoke(`StartExport`,e,t,n,r)}catch(e){console.error(`Failed to start export:`,e),this.callbacks.onError?.(`Failed to start export: ${e}`),this.callbacks.onComplete?.(!1,null)}}async cancelExport(){if(this.isConnected)try{await this.connection?.invoke(`CancelExport`)}catch(e){console.error(`Failed to cancel export:`,e)}}getConnectionState(){return this.connection?.state??e.Disconnected}},m=null;function h(){return m||=new p,m}s.registerModules([l]);var g=h(),_=[],v=null,y=null,b=null,x=null,S=null,C=new Map,w=[],T=new Map,E=[],D=new Map,O=!1,k=[];async function A(){try{let e=await fetch(`${a}/api/admin/export-series`,{credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();return(Array.isArray(t)?t:t.series||t).map(e=>({id:e.id,name:e.name,data:``,bookCount:e.bookCount??0}))}catch(e){return console.error(`Failed to fetch series:`,e),[]}}async function j(e){try{let t=await fetch(`${a}/api/admin/export-series/${e}/books`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let n=await t.json();return(Array.isArray(n)?n:n.books||n).map(e=>({id:e.id,seriesId:e.seriesId,name:e.name,data:e.value||e.data||``}))}catch(e){return console.error(`Failed to fetch books:`,e),[]}}async function M(e){try{let t=await fetch(`${a}/api/admin/export-books/${e}`,{credentials:`include`});if(!t.ok)return null;let n=await t.json();return{bookTexts:(n.bookTexts||[]).map(e=>({id:e.id||``,name:e.name||``,workId:e.workId??0,data1Id:e.data1Id??0,data2Id:e.data2Id??0,data3Id:e.data3Id??0,metadata1Id:e.metadata1Id??0,metadata2Id:e.metadata2Id??0,metadata3Id:e.metadata3Id??0,useWholeText:e.useWholeText??!0,beginRowId:e.beginRowId??null,endRowId:e.endRowId??null,mergeWithNext:e.mergeWithNext??!1})),sharedBookSettings:{id:n.sharedBookSettings?.id||``,name:n.sharedBookSettings?.name||`Shared`,namespace:n.sharedBookSettings?.namespace||``,settings:(n.sharedBookSettings?.settings||[]).map(z)},bookObjectsSettings:(n.bookObjectsSettings||[]).map(e=>({id:e.id||``,name:e.name||``,namespace:e.namespace||``,settings:(e.settings||[]).map(z),layoutsSettings:(e.layoutsSettings||[]).map(e=>({id:e.id||``,textName:e.textName||``,layoutClassName:e.layoutClassName||``,description:e.description||``,settingsClassNames:e.settingsClassNames||[],settings:(e.settings||[]).map(z)}))}))}}catch(e){return console.error(`Failed to fetch book settings:`,e),null}}async function N(e,t){try{let n=await fetch(`${a}/api/admin/books`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({seriesId:e,name:t,value:`{}`})});if(!n.ok)throw Error(`HTTP error! status: ${n.status}`);let r=await n.json();return r.success?{id:r.id,seriesId:e,name:t,data:`{}`}:(console.error(`Failed to create book:`,r.message),null)}catch(e){return console.error(`Failed to create book:`,e),null}}async function ee(e,t){try{let n=await fetch(`${a}/api/admin/books/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({name:t})});return n.ok?(await n.json()).success===!0:!1}catch(e){return console.error(`Failed to update book:`,e),!1}}async function te(e,t){try{let n=await fetch(`${a}/api/admin/export-books/${e}/settings`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(t)});return n.ok?(await n.json()).success===!0:(console.error(`Failed to save book settings:`,n.status),!1)}catch(e){return console.error(`Failed to save book settings:`,e),!1}}async function ne(e){try{let t=await(await fetch(`${a}/api/admin/books/${e}`,{method:`DELETE`,credentials:`include`})).json();return t.success?!0:(console.error(`Failed to delete book:`,t.message),!1)}catch(e){return console.error(`Failed to delete book:`,e),!1}}async function re(){try{let e=await fetch(`${a}/api/admin/works`,{credentials:`include`});if(!e.ok)return[];let t=await e.json(),n=Array.isArray(t)?t:t.works||t;return Array.isArray(n)?n.map(e=>({id:e.id,name:e.name})):[]}catch(e){return console.error(`Failed to fetch works:`,e),[]}}async function P(e){try{let t=await fetch(`${a}/api/admin/works/${e}/data`,{credentials:`include`});if(!t.ok)return[];let n=await t.json(),r=Array.isArray(n)?n:n.languages||n.data||n;return Array.isArray(r)?r.map(t=>({id:t.id,name:t.name,workId:t.workId??e})):[]}catch(e){return console.error(`Failed to fetch work languages:`,e),[]}}async function F(){try{let e=await fetch(`${a}/api/admin/export-formats`,{credentials:`include`});if(!e.ok)return[];let t=await e.json(),n=Array.isArray(t)?t:t.formats||t;return Array.isArray(n)?n.map(e=>({namespace:e.namespace||e.Namespace||``,description:e.description||e.Description||e.namespace||e.Namespace||``})):[]}catch(e){return console.error(`Failed to fetch export formats:`,e),[]}}function I(){return E.map(e=>`<option value="${e.namespace}">${e.description}</option>`).join(``)}async function L(e){if(!e)return[];let t=D.get(e);if(t)return t;try{let t=await fetch(`${a}/api/admin/export-text-layouts/${encodeURIComponent(e)}`,{credentials:`include`});if(!t.ok)return D.set(e,[]),[];let n=await t.json(),r=Array.isArray(n)?n:n.layouts||n,i=(Array.isArray(r)?r:[]).map(e=>({layoutClassName:e.layoutClassName||e.LayoutClassName||``,description:e.description||e.Description||e.layoutClassName||e.LayoutClassName||``,settings:(e.settings||e.Settings||[]).map(z)}));return D.set(e,i),i}catch(t){return console.error(`Failed to fetch text layouts:`,t),D.set(e,[]),[]}}async function R(e){try{let t=await fetch(`${a}/api/admin/export-books/${e}/text-tree`,{credentials:`include`});if(!t.ok)return[];let n=await t.json(),r=Array.isArray(n)?n:n.works||n;return Array.isArray(r)?r.map(e=>({workCode:e.workCode||``,rowCount:e.rowCount??0,languageCount:e.languageCount??0,rows:(e.rows||[]).map(e=>({number:e.number??0,style:e.style||``,styleName:e.styleName||``,indexId:e.indexId??0,previousIndexId:e.previousIndexId??0,text1:e.text1||``,text2:e.text2||``,parentRowNumber:e.parentRowNumber??null}))})):[]}catch(e){return console.error(`Failed to fetch text tree:`,e),[]}}function z(e){return{name:e.name||e.Name||``,displayName:e.displayName||e.DisplayName||``,group:e.group||e.Group||``,typeName:e.typeName||e.TypeName||`String`,placeholder:e.placeholder||e.Placeholder||``,isReadOnly:e.isReadOnly??e.IsReadOnly??!1,isShared:e.isShared??e.IsShared??!1,hasValue:e.hasValue??e.HasValue??!1,stringValue:e.stringValue??e.StringValue??e._StringValue??null,intValue:e.intValue??e.IntValue??e._IntValue??null,booleanValue:e.booleanValue??e.BooleanValue??e._BooleanValue??null,decimalValue:e.decimalValue??e.DecimalValue??e._DecimalValue??null,doubleValue:e.doubleValue??e.DoubleValue??e._DoubleValue??null,stringOptions:e.stringOptions||e.StringOptions||null,intOptions:e.intOptions||e.IntOptions||null}}function B(e){document.querySelectorAll(`#mainTabs .tab-pane`).forEach(e=>e.classList.remove(`show`,`active`)),document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>e.classList.remove(`active`)),document.getElementById(e)?.classList.add(`show`,`active`),document.querySelector(`#mainTabsNav .nav-link[data-tab="${e}"]`)?.classList.add(`active`);let t=document.querySelector(`.text-tree-toggle-section`),n=document.getElementById(`textTreeContainer`);if(t&&(t.style.display=e===`texts-tab`?`flex`:`none`),n&&e!==`texts-tab`?n.style.display=`none`:n&&e===`texts-tab`&&O&&(n.style.display=`block`),e===`texts-tab`&&x)setTimeout(()=>x?.sizeColumnsToFit(),50);else if(e===`common-settings-tab`&&S)setTimeout(()=>S?.refresh(),50);else if(e.startsWith(`object-`)){let t=e.replace(`object-`,``),n=C.get(t);n&&n.activateFirstTab()}}async function V(){y&&b&&(S&&(b.sharedBookSettings.settings=S.getSettingsWithValues()),C.forEach((e,t)=>{let n=e.getSettings(),r=b.bookObjectsSettings.findIndex(e=>e.id===t);r>=0&&(b.bookObjectsSettings[r]=n)}),await te(y.id,b))}function H(e,t){t!==null&&S?.updateSettings([e],!1),C.forEach((n,r)=>{r!==t&&n.applySharedSetting(e)})}async function U(e){y=e,b=await M(e.id)||{bookTexts:[],sharedBookSettings:{id:``,name:`Shared`,namespace:``,settings:[]},bookObjectsSettings:[]};let t=document.getElementById(`bookDropdown`);t&&(t.value=String(e.id)),v&&history.replaceState(null,``,`${a}/admin/books/${v.id}/${e.id}`);let n=document.getElementById(`bookDetailSection`);n&&(n.style.display=`block`);let r=document.getElementById(`deleteBookBtn`);r&&(r.style.display=`inline-flex`);let i=document.getElementById(`bookNameInput`);i&&(i.value=e.name),O=!1,k=[];let o=document.getElementById(`showTextTreeToggle`);o&&(o.checked=!1);let s=document.getElementById(`textTreeContainer`);s&&(s.style.display=`none`,s.innerHTML=``),x&&x.setGridOption(`rowData`,b.bookTexts),await K(),await G(),v&&localStorage.setItem(`LastSeries${v.id}BookId`,String(e.id))}async function W(e){v=e,y=null,b=null,O=!1,k=[];let t=document.getElementById(`seriesDropdown`);t&&(t.value=String(e.id));let n=await j(e.id),i=document.getElementById(`bookDropdown`);i&&(i.innerHTML=`<option value="" data-i18n="Select a Book">Select a Book</option>`+n.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``),r.translateIn(i));let a=document.getElementById(`bookDetailSection`);a&&(a.style.display=`none`),localStorage.setItem(`LastSeriesId`,String(e.id));let o=window.location.pathname.match(/\/admin\/books\/\d+\/(\d+)/),s=o?parseInt(o[1],10):0;if(s||=parseInt(localStorage.getItem(`LastSeries${e.id}BookId`)||`0`,10),s){let e=n.find(e=>e.id===s);e&&await U(e)}}async function G(){S?.destroy(),S=null;let e=document.getElementById(`sharedSettingsGrid`);e&&b&&(S=new u({container:e,gridId:`shared-book-settings`,settings:b.sharedBookSettings.settings,onSettingsChange:async(e,t)=>{t?.isShared&&H(t,null),await V()}}))}async function K(){if(C.forEach(e=>e.destroy()),C.clear(),b){q();for(let e of b.bookObjectsSettings){let t=document.getElementById(`object-tab-${e.id}`);if(t){let n=new f({container:t,bookObjectSettings:e,availableLayouts:await L(e.namespace),onSettingsChange:async(t,n)=>{n?.isShared&&H(n,e.id),await V()},onExport:async(e,t)=>{if(!v||!y)return;let n=C.get(e.id)?.getExportPanel();n&&(g.setCallbacks({onStatus:e=>n.logStatus(e),onDetail:e=>n.logDetail(e),onError:e=>n.logError(e),onProgress:e=>n.setProgress(e,n.progressTotal||100),onProgressTotal:e=>{n.progressTotal=e,n.setProgress(n.progressValue||0,e)},onComplete:async(r,a)=>{if(n.setExporting(!1),r&&a){n.logStatus(i(`Download ready!`));let r=document.createElement(`a`);if(r.href=a,r.download=``,document.body.appendChild(r),r.click(),document.body.removeChild(r),t===`Final`&&y)try{let t=await M(y.id);if(t){b=t;let r=t.bookObjectsSettings.find(t=>t.id===e.id);if(r){let t=C.get(e.id);t&&(t.updateSettings(r),n.logDetail(i(`Settings refreshed with updated page count.`)))}}}catch(e){console.error(`Failed to refresh settings after export:`,e)}}}}),await g.startExport(v.id,y.id,e.id,t))},onCancel:async()=>{await g.cancelExport()}});await n.init(),C.set(e.id,n)}}}}function q(){let e=document.getElementById(`mainTabsNav`),t=document.getElementById(`mainTabs`);if(!e||!t||!b)return;let n=b.bookObjectsSettings.map(e=>`<li class="nav-item">
            <button class="nav-link" data-tab="object-${e.id}" type="button">${e.name}</button>
        </li>`).join(``),i=b.bookObjectsSettings.map(e=>`<div class="tab-pane" id="object-${e.id}" role="tabpanel">
            <div id="object-tab-${e.id}"></div>
        </div>`).join(``);e.innerHTML=`
        <li class="nav-item">
            <button class="nav-link active" data-tab="texts-tab" type="button" data-i18n="Texts">Texts</button>
        </li>
        <li class="nav-item">
            <button class="nav-link" data-tab="common-settings-tab" type="button" data-i18n="Common Settings">Common Settings</button>
        </li>
        ${n}
    `,r.translateIn(e),t.innerHTML=`
        <div class="tab-pane show active" id="texts-tab" role="tabpanel">
            <div class="texts-section">
                <div class="texts-toolbar">
                    <button class="btn btn-sm btn-success" id="addTextBtn"><i class="fa fa-plus"></i>&emsp;<span data-i18n="Add Text">Add Text</span></button>
                </div>
                <div class="texts-layout">
                    <div class="texts-grid-panel">
                        <div id="textsGrid" class="grid-container texts-grid"></div>
                    </div>
                    <div class="texts-detail-panel" id="textDetailPanel" style="display: none;">
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <h4 id="detailTextName" data-i18n="Text Settings">Text Settings</h4>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-row">
                                    <label data-i18n="Work">Work</label>
                                    <select id="detailWorkId" class="form-control"></select>
                                </div>
                                <div class="detail-row-group">
                                    <div class="detail-row">
                                        <label data-i18n="Language 1">Language 1</label>
                                        <select id="detailData1Id" class="form-control"></select>
                                    </div>
                                    <div class="detail-row">
                                        <label data-i18n="Metadata 1">Metadata 1</label>
                                        <select id="detailMetadata1Id" class="form-control"></select>
                                    </div>
                                </div>
                                <div class="detail-row-group">
                                    <div class="detail-row">
                                        <label data-i18n="Language 2">Language 2</label>
                                        <select id="detailData2Id" class="form-control"></select>
                                    </div>
                                    <div class="detail-row">
                                        <label data-i18n="Metadata 2">Metadata 2</label>
                                        <select id="detailMetadata2Id" class="form-control"></select>
                                    </div>
                                </div>
                                <div class="detail-row-group">
                                    <div class="detail-row">
                                        <label data-i18n="Language 3">Language 3</label>
                                        <select id="detailData3Id" class="form-control"></select>
                                    </div>
                                    <div class="detail-row">
                                        <label data-i18n="Metadata 3">Metadata 3</label>
                                        <select id="detailMetadata3Id" class="form-control"></select>
                                    </div>
                                </div>
                                <div class="detail-row-group">
                                    <div class="detail-row checkbox-row">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="detailUseWholeText" />
                                            <span data-i18n="Use whole text">Use whole text</span>
                                        </label>
                                    </div>
                                    <div class="detail-row">
                                        <label data-i18n="Begin Row Id (database id)">Begin Row Id (database id)</label>
                                        <input type="number" id="detailBeginRowId" class="form-control"
                                               data-i18n-title="Internal database row id, not the row number shown in the editor."
                                               title="Internal database row id, not the row number shown in the editor." />
                                    </div>
                                    <div class="detail-row">
                                        <label data-i18n="End Row Id (database id)">End Row Id (database id)</label>
                                        <input type="number" id="detailEndRowId" class="form-control"
                                               data-i18n-title="Internal database row id, not the row number shown in the editor."
                                               title="Internal database row id, not the row number shown in the editor." />
                                    </div>
                                    <div class="detail-row checkbox-row">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="detailMergeWithNext" />
                                            <span data-i18n="Merge with Next">Merge with Next</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tab-pane" id="common-settings-tab" role="tabpanel">
            <div class="common-settings-section">
                <div class="form-group mb-4">
                    <label for="bookNameInput" data-i18n="Book Name">Book Name</label>
                    <input type="text" id="bookNameInput" class="form-control" value="${y?.name||``}" />
                    <button class="btn btn-primary btn-sm mt-2" id="saveBookNameBtn" data-i18n="Save Name">Save Name</button>
                </div>
                <label class="settings-label" data-i18n="Shared Book Settings">Shared Book Settings</label>
                <div id="sharedSettingsGrid" class="grid-container settings-grid"></div>
            </div>
        </div>
        ${i}
    `,r.translateIn(t),oe(),J(),se()}function J(){let e=document.getElementById(`textsGrid`);if(!e||!b)return;let t=[{headerName:i(`Name`),field:`name`,flex:1,editable:!0},{headerName:``,field:`id`,width:50,sortable:!1,resizable:!1,cellRenderer:e=>{let t=document.createElement(`button`);return t.className=`btn-row-delete`,t.innerHTML=`<i class="fa fa-trash"></i>`,t.title=i(`Delete`),t.onclick=async t=>{if(t.stopPropagation(),!confirm(i(`Delete this text?`))||!b)return;b.bookTexts=b.bookTexts.filter(t=>t.id!==e.value),x?.setGridOption(`rowData`,b.bookTexts);let n=document.getElementById(`textDetailPanel`);n&&(n.style.display=`none`),await V()},t}}],n={theme:o,columnDefs:t,defaultColDef:{sortable:!0,resizable:!0},rowData:b.bookTexts,domLayout:`autoHeight`,rowSelection:{mode:`singleRow`,checkboxes:!1},onRowClicked:e=>{e.data&&ie(e.data)},onCellValueChanged:async()=>{await V()}};x=c(e,n),Y()}function Y(){document.getElementById(`addTextBtn`)?.addEventListener(`click`,async()=>{if(!b)return;let e={id:crypto.randomUUID(),name:`Text ${b.bookTexts.length+1}`,workId:w.length>0?w[0].id:0,data1Id:0,data2Id:0,data3Id:0,metadata1Id:0,metadata2Id:0,metadata3Id:0,useWholeText:!0,beginRowId:null,endRowId:null,mergeWithNext:!1};b.bookTexts.push(e),x?.setGridOption(`rowData`,b.bookTexts),await V()})}function ie(e){let t=document.getElementById(`textDetailPanel`);if(!t)return;t.style.display=`block`;let n=document.getElementById(`detailTextName`);n&&(n.textContent=e.name||i(`Text Settings`));let r=document.getElementById(`detailWorkId`);r&&(r.innerHTML=w.map(t=>`<option value="${t.id}" ${t.id===e.workId?`selected`:``}>${t.name}</option>`).join(``),r.onchange=()=>{e.workId=parseInt(r.value,10);let t=new Set((T.get(e.workId)||[]).map(e=>e.id));for(let n of[`data1Id`,`data2Id`,`data3Id`,`metadata1Id`,`metadata2Id`,`metadata3Id`])t.has(e[n])||(e[n]=0);X(e),V()}),X(e),ae(e)}function X(e){let t=`<option value="0" data-i18n="-- None --">-- None --</option>`+(T.get(e.workId)||[]).map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);for(let{id:n,field:i}of[{id:`detailData1Id`,field:`data1Id`},{id:`detailData2Id`,field:`data2Id`},{id:`detailData3Id`,field:`data3Id`},{id:`detailMetadata1Id`,field:`metadata1Id`},{id:`detailMetadata2Id`,field:`metadata2Id`},{id:`detailMetadata3Id`,field:`metadata3Id`}]){let a=document.getElementById(n);a&&(a.innerHTML=t,r.translateIn(a),a.value=String(e[i]||0),a.onchange=()=>{e[i]=parseInt(a.value,10),V()})}}function ae(e){let t=document.getElementById(`detailUseWholeText`);t&&(t.checked=e.useWholeText,t.onchange=()=>{e.useWholeText=t.checked,V()});let n=document.getElementById(`detailBeginRowId`);n&&(n.value=e.beginRowId===null?``:String(e.beginRowId),n.onchange=()=>{e.beginRowId=n.value?parseInt(n.value,10):null,V()});let r=document.getElementById(`detailEndRowId`);r&&(r.value=e.endRowId===null?``:String(e.endRowId),r.onchange=()=>{e.endRowId=r.value?parseInt(r.value,10):null,V()});let i=document.getElementById(`detailMergeWithNext`);i&&(i.checked=e.mergeWithNext,i.onchange=()=>{e.mergeWithNext=i.checked,V()})}function oe(){document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.getAttribute(`data-tab`);t&&B(t)})})}function se(){document.getElementById(`saveBookNameBtn`)?.addEventListener(`click`,async()=>{if(!y)return;let e=document.getElementById(`bookNameInput`)?.value?.trim();if(!e)alert(i(`Book name cannot be empty`));else if(await ee(y.id,e)){y.name=e;let t=document.querySelector(`#bookDropdown option[value="${y.id}"]`);t&&(t.textContent=e),alert(i(`Book name updated`))}else alert(i(`Failed to update book name`))}),document.getElementById(`deleteBookBtn`)?.addEventListener(`click`,async()=>{if(y&&v&&confirm(i(`Are you sure you want to delete the book "{0}"? This action cannot be undone.`,[y.name]))){if(await ne(y.id)){let e=document.querySelector(`#bookDropdown option[value="${y.id}"]`);e&&e.remove(),document.getElementById(`bookDetailSection`).style.display=`none`,document.getElementById(`deleteBookBtn`).style.display=`none`,y=null,b=null}else alert(i(`Failed to delete book`))}})}async function ce(e){[_,w,E]=await Promise.all([A(),re(),F()]),await Promise.all(w.map(async e=>{let t=await P(e.id);T.set(e.id,t)})),e.innerHTML=`
        <div class="books-page">
            <div class="card">
                <div class="card-header">
                    <div class="header-row">
                        <div class="header-col">
                            <i class="fa fa-database"></i> <span data-i18n="Books in">Books in</span>
                            <select id="seriesDropdown" class="form-control series-link" style="width: auto; display: inline-block; min-width: 200px;">
                                <option value="" data-i18n="Select a Series">Select a Series</option>
                                ${_.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
                            </select>
                            <a href="#" id="seriesExternalLink" target="_blank" style="display: none;"><i class="fa fa-external-link"></i></a>
                        </div>
                        <div class="header-col flex-grow">
                            <select id="bookDropdown" class="form-control">
                                <option value="" data-i18n="Select a Book">Select a Book</option>
                            </select>
                        </div>
                        <div class="header-col">
                            <button class="btn btn-sm btn-success" id="createBookBtn"><i class="fa fa-plus"></i>&emsp;<span data-i18n="Create Book">Create Book</span></button>
                            <button class="btn btn-sm btn-danger" id="deleteBookBtn" style="display: none;"><i class="fa fa-trash"></i>&emsp;<span data-i18n="Delete This Book">Delete This Book</span></button>
                        </div>
                    </div>
                </div>
                
                <div id="bookDetailSection" class="card-body" style="display: none;">
                    <div class="book-objects-toolbar" style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                        <button class="btn btn-sm btn-success" id="addBookObjectBtn"><i class="fa fa-plus"></i>&emsp;<span data-i18n="Add Export Format">Add Export Format</span></button>
                    </div>
                    <ul class="nav nav-tabs" id="mainTabsNav" role="tablist">
                        <!-- Tabs rendered dynamically -->
                    </ul>
                    <div class="tab-content" id="mainTabs">
                        <!-- Tab content rendered dynamically -->
                    </div>
                    
                    <!-- Show Text Tree Toggle -->
                    <div class="mt-3 text-tree-toggle-section">
                        <label class="text-tree-label" data-i18n="Show Text Tree">Show Text Tree</label>
                        <label class="toggle-switch">
                            <input type="checkbox" id="showTextTreeToggle" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div id="textTreeContainer" class="text-tree-container mt-2" style="display: none;">
                        <!-- Text tree content rendered dynamically -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Create Book Modal -->
        <div id="createBookModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="Create a Book">Create a Book</h3>
                    <button class="modal-close" id="closeModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="newBookName" data-i18n="Book Name">Book Name</label>
                        <input type="text" id="newBookName" class="form-control" data-i18n-placeholder="Enter book name" placeholder="Enter book name" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmCreateBtn" data-i18n="Create Book">Create Book</button>
                    <button class="btn btn-secondary" id="cancelCreateBtn" data-i18n="Cancel">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Add Export Format Modal -->
        <div id="addBookObjectModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="Add Export Format">Add Export Format</h3>
                    <button class="modal-close" id="closeBookObjectModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="bookObjectName" data-i18n="Name">Name</label>
                        <input type="text" id="bookObjectName" class="form-control" data-i18n-placeholder="Enter a name (e.g. Print PDF)" placeholder="Enter a name (e.g. Print PDF)" />
                    </div>
                    <div class="form-group">
                        <label for="bookObjectFormat" data-i18n="Format">Format</label>
                        <select id="bookObjectFormat" class="form-control">
                            <option value="" data-i18n="Select a Format">Select a Format</option>
                            ${I()}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmAddBookObjectBtn" data-i18n="Add">Add</button>
                    <button class="btn btn-secondary" id="cancelAddBookObjectBtn" data-i18n="Cancel">Cancel</button>
                </div>
            </div>
        </div>
    `,r.translateIn(e),Z();let t=window.location.pathname.match(/\/admin\/books\/(\d+)/),n=t?parseInt(t[1],10):0;if(n||=parseInt(localStorage.getItem(`LastSeriesId`)||`0`,10),n){let e=_.find(e=>e.id===n);e&&await W(e)}}function Z(){document.getElementById(`seriesDropdown`)?.addEventListener(`change`,async e=>{let t=parseInt(e.target.value,10);if(t){let e=_.find(e=>e.id===t);if(e){await W(e);let t=document.getElementById(`seriesExternalLink`);t&&(t.href=`${a}/admin/series`,t.style.display=`inline`)}}else document.getElementById(`bookDetailSection`).style.display=`none`,document.getElementById(`seriesExternalLink`).style.display=`none`,v=null,y=null,b=null}),document.getElementById(`bookDropdown`)?.addEventListener(`change`,async e=>{let t=parseInt(e.target.value,10);if(t&&v){let e=(await j(v.id)).find(e=>e.id===t);e&&await U(e)}else document.getElementById(`bookDetailSection`).style.display=`none`,y=null,b=null});let e=document.getElementById(`createBookModal`);document.getElementById(`createBookBtn`)?.addEventListener(`click`,()=>{v?(e&&(e.style.display=`flex`),document.getElementById(`newBookName`).value=``):alert(i(`Please select a series first`))}),document.getElementById(`closeModalBtn`)?.addEventListener(`click`,()=>{e&&(e.style.display=`none`)}),document.getElementById(`cancelCreateBtn`)?.addEventListener(`click`,()=>{e&&(e.style.display=`none`)}),document.getElementById(`confirmCreateBtn`)?.addEventListener(`click`,async()=>{if(!v)return;let t=document.getElementById(`newBookName`).value.trim();if(!t){alert(i(`Please enter a book name`));return}let n=await N(v.id,t);if(n){let t=document.getElementById(`bookDropdown`);if(t){let e=document.createElement(`option`);e.value=String(n.id),e.textContent=n.name,t.appendChild(e)}e&&(e.style.display=`none`),await U(n)}else alert(i(`Failed to create book`))}),e?.addEventListener(`click`,t=>{t.target===e&&(e.style.display=`none`)});let t=document.getElementById(`addBookObjectModal`);document.getElementById(`addBookObjectBtn`)?.addEventListener(`click`,()=>{!y||!b?alert(i(`Please select a book first`)):(t&&(t.style.display=`flex`),document.getElementById(`bookObjectName`).value=``,document.getElementById(`bookObjectFormat`).value=``)}),document.getElementById(`closeBookObjectModalBtn`)?.addEventListener(`click`,()=>{t&&(t.style.display=`none`)}),document.getElementById(`cancelAddBookObjectBtn`)?.addEventListener(`click`,()=>{t&&(t.style.display=`none`)}),document.getElementById(`confirmAddBookObjectBtn`)?.addEventListener(`click`,async()=>{if(!y||!b)return;let e=document.getElementById(`bookObjectName`).value.trim(),n=document.getElementById(`bookObjectFormat`).value;if(!e||!n){alert(i(`Please enter a name and select a format`));return}let r={id:crypto.randomUUID(),name:e,namespace:n,settings:[],layoutsSettings:[]};b.bookObjectsSettings.push(r),await V();let a=await M(y.id);a&&(b=a),await K(),await G(),t&&(t.style.display=`none`),B(`object-${r.id}`)}),t?.addEventListener(`click`,e=>{e.target===t&&(t.style.display=`none`)}),document.getElementById(`showTextTreeToggle`)?.addEventListener(`change`,async e=>{O=e.target.checked;let t=document.getElementById(`textTreeContainer`);t&&(O&&y?(t.style.display=`block`,t.innerHTML=`<div class="loading" data-i18n="Loading text tree...">Loading text tree...</div>`,r.translateIn(t),k=await R(y.id),le(t)):(t.style.display=`none`,t.innerHTML=``,k=[]))})}function le(e){if(k.length===0){e.innerHTML=`<div class="text-tree-empty" data-i18n="No texts found in this book.">No texts found in this book.</div>`,r.translateIn(e);return}let t=k.map((e,t)=>`<button class="text-tree-tab ${t===0?`active`:``}" data-work-index="${t}">${e.workCode}</button>`).join(``),n=document.createElement(`div`);n.className=`text-tree-tabs`,n.innerHTML=t;let i=document.createElement(`div`);i.className=`text-tree-content`,e.innerHTML=``,e.appendChild(n),e.appendChild(i),Q(i,k[0]),n.querySelectorAll(`.text-tree-tab`).forEach(e=>{e.addEventListener(`click`,e=>{let t=parseInt(e.target.getAttribute(`data-work-index`)||`0`,10);n.querySelectorAll(`.text-tree-tab`).forEach(e=>e.classList.remove(`active`)),e.target.classList.add(`active`),Q(i,k[t])})})}function Q(e,t){let n=new Map,i=[];for(let e of t.rows)n.set(e.number,e),(e.parentRowNumber===null||e.parentRowNumber===0)&&i.push(e);let a=e=>t.rows.filter(t=>t.parentRowNumber===e),o=(e,t=0)=>{let n=a(e.number),r=`<div class="text-tree-row ${ue(e.style)}" style="padding-left: ${t*20}px;">
            <span class="row-prev-id">${e.previousIndexId}</span>
            <span class="row-index-id">${e.indexId}</span>
            <span class="row-number">${e.number}</span>
            <span class="row-style">${e.styleName||e.style}</span>
            <span class="row-text1">${$(e.text1)}</span>
            <span class="row-text2">${$(e.text2)}</span>
        </div>`;for(let e of n)r+=o(e,t+1);return r},s=`<div class="text-tree-header">
        <span class="row-prev-id" data-i18n="Prev Id">Prev Id</span>
        <span class="row-index-id" data-i18n="Index Id">Index Id</span>
        <span class="row-number" data-i18n="Row">Row</span>
        <span class="row-style" data-i18n="Style">Style</span>
        <span class="row-text1" data-i18n="Text 1">Text 1</span>
        <span class="row-text2" data-i18n="Text 2">Text 2</span>
    </div>`;for(let e of i)s+=o(e,0);e.innerHTML=s,r.translateIn(e)}function ue(e){return e.localeCompare(`t`)>0?`text-style-text`:e.localeCompare(`j`)>0?`text-style-title`:`text-style-heading`}function $(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function de(){x?.destroy(),x=null,S?.destroy(),S=null,C.forEach(e=>e.destroy()),C.clear(),v=null,y=null,b=null,_=[],w=[],T.clear(),E=[],D.clear(),O=!1,k=[]}export{de as cleanup,ce as render};