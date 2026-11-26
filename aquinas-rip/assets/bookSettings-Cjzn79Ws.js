import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";function s(e){let{buttonContainer:n,buttonText:r=t(`Columns`),onColumnVisibilityChange:i}=e,a=null,o=!1,s=document.createElement(`button`);s.className=`btn btn-sm btn-outline-secondary column-chooser-btn`,s.innerHTML=`<i class="fa fa-columns"></i> ${r}`,s.type=`button`;let c=document.createElement(`div`);c.className=`column-chooser-dropdown`,c.style.display=`none`;let l=document.createElement(`div`);l.className=`column-chooser-wrapper`,l.appendChild(s),l.appendChild(c),n.appendChild(l);function u(){if(c.innerHTML=``,!a){let e=document.createElement(`div`);e.className=`column-chooser-message`,e.textContent=t(`No grid available`),c.appendChild(e);return}let e=a.getColumns();if(!e||e.length===0){let e=document.createElement(`div`);e.className=`column-chooser-message`,e.textContent=t(`No columns available`),c.appendChild(e);return}let n=[];if(e.forEach(e=>{let t=e.getColDef();t.field!==`id`&&t.colId!==`id`&&(t.pinned||t.lockVisible||n.push(e))}),n.length===0){let e=document.createElement(`div`);e.className=`column-chooser-message`,e.textContent=t(`No configurable columns`),c.appendChild(e);return}let r=document.createElement(`div`);r.className=`column-chooser-header`,r.textContent=t(`Show/Hide Columns`),c.appendChild(r);let o=document.createElement(`div`);o.className=`column-chooser-actions`;let s=document.createElement(`button`);s.className=`btn btn-xs btn-link`,s.textContent=t(`Show All`),s.type=`button`,s.onclick=e=>{if(e.preventDefault(),e.stopPropagation(),!a)return;let t=n.map(e=>e.getColId());a.setColumnsVisible(t,!0),setTimeout(()=>u(),50)};let l=document.createElement(`button`);l.className=`btn btn-xs btn-link`,l.textContent=t(`Hide All`),l.type=`button`,l.onclick=e=>{if(e.preventDefault(),e.stopPropagation(),!a)return;let t=n.map(e=>e.getColId());a.setColumnsVisible(t,!1),setTimeout(()=>u(),50)},o.appendChild(s),o.appendChild(l),c.appendChild(o);let d=document.createElement(`div`);d.className=`column-chooser-separator`,c.appendChild(d),n.forEach(e=>{let t=e.getColDef(),n=e.getColId(),r=t.headerName||n,o=e.isVisible(),s=document.createElement(`label`);s.className=`column-chooser-item`;let l=document.createElement(`input`);l.type=`checkbox`,l.checked=o,l.addEventListener(`change`,e=>{e.stopPropagation(),a&&(a.setColumnsVisible([n],l.checked),i&&i(n,l.checked))});let u=document.createElement(`span`);u.textContent=r,s.appendChild(l),s.appendChild(u),c.appendChild(s)})}s.addEventListener(`click`,e=>{e.stopPropagation(),o=!o,o?(u(),c.style.display=`block`):c.style.display=`none`});let d=e=>{l.contains(e.target)||(o=!1,c.style.display=`none`)};return document.addEventListener(`click`,d),{setGridApi:e=>{a=e,o&&u()},cleanup:()=>{document.removeEventListener(`click`,d),l.remove()}}}var c=`column-chooser-styles`;if(!document.getElementById(c)){let e=document.createElement(`style`);e.id=c,e.textContent=`
        .column-chooser-wrapper {
            position: relative;
            display: inline-block;
        }
        
        .column-chooser-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .column-chooser-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            z-index: 1000;
            min-width: 220px;
            max-height: 400px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            margin-top: 4px;
        }
        
        .column-chooser-header {
            padding: 8px 12px;
            font-weight: bold;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
        }
        
        .column-chooser-message {
            padding: 12px;
            color: #666;
            font-style: italic;
            text-align: center;
        }
        
        .column-chooser-actions {
            display: flex;
            gap: 8px;
            padding: 6px 12px;
            border-bottom: 1px solid #eee;
        }
        
        .column-chooser-actions .btn {
            font-size: 12px;
            padding: 2px 8px;
        }
        
        .column-chooser-separator {
            height: 1px;
            background: #eee;
            margin: 4px 0;
        }
        
        .column-chooser-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            cursor: pointer;
            user-select: none;
        }
        
        .column-chooser-item:hover {
            background: #f0f0f0;
        }
        
        .column-chooser-item input[type="checkbox"] {
            cursor: pointer;
            width: 16px;
            height: 16px;
        }
        
        .column-chooser-item span {
            flex: 1;
            font-size: 13px;
        }
    `,document.head.appendChild(e)}function l(e){return{name:e.name||e.Name||``,displayName:e.displayName||e.DisplayName||``,group:e.group||e.Group||``,typeName:e.typeName||e.TypeName||`String`,placeholder:e.placeholder||e.Placeholder||``,isReadOnly:e.isReadOnly??e.IsReadOnly??!1,isShared:e.isShared??e.IsShared??!1,hasValue:e.hasValue??e.HasValue??!1,stringValue:e.stringValue??e.StringValue??e._StringValue??null,intValue:e.intValue??e.IntValue??e._IntValue??null,booleanValue:e.booleanValue??e.BooleanValue??e._BooleanValue??null,decimalValue:e.decimalValue??e.DecimalValue??e._DecimalValue??null,doubleValue:e.doubleValue??e.DoubleValue??e._DoubleValue??null,stringOptions:e.stringOptions||e.StringOptions||null,intOptions:e.intOptions||e.IntOptions||null}}async function u(){try{let e=await fetch(`${n}/api/admin/export-series`,{credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();return(Array.isArray(t)?t:t.series||t).map(e=>({id:e.id,name:e.name,bookCount:e.bookCount??0}))}catch(e){return console.error(`Failed to fetch series:`,e),[]}}async function d(e){try{let t=await fetch(`${n}/api/admin/export-series/${e}`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return await t.json()}catch(e){return console.error(`Failed to fetch series settings:`,e),null}}async function f(e){try{let t=await fetch(`${n}/api/admin/export-series/${e}/books`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let r=await t.json();return(Array.isArray(r)?r:r.books||r).map(e=>({id:e.id,seriesId:e.seriesId,name:e.name}))}catch(e){return console.error(`Failed to fetch books:`,e),[]}}async function p(e){try{let t=await fetch(`${n}/api/admin/export-books/${e}`,{credentials:`include`});if(!t.ok)return null;let r=await t.json();return{seriesId:r.seriesId??0,bookTexts:(r.bookTexts||[]).map(e=>({id:e.id||``,name:e.name||``,workId:e.workId??0,data1Id:e.data1Id??0,data2Id:e.data2Id??0,data3Id:e.data3Id??0,metadata1Id:e.metadata1Id??0,metadata2Id:e.metadata2Id??0,metadata3Id:e.metadata3Id??0})),sharedBookSettings:{id:r.sharedBookSettings?.id||``,name:r.sharedBookSettings?.name||`Shared`,namespace:r.sharedBookSettings?.namespace||``,settings:(r.sharedBookSettings?.settings||[]).map(l)},bookObjectsSettings:(r.bookObjectsSettings||[]).map(e=>({id:e.id||``,name:e.name||``,namespace:e.namespace||``,settings:(e.settings||[]).map(l)}))}}catch(e){return console.error(`Failed to fetch book settings:`,e),null}}async function m(e){let t=await f(e);return await Promise.all(t.map(async e=>{let t=await p(e.id);return{...e,settings:t}}))}async function h(e,t,r){try{let i=await fetch(`${n}/api/admin/export-books/${e}/object-settings/${t}`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({id:t,settings:r.filter(e=>e.hasValue)})});return i.ok?(await i.json()).success===!0:(console.error(`Failed to save book object settings:`,i.status),!1)}catch(e){return console.error(`Failed to save book object settings:`,e),!1}}function g(e,t){document.querySelectorAll(`#mainTabs .tab-pane`).forEach(e=>e.classList.remove(`show`,`active`)),document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>e.classList.remove(`active`)),document.getElementById(e)?.classList.add(`show`,`active`),document.querySelector(`#mainTabsNav .nav-link[data-tab="${e}"]`)?.classList.add(`active`),t&&setTimeout(()=>t(e),50)}function _(e,t,n){let r=document.getElementById(e);r&&(r.querySelectorAll(`.sub-tabs .tab-pane`).forEach(e=>e.classList.remove(`show`,`active`)),r.querySelectorAll(`.sub-tabs-nav .nav-link`).forEach(e=>e.classList.remove(`active`)),r.querySelector(`#${t}`)?.classList.add(`show`,`active`),r.querySelector(`.sub-tabs-nav .nav-link[data-subtab="${t}"]`)?.classList.add(`active`),n&&setTimeout(()=>n(t),50))}function v(e){let t=e.defaultBookObjectsSettings||[];if(t.length===0)return{nav:``,content:`<div class="alert alert-info" data-i18n="No export objects defined for this series. Configure them on the Series page first.">No export objects defined for this series. Configure them on the Series page first.</div>`};let n=``,r=``;return t.forEach((e,t)=>{let i=`object-${e.id}`,a=t===0;n+=`
            <li class="nav-item">
                <button class="nav-link${a?` active`:``}" data-tab="${i}" type="button">
                    ${e.name} <span data-i18n="Settings">Settings</span>
                </button>
            </li>
        `,r+=`
            <div class="tab-pane${a?` show active`:``}" id="${i}" role="tabpanel">
                <ul class="nav nav-tabs sub-tabs-nav" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" data-subtab="${i}-export" type="button" data-i18n="Export Settings">Export Settings</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" data-subtab="${i}-text" type="button" data-i18n="Text Settings">Text Settings</button>
                    </li>
                    <li class="nav-item ms-auto">
                        <div id="column-chooser-${i}" class="column-chooser-container"></div>
                    </li>
                </ul>
                <div class="tab-content sub-tabs">
                    <div class="tab-pane show active" id="${i}-export" role="tabpanel">
                        <div id="grid-${i}-export" class="grid-container settings-books-grid"></div>
                    </div>
                    <div class="tab-pane" id="${i}-text" role="tabpanel">
                        <div id="grid-${i}-text" class="grid-container settings-books-grid"></div>
                    </div>
                </div>
            </div>
        `}),{nav:n,content:r}}function y(e){let t=[];for(let n of e)if(n.settings&&n.settings.bookTexts.length>0)for(let e of n.settings.bookTexts)t.push({book:{id:n.id,seriesId:n.seriesId,name:n.name},bookText:e,bookSettings:n.settings});return t}function b(e){if(!e)return``;if(!e.hasValue)return e.placeholder||``;switch(e.typeName){case`Boolean`:return e.booleanValue?t(`Yes`):t(`No`);case`Int32`:return e.intValue?.toString()??``;case`Decimal`:case`Double`:return(e.decimalValue??e.doubleValue)?.toString()??``;default:return e.stringOptions&&e.stringOptions.length>0?e.stringOptions.find(t=>t.id===e.stringValue)?.name||e.stringValue||``:e.intOptions&&e.intOptions.length>0?e.intOptions.find(t=>t.id===e.intValue)?.name||e.intValue?.toString()||``:e.stringValue||``}}function x(e){return e?!e.hasValue&&e.placeholder?{color:`#2196F3`,fontStyle:`italic`}:e.hasValue?{backgroundColor:`#f8fff8`}:{}:{}}function S(e,t,n,r){if(e.settings)return e.settings.bookObjectsSettings.find(e=>e.id===t||e.namespace===n)?.settings.find(e=>e.name===r)}function C(e,t,n,r,i,a){if(!e.settings)return;let o=e.settings.bookObjectsSettings.find(e=>e.id===t||e.namespace===n);if(!o)return;let s=o.settings.find(e=>e.name===r);if(s||(s={name:r,displayName:r,group:``,typeName:a,placeholder:``,isReadOnly:!1,isShared:!1,hasValue:!1,stringValue:null,intValue:null,booleanValue:null,decimalValue:null,doubleValue:null},o.settings.push(s)),s.stringValue=null,s.intValue=null,s.booleanValue=null,s.decimalValue=null,s.doubleValue=null,i==null||i===``)s.hasValue=!1;else switch(s.hasValue=!0,a){case`Boolean`:s.booleanValue=i===!0||i===`true`||i===`Yes`;break;case`Int32`:s.intValue=parseInt(i,10);break;case`Decimal`:case`Double`:s.decimalValue=parseFloat(i);break;default:s.stringValue=String(i)}return s}function w(e,n,r,i,a){return o=>{if(!o.data?.settings)return``;let s=o.data,c=S(s,e,n,r),l=c?.hasValue?c.booleanValue:i.booleanValue??!1,u=c?.hasValue??!1,d=document.createElement(`div`);d.className=`setting-checkbox-cell`,d.style.display=`flex`,d.style.alignItems=`center`,d.style.gap=`4px`;let f=document.createElement(`input`);if(f.type=`checkbox`,f.checked=l??!1,f.style.cursor=`pointer`,u||(d.style.opacity=`0.6`),f.addEventListener(`change`,async()=>{let t=C(s,e,n,r,f.checked,`Boolean`);t&&(await a.onSettingChange(s.id,e,t),o.api?.refreshCells({rowNodes:[o.node],force:!0}))}),d.appendChild(f),u){let i=document.createElement(`button`);i.innerHTML=`✕`,i.style.cssText=`border:none;background:transparent;cursor:pointer;color:#999;font-size:10px;padding:0 2px;`,i.title=t(`Clear value`),i.onclick=async t=>{t.stopPropagation();let i=C(s,e,n,r,null,`Boolean`);i&&(await a.onSettingChange(s.id,e,i),o.api?.refreshCells({rowNodes:[o.node],force:!0}))},d.appendChild(i)}return d}}function T(e,n,r,i,a){return o=>{if(!o.data?.settings)return``;let s=o.data,c=S(s,e,n,r),l=c?.hasValue??!1,u=document.createElement(`div`),d=document.createElement(`select`);d.style.cssText=`width:100%;border:1px solid #ccc;border-radius:3px;padding:2px;font-size:12px;`;let f=document.createElement(`option`);if(f.value=``,f.textContent=t(l?`(Clear)`:`(Default)`),d.appendChild(f),i.stringOptions){let e=c?.stringValue??``;i.stringOptions.forEach(t=>{let n=document.createElement(`option`);n.value=t.id,n.textContent=t.name,t.id===e&&(n.selected=!0),d.appendChild(n)})}else if(i.intOptions){let e=c?.intValue??null;i.intOptions.forEach(t=>{let n=document.createElement(`option`);n.value=String(t.id),n.textContent=t.name,t.id===e&&(n.selected=!0),d.appendChild(n)})}return l||(d.style.color=`#2196F3`,d.style.fontStyle=`italic`),d.addEventListener(`change`,async()=>{let t=d.value||null,c=C(s,e,n,r,t,i.typeName);c&&(await a.onSettingChange(s.id,e,c),o.api?.refreshCells({rowNodes:[o.node],force:!0}))}),u.appendChild(d),u}}function E(e,r){let i=[{field:`id`,headerName:t(`ID`),width:80,hide:!0},{field:`name`,headerName:t(`Book Name`),width:200,pinned:`left`,cellRenderer:e=>e.data?`<a href="${n}/admin/books/${e.data.seriesId}/${e.data.id}" target="_blank">${e.value}</a>`:``}],a=e.settings||[];for(let t of a){let n=t.name,a=e.id,o=e.namespace,s,c=!t.isReadOnly,l,u,d=!1;t.typeName===`Boolean`?(s=w(a,o,n,t,r),c=!1):t.stringOptions&&t.stringOptions.length>0||t.intOptions&&t.intOptions.length>0?(s=T(a,o,n,t,r),c=!1):(c=!t.isReadOnly,t.typeName!==`Int32`&&t.typeName!==`Decimal`&&t.typeName!==`Double`&&(l=`agLargeTextCellEditor`,d=!0,u={maxLength:1e5,rows:10,cols:60}));let f={headerName:t.displayName||t.name,colId:n,minWidth:100,flex:1,hide:!0,cellRenderer:s,editable:c,cellEditor:l,cellEditorParams:u,cellEditorPopup:d,valueGetter:e=>e.data?.settings?b(S(e.data,a,o,n)||t):``,valueSetter:e=>{if(!e.data?.settings)return!1;let i=C(e.data,a,o,n,e.newValue,t.typeName);return i?(r.onSettingChange(e.data.id,a,i),!0):!1},cellStyle:e=>e.data?.settings?x(S(e.data,a,o,n)):{}};i.push(f)}return i}function D(e,t){return{theme:r,columnDefs:E(e,t),defaultColDef:{sortable:!0,resizable:!0,filter:!0},rowData:void 0,domLayout:`autoHeight`,enableCellTextSelection:!0,columnMenu:`new`,rowSelection:{mode:`singleRow`,checkboxes:!1},stopEditingWhenCellsLoseFocus:!0,getRowId:e=>String(e.data.id),onColumnVisible:e=>{setTimeout(()=>e.api.sizeColumnsToFit(),50)},onFirstDataRendered:e=>{e.api.sizeColumnsToFit()}}}function O(){return[{headerName:t(`Book`),valueGetter:e=>e.data?.book.name||``,minWidth:150,maxWidth:300,pinned:`left`,suppressSizeToFit:!0,cellRenderer:e=>e.data?`<a href="${n}/admin/books/${e.data.book.seriesId}/${e.data.book.id}" target="_blank">${e.data.book.name}</a>`:``},{headerName:t(`Text`),valueGetter:e=>e.data?.bookText.name||``,minWidth:150,flex:1},{headerName:t(`Work ID`),valueGetter:e=>e.data?.bookText.workId||``,minWidth:80,flex:1,hide:!0},{headerName:t(`Language 1 ID`),valueGetter:e=>e.data?.bookText.data1Id||``,minWidth:100,flex:1,hide:!0},{headerName:t(`Metadata 1 ID`),valueGetter:e=>e.data?.bookText.metadata1Id||``,minWidth:100,flex:1,hide:!0},{headerName:t(`Language 2 ID`),valueGetter:e=>e.data?.bookText.data2Id||``,minWidth:100,flex:1,hide:!0},{headerName:t(`Metadata 2 ID`),valueGetter:e=>e.data?.bookText.metadata2Id||``,minWidth:100,flex:1,hide:!0},{headerName:t(`Language 3 ID`),valueGetter:e=>e.data?.bookText.data3Id||``,minWidth:100,flex:1,hide:!0},{headerName:t(`Metadata 3 ID`),valueGetter:e=>e.data?.bookText.metadata3Id||``,minWidth:100,flex:1,hide:!0}]}function k(){return{theme:r,columnDefs:O(),defaultColDef:{sortable:!0,resizable:!0,filter:!0},rowData:void 0,domLayout:`autoHeight`,enableCellTextSelection:!0,columnMenu:`new`,rowSelection:{mode:`singleRow`,checkboxes:!1},onColumnVisible:e=>{setTimeout(()=>e.api.sizeColumnsToFit(),50)},onFirstDataRendered:e=>{e.api.sizeColumnsToFit()}}}i.registerModules([o]);var A=[],j=null,M=null,N=[],P=new Map,F=new Map,I=new Map,L=new Map;async function R(){if(!j)return;let e=document.getElementById(`booksLoadingIndicator`);e&&(e.style.display=`flex`),N=await m(j.id),e&&(e.style.display=`none`),z()}function z(){P.forEach(e=>{e.setGridOption(`rowData`,N)});let e=y(N);F.forEach(t=>{t.setGridOption(`rowData`,e)})}async function B(e,t,n){console.log(`Saving setting ${n.name} for book ${e}, object ${t}`);let r=N.find(t=>t.id===e);if(!r?.settings)return;let i=r.settings.bookObjectsSettings.find(e=>e.id===t);i&&(await h(e,t,i.settings)||console.error(`Failed to save setting`))}function V(){if(P.forEach(e=>e.destroy()),P.clear(),F.forEach(e=>e.destroy()),F.clear(),I.forEach(e=>e.cleanup()),I.clear(),L.clear(),!M)return;let e=M.defaultBookObjectsSettings||[],n={onSettingChange:B};for(let r of e){let e=`object-${r.id}`,i=document.getElementById(`grid-${e}-export`),o=null;i&&(o=a(i,D(r,n)),P.set(r.id,o));let c=document.getElementById(`grid-${e}-text`),l=null;c&&(l=a(c,k()),F.set(r.id,l));let u=document.getElementById(`column-chooser-${e}`);if(u){let e=s({buttonContainer:u,buttonText:t(`Columns`)});I.set(r.id,e),L.set(r.id,`export`),o&&e.setGridApi(o)}}}function H(e,t){let n=document.getElementById(e);n&&n.querySelectorAll(`.sub-tabs-nav .nav-link`).forEach(n=>{n.addEventListener(`click`,n=>{let r=n.target.getAttribute(`data-subtab`);r&&_(e,r,e=>{let n=I.get(t);if(e.endsWith(`-export`)){L.set(t,`export`);let e=P.get(t);e&&(e.sizeColumnsToFit(),n&&n.setGridApi(e))}else if(e.endsWith(`-text`)){L.set(t,`text`);let e=F.get(t);e&&(e.sizeColumnsToFit(),n&&n.setGridApi(e))}})})})}async function U(e){j=e;let t=document.getElementById(`seriesDropdown`);t&&(t.value=String(e.id)),M=await d(e.id);let n=document.getElementById(`seriesDetailSection`);n&&(n.style.display=`flex`);let r=document.getElementById(`tabsContainer`);if(r&&M){let{nav:e,content:t}=v(M);r.innerHTML=`
            <ul class="nav nav-tabs" id="mainTabsNav" role="tablist">
                ${e}
            </ul>
            <div class="tab-content" id="mainTabs">
                ${t}
            </div>
        `,document.querySelectorAll(`#mainTabsNav .nav-link`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.getAttribute(`data-tab`);t&&g(t,e=>{let t=e.replace(`object-`,``),n=P.get(t);n&&n.sizeColumnsToFit()})})});let n=M.defaultBookObjectsSettings||[];for(let e of n)H(`object-${e.id}`,e.id);V()}await R(),localStorage.setItem(`LastBookSettingsSeriesId`,String(e.id))}function W(){document.getElementById(`seriesDropdown`)?.addEventListener(`change`,async e=>{let t=parseInt(e.target.value,10);if(t){let e=A.find(e=>e.id===t);e&&await U(e)}else document.getElementById(`seriesDetailSection`).style.display=`none`,j=null,M=null,N=[]})}async function G(t){A=await u();let n=A.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);t.innerHTML=`
        <div class="book-settings-page">
            <div class="card">
                <div class="card-header">
                    <div class="header-row">
                        <div class="header-col">
                            <i class="fa fa-database"></i> <span data-i18n="Publishing Series">Publishing Series</span> (<span id="seriesCount">${A.length}</span>)
                        </div>
                        <div class="header-col flex-grow">
                            <select id="seriesDropdown" class="form-control">
                                <option value="" data-i18n="Select a Series">Select a Series</option>
                                ${n}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="seriesDetailSection" class="card detail-card" style="display: none;">
                <div class="card-header">
                    <i class="fa fa-info-circle"></i>
                    <span data-i18n="Use the Columns button to show/hide setting columns. Click on a book name to open its full settings page.">Use the Columns button to show/hide setting columns. Click on a book name to open its full settings page.</span>
                </div>
                
                <div class="card-body">
                    <div id="booksLoadingIndicator" class="loading" style="display: none;" data-i18n="Loading books...">
                        Loading books...
                    </div>
                    
                    <div id="tabsContainer">
                        <!-- Tabs rendered dynamically when series is selected -->
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),W();let r=localStorage.getItem(`LastBookSettingsSeriesId`);if(r){let e=A.find(e=>e.id===parseInt(r,10));e&&await U(e)}}function K(){P.forEach(e=>e.destroy()),P.clear(),F.forEach(e=>e.destroy()),F.clear(),I.forEach(e=>e.cleanup()),I.clear(),L.clear(),j=null,M=null,N=[],A=[]}export{K as cleanup,G as render};