const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./works-B4UD10PV.js","./i18n-fj3F4Jw9.js","./main.esm-vKLlLbDv.js","./EditDialog-cJb7hPwJ.js","./EditDialog-ChULzfS5.css","./works-DCdlK4dl.css","./workDetail-XZFrQWj-.js","./workDetail-Drhp_8-A.css","./series-De-BCPfR.js","./SettingsGrid-B84ehmak.js","./SettingsGrid-BRFgWqbR.css","./series-B-btHB8g.css","./bookSettings-Cjzn79Ws.js","./bookSettings-CM5Y7-ye.css","./books-DwqXGBDJ.js","./HubConnectionBuilder-CFo-bU28.js","./books-C2nHNWgO.css","./users-CsWEVSVT.js","./users-DiVJDWvA.css","./userDetail-DkR7gLqc.js","./authors-BZkOCpi_.js","./userDetail-CMyy1iHr.css","./publicUsage-B3Ik-l1k.js","./styles-CHRfZjUL.css","./userUsage-oxt9-c2_.js","./searches-CHiESB4u.js","./sessions-CK38e6Hh.js","./guestEdits-MDEMeabE.js","./stats-B1aGIv7H.js","./visitor-DxaYgE8n.js","./styles-BKGgJDUx.js","./styles-DSOfXHme.css","./visitors-Deyz3gQI.js","./tabs-C-tNlu9E.js","./live-DVJymOdY.js","./dataSync-CyxpoCde.js","./maintenanceProgress-BnSSLFBU.js","./maintenanceProgress-CwJHWPOo.css","./diff-match-patch-DV1_YRJN.js","./dataSync-BeDesHe6.css","./backupRestore-CtJIkAuN.js","./backupRestore-XoCSAmxL.css","./settings-CGRKLety.js","./styles-B5Da82Fa.css","./aiUsage-BuzLgChO.js","./aiUsage-DC0BCbjE.css","./tools-Dfo2H2s8.js","./tools-BDwqvnjh.css","./archive-6I1LZgmm.js","./archive-BLRY8fdC.css","./resources-D8ibqZYU.js","./resources-Bvi6Xrh5.css"])))=>i.map(i=>d[i]);
import{a as e}from"./HubConnectionBuilder-CFo-bU28.js";import{c as t,h as n,i as r,l as i,p as a,t as o,u as s}from"./i18n-fj3F4Jw9.js";import{n as c}from"./authors-BZkOCpi_.js";var l=`data-editio-hub`;function u(){return document.documentElement.hasAttribute(l)?`general`:a?`author`:`all`}var d=new Set([`ai-usage`]),ee=new Set([`home`,`users`,`user`,`settings`,`backup-restore`]);function f(e,t=u()){return t===`all`||ee.has(e)?!0:t===`general`?d.has(e):!d.has(e)}function p(e,t=u()){return f(g(e),t)?`here`:t===`author`?`general`:`home`}function m(e,t=u()){return t===`general`?![`reads`,`edits`,`guestEdits`].includes(e):t!==`author`||e!==`actions`}function h(e,t=u()){return t===`all`||e===`all`==(t===`general`)}function te(e,t=u()){return t===`all`||e===`Identity`==(t===`general`)}function g(e){return e.split(`/`)[0]||`home`}function _(){let e=a.replace(/^\//,``);return c.find(t=>t.slug===e)??null}function v(e=``){return e?`/admin/${e}`:`/admin`}function y(e,t=``){return t?`/${e}/admin/${t}`:`/${e}/admin`}function b(){return n().replace(/^\/admin\/?/,``)||`home`}function x(e){let t=e.match(/^work\/(\d+)$/);return t?parseInt(t[1],10):null}function S(e){let t=e.match(/^user\/(.+)$/);return t?t[1]:null}function C(e){return e.match(/^books(?:\/(\d+)(?:\/(\d+))?)?$/)!==null}function w(e){return e===`data-sync`}function T(e){return e===`backup-restore`}function E(e){let t=e.match(/^stats(?:\/(.+))?$/);return t?t[1]||`dashboard`:null}function ne(e){let t=e.match(/^activity(?:\/(visitors|works|visitor\/(.+)))?$/);return t?t[2]===void 0?{page:t[1]||`live`}:{page:`visitor`,key:decodeURIComponent(t[2])}:null}var re=`<template id="admin-header-template">
    <header class="admin-header">
        <div class="admin-header-left">
            <h1><a href="/admin" class="admin-title-link" data-i18n="Admin">Admin</a></h1>
            <!-- The pages in groups, so the menu stays short. header.ts drops the pages this admin does
                 not have, shows a group of one page as that page, and shows a short menu without groups. -->
            <nav class="admin-menu">
                <div class="admin-dropdown" data-group="texts">
                    <button type="button" class="admin-dropdown-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="Texts">Texts</span><span class="admin-caret" aria-hidden="true">▾</span></button>
                    <div class="admin-dropdown-content">
                        <a href="/admin/works" class="admin-menu-link" data-page="works" data-i18n="Works">Works</a>
                        <a href="/admin/resources" class="admin-menu-link" data-page="resources" data-i18n="Resources">Resources</a>
                        <a href="/admin/tools" class="admin-menu-link" data-page="tools" data-i18n="Tools">Tools</a>
                    </div>
                </div>
                <div class="admin-dropdown" data-group="people">
                    <button type="button" class="admin-dropdown-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="People">People</span><span class="admin-caret" aria-hidden="true">▾</span></button>
                    <div class="admin-dropdown-content">
                        <a href="/admin/users" class="admin-menu-link" data-page="users" data-i18n="Users">Users</a>
                        <a href="/admin/ai-usage" class="admin-menu-link admin-restricted" data-page="ai-usage" data-i18n="AI usage">AI usage</a>
                    </div>
                </div>
                <div class="admin-dropdown" data-group="books">
                    <button type="button" class="admin-dropdown-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="Books">Books</span><span class="admin-caret" aria-hidden="true">▾</span></button>
                    <div class="admin-dropdown-content">
                        <a href="/admin/series" class="admin-menu-link" data-page="series" data-i18n="Series">Series</a>
                        <a href="/admin/book-settings" class="admin-menu-link" data-page="book-settings" data-i18n="Book Settings">Book Settings</a>
                        <a href="/admin/books" class="admin-menu-link" data-page="books" data-i18n="Books">Books</a>
                    </div>
                </div>
                <div class="admin-dropdown" data-group="usage">
                    <button type="button" class="admin-dropdown-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="Usage">Usage</span><span class="admin-caret" aria-hidden="true">▾</span></button>
                    <div class="admin-dropdown-content">
                        <a href="/admin/stats" class="admin-menu-link" data-page="stats" data-i18n="Stats">Stats</a>
                        <a href="/admin/activity" class="admin-menu-link" data-page="activity" data-i18n="Activity">Activity</a>
                    </div>
                </div>
                <div class="admin-dropdown" data-group="maintenance">
                    <button type="button" class="admin-dropdown-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="Maintenance">Maintenance</span><span class="admin-caret" aria-hidden="true">▾</span></button>
                    <div class="admin-dropdown-content">
                        <a href="/admin/backup-restore" class="admin-menu-link admin-restricted" data-page="backup-restore" data-i18n="Backup &amp; Restore">Backup &amp; Restore</a>
                        <a href="/admin/settings" class="admin-menu-link admin-restricted" data-page="settings" data-i18n="Settings">Settings</a>
                        <a href="/admin/archive" class="admin-menu-link" data-page="archive" data-i18n="Archive">Archive</a>
                        <a href="/admin/data-sync" class="admin-menu-link admin-restricted" data-page="data-sync" data-i18n="Data Sync">Data Sync</a>
                    </div>
                </div>
            </nav>
        </div>
        <nav class="admin-nav">
            <select id="adminLangSelect" class="admin-lang-select" title="Language" data-i18n-title="Language" aria-label="Language"></select>
            <a href="/" target="_blank" rel="noopener"><span data-i18n="Go to Editor">Go to Editor</span> <span class="external-icon">↗</span></a>
        </nav>
    </header>
</template>`.replace(/(href|src)="\//g,`$1="${a}/`),D=document.createElement(`div`);D.innerHTML=re;var ie=D.querySelector(`#admin-header-template`);function O(e){let t=document.createElement(`span`);return t.textContent=e,t.innerHTML}function k(){let e=u(),t=document.createElement(`div`);return t.innerHTML=ie.innerHTML,t.querySelectorAll(`.admin-menu-link`).forEach(t=>{f(t.dataset.page??``,e)||t.remove()}),P(t),j(t),N(t),t.innerHTML}var A=5;function j(e){let t=e.querySelector(`.admin-menu`);if(!t)return;let n=t.querySelectorAll(`.admin-menu-link`).length<=A;t.querySelectorAll(`.admin-dropdown`).forEach(e=>{let t=Array.from(e.querySelectorAll(`.admin-menu-link`));n||t.length<=1?e.replaceWith(...t):t.every(e=>e.classList.contains(`admin-restricted`))&&e.classList.add(`admin-restricted`)})}var M={work:`works`,user:`users`};function N(e){let t=g(b()),n=e.querySelector(`.admin-menu-link[data-page="${M[t]??t}"]`);n&&(n.classList.add(`active`),n.closest(`.admin-dropdown`)?.querySelector(`.admin-dropdown-btn`)?.classList.add(`active`))}function P(e){let t=u();if(t===`all`)return;let n=e.querySelector(`.admin-title-link`),r=e.querySelector(`.admin-nav`),a=r?.querySelector(`a`)??null;if(t===`general`){n&&(n.textContent=`Editio admin`,n.setAttribute(`data-i18n`,`Editio admin`)),a?.remove();let e=document.createElement(`span`);e.className=`admin-sites`,e.innerHTML=c.map(e=>`<a href="${y(e.slug)}" class="admin-site-link" title="${O(i(`The admin of this author site`))}">${O(i(e.name))}</a>`).join(``)+`<a href="/" class="admin-site-link" data-i18n="Editio home">Editio home</a>`,r?.appendChild(e)}else{let t=_();n&&(n.removeAttribute(`data-i18n`),n.textContent=t?i(`Admin: {0}`,[i(t.name)]):i(`Admin`));let o=e.querySelector(`.admin-menu-link[data-page="users"]`);o&&(o.textContent=`Permissions`,o.setAttribute(`data-i18n`,`Permissions`));let s=document.createElement(`a`);s.href=v(),s.className=`admin-site-link`,s.setAttribute(`data-i18n`,`Editio admin`),s.title=i(`People, roles, the AI tools and the settings all sites share`),s.textContent=`Editio admin`,r?.insertBefore(s,a)}}var F=!1;function I(){document.querySelectorAll(`.admin-dropdown.open`).forEach(e=>{e.classList.remove(`open`),e.querySelector(`.admin-dropdown-btn`)?.setAttribute(`aria-expanded`,`false`)})}function L(e){document.querySelectorAll(`.admin-dropdown-content a, .admin-title-link, .admin-menu-link, .feature-link`).forEach(t=>{t.addEventListener(`click`,t=>{t.preventDefault();let n=t.currentTarget.getAttribute(`href`);n&&(history.pushState(null,``,n),e())})}),document.querySelectorAll(`.admin-dropdown-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.closest(`.admin-dropdown`),r=n?.classList.contains(`open`)??!1;I(),n&&!r&&(n.classList.add(`open`),e.setAttribute(`aria-expanded`,`true`))})}),F||(F=!0,document.addEventListener(`click`,I)),H(),R(),r.translateIn(document.body)}function R(){let e=document.getElementById(`adminLangSelect`);if(e){e.innerHTML=``;for(let t of o){let n=document.createElement(`option`);n.value=t.code,n.textContent=t.name,t.code===r.language&&(n.selected=!0),e.appendChild(n)}e.addEventListener(`change`,()=>{t(e.value),window.location.reload()})}}var z=null;function B(){return z||=fetch(`${a}/api/user/session`,{credentials:`include`}).then(e=>e.ok?e.json():null).then(e=>e&&e.success&&e.user?e.user.role??null:null).catch(()=>null),z}async function V(){return(await B()??``).toLowerCase()===`admin`}async function H(){await V()&&document.querySelectorAll(`.admin-restricted`).forEach(e=>e.classList.remove(`admin-restricted`))}var U=null;function W(e){U=e}function G(){U&&=(U(),null)}function K(e,t,n=!1){return`<li${n?` class="admin-restricted"`:``}><a href="${a}/admin/${e}" class="feature-link" data-i18n="${t}">${t}</a></li>`}function q(e){let t=document.createElement(`span`);return t.textContent=e,t.innerHTML}function J(){return`
        <h2 data-i18n="Editio admin">Editio admin</h2>
        <p data-i18n="What applies to every author site: people and their roles, the AI tools, and the settings all sites share.">What applies to every author site: people and their roles, the AI tools, and the settings all sites share.</p>
        <div id="adminSignInNotice"></div>
        <ul class="admin-features">
            ${K(`users`,`Users`)}
            ${K(`ai-usage`,`AI usage`,!0)}
            ${K(`settings`,`Settings`,!0)}
            ${K(`backup-restore`,`Backup & Restore`,!0).replace(`>Backup & Restore<`,`>Backup &amp; Restore<`)}
        </ul>
        <h3 class="admin-home-subhead" data-i18n="Author sites">Author sites</h3>
        <p data-i18n="Works, books, tools, statistics and permissions on columns belong to one author site. Open that site's admin.">Works, books, tools, statistics and permissions on columns belong to one author site. Open that site's admin.</p>
        <ul class="admin-features">
            ${c.map(e=>`<li><a href="${y(e.slug)}" class="site-link">${q(i(e.name))}</a></li>`).join(``)}
        </ul>
    `}function ae(){let e=_();return`
        <h2>${q(e?i(`Admin: {0}`,[i(e.name)]):i(`Administration Panel`))}</h2>
        <p data-i18n="This site's works, books, tools and statistics, and people's permissions on its columns.">This site's works, books, tools and statistics, and people's permissions on its columns.</p>
        <ul class="admin-features">
            ${K(`works`,`Works`)}
            ${K(`users`,`Permissions`)}
            ${K(`tools`,`Tools`)}
            ${K(`stats`,`Stats`)}
            ${K(`series`,`Series`)}
            ${K(`book-settings`,`Book Settings`)}
            ${K(`books`,`Books`)}
            ${K(`resources`,`Resources`)}
            ${K(`archive`,`Archive`)}
            ${K(`backup-restore`,`Backup & Restore`,!0).replace(`>Backup & Restore<`,`>Backup &amp; Restore<`)}
            ${K(`settings`,`Settings`,!0)}
        </ul>
        <p class="admin-home-other"><span data-i18n="People and their roles, the AI tools and the settings all sites share are in the">People and their roles, the AI tools and the settings all sites share are in the</span>
            <a href="${v()}" class="site-link" data-i18n="Editio admin">Editio admin</a>.</p>
    `}function oe(){return`
        <h2 data-i18n="Administration Panel">Administration Panel</h2>
        <p data-i18n="Select a menu item above to get started.">Select a menu item above to get started.</p>
        <ul class="admin-features">
            ${K(`works`,`Works`)}
            ${K(`users`,`Users`)}
            ${K(`tools`,`Tools`)}
            ${K(`stats`,`Stats`)}
            ${K(`series`,`Series`)}
            ${K(`book-settings`,`Book Settings`)}
            ${K(`books`,`Books`)}
            ${K(`resources`,`Resources`)}
            ${K(`archive`,`Archive`)}
            ${K(`backup-restore`,`Backup & Restore`,!0).replace(`>Backup & Restore<`,`>Backup &amp; Restore<`)}
            ${K(`settings`,`Settings`,!0)}
            ${K(`ai-usage`,`AI usage`,!0)}
        </ul>
    `}function Y(e,t){let n=u();e.innerHTML=`
        <div class="admin-container admin-page-home">
            ${k()}
            <main class="admin-content">
                <div class="admin-placeholder">
                    ${n===`general`?J():n===`author`?ae():oe()}
                </div>
            </main>
        </div>
    `,r.translateIn(e),L(t),n===`general`&&se()}async function se(){if(await V())return;let e=document.getElementById(`adminSignInNotice`);e&&(e.innerHTML=`<p class="admin-signin-notice"><span data-i18n="Sign in as an administrator to use the Editio admin.">Sign in as an administrator to use the Editio admin.</span>
        <a href="${a}/user/login?returnUrl=${encodeURIComponent(v())}" class="site-link" data-i18n="Sign in">Sign in</a></p>`,r.translateIn(e))}async function ce(e,t){e.innerHTML=`
        <div class="admin-container admin-page-works">
            ${k()}
            <main class="admin-content full-width">
                <div id="works-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./works-B4UD10PV.js`),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),r=document.getElementById(`works-container`);r&&(await n.render(r),W(n.cleanup))}async function le(e,t,n){e.innerHTML=`
        <div class="admin-container admin-page-works">
            ${k()}
            <main class="admin-content full-width">
                <div id="work-detail-container"></div>
            </main>
        </div>
    `,L(n);let r=await s(()=>import(`./workDetail-XZFrQWj-.js`),__vite__mapDeps([6,1,2,3,4,7]),import.meta.url),i=document.getElementById(`work-detail-container`);i&&(await r.render(i,t),W(r.cleanup))}async function ue(e,t){e.innerHTML=`
        <div class="admin-container admin-page-series">
            ${k()}
            <main class="admin-content full-width">
                <div id="series-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./series-De-BCPfR.js`),__vite__mapDeps([8,1,2,9,10,3,4,11]),import.meta.url),r=document.getElementById(`series-container`);r&&(await n.render(r),W(n.cleanup))}async function de(e,t){e.innerHTML=`
        <div class="admin-container admin-page-book-settings">
            ${k()}
            <main class="admin-content full-width">
                <div id="book-settings-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./bookSettings-Cjzn79Ws.js`),__vite__mapDeps([12,1,2,13]),import.meta.url),r=document.getElementById(`book-settings-container`);r&&(await n.render(r),W(n.cleanup))}async function fe(e,t){e.innerHTML=`
        <div class="admin-container admin-page-books">
            ${k()}
            <main class="admin-content full-width">
                <div id="books-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./books-DwqXGBDJ.js`),__vite__mapDeps([14,15,1,2,9,10,16]),import.meta.url),r=document.getElementById(`books-container`);r&&(await n.render(r),W(n.cleanup))}async function pe(e,t){e.innerHTML=`
        <div class="admin-container admin-page-users">
            ${k()}
            <main class="admin-content full-width">
                <div id="users-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./users-CsWEVSVT.js`),__vite__mapDeps([17,1,2,3,4,18]),import.meta.url),r=document.getElementById(`users-container`);r&&(await n.render(r),W(n.cleanup))}async function me(e,t,n){e.innerHTML=`
        <div class="admin-container admin-page-users">
            ${k()}
            <main class="admin-content full-width">
                <div id="user-detail-container"></div>
            </main>
        </div>
    `,L(n);let r=await s(()=>import(`./userDetail-DkR7gLqc.js`),__vite__mapDeps([19,1,20,2,21]),import.meta.url),i=document.getElementById(`user-detail-container`);i&&(await r.render(i,t),W(r.cleanup))}async function he(e,t,n){e.innerHTML=`
        <div class="admin-container admin-page-stats">
            ${k()}
            <main class="admin-content full-width">
                <div id="stats-container"></div>
            </main>
        </div>
    `,L(n);let r=document.getElementById(`stats-container`);if(r)switch(t){case`public-usage`:{let e=await s(()=>import(`./publicUsage-B3Ik-l1k.js`),__vite__mapDeps([22,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}case`user-usage`:{let e=await s(()=>import(`./userUsage-oxt9-c2_.js`),__vite__mapDeps([24,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}case`searches`:{let e=await s(()=>import(`./searches-CHiESB4u.js`),__vite__mapDeps([25,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}case`sessions`:{let e=await s(()=>import(`./sessions-CK38e6Hh.js`),__vite__mapDeps([26,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}case`guest-edits`:{let e=await s(()=>import(`./guestEdits-MDEMeabE.js`),__vite__mapDeps([27,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}default:{let e=await s(()=>import(`./stats-B1aGIv7H.js`),__vite__mapDeps([28,1,2,23]),import.meta.url);await e.render(r),W(e.cleanup);break}}}async function ge(e,t,n,r){e.innerHTML=`
        <div class="admin-container admin-page-activity">
            ${k()}
            <main class="admin-content full-width">
                <div id="activity-container"></div>
            </main>
        </div>
    `,L(r);let i=document.getElementById(`activity-container`);if(i)switch(t){case`visitor`:{let e=await s(()=>import(`./visitor-DxaYgE8n.js`),__vite__mapDeps([29,1,2,30,31]),import.meta.url);await e.render(i,n||``),W(e.cleanup);break}case`visitors`:case`works`:{let e=await s(()=>import(`./visitors-Deyz3gQI.js`),__vite__mapDeps([32,1,2,30,31,33]),import.meta.url);await e.render(i,t),W(e.cleanup);break}default:{let e=await s(()=>import(`./live-DVJymOdY.js`),__vite__mapDeps([34,1,2,30,31,33]),import.meta.url);await e.render(i),W(e.cleanup);break}}}async function X(e,t){e.innerHTML=`
        <div class="admin-container admin-page-data-sync">
            ${k()}
            <main class="admin-content full-width">
                <div id="data-sync-container"></div>
            </main>
        </div>
    `,L(t);let n=document.getElementById(`data-sync-container`);if(!n)return;if(!await V()){n.innerHTML=Z(`Data Sync`),r.translateIn(n);return}let i=await s(()=>import(`./dataSync-CyxpoCde.js`),__vite__mapDeps([35,15,1,2,36,37,38,39]),import.meta.url);await i.render(n),W(i.cleanup)}function Z(e){return`
        <div class="admin-placeholder admin-access-denied">
            <h2 data-i18n="Access restricted">Access restricted</h2>
            <p>${i(`{0} is available only to administrators (the Admin role).`,[e])}</p>
            <p data-i18n="If you believe you should have access, contact your administrator.">If you believe you should have access, contact your administrator.</p>
        </div>
    `}async function _e(e,t){e.innerHTML=`
        <div class="admin-container admin-page-backup-restore">
            ${k()}
            <main class="admin-content full-width">
                <div id="backup-restore-container"></div>
            </main>
        </div>
    `,L(t);let n=document.getElementById(`backup-restore-container`);if(!n)return;if(!await V()){n.innerHTML=Z(`Backup &amp; Restore`),r.translateIn(n);return}let i=await s(()=>import(`./backupRestore-CtJIkAuN.js`),__vite__mapDeps([40,1,36,15,37,41]),import.meta.url);await i.render(n),W(i.cleanup)}async function ve(e,t){e.innerHTML=`
        <div class="admin-container admin-page-settings">
            ${k()}
            <main class="admin-content full-width">
                <div id="settings-container"></div>
            </main>
        </div>
    `,L(t);let n=document.getElementById(`settings-container`);if(!n)return;if(!await V()){n.innerHTML=Z(`Settings`),r.translateIn(n);return}let i=await s(()=>import(`./settings-CGRKLety.js`),__vite__mapDeps([42,1,43]),import.meta.url);await i.render(n),W(i.cleanup)}async function ye(e,t){e.innerHTML=`
        <div class="admin-container admin-page-ai-usage">
            ${k()}
            <main class="admin-content full-width">
                <div id="ai-usage-container"></div>
            </main>
        </div>
    `,L(t);let n=document.getElementById(`ai-usage-container`);if(!n)return;if(!await V()){n.innerHTML=Z(`AI usage`),r.translateIn(n);return}let i=await s(()=>import(`./aiUsage-BuzLgChO.js`),__vite__mapDeps([44,1,45,43]),import.meta.url);await i.render(n),W(i.cleanup)}async function be(e,t){e.innerHTML=`
        <div class="admin-container admin-page-tools">
            ${k()}
            <main class="admin-content full-width">
                <div id="tools-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./tools-Dfo2H2s8.js`),__vite__mapDeps([46,1,2,47]),import.meta.url),r=document.getElementById(`tools-container`);r&&(await n.render(r),W(n.cleanup))}async function xe(e,t){e.innerHTML=`
        <div class="admin-container admin-page-archive">
            ${k()}
            <main class="admin-content full-width">
                <div id="archive-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./archive-6I1LZgmm.js`),__vite__mapDeps([48,1,2,49]),import.meta.url),r=document.getElementById(`archive-container`);r&&(await n.render(r),W(n.cleanup))}async function Se(e,t){e.innerHTML=`
        <div class="admin-container admin-page-resources">
            ${k()}
            <main class="admin-content full-width">
                <div id="resources-container"></div>
            </main>
        </div>
    `,L(t);let n=await s(()=>import(`./resources-D8ibqZYU.js`),__vite__mapDeps([50,1,2,51]),import.meta.url),r=document.getElementById(`resources-container`);r&&(await n.render(r),W(n.cleanup))}var Ce=e({init:()=>$});async function Q(){G();let e=b(),t=document.getElementById(`app`);if(!t)return;let n=p(e);if(n===`general`){window.location.replace(v(e));return}if(n===`home`){Y(t,Q);return}let r=x(e);if(r!==null){await le(t,r,Q);return}let i=S(e);if(i!==null){await me(t,i,Q);return}if(C(e)){await fe(t,Q);return}if(w(e)){await X(t,Q);return}if(T(e)){await _e(t,Q);return}let a=ne(e);if(a){await ge(t,a.page,a.key,Q);return}let o=E(e);if(o!==null)await he(t,o,Q);else switch(e){case`works`:await ce(t,Q);break;case`users`:await pe(t,Q);break;case`tools`:await be(t,Q);break;case`series`:await ue(t,Q);break;case`book-settings`:await de(t,Q);break;case`resources`:await Se(t,Q);break;case`archive`:await xe(t,Q);break;case`settings`:await ve(t,Q);break;case`ai-usage`:await ye(t,Q);break;default:Y(t,Q)}}async function $(){console.log(`Admin module loading...`),await Q();let e=()=>{window.location.pathname.startsWith(`${a}/admin`)&&Q()};return window.addEventListener(`popstate`,e),console.log(`Admin initialized`),()=>{console.log(`Admin cleanup`),window.removeEventListener(`popstate`,e)}}export{v as a,te as i,$ as init,u as n,h as o,y as r,m as s,Ce as t};