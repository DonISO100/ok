import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";/* empty css               */function r(e){return`$`+(typeof e==`number`&&Number.isFinite(e)?e:0).toFixed(2)}function i(e){return typeof e==`number`&&Number.isFinite(e)?String(e):``}function a(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function o(e,t){return e.role?e.enabled?e.access===`full`?t(`Claude can propose any change`):t(`Claude can propose changes to text`):t(`Not allowed to use the AI tools`):t(`Neither administrator nor editor: cannot use the AI tools`)}function s(e){return e.enabled||e.role!==``}function c(e,t){return e.ownKeyUnreadable?t(`Own key saved, but this server cannot read it`):e.hasOwnKey?e.ownKeyEnding?t(`Own key, ends in {0}`,[e.ownKeyEnding]):t(`Own key`):e.key===`org`?t(`Organisation's key`):t(`No key`)}function l(e,t){let n={};t.apiKey.trim()!==``&&(n[`Chat.ApiKey`]=t.apiKey.trim());let r=[[`Chat.MonthlyLimitUsd`,t.monthlyLimit,e.monthlyLimitUsd],[`Chat.EditorDailyLimitUsd`,t.editorDailyLimit,e.editorDailyLimitUsd],[`Chat.AdminDailyLimitUsd`,t.adminDailyLimit,e.adminDailyLimitUsd]];for(let[e,t,a]of r){let r=t.trim();r!==``&&r!==i(a)&&(n[e]=r)}return n}function u(e,t){let n={userId:e.userId},r=!1;t.removeKey?(e.hasOwnKey||e.ownKeyUnreadable)&&(n.removeKey=!0,r=!0):t.apiKey.trim()!==``&&(n.apiKey=t.apiKey.trim(),r=!0);let a=t.dailyLimit.trim();return a===``?e.ownLimitUsd!=null&&(n.removeLimit=!0,r=!0):a!==i(e.ownLimitUsd)&&(n.dailyLimitUsd=a,r=!0),r?n:null}var d=null,f=null,p=null;function m(e,t,n=`info`){let r=document.getElementById(e);r&&(r.textContent=t,r.className=`st-status st-status-${n}`)}function h(e){return document.getElementById(e)?.value??``}async function g(e,t){let r=await fetch(`${n}${e}`,{method:t===void 0?`GET`:`POST`,credentials:`include`,headers:t===void 0?void 0:{"Content-Type":`application/json`},body:t===void 0?void 0:JSON.stringify(t)}),i=await r.json().catch(()=>null);if(!r.ok||!i?.success)throw Error(i?.message||`HTTP ${r.status}`);return i}var _=()=>g(`/api/admin/ai-usage`);function v(e){let n=e.org,o=n.keySet?n.keyEnding?t(`Set. It ends in {0}.`,[n.keyEnding]):t(`Set.`):t(`Not set. People without a key of their own cannot use the chat.`),s=n.spentThisMonthUsd==null?``:`<p class="st-spending">${a(t(`Spent this month on the organisation's key:`))} <strong>${r(n.spentThisMonthUsd)}</strong> ${a(t(`of {0}.`,[r(n.monthlyLimitUsd)]))} ${a(t(`Today: {0}.`,[r(n.spentTodayUsd)]))} ${a(t(`On people's own keys this month: {0}.`,[r(n.ownKeysThisMonthUsd)]))}</p>`,c=(e,t,n,r)=>`
        <div class="st-row">
            <label class="st-label" for="${e}">${a(t)}</label>
            <div class="st-field">
                <input id="${e}" class="st-input st-short" type="text" inputmode="decimal" value="${a(i(r))}">
                <div class="st-help">${a(n)}</div>
            </div>
        </div>`;return`
        <section class="st-card">
            <div class="card-header">
                <span class="card-title">${a(t(`Organisation`))}</span>
                <span class="st-scope">${a(t(`All sites`))}</span>
            </div>
            <div class="card-body">
                <p class="st-note">${a(t(`The key and the limits everyone shares. The model is {0}; change it on the Settings page.`,[n.model]))}</p>
                ${s}
                <form id="au-org-form" autocomplete="off">
                    <div class="st-row">
                        <label class="st-label" for="au-org-key">${a(t(`Default API key`))}</label>
                        <div class="st-field">
                            <div class="st-secret-state">${a(o)}</div>
                            <input id="au-org-key" class="st-input" type="password" autocomplete="new-password" value="" placeholder="${a(n.keySet?t(`Enter a new key to replace it`):t(`Enter a key`))}">
                            <div class="st-help">${a(t(`The Anthropic key for everyone who has no key of their own. The server stores it encrypted and never shows it again.`))}</div>
                        </div>
                    </div>
                    ${c(`au-org-month`,t(`Limit for the organisation, per month (US dollars)`),t(`The most everyone together may spend on the organisation's key in a calendar month (UTC). Spending on a person's own key does not count.`),n.monthlyLimitUsd)}
                    ${c(`au-org-editor`,t(`Limit for one editor, per day (US dollars)`),t(`Applies to every editor who has no limit of their own. The day starts at midnight UTC.`),n.editorDailyLimitUsd)}
                    ${c(`au-org-admin`,t(`Limit for one administrator, per day (US dollars)`),t(`Applies to every administrator who has no limit of their own.`),n.adminDailyLimitUsd)}
                    <div class="st-actions">
                        <button type="submit" class="btn-primary" id="au-org-save">${a(t(`Save`))}</button>
                        <span id="au-org-status" class="st-status st-status-info"></span>
                    </div>
                </form>
            </div>
        </section>`}function y(e){return e.dailyLimitUsd==null?`—`:`${r(e.dailyLimitUsd)} <span class="au-dim">${a(e.ownLimitUsd==null?t(`for their role`):t(`own`))}</span>`}function b(e){let n=a(e.userId),l=`
        <tr data-user="${n}" class="${e.enabled?``:`au-off`}">
            <td class="au-switch"><input type="checkbox" class="au-enabled" data-user="${n}" ${e.enabled?`checked`:``} ${s(e)?``:`disabled`} title="${a(t(`May use the AI tools`))}" aria-label="${a(t(`May use the AI tools`))}"></td>
            <td><div>${a(e.name||e.email||``)}</div><div class="au-dim">${a(e.email)}</div></td>
            <td>${a(e.role||`—`)}<div class="au-dim">${a(o(e,t))}</div></td>
            <td class="${e.key===`none`||e.ownKeyUnreadable?`au-warn`:``}">${a(c(e,t))}</td>
            <td class="au-num">${r(e.todayUsd)}</td>
            <td class="au-num">${r(e.monthUsd)}${e.monthOwnKeyUsd>0?`<div class="au-dim">${a(t(`{0} on own key`,[r(e.monthOwnKeyUsd)]))}</div>`:``}</td>
            <td class="au-num">${e.monthRequests.toLocaleString()}</td>
            <td class="au-num">${y(e)}</td>
            <td><button type="button" class="st-link au-edit" data-user="${n}">${a(p===e.userId?t(`Close`):t(`Change`))}</button></td>
        </tr>`;return p===e.userId?l+`
        <tr class="au-edit-row" data-user="${n}">
            <td colspan="9">
                <form class="au-user-form" data-user="${n}" autocomplete="off">
                    <div class="st-row">
                        <label class="st-label" for="au-user-key">${a(t(`Own API key`))}</label>
                        <div class="st-field">
                            <input id="au-user-key" class="st-input" type="password" autocomplete="new-password" value="" placeholder="${a(e.hasOwnKey?t(`Enter a new key to replace it`):t(`Enter a key`))}">
                            <div class="st-help">${a(t(`With a key of their own, this person's questions run on that key and do not count against the organisation's monthly limit. Their daily limit still applies. The person can also enter their key themselves, in the chat panel.`))}</div>
                            ${e.hasOwnKey||e.ownKeyUnreadable?`<label class="au-remove"><input type="checkbox" id="au-user-remove-key"> ${a(t(`Remove this person's own key, so they use the organisation's key`))}</label>`:``}
                        </div>
                    </div>
                    <div class="st-row">
                        <label class="st-label" for="au-user-limit">${a(t(`Own limit per day (US dollars)`))}</label>
                        <div class="st-field">
                            <input id="au-user-limit" class="st-input st-short" type="text" inputmode="decimal" value="${a(i(e.ownLimitUsd))}">
                            <div class="st-help">${a(t(`Leave this empty to use the limit for their role.`))}</div>
                        </div>
                    </div>
                    <div class="st-actions">
                        <button type="submit" class="btn-primary">${a(t(`Save`))}</button>
                        <span id="au-user-status" class="st-status st-status-info"></span>
                    </div>
                </form>
            </td>
        </tr>`:l}function x(e){let n=e.users.length===0?`<tr><td colspan="9" class="au-dim">${a(t(`There are no administrators or editors.`))}</td></tr>`:e.users.map(b).join(``);return`
        <section class="st-card">
            <div class="card-header">
                <span class="card-title">${a(t(`People`))}</span>
                <span class="st-scope">${a(t(`Administrators and editors`))}</span>
            </div>
            <div class="card-body">
                <p class="st-note">${a(t(`Tick the box in front of a person to let them use the AI tools. Nobody may use them until an administrator ticks their box, administrators included. Amounts count all sites together; days and months are UTC.`))}</p>
                <div id="au-people-status" class="st-status st-status-info"></div>
                <div class="au-scroll">
                    <table class="au-table">
                        <thead>
                            <tr>
                                <th>${a(t(`AI tools`))}</th>
                                <th>${a(t(`Person`))}</th>
                                <th>${a(t(`Role`))}</th>
                                <th>${a(t(`Key`))}</th>
                                <th class="au-num">${a(t(`Today`))}</th>
                                <th class="au-num">${a(t(`This month`))}</th>
                                <th class="au-num">${a(t(`Requests this month`))}</th>
                                <th class="au-num">${a(t(`Limit per day`))}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>${n}</tbody>
                    </table>
                </div>
            </div>
        </section>`}function S(n){if(!f)return;let r=[];n.usageError&&r.push(n.usageError),n.keysError&&r.push(n.keysError),n.sharedSignIn||r.push(t(`This server does not share its keys with other sites (appSettings:SharedKeyRing is not set). A key saved here works on this site only.`)),f.innerHTML=`
        <div class="st-page au-page">
            <p class="st-intro">${a(t(`Who may use the AI tools (the Claude chat), which key each person runs on, and what each has spent.`))}</p>
            ${r.map(e=>`<p class="st-banner">${a(e)}</p>`).join(``)}
            ${v(n)}
            ${x(n)}
        </div>
    `,e.translateIn(f),E()}async function C(e){if(e.preventDefault(),!d)return;let n=l(d.org,{apiKey:h(`au-org-key`),monthlyLimit:h(`au-org-month`),editorDailyLimit:h(`au-org-editor`),adminDailyLimit:h(`au-org-admin`)});if(Object.keys(n).length===0)m(`au-org-status`,t(`Nothing to save.`));else{m(`au-org-status`,t(`Saving…`));try{await g(`/api/admin/settings`,{values:n}),d=await _(),S(d),m(`au-org-status`,t(`Saved.`),`success`)}catch(e){m(`au-org-status`,e instanceof Error?e.message:String(e),`error`)}}}async function w(e,n){e.preventDefault();let r=d?.users.find(e=>e.userId===n);if(!r)return;let i=u(r,{apiKey:h(`au-user-key`),removeKey:document.getElementById(`au-user-remove-key`)?.checked??!1,dailyLimit:h(`au-user-limit`)});if(!i)m(`au-user-status`,t(`Nothing to save.`));else{m(`au-user-status`,t(`Saving…`));try{d=await g(`/api/admin/ai-usage/user`,i),p=null,S(d)}catch(e){m(`au-user-status`,e instanceof Error?e.message:String(e),`error`)}}}async function T(e){let n=e.dataset.user??``,r=e.checked;e.disabled=!0;try{d=await g(`/api/admin/ai-usage/user`,{userId:n,enabled:r}),S(d);let e=d.users.find(e=>e.userId===n),i=e?.name||e?.email||``;m(`au-people-status`,t(r?`{0} may now use the AI tools.`:`{0} may no longer use the AI tools.`,[i]),`success`)}catch(t){e.checked=!r,e.disabled=!1,m(`au-people-status`,t instanceof Error?t.message:String(t),`error`)}}function E(){document.getElementById(`au-org-form`)?.addEventListener(`submit`,e=>void C(e)),document.querySelectorAll(`.au-enabled`).forEach(e=>{e.addEventListener(`change`,()=>void T(e))}),document.querySelectorAll(`.au-edit`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.user??``;p=p===t?null:t,d&&S(d)})}),document.querySelectorAll(`.au-user-form`).forEach(e=>{e.addEventListener(`submit`,t=>void w(t,e.dataset.user??``))})}async function D(e){f=e,p=null,e.innerHTML=`<div class="st-page"><p class="st-intro">${a(t(`Loading…`))}</p></div>`;try{d=await _(),S(d)}catch(n){console.error(`Failed to load AI usage:`,n),e.innerHTML=`<div class="st-page"><p class="st-banner">${a(t(`The page could not be loaded. Reload it to try again.`))}</p></div>`}}function O(){d=null,f=null,p=null}export{O as cleanup,D as render};