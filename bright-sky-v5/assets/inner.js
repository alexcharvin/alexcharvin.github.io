
(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;

  /* Land on the hero: Chrome's scroll restoration used to drop returning
     visitors mid-page, where the car arrival had already played unseen.
     An explicit anchor (#reviews etc.) still wins. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (document.getElementById('gl')){
    var hashTgt = null;
    try { hashTgt = location.hash.length > 1 ? document.querySelector(location.hash) : null; } catch(e){}
    if (hashTgt) setTimeout(function(){ hashTgt.scrollIntoView(); }, 80);
    else window.scrollTo(0, 0);
  }

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

  /* ---------------- custom Service Type dropdown ----------------
     The native <select> popup rendered white with white option text on it
     (options invisible). This styled replacement keeps a hidden input with
     id f-service, so the WhatsApp submit above reads the value as before. */
  document.querySelectorAll('[data-csel]').forEach(function(box){
    var btn = box.querySelector('.csel-btn'), list = box.querySelector('.csel-list'),
        valEl = box.querySelector('.csel-val'), hidden = box.querySelector('input[type="hidden"]'),
        items = Array.prototype.slice.call(list.querySelectorAll('[role="option"]')), act = -1;
    function setAct(i){
      act = (i + items.length) % items.length;
      items.forEach(function(li, k){ li.classList.toggle('act', k === act); });
      if (items[act]) items[act].scrollIntoView({ block: 'nearest' });
    }
    function open(){
      if (!list.hidden) return;
      list.hidden = false; box.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      var cur = -1;
      items.forEach(function(li, k){ if (li.getAttribute('aria-selected') === 'true') cur = k; });
      setAct(cur < 0 ? 0 : cur);
    }
    function close(){
      if (list.hidden) return;
      list.hidden = true; box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }
    function pick(li){
      items.forEach(function(o){ o.setAttribute('aria-selected', o === li ? 'true' : 'false'); });
      hidden.value = li.getAttribute('data-v');
      valEl.textContent = li.getAttribute('data-v');
      close(); btn.focus();
    }
    btn.addEventListener('click', function(){ if (list.hidden) open(); else close(); });
    items.forEach(function(li){ li.addEventListener('click', function(){ pick(li); }); });
    document.addEventListener('click', function(e){ if (!box.contains(e.target)) close(); });
    box.addEventListener('keydown', function(e){
      if (e.key === 'Escape'){ close(); btn.focus(); }
      else if (e.key === 'ArrowDown'){ e.preventDefault(); if (list.hidden) open(); else setAct(act + 1); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); if (list.hidden) open(); else setAct(act - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && !list.hidden && act >= 0){ e.preventDefault(); pick(items[act]); }
      else if (e.key === 'Home' && !list.hidden){ e.preventDefault(); setAct(0); }
      else if (e.key === 'End' && !list.hidden){ e.preventDefault(); setAct(items.length - 1); }
      else if (!list.hidden && e.key.length === 1){
        var c = e.key.toLowerCase();
        for (var i = 0; i < items.length; i++){
          var j = (act + 1 + i) % items.length;
          if (items[j].getAttribute('data-v').toLowerCase().indexOf(c) === 0){ setAct(j); break; }
        }
      }
    });
  });

  /* ---------------- ambient animated background (every page) ----------------
     A fixed canvas behind the content: three soft sage light ribbons
     flowing across and dust motes rising — no grid lines anywhere (the
     squares read as graph paper on a real screen). Sections sit on
     translucent deep green, so it ghosts through — present, never loud.
     through — present everywhere, never loud enough to hurt reading.
     Reduced motion gets one still frame. */
  (function(){
    var cv = document.getElementById('ambg');
    if (!cv) return;
    var cx2 = cv.getContext('2d');
    if (!cx2) return;
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 1.5), P = [], i;
    function size(){
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cx2.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size(); window.addEventListener('resize', size);
    for (i = 0; i < 42; i++) P.push({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.7, v: 0.02 + Math.random() * 0.05, o: 0.05 + Math.random() * 0.15 });
    var ORB = [], OC = ['142,182,155', '218,241,222', '142,182,155'];
    for (i = 0; i < 7; i++) ORB.push({ x: Math.random(), y: Math.random(), r: 60 + Math.random() * 120, v: 0.008 + Math.random() * 0.016, ph: Math.random() * 6.2832, o: 0.05 + Math.random() * 0.05, c: OC[i % 3] });
    function frame(t){
      cx2.clearRect(0, 0, W, H);
      ORB.forEach(function(o){
        var ox = o.x * W + Math.sin(t * 0.00011 + o.ph) * 26, oy = o.y * H;
        var og = cx2.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        og.addColorStop(0, 'rgba(' + o.c + ',' + o.o + ')');
        og.addColorStop(1, 'rgba(' + o.c + ',0)');
        cx2.fillStyle = og;
        cx2.beginPath(); cx2.arc(ox, oy, o.r, 0, 6.2832); cx2.fill();
      });
      if (!reduced){
        var sw = t % 11000;
        if (sw < 3000){
          var spp = sw / 3000, sx = -W * 0.35 + W * 1.7 * spp;
          var sa = Math.sin(spp * Math.PI) * 0.055;
          cx2.save();
          cx2.translate(sx, H / 2); cx2.rotate(-0.42);
          var sg = cx2.createLinearGradient(-190, 0, 190, 0);
          sg.addColorStop(0, 'rgba(218,241,222,0)');
          sg.addColorStop(0.5, 'rgba(218,241,222,' + sa + ')');
          sg.addColorStop(1, 'rgba(218,241,222,0)');
          cx2.fillStyle = sg; cx2.fillRect(-190, -H * 0.75, 380, H * 1.5);
          cx2.restore();
        }
      }
      var k, px;
      for (k = 0; k < 3; k++){
        var baseY = H * (0.22 + k * 0.27), amp = 24 + k * 10;
        var gr = cx2.createLinearGradient(0, 0, W, 0);
        gr.addColorStop(0, 'rgba(142,182,155,0)');
        gr.addColorStop(0.3, 'rgba(142,182,155,0.10)');
        gr.addColorStop(0.62, 'rgba(218,241,222,0.15)');
        gr.addColorStop(1, 'rgba(142,182,155,0)');
        cx2.strokeStyle = gr; cx2.lineWidth = 2; cx2.beginPath();
        for (px = 0; px <= W; px += 14){
          var py = baseY + Math.sin(px * 0.004 + t * 0.0004 + k * 2.1) * amp + Math.sin(px * 0.0013 - t * 0.00023 + k) * amp * 0.6;
          if (px === 0) cx2.moveTo(px, py); else cx2.lineTo(px, py);
        }
        cx2.stroke();
      }
      P.forEach(function(p){
        cx2.beginPath(); cx2.arc(p.x * W, p.y * H, p.s, 0, 6.2832);
        cx2.fillStyle = 'rgba(218,241,222,' + p.o + ')'; cx2.fill();
      });
    }
    if (reduced){ frame(1400); return; }
    (function loop(t){
      requestAnimationFrame(loop);
      if (document.hidden) return;
      frame(t || 0);
      P.forEach(function(p){
        p.y -= p.v * 0.0016; p.x -= p.v * 0.0006;
        if (p.y < -0.02){ p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
      });
      ORB.forEach(function(o){
        o.y -= o.v * 0.004;
        if (o.y < -0.28){ o.y = 1.28; o.x = Math.random(); }
      });
    })(0);
  })();

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
    // stats stage: exploded view as stepped stills (was a WebGL scene —
    // the frame sequence, phase labels and stat spotlight are scroll-
    // scrubbed here, so the section works on every machine, WebGL or not;
    // without GSAP the stage simply shows the parked car frame)
    var sframes = document.querySelectorAll('#stageFrames .sframe');
    var stageEl = document.getElementById('xstage');
    if (stageEl && sframes.length){
      var sWrap = document.getElementById('stageFrames');
      var sLabels = {
        engine: stageEl.querySelector('[data-phase="engine"]'),
        wheel: stageEl.querySelector('[data-phase="wheel"]'),
        brake: stageEl.querySelector('[data-phase="brake"]')
      };
      var statsEls = Array.prototype.slice.call(document.querySelectorAll('#statsGrid .stat'));
      var SEQ = [0, 1, 2, 1, 3, 4, 1, 0];
      var curF = 0, sLit = -1;
      function showFrame(idx){
        if (idx === curF) return;
        sframes[curF].classList.remove('on'); sframes[idx].classList.add('on'); curF = idx;
      }
      function setLabel(el, on){
        if (el) gsap.to(el, { autoAlpha: on ? 1 : 0, duration: 0.3, overwrite: 'auto' });
      }
      function sSpot(p){
        var idx = Math.min(3, Math.floor(p * 4));
        if (idx === sLit) return;
        sLit = idx;
        statsEls.forEach(function(el, i){
          el.classList.toggle('lit', i === idx);
          gsap.to(el, { scale: i === idx ? 1.14 : 1, duration: 0.45, ease: 'power3.out' });
        });
      }
      gsap.timeline({ scrollTrigger: { trigger: '#stagePin', start: 'top 96px', end: '+=1700', scrub: 0.5, pin: true, anticipatePin: 1,
        onUpdate: function(self){
          var p = self.progress;
          sSpot(p);
          showFrame(SEQ[Math.min(7, Math.floor(p * 8))]);
          setLabel(sLabels.engine, p > 0.22 && p < 0.48);
          setLabel(sLabels.wheel, p > 0.50 && p < 0.64);
          setLabel(sLabels.brake, p > 0.63 && p < 0.80);
          var tx = 0;
          if (p < 0.125) tx = -38 * (1 - p / 0.125);
          else if (p > 0.875) tx = 38 * ((p - 0.875) / 0.125);
          gsap.set(sWrap, { x: tx });
        } } });
    }
    // parallax (scrub-linked): story photo, rate card, generic [data-plx]
    var storyImg = document.querySelectorAll('#wslides .slide');
    if (storyImg.length) gsap.to(storyImg, { yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.story-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
    var rateCard = document.querySelector('.rate-card');
    if (rateCard && document.querySelector('.hero')) gsap.to(rateCard, { y: -26, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.utils.toArray('[data-plx]').forEach(function(img){
      gsap.to(img, { yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: img.closest('figure') || img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // card tilt + glare (desktop pointers only): services, packages, reviews, brands
    if (fine){
      document.querySelectorAll('.card, .pkg, .testi, .bthumb, .bfeat').forEach(function(card){
        gsap.set(card, { transformPerspective: 950 });
        var qx = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        var qy = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        card.addEventListener('pointermove', function(e){
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          qx((px - 0.5) * 7); qy(-(py - 0.5) * 7);
          card.style.setProperty('--gx', (px * 100) + '%');
          card.style.setProperty('--gy', (py * 100) + '%');
          card.style.setProperty('--gl', 1);
        });
        card.addEventListener('pointerleave', function(){ qx(0); qy(0); card.style.setProperty('--gl', 0); });
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
