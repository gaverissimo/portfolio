// Theme toggle: 'clean' (default) or 'dark' managed via checkbox #darkmode-toggle
function setTheme(theme){
    if(theme === 'dark'){
        document.documentElement.setAttribute('data-theme','dark');
        localStorage.setItem('site-theme','dark');
        // ensure checkbox is checked
        const cb = document.getElementById('darkmode-toggle'); if(cb) cb.checked = true;
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('site-theme','clean');
        const cb = document.getElementById('darkmode-toggle'); if(cb) cb.checked = false;
    }
}

// initialize theme from localStorage
const savedTheme = localStorage.getItem('site-theme') || 'clean';
setTheme(savedTheme === 'dark' ? 'dark' : 'clean');

// wire checkbox change to theme setter
const darkCheckbox = document.getElementById('darkmode-toggle');
if(darkCheckbox){
    darkCheckbox.addEventListener('change', (e)=>{
        setTheme(e.target.checked ? 'dark' : 'clean');
    });
}

// keep visual checkbox in sync on DOMContentLoaded for pages where the input is added later
document.addEventListener('DOMContentLoaded',()=>{
    const cb2 = document.getElementById('darkmode-toggle');
    if(cb2){
        const current = localStorage.getItem('site-theme') === 'dark';
        cb2.checked = current;
        cb2.addEventListener('change', (e)=> setTheme(e.target.checked ? 'dark' : 'clean'));
    }
});

// Language toggle (simple static mapping)
const translations = {
    pt: {
        'hero-name':'Gabrielli.',
        'hero-desc':'Explorando DevOps, Cloud e Segurança. Compartilhando meus conhecimentos e projetos.',
        'btnLabs':'Labs & Projetos',
        'btnSobre':'Sobre Mim',
        'section-learning':'Em Aprendizado'
    },
    en: {
        'hero-name':'Gabrielli.',
        'hero-desc':'Exploring DevOps, Cloud and Security. Sharing my knowledge and projects.',
        'btnLabs':'Labs & Projects',
        'btnSobre':'About Me',
        'section-learning':'Currently Learning'
    }
};

function setLanguage(lang){
    const t = translations[lang] || translations.pt;
    const nameEl = document.getElementById('hero-name');
    const descEl = document.getElementById('hero-desc');
    const btnLabs = document.getElementById('btnLabs');
    const btnSobre = document.getElementById('btnSobre');
    if(nameEl) nameEl.textContent = t['hero-name'];
    if(descEl) descEl.textContent = t['hero-desc'];
    if(btnLabs) btnLabs.textContent = t['btnLabs'];
    if(btnSobre) btnSobre.textContent = t['btnSobre'];
    // update active class on toggles
    document.querySelectorAll('.lang').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.lang').forEach(b=>{ if(b.textContent.toLowerCase() === lang) b.classList.add('active')});
    localStorage.setItem('site-lang',lang);
}

// Initialize language from storage
const savedLang = localStorage.getItem('site-lang') || 'pt';
setLanguage(savedLang);

// Wire up language buttons
['btn-pt','btn-en','btn-pt-labs','btn-en-labs','btn-pt-sobre','btn-en-sobre'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click',()=>{
        const lang = el.textContent.trim().toLowerCase();
        setLanguage(lang);
    })
});

// Small helper so internal pages with separate buttons also use the stored language
document.addEventListener('DOMContentLoaded',()=>{
    const currentLang = localStorage.getItem('site-lang') || 'pt';
    setLanguage(currentLang);
});

// NAV: set active class on nav links based on current path
function markActiveNav(){
    const links = document.querySelectorAll('.main-nav a');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a=>{
        const href = a.getAttribute('href').split('/').pop();
        // consider index and empty
        if((href === path) || (href === 'index.html' && (path === '' || path === 'index.html'))){
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
        // add click handler to update active state without reload (for SPA like behavior)
        a.addEventListener('click', ()=>{
            links.forEach(l=>l.classList.remove('active'));
            a.classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', markActiveNav);

// Dropdown accessibility for touch devices: toggle dropdown on first tap/click
document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.nav-item.has-dropdown > .has-link').forEach(link=>{
        // mark initial state
        link.setAttribute('aria-expanded','false');
        link.addEventListener('click', (e)=>{
            const parent = link.parentElement;
            if(!parent) return;
            const href = link.getAttribute('href').split('/').pop();
            const current = location.pathname.split('/').pop() || 'index.html';

            // If we're already on the target page, toggle dropdown without navigating
            if(current === href){
                e.preventDefault();
                const isOpen = parent.classList.contains('open');
                // close other dropdowns
                document.querySelectorAll('.nav-item.has-dropdown.open').forEach(p=>p.classList.remove('open'));
                if(!isOpen) {
                    parent.classList.add('open');
                    link.setAttribute('aria-expanded','true');
                } else {
                    parent.classList.remove('open');
                    link.setAttribute('aria-expanded','false');
                }
                // prevent the click from bubbling to the document handler which may close the menu
                e.stopPropagation();
                return;
            }

            // If we're on a different page, allow navigation but remember to open dropdown on arrival
            try{ localStorage.setItem('open-dropdown','labs'); }catch(_){}
            // do not preventDefault — navigation will occur
        });
    });

    // On pages load, if navigation requested opening the labs dropdown, open it on labs.html
    const pending = localStorage.getItem('open-dropdown');
    if(pending === 'labs'){
        const current = location.pathname.split('/').pop() || 'index.html';
        if(current === 'labs.html'){
            const navItem = document.querySelector('.nav-item.has-dropdown');
            const link = navItem ? navItem.querySelector('.has-link') : null;
            if(navItem){
                navItem.classList.add('open');
                if(link) link.setAttribute('aria-expanded','true');
            }
            try{ localStorage.removeItem('open-dropdown'); }catch(_){}
        }
    }

    // close dropdown when clicking outside
    document.addEventListener('click', (e)=>{
        if(!e.target.closest('.nav-item.has-dropdown')){
            document.querySelectorAll('.nav-item.has-dropdown.open').forEach(p=>p.classList.remove('open'));
        }
    });
});

// Labs search: filter project rows on labs page
document.addEventListener('DOMContentLoaded', ()=>{
    const search = document.getElementById('labs-search');
    if(!search) return;
    const rows = Array.from(document.querySelectorAll('.project-row'));
    const normalize = s => (s||'').toString().toLowerCase().trim();

    const filter = (q)=>{
        const qn = normalize(q);
        rows.forEach(r=>{
            const title = normalize(r.querySelector('.project-content h3')?.textContent);
            const body = normalize(r.querySelector('.project-content')?.textContent);
            const found = qn === '' || title.includes(qn) || body.includes(qn);
            r.style.display = found ? '' : 'none';
        });
    };

    search.addEventListener('input', (e)=> filter(e.target.value));
    // optional: allow pressing Esc to clear
    search.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') { e.target.value=''; filter(''); } });
});