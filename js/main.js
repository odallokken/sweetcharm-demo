(() => {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

  // Mobile menu
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  menuToggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', open);
  });

  // Search
  const searchToggle = document.querySelector('[data-search-toggle]');
  const search = document.querySelector('[data-search]');
  searchToggle?.addEventListener('click', () => {
    search.hidden = !search.hidden;
    if (!search.hidden) search.querySelector('input').focus();
  });

  // Filter panel
  const filterToggle = document.querySelector('[data-filter-toggle]');
  const filters = document.querySelector('[data-filters]');
  filterToggle?.addEventListener('click', () => {
    filters.hidden = !filters.hidden;
    filterToggle.setAttribute('aria-expanded', !filters.hidden);
    filterToggle.textContent = filters.hidden ? '+ Filter' : '− Filter';
  });
  if (filterToggle && filters && !filters.hidden) filterToggle.textContent = '− Filter';

  // Auto-submit selects / qty inputs
  document.querySelectorAll('[data-autosubmit]').forEach((el) =>
    el.addEventListener('change', () => el.form.requestSubmit ? el.form.requestSubmit() : el.form.submit())
  );

  // Favorites
  document.querySelectorAll('[data-fav]').forEach((btn) =>
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.fav;
      try {
        const res = await fetch(`/favoritter/${id}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'X-CSRF-Token': csrf },
        });
        const data = await res.json();
        document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => {
          b.classList.toggle('is-active', data.active);
          b.setAttribute('aria-pressed', data.active);
        });
        if (!data.active && location.pathname === '/favoritter') btn.closest('.card')?.remove();
      } catch {}
    })
  );

  // Product gallery
  const main = document.querySelector('[data-gallery-main]');
  document.querySelectorAll('[data-gallery-thumb]').forEach((thumb) =>
    thumb.addEventListener('click', () => {
      main.src = thumb.dataset.galleryThumb;
      document.querySelectorAll('[data-gallery-thumb]').forEach((t) => t.classList.toggle('is-active', t === thumb));
    })
  );

  // Clickable table rows
  document.querySelectorAll('tr[data-href]').forEach((row) =>
    row.addEventListener('click', (e) => {
      if (!e.target.closest('a,button')) location.href = row.dataset.href;
    })
  );

  // Confirm forms
  document.querySelectorAll('form[data-confirm]').forEach((form) =>
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm)) e.preventDefault();
    })
  );

  // Image upload: drag & drop + preview
  const dropzone = document.querySelector('[data-dropzone]');
  if (dropzone) {
    const input = dropzone.querySelector('[data-file-input]');
    const preview = dropzone.querySelector('[data-preview]');
    const render = () => {
      preview.innerHTML = '';
      [...input.files].forEach((file) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        preview.appendChild(img);
      });
    };
    input.addEventListener('change', render);
    ['dragenter', 'dragover'].forEach((ev) =>
      dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.add('is-over');
      })
    );
    ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, () => dropzone.classList.remove('is-over')));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      const dt = new DataTransfer();
      [...input.files, ...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')).forEach((f) => dt.items.add(f));
      input.files = dt.files;
      render();
    });
  }
})();
