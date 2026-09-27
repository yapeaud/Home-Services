/* HOME SERVICES – menu, animations, calculateur et formulaire WhatsApp */
(function () {
  var WA = '2250576323748';
  document.documentElement.classList.add('js');
  document.getElementById('year').textContent = new Date().getFullYear();

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function openWa(text) {
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  /* Menu mobile */
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Animations au défilement */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Calculateur de lessive */
  var commune = document.getElementById('calc-commune');
  var calcMsg = document.getElementById('calc-msg');
  var articles = [
    { id: 'adulte',  name: 'Vêtements adultes',               price: 75,  unit: '75 F / unité' },
    { id: 'robe',    name: 'Robes, pantalons, jeans, pulls',  price: 100, unit: '100 F / unité' },
    { id: 'serv',    name: 'Serviettes',                      price: 200, unit: '200 F / unité' },
    { id: 'taie',    name: "Taies d'oreiller",                price: 100, unit: '3 pour 100 F', per: 3 },
    { id: 'drap1',   name: 'Draps, lit 1 place',              price: 150, unit: 'dès 150 F / unité' },
    { id: 'drap2',   name: 'Draps, lit 2 places et plus',     price: 200, unit: '200 F / unité' },
    { id: 'enfant',  name: 'Vêtements enfants',               price: 50,  unit: '50 F / unité' }
  ];
  var list = document.getElementById('calc-list');
  list.innerHTML = articles.map(function (a) {
    return '<li class="calc-row"><div class="label"><strong id="l-' + a.id + '">' + a.name + '</strong><small>' + a.unit + '</small></div>' +
      '<div class="stepper"><button type="button" data-step="-1" data-for="q-' + a.id + '" aria-label="Retirer un article : ' + a.name + '">−</button>' +
      '<input id="q-' + a.id + '" type="number" min="0" max="999" inputmode="numeric" value="0" aria-labelledby="l-' + a.id + '">' +
      '<button type="button" data-step="1" data-for="q-' + a.id + '" aria-label="Ajouter un article : ' + a.name + '">+</button></div></li>';
  }).join('');

  function lineCost(a, q) { return a.per ? Math.ceil(q / a.per) * a.price : q * a.price; }
  function compute() {
    var lines = [], sub = 0;
    articles.forEach(function (a) {
      var q = parseInt(document.getElementById('q-' + a.id).value, 10) || 0;
      if (q > 0) { var c = lineCost(a, q); sub += c; lines.push({ a: a, q: q, c: c }); }
    });
    var opt = commune.options[commune.selectedIndex];
    // fee : nombre (1500 / 2000), null = à confirmer, undefined = aucune commune choisie
    var fee = !commune.value ? undefined : (opt.dataset.fee ? Number(opt.dataset.fee) : null);
    return { lines: lines, fee: fee, total: lines.length ? sub + (fee || 0) : 0 };
  }
  function feeLabel(fee) {
    if (fee === undefined) return 'selon commune';
    if (fee === null) return 'à confirmer';
    return fmt(fee) + ' F';
  }
  function plain(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  var sumLines = document.getElementById('sum-lines');
  var sumTotal = document.getElementById('sum-total');
  function render() {
    var r = compute();
    calcMsg.textContent = '';
    sumLines.innerHTML = r.lines.length
      ? r.lines.map(function (l) { return '<li><span>' + l.q + ' × ' + l.a.name + '</span><span>' + fmt(l.c) + ' F</span></li>'; }).join('') +
        '<li><span>Frais de déplacement' + (typeof r.fee === 'number' ? ' (' + commune.value + ')' : '') + '</span><span>' + feeLabel(r.fee) + '</span></li>'
      : '<li class="empty">Aucun article pour le moment.</li>';
    sumTotal.textContent = fmt(r.total) + ' F CFA' + (r.lines.length && typeof r.fee !== 'number' ? ' + déplacement' : '');
  }
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-step]');
    if (!b) return;
    var inp = document.getElementById(b.dataset.for);
    inp.value = Math.min(999, Math.max(0, (parseInt(inp.value, 10) || 0) + Number(b.dataset.step)));
    render();
  });
  list.addEventListener('input', function (e) {
    var v = parseInt(e.target.value, 10);
    if (v < 0) e.target.value = 0;
    if (v > 999) e.target.value = 999;
    render();
  });
  commune.addEventListener('change', function () {
    commune.classList.remove('field-error');
    calcMsg.textContent = '';
    render();
  });
  document.getElementById('calc-reset').addEventListener('click', function () {
    list.querySelectorAll('input').forEach(function (i) { i.value = 0; });
    calcMsg.textContent = '';
    render();
  });
  document.getElementById('calc-send').addEventListener('click', function () {
    var r = compute();
    if (!r.lines.length) {
      calcMsg.textContent = 'Ajoutez au moins un article avant l\'envoi.';
      return;
    }
    if (!commune.value) {
      calcMsg.textContent = 'Choisissez votre commune pour calculer le déplacement.';
      commune.classList.add('field-error');
      commune.focus();
      return;
    }
    calcMsg.textContent = '';
    var feeKnown = typeof r.fee === 'number';
    var msg = 'Bonjour HOME SERVICES, je souhaite un service de lessive à domicile.\n\nCommune : ' + commune.value + '\n\nMon récapitulatif :\n' +
      r.lines.map(function (l) { return '- ' + l.q + ' x ' + l.a.name + ' : ' + plain(l.c) + ' F'; }).join('\n') +
      '\n- Frais de déplacement : ' + (feeKnown ? plain(r.fee) + ' F' : 'à confirmer') +
      '\n\nTotal estimé : ' + plain(r.total) + ' F CFA' + (feeKnown ? '' : ' + déplacement') +
      '\n\nMerci de me recontacter pour fixer une date.';
    openWa(msg);
  });
  render();

  /* Formulaire de réservation */
  var form = document.getElementById('booking-form');
  var formMsg = document.getElementById('form-msg');
  var date = document.getElementById('f-date');
  var today = new Date();
  date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  document.querySelectorAll('[data-book]').forEach(function (a) {
    a.addEventListener('click', function () {
      document.getElementById('f-service').value = 'Nettoyage de maison';
      document.getElementById('f-taille').value = a.dataset.book;
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, missing = [];
    [['nom', 'votre nom'], ['tel', 'votre téléphone'], ['lieu', 'votre commune / quartier'], ['service', 'le service souhaité']].forEach(function (p) {
      var el = f[p[0]], bad = !el.value.trim();
      el.classList.toggle('field-error', bad);
      el.setAttribute('aria-invalid', bad);
      if (bad) missing.push(p[1]);
    });
    if (missing.length) {
      formMsg.textContent = 'Merci d\'indiquer ' + missing.join(', ') + '.';
      form.querySelector('.field-error').focus();
      return;
    }
    formMsg.textContent = '';
    var d = f.date.value ? new Date(f.date.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'À convenir';
    var msg = 'Bonjour HOME SERVICES, je souhaite réserver une prestation.\n\n' +
      'Nom : ' + f.nom.value.trim() + '\n' +
      'Téléphone : ' + f.tel.value.trim() + '\n' +
      'Commune / quartier : ' + f.lieu.value.trim() + '\n' +
      'Service : ' + f.service.value + '\n' +
      'Taille du logement : ' + (f.taille.value || 'Non précisée') + '\n' +
      'Date souhaitée : ' + d +
      (f.message.value.trim() ? '\n\nMessage : ' + f.message.value.trim() : '');
    openWa(msg);
  });
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('field-error') && e.target.value.trim()) {
      e.target.classList.remove('field-error');
      e.target.removeAttribute('aria-invalid');
    }
  });
})();
