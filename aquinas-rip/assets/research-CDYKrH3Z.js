const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./bookmarks-DiNMZXdi.js","./i18n-fj3F4Jw9.js","./bookmarks-XWaY5uKj.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,p as n,u as r}from"./i18n-fj3F4Jw9.js";function i(){return window.location.pathname.replace(/^\/research\/?/,``)||`home`}function a(r){r.innerHTML=`
        <div class="research-container">
            <header class="research-header">
                <h1 data-i18n="Research">Research</h1>
                <nav class="research-nav">
                    <a href="${n}/" data-i18n="← Back to Editor">← Back to Editor</a>
                </nav>
            </header>
            <main class="research-content">
                <div class="research-tools">
                    <h2 data-i18n="Research Tools">Research Tools</h2>
                    <div class="research-tool-grid">
                        <a href="${n}/research/bookmarks" class="research-tool-card">
                            <div class="tool-icon">📑</div>
                            <h3 data-i18n="Bookmarks">Bookmarks</h3>
                            <p data-i18n="View and manage all your saved bookmarks across works">View and manage all your saved bookmarks across works</p>
                        </a>
                        <div class="research-tool-card disabled">
                            <div class="tool-icon">🔍</div>
                            <h3 data-i18n="Text Analysis">Text Analysis</h3>
                            <p data-i18n="Analyze text patterns and statistics">Analyze text patterns and statistics</p>
                            <span class="coming-soon" data-i18n="Coming Soon">Coming Soon</span>
                        </div>
                        <div class="research-tool-card disabled">
                            <div class="tool-icon">📊</div>
                            <h3 data-i18n="Concordance Search">Concordance Search</h3>
                            <p data-i18n="Search for word occurrences in context">Search for word occurrences in context</p>
                            <span class="coming-soon" data-i18n="Coming Soon">Coming Soon</span>
                        </div>
                        <div class="research-tool-card disabled">
                            <div class="tool-icon">📈</div>
                            <h3 data-i18n="Statistical Reports">Statistical Reports</h3>
                            <p data-i18n="Generate statistical reports on text data">Generate statistical reports on text data</p>
                            <span class="coming-soon" data-i18n="Coming Soon">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `,e.translateIn(r),r.querySelector(`.research-nav`)?.appendChild(t(`lang-select`))}async function o(){let e=i(),t=document.getElementById(`app`);if(t)switch(e){case`bookmarks`:await(await r(()=>import(`./bookmarks-DiNMZXdi.js`),__vite__mapDeps([0,1,2]),import.meta.url)).init();break;default:a(t)}}async function s(){console.log(`Research module loading...`),await o();let e=()=>{window.location.pathname.startsWith(`${n}/research`)&&o()};return window.addEventListener(`popstate`,e),console.log(`Research initialized`),()=>{console.log(`Research cleanup`),window.removeEventListener(`popstate`,e)}}export{s as init};