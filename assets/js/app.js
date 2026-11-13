/* Rede Primeiros Anos — renderização dirigida pela configuração (config.js) */
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
      img.loading = el.getAttribute('data-foto') === 'hero' ? 'eager' : 'lazy';
      el.innerHTML = '';
      el.appendChild(img);
      el.hidden = false;
    });
  }

  /* abertura em vídeo: tela cheia; ao terminar (ou ao pular) encolhe até a foto do topo */
  function initIntro() {
    var root = document.documentElement, el = $('intro');
    if (!el) return;
    var cfg = CFG.intro || {};
    var src = urlSegura(cfg.video || '');
    var poupar = !!(navigator.connection && navigator.connection.saveData);
    if (!root.classList.contains('intro-on') || cfg.ativo === false || !src || poupar) {
      root.classList.remove('intro-on', 'intro-lock'); el.remove(); return;
    }
    var v = $('intro-video'), clip = $('intro-clip'), pular = $('intro-pular'), som = $('intro-som');
    var encerrado = false, tocou = false, tempo = null;
    function limpar() { root.classList.remove('intro-on', 'intro-lock'); document.body.classList.remove('site-entra'); if (el.parentNode) el.remove(); }
    function encerrar(motivo) {
      if (encerrado) return; encerrado = true;
      clearTimeout(tempo);
      try { v.pause(); } catch (e) {}
      track('intro_' + motivo, tocou ? Math.round(v.currentTime) : 0);
      root.classList.remove('intro-lock');
      var de = document.documentElement;
      function irPara(y) { de.style.scrollBehavior = 'auto'; window.scrollTo(0, y); de.style.scrollBehavior = ''; }
      irPara(0);
      var alvo = document.querySelector('.ht-frame');
      document.body.classList.add('site-entra');
      el.classList.add('saindo');
      setTimeout(function () { document.body.classList.remove('site-entra'); }, 2600);
      if (!alvo) {
        clip.classList.add('fade');
        setTimeout(limpar, 900);
        return;
      }
      /* se a moldura não estiver toda visível (celular), rola a página por baixo da abertura até ela */
      var topoFixo = 0;
      ['.site-header', '.site-bar'].forEach(function (s) {
        var n = document.querySelector(s);
        if (n && getComputedStyle(n).position !== 'static') { var b = n.getBoundingClientRect(); if (b.height && b.bottom > topoFixo && b.top < 5) topoFixo = b.bottom; }
      });
      var r = alvo.getBoundingClientRect(), vh = window.innerHeight;
      if (r.top < topoFixo + 8 || r.bottom > vh - 8) {
        var desejado = Math.max(topoFixo + 16, (vh - r.height) / 2);
        var maxY = Math.max(0, de.scrollHeight - vh);
        irPara(Math.min(maxY, Math.max(0, r.top - desejado)));
        r = alvo.getBoundingClientRect();
      }
      var voltou = false;
      function cancelarVolta() { voltou = true; }
      ['touchstart', 'wheel', 'keydown'].forEach(function (ev) { window.addEventListener(ev, cancelarVolta, { once: true, passive: true }); });
      var cs = getComputedStyle(alvo);
      var borda = 8, ar = 16 / 9;
      /* geometria do vídeo dentro da caixa: início = tela cheia (cover no horizontal, contain no vertical); fim = cover dentro da moldura */
      function geo(w, h, cobrir, px, py) {
        var largo = w / h > ar, W, H;
        if (cobrir ? largo : !largo) { W = w; H = w / ar; } else { H = h; W = h * ar; }
        return { w: W, h: H, l: (w - W) * px, t: (h - H) * py };
      }
      var cr = clip.getBoundingClientRect();
      var g0 = geo(cr.width, cr.height, cr.width >= cr.height, 0.5, 0.5);
      var g1 = geo(r.width - 2 * borda, r.height - 2 * borda, true, 0.58, 0.5);
      function px(n) { return n + 'px'; }
      v.style.cssText = 'position:absolute;object-fit:fill;max-width:none;left:' + px(g0.l) + ';top:' + px(g0.t) + ';width:' + px(g0.w) + ';height:' + px(g0.h);
      void clip.offsetWidth;
      var dur = '1.2s cubic-bezier(.65,0,.25,1)';
      var props = ['left', 'top', 'width', 'height'];
      clip.style.transition = ['left', 'top', 'width', 'height', 'border-radius', 'border-width', 'box-shadow'].map(function (p) { return p + ' ' + dur; }).join(',');
      v.style.transition = props.map(function (p) { return p + ' ' + dur; }).join(',');
      void clip.offsetWidth;
      clip.style.left = px(r.left); clip.style.top = px(r.top);
      clip.style.width = px(r.width); clip.style.height = px(r.height);
      clip.style.borderRadius = cs.borderRadius; clip.style.borderWidth = px(borda);
      clip.style.boxShadow = '0 28px 60px rgba(11,42,94,.35)';
      v.style.left = px(g1.l); v.style.top = px(g1.t); v.style.width = px(g1.w); v.style.height = px(g1.h);
      var feito = false;
      function pousou() {
        if (feito) return; feito = true;
        if (cfg.final === 'video') {
          alvo.innerHTML = '';
          v.removeAttribute('style'); v.removeAttribute('aria-hidden'); v.setAttribute('aria-label', 'Vídeo de abertura');
          v.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:58% 50%;display:block';
          alvo.appendChild(v);
          limpar();
        } else {
          clip.style.transition = 'opacity .6s ease'; clip.style.opacity = '0';
          setTimeout(limpar, 650);
        }
        /* se a página foi rolada para mostrar a moldura, volta suavemente ao topo, a menos que a pessoa já tenha interagido */
        if (window.pageYOffset > 4) {
          setTimeout(function () { if (!voltou && window.pageYOffset > 4) window.scrollTo({ top: 0, behavior: 'smooth' }); }, 1100);
        }
      }
      clip.addEventListener('transitionend', function (e) { if (e.propertyName === 'width' && e.target === clip) pousou(); });
      setTimeout(pousou, 1600);
    }
    v.addEventListener('ended', function () { setTimeout(function () { encerrar('assistiu'); }, 700); });
    v.addEventListener('error', function () { encerrar('erro'); });
    v.addEventListener('playing', function () { tocou = true; clearTimeout(tempo); });
    pular.addEventListener('click', function () { encerrar('pulou'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') encerrar('pulou'); });
    som.addEventListener('click', function () {
      v.muted = !v.muted;
      var on = !v.muted;
      som.setAttribute('aria-pressed', on ? 'true' : 'false');
      som.setAttribute('aria-label', on ? 'Desligar o som do vídeo' : 'Ativar o som do vídeo');
      if (v.paused && !encerrado) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    });
    v.src = src;
    var p = v.play();
    if (p && p.catch) p.catch(function () { encerrar('bloqueado'); });
    tempo = setTimeout(function () { if (!tocou) encerrar('lento'); }, 6000);
    pular.focus({ preventScroll: true });
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
    initIntro();
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
