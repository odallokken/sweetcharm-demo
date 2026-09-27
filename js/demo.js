// Only loaded in the static demo build (scripts/build-demo.js).
(() => {
  const D = window.DEMO;

  let toastTimer;
  const toast = (msg) => {
    let el = document.querySelector('.demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'demo-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3500);
  };

  // POST forms can't reach a server here: simulate the happy path or explain
  document.addEventListener(
    'submit',
    (e) => {
      const f = e.target;
      if ((f.getAttribute('method') || 'get').toLowerCase() !== 'post') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const action = new URL(f.action, location.href).pathname;
      if (action.endsWith('/handlekurv/legg-til/')) location.href = D.cart;
      else if (action.endsWith('/kassen/')) location.href = D.thanks;
      else if (action.endsWith('/admin/logg-inn/')) location.href = D.admin;
      else if (action.endsWith('/admin/logg-ut/')) location.href = `${D.base}/`;
      else toast('Dette er en demo – endringer lagres ikke.');
    },
    true
  );

  // Favorites: toggle visually only
  document.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('[data-fav]');
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const on = !btn.classList.contains('is-active');
      document.querySelectorAll(`[data-fav="${btn.dataset.fav}"]`).forEach((b) => {
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on);
      });
    },
    true
  );

  // Product listing: filter/sort client-side from the query string
  if (D.page === '/produkter') {
    const params = new URLSearchParams(location.search);
    const cat = params.get('kategori') || '';
    const q = (params.get('q') || '').trim().toLowerCase();
    const sort = params.get('sort') || 'nyeste';
    const grid = document.querySelector('.grid');
    const cards = [...grid.children];
    const visible = cards.filter(
      (c) => (cat === 'nyheter' ? c.dataset.new === 'true' : !cat || c.dataset.category === cat) && (!q || c.dataset.search.includes(q))
    );
    const sorters = {
      nyeste: (a, b) => b.dataset.created.localeCompare(a.dataset.created),
      'pris-lav': (a, b) => a.dataset.price - b.dataset.price,
      'pris-hoy': (a, b) => b.dataset.price - a.dataset.price,
      navn: (a, b) => a.dataset.name.localeCompare(b.dataset.name, 'nb'),
    };
    visible.sort(sorters[sort] || sorters.nyeste);
    cards.forEach((c) => c.remove());
    visible.forEach((c) => grid.appendChild(c));
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<p>Ingen produkter her ennå.</p>';
      grid.after(empty);
    }

    const heading = q ? `Søk: «${q}»` : cat === 'nyheter' ? 'Nyheter' : cat || 'Alle smykker';
    const h1 = document.querySelector('.listing-head h1');
    h1.firstChild.textContent = `${heading} `;
    h1.querySelector('small').textContent = `${visible.length} ${visible.length === 1 ? 'produkt' : 'produkter'}`;
    document.title = document.title.replace(/^[^–]+/, `${heading} `);
    const intro = document.querySelector('.listing-head p');
    if (intro && (cat || q)) intro.hidden = true;

    const sortForm = document.querySelector('.toolbar__sort');
    sortForm.querySelector('select').value = sort;
    for (const [k, v] of [['kategori', cat], ['q', q]]) {
      if (!v) continue;
      const input = document.createElement('input');
      Object.assign(input, { type: 'hidden', name: k, value: v });
      sortForm.prepend(input);
    }

    const filters = document.querySelector('[data-filters]');
    filters.querySelectorAll('.chip').forEach((chip) => {
      const chipCat = new URL(chip.href).searchParams.get('kategori') || '';
      chip.classList.toggle('is-active', chipCat === cat);
      const u = new URL(chip.href);
      u.searchParams.set('sort', sort);
      chip.href = u.pathname + u.search;
    });
    if (cat) filters.hidden = false;

    document.querySelectorAll('.main-nav a').forEach((a) => {
      const u = new URL(a.href);
      const isListing = u.pathname === location.pathname;
      a.classList.toggle('active', isListing && (u.searchParams.get('kategori') || '') === cat && !q);
    });
    const search = document.querySelector('[data-search] input');
    if (search) search.value = params.get('q') || '';
  }
})();
