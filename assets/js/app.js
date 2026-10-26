/* Rede DesenvolVi — renderização dirigida pela configuração (config.js) */
(function () {
  'use strict';

  var CFG = window.REDE_CONFIG;
  if (!CFG) { console.error('REDE_CONFIG não encontrado. Verifique assets/js/config.js.'); return; }

  /* ---------- utilitários ---------- */
  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }
  function urlSegura(u) {
    var s = String(u || '').trim();
    return /^(https?:\/\/|assets\/|\/)/i.test(s) ? s : '';
  }
  function $(id) { return document.getElementById(id); }
  function cidadesAtivas() { return (CFG.cidades || []).filter(function (c) { return c.ativa !== false; }); }

  function whatsapp(telefone, modelo, cidade) {
    var msg = String(modelo || '').replace('{cidade}', cidade || '');
    return 'https://api.whatsapp.com/send?phone=' + soDigitos(telefone) + '&text=' + encodeURIComponent(msg);
  }
  function mapsUrl(c) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent([c.local, c.nome, c.uf].filter(Boolean).join(', '));
  }

  /* gancho de medição: compatível com Google Tag Manager / GA4 (se instalados) */
  function track(evento, detalhe) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: evento, detalhe: detalhe || '' });
    } catch (e) { console.warn('track falhou', e); }
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-evento]') : null;
    if (el) track(el.getAttribute('data-evento'), el.getAttribute('data-detalhe'));
  });

  /* ---------- renderizadores (montam HTML em buffer e escrevem uma única vez) ---------- */
  function renderHero() {
    var cs = cidadesAtivas();
    var n = $('contagem-cidades');
    if (n) n.textContent = cs.length + (cs.length === 1 ? ' cidade' : ' cidades');
    var alvo = $('hero-cidades');
    if (!alvo) return;
    var buf = '';
    cs.forEach(function (c) {
      var href = whatsapp(c.telefone, CFG.mensagens.contato, c.nome);
      buf += `<a class="btn btn-primary btn-sm" href="${escapeHtml(href)}" data-evento="whatsapp_cidade" data-detalhe="${escapeHtml(c.id)}">${escapeHtml(c.nome)} · ${escapeHtml(c.uf)} →</a>`;
    });
    buf += '<a class="btn btn-dashed btn-sm" href="#parceiros">Minha cidade não está aqui</a>';
    alvo.innerHTML = buf;
  }

  function renderCidades() {
    var alvo = $('cidades-lista');
    if (!alvo) return;
    var buf = '';
    cidadesAtivas().forEach(function (c) {
      var wa = whatsapp(c.telefone, CFG.mensagens.aulaExperimental, c.nome);
      buf += `
        <article class="city">
          <h3>${escapeHtml(c.nome)} · ${escapeHtml(c.uf)}</h3>
          <p>${escapeHtml(c.local)}</p>
          <div class="actions">
            <a class="btn btn-primary btn-sm" href="${escapeHtml(wa)}" data-evento="agendar_whatsapp" data-detalhe="${escapeHtml(c.id)}">Agendar aula experimental</a>
            <a class="btn btn-outline btn-sm" href="${escapeHtml(mapsUrl(c))}" target="_blank" rel="noopener">Como chegar</a>
          </div>
        </article>`;
    });
    buf += `
      <article class="city soon">
        <h3>Sua cidade aqui</h3>
        <p>Estamos ampliando a rede com profissionais e centros que compartilham o nosso propósito.</p>
        <div class="actions"><a class="btn btn-dashed btn-sm" href="#parceiros">Quero levar a rede para minha cidade</a></div>
      </article>`;
    alvo.innerHTML = buf;
  }

  function renderEquipe() {
    var alvo = $('equipe-lista');
    if (!alvo) return;
    var buf = '';
    (CFG.equipe || []).forEach(function (p) {
      var foto = urlSegura(p.foto);
      var avatar = foto
        ? `<img src="${escapeHtml(foto)}" alt="Foto de ${escapeHtml(p.nome)}" loading="lazy">`
        : escapeHtml(p.iniciais || '');
      var apelido = p.apelido ? ` <span style="font-weight:600;font-size:18px">(${escapeHtml(p.apelido)})</span>` : '';
      buf += `
        <article class="person">
          <div class="avatar" ${foto ? '' : 'aria-hidden="true"'}>${avatar}</div>
          <div class="info">
            <h3>${escapeHtml(p.nome)}${apelido}</h3>
            <p class="role">${escapeHtml(p.cargo)}</p>
            <p>${escapeHtml(p.texto)}</p>
          </div>
        </article>`;
    });
    alvo.innerHTML = buf;
  }

  function renderDepoimentos() {
    var secao = $('depoimentos');
    var alvo = $('depoimentos-lista');
    var lista = CFG.depoimentos || [];
    if (!secao || !alvo) return;
    if (!lista.length) { secao.hidden = true; return; }
    var buf = '';
    lista.forEach(function (d) {
      buf += `
        <figure class="quote">
          <blockquote>“${escapeHtml(d.texto)}”</blockquote>
          <figcaption>${escapeHtml(d.autor)}${d.detalhe ? ' · ' + escapeHtml(d.detalhe) : ''}</figcaption>
        </figure>`;
    });
    alvo.innerHTML = buf;
    secao.hidden = false;
  }

  function renderParceiros() {
    var alvo = $('parceiros-lista');
    if (alvo) {
      var buf = '';
      (CFG.parceiros || []).forEach(function (p) {
        var u = urlSegura(p.url);
        buf += u
          ? `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(p.nome)}</a>`
          : `<span>${escapeHtml(p.nome)}</span>`;
      });
      alvo.innerHTML = buf;
    }
    var cta = $('parceiro-cta');
    if (cta && CFG.contatoRede) {
      cta.href = whatsapp(CFG.contatoRede.telefone, CFG.mensagens.parceiro, '');
    }
  }

  /* seletor de cidade do fechamento: estado local simples */
  var cidadeSelecionada = null;
  function renderContato() {
    var cs = cidadesAtivas();
    var alvo = $('contato-cidades');
    var cta = $('contato-cta');
    var info = $('contato-info');
    if (!alvo || !cta || !cs.length) return;
    if (!cidadeSelecionada || !cs.some(function (c) { return c.id === cidadeSelecionada; })) {
      cidadeSelecionada = cs[0].id;
    }
    var buf = '';
    cs.forEach(function (c) {
      var ativa = c.id === cidadeSelecionada;
      buf += `<button type="button" class="opt" data-cidade="${escapeHtml(c.id)}" aria-pressed="${ativa}">${escapeHtml(c.nome)} · ${escapeHtml(c.uf)}</button>`;
    });
    alvo.innerHTML = buf;
    var atual = cs.filter(function (c) { return c.id === cidadeSelecionada; })[0];
    cta.href = whatsapp(atual.telefone, CFG.mensagens.aulaExperimental, atual.nome);
    cta.setAttribute('data-detalhe', atual.id);
    if (info) info.textContent = 'Atendimento: ' + atual.nome + ' · ' + atual.local + '. Você será direcionado ao WhatsApp da unidade.';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-cidade]') : null;
    if (!b) return;
    cidadeSelecionada = b.getAttribute('data-cidade');
    renderContato();
  });

  /* fotos opcionais: preencha CFG.fotos em config.js; vazio = nada aparece (hero usa a ilustração) */
  function renderFotos() {
    var f = CFG.fotos || {};
    document.querySelectorAll('[data-foto]').forEach(function (el) {
      var item = f[el.getAttribute('data-foto')];
      if (!item || !item.src) return;
      var img = document.createElement('img');
      var u = urlSegura(item.src); if (!u) return; img.src = u;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      el.innerHTML = '';
      el.appendChild(img);
      el.hidden = false;
    });
  }

  /* menu hambúrguer (celular) */
  function initMenu() {
    var btn = $('menu-toggle'), bar = $('menu-bar'), hd = document.querySelector('.site-header');
    if (!btn || !bar) return;
    function medir() { if (hd) document.documentElement.style.setProperty('--hh', hd.offsetHeight + 'px'); }
    function fechar() { bar.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menu'); }
    btn.addEventListener('click', function () {
      medir();
      var abrir = !bar.classList.contains('open');
      bar.classList.toggle('open', abrir);
      btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      btn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    });
    bar.addEventListener('click', function (e) { if (e.target.closest('a')) fechar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    window.addEventListener('resize', function () { medir(); if (window.innerWidth > 700) fechar(); });
    medir();
    /* cabeçalho compacto ao rolar (com histerese para não oscilar) */
    var compacto = false;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (!compacto && y > 90) { compacto = true; hd.classList.add('compacto'); medir(); }
      else if (compacto && y < 20) { compacto = false; hd.classList.remove('compacto'); medir(); }
    }, { passive: true });
    window.addEventListener('load', medir);
  }

  /* vídeo com carregamento sob demanda (só carrega o YouTube ao clicar; privacidade e velocidade) */
  function renderVideos() {
    var v = CFG.videos || {};
    document.querySelectorAll('[data-video]').forEach(function (el) {
      var item = v[el.getAttribute('data-video')];
      if (!item || !/^[\w-]{6,20}$/.test(item.id || '')) { el.closest('section') && (el.hidden = true); return; }
      var titulo = escapeHtml(item.titulo || 'Vídeo');
      el.innerHTML = `<button type="button" class="video-play" aria-label="Assistir ao vídeo: ${titulo}"><img src="https://i.ytimg.com/vi/${item.id}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span>${titulo}</span></button>`;
      el.querySelector('button').addEventListener('click', function () {
        el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0&hl=pt-BR&cc_load_policy=1" title="${titulo}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      });
    });
  }

  /* casa animada: toca ao entrar na tela e pode ser reproduzida de novo */
  function initCasa() {
    var el = $('casa-anim'), btn = $('casa-replay');
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function tocar() { el.classList.remove('rodando'); void el.offsetWidth; el.classList.add('rodando'); }
    if (btn) btn.addEventListener('click', tocar);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { tocar(); io.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe(el);
    }
  }

  function init() {
    initMenu();
    initCasa();
    renderVideos();
    renderFotos();
    renderHero();
    renderCidades();
    renderEquipe();
    renderDepoimentos();
    renderParceiros();
    renderContato();
    var ano = $('ano');
    if (ano) ano.textContent = new Date().getFullYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
