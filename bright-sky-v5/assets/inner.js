
(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;

  /* ---------------- Booking form → WhatsApp ---------------- */
  var form = document.getElementById('bookForm');
  if (form) form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var v = function(id){ return document.getElementById(id).value.trim(); };
    var lines = ['Hi Bright Sky Auto, I would like to book a service.',
      'Name: ' + v('f-name'), 'Phone: ' + v('f-phone')];
    if (v('f-email')) lines.push('Email: ' + v('f-email'));
    lines.push('Service: ' + v('f-service'));
    if (v('f-date')) lines.push('Preferred date: ' + v('f-date'));
    if (v('f-msg')) lines.push('Message: ' + v('f-msg'));
    window.open('https://wa.me/971547787862?text=' + encodeURIComponent(lines.join('\n')), '_blank');
  });

  /* ---------------- THREE.JS HERO SCENE ---------------- */

  /* ---------------- LANGUAGE SWITCHER (Google Translate, 6 languages) ---------------- */
  var LANGS = { 'en': ['EN', 'English'], 'ar': ['عربي', 'العربية'], 'zh-CN': ['中文', '简体中文'], 'zh-TW': ['繁體', '繁體中文'], 'de': ['DE', 'Deutsch'], 'ru': ['RU', 'Русский'] };
  function curLang(){
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
    return (m && LANGS[m[1]]) ? m[1] : 'en';
  }
  function paintLang(){
    var c = curLang();
    document.querySelectorAll('.langcur').forEach(function(el){ el.textContent = LANGS[c][0]; });
    document.querySelectorAll('[data-lang]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-lang') === c); });
    document.documentElement.classList.toggle('is-ar', c === 'ar');
  }
  function setLang(code){
    if (!LANGS[code]) code = 'en';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    if (code !== 'en') document.cookie = 'googtrans=/en/' + code + '; path=/; max-age=31536000';
    var sel = document.querySelector('#google_translate_element select.goog-te-combo');
    if (sel) {
      sel.value = (code === 'en') ? '' : code;
      sel.dispatchEvent(new Event('change'));
      paintLang();
    } else {
      location.reload();
    }
  }
  window.googleTranslateElementInit = function(){
    try {
      new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'ar,zh-CN,zh-TW,de,ru', autoDisplay: false }, 'google_translate_element');
    } catch(e){}
  };
  (function(){
    var holder = document.getElementById('google_translate_element');
    if (holder) {
      var gs = document.createElement('script');
      gs.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      gs.async = true;
      document.head.appendChild(gs);
    }
    var sw = document.getElementById('langsw');
    if (sw) {
      var btn = sw.querySelector('.langbtn');
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var open = sw.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function(e){ if (!sw.contains(e.target)) sw.classList.remove('open'); });
      document.addEventListener('keydown', function(e){ if (e.key === 'Escape') sw.classList.remove('open'); });
    }
    document.querySelectorAll('[data-lang]').forEach(function(b){
      b.addEventListener('click', function(){
        if (sw) sw.classList.remove('open');
        setLang(b.getAttribute('data-lang'));
      });
    });
    paintLang();
  })();

  /* ---------------- LENIS + GSAP MOTION ---------------- */
  var hasGsap = !!window.gsap;
  var lenis = null;
  if (window.Lenis && !reduced){
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap){
      lenis.on('scroll', function(){ if (window.ScrollTrigger) ScrollTrigger.update(); });
      gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time){ lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }
  // anchor links through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if (id.length > 1){
        var el = document.querySelector(id);
        if (el){ e.preventDefault(); if (lenis) lenis.scrollTo(el, { offset: -86 }); else el.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });

  if (hasGsap && window.ScrollTrigger && !reduced){
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('anim');

    // inner-page header intro
    var itl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    itl.from('.nav', { y: -26, opacity: 0, duration: 0.7 }, 0.1)
       .from('.ihead .crumbs, .ihead .label', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.25)
       .from('.ih1 .line > span', { yPercent: 115, duration: 0.85, stagger: 0.09 }, 0.35)
       .from('.ilead', { y: 20, opacity: 0, duration: 0.55 }, 0.7)
       .from('.ihead .truststrip span', { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 }, 0.8)
       .from('.himg', { x: 44, opacity: 0, duration: 0.7 }, 0.6);

    // ---- pro motion library: bidirectional + varied + brisk ----
    // Every scroll animation plays IN on enter and REVERSES OUT on leave,
    // in both scroll directions (toggleActions: play reverse play reverse).
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var EASE = 'expo.out';
    function natural(k){
      return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }[k];
    }
    function biTween(target, fromVars, opts){
      opts = opts || {};
      var to = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' };
      to.duration = opts.duration || 0.75; to.ease = EASE;
      if (opts.delay) to.delay = opts.delay;
      if (opts.stagger) to.stagger = opts.stagger;
      to.scrollTrigger = { trigger: opts.trigger || target, start: 'top 88%', end: 'bottom 12%',
        toggleActions: 'play reverse play reverse' };
      return gsap.fromTo(target, fromVars, to);
    }
    // stagger containers animate their children instead of themselves
    var staggerSels = ['.chips', '.facts', '.bchips'];
    var staggerEls = new Set();
    staggerSels.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(c){ staggerEls.add(c); });
    });
    staggerEls.forEach(function(c){
      var kids = Array.prototype.filter.call(c.children, function(k){
        return !k.classList.contains('rv') && !k.classList.contains('rv-l') && !k.classList.contains('rv-r');
      });
      if (!kids.length) return;
      kids.forEach(function(k, i){ k.style.transformOrigin = '50% 100%'; });
      biTween(kids, { y: 22, opacity: 0 }, { trigger: c, duration: 0.6, stagger: 0.055 });
    });
    // individual reveals: variants rotate by DOM order so neighbours differ
    var variantPool = [
      { y: 38, opacity: 0 },
      { y: 22, scale: 0.93, opacity: 0 },
      { x: -46, opacity: 0, rotate: -0.5 },
      { x: 46, opacity: 0, rotate: 0.5 },
      fine ? { y: 26, opacity: 0, filter: 'blur(7px)' } : { y: 30, opacity: 0 }
    ];
    var vi = 0;
    gsap.utils.toArray('.rv, .rv-l, .rv-r').forEach(function(el){
      if (staggerEls.has(el)) return;
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      var delay = (sib % 4) * 0.05;
      if (el.classList.contains('rv-l')) biTween(el, { x: -48, opacity: 0, rotate: -0.4 }, { delay: delay });
      else if (el.classList.contains('rv-r')) biTween(el, { x: 48, opacity: 0, rotate: 0.4 }, { delay: delay });
      else { biTween(el, variantPool[vi % variantPool.length], { delay: delay }); vi++; }
    });
    // counters + stat bars (bidirectional: they run back down on leave)
    gsap.utils.toArray('.count').forEach(function(el){
      var to = parseInt(el.getAttribute('data-to'), 10) || 0;
      var obj = { v: 0 };
      gsap.to(obj, { v: to, duration: 1.1, ease: 'power2.out',
        onUpdate: function(){ el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    gsap.utils.toArray('.stat .bar').forEach(function(bar){
      var stat = bar.closest('.stat');
      var num = stat ? parseInt(stat.querySelector('.count').getAttribute('data-to'), 10) : 30;
      gsap.to(bar, { height: (20 + (num / 60) * 64) + 'px', duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: bar, start: 'top 94%', once: true } });
    });
    // parallax (scrub-linked): story photo, rate card, generic [data-plx]
    var storyImg = document.querySelector('.story-photo img.plx');
    if (storyImg) gsap.to(storyImg, { yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.story-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
    var rateCard = document.querySelector('.rate-card');
    if (rateCard && document.querySelector('.hero')) gsap.to(rateCard, { y: -26, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.utils.toArray('[data-plx]').forEach(function(img){
      gsap.to(img, { yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: img.closest('figure') || img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // card tilt (desktop pointers only)
    if (fine){
      document.querySelectorAll('.card').forEach(function(card){
        var qx = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3.out' });
        var qy = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3.out' });
        card.addEventListener('pointermove', function(e){
          var r = card.getBoundingClientRect();
          qx(((e.clientX - r.left) / r.width - 0.5) * 7);
          qy(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        card.addEventListener('pointerleave', function(){ qx(0); qy(0); });
      });
      // magnetic buttons
      document.querySelectorAll('.btn').forEach(function(btn){
        var mx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
        var my = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
        btn.addEventListener('pointermove', function(e){
          var r = btn.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.22);
          my((e.clientY - r.top - r.height / 2) * 0.3);
        });
        btn.addEventListener('pointerleave', function(){ mx(0); my(0); });
      });
    }
    // sticky call bar slides in after the hero
    var sb = document.querySelector('.stickybar');
    if (sb) ScrollTrigger.create({ start: 420, end: 'max', toggleClass: { targets: sb, className: 'show' } });
    // FAQ accordion motion
    document.querySelectorAll('.faq-list details').forEach(function(d){
      var sum = d.querySelector('summary'), p = d.querySelector('p');
      if (!sum || !p) return;
      sum.addEventListener('click', function(e){
        e.preventDefault();
        if (d.open){
          gsap.to(p, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut',
            onComplete: function(){ d.open = false; p.style.height = ''; p.style.opacity = ''; } });
        } else {
          d.open = true;
          gsap.fromTo(p, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.42, ease: 'power3.out' });
        }
      });
    });
    // v5 hardening: positions measured before fonts/images settle caused stuck
    // pre-hidden sections in v4 — re-measure once everything has loaded.
    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
    setTimeout(function(){ ScrollTrigger.refresh(); }, 2600);

  }
})();

/* cursor companion: butterfly (titli) flutters after the cursor — inner pages */
(function(){
  var cf = document.getElementById('cursorFly');
  if (!cf) return;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;
  var tx = -200, ty = -200, cx = -200, cy = -200, shown = false, t0 = performance.now();
  window.addEventListener('pointermove', function(e){
    tx = e.clientX; ty = e.clientY;
    if (!shown){ shown = true; cx = tx; cy = ty; cf.classList.add('live'); }
  }, { passive: true });
  document.addEventListener('pointerleave', function(){ shown = false; cf.classList.remove('live'); });
  (function follow(){
    requestAnimationFrame(follow);
    cx += (tx - cx) * 0.13; cy += (ty - cy) * 0.13;
    var bt = (performance.now() - t0) / 1000;
    var bob = Math.sin(bt * 5.2) * 4;
    var tilt = Math.max(-16, Math.min(16, (tx - cx) * 0.12));
    cf.style.transform = 'translate(' + (cx + 16) + 'px,' + (cy + 12 + bob) + 'px) rotate(' + tilt + 'deg)';
  })();
})();
