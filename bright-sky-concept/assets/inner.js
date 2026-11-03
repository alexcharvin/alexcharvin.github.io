
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
    itl.from('.nav', { y: -26, opacity: 0, duration: 0.9 }, 0.1)
       .from('.ihead .crumbs, .ihead .label', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.25)
       .from('.ih1 .line > span', { yPercent: 115, duration: 1.05, stagger: 0.1 }, 0.35)
       .from('.ilead', { y: 20, opacity: 0, duration: 0.7 }, 0.7)
       .from('.ihead .truststrip span', { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 }, 0.8)
       .from('.himg', { x: 44, opacity: 0, duration: 0.9 }, 0.6);

    // section reveals
    gsap.utils.toArray('.rv, .rv-l, .rv-r').forEach(function(el){
      var x = el.classList.contains('rv-l') ? -40 : (el.classList.contains('rv-r') ? 40 : 0);
      gsap.fromTo(el, { opacity: 0, y: 34, x: x }, {
        opacity: 1, y: 0, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    // safety: never leave in-view content hidden
    setTimeout(function(){
      document.querySelectorAll('.rv, .rv-l, .rv-r').forEach(function(el){
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && parseFloat(getComputedStyle(el).opacity) < 0.05){
          gsap.set(el, { opacity: 1, y: 0, x: 0 });
        }
      });
    }, 4000);

    // counters + stat bars
    gsap.utils.toArray('.count').forEach(function(el){
      var to = parseInt(el.getAttribute('data-to'), 10) || 0;
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function(){
          gsap.to(obj, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: function(){ el.textContent = Math.round(obj.v); } });
        }
      });
    });
    gsap.utils.toArray('.stat .bar').forEach(function(bar){
      var stat = bar.closest('.stat');
      var num = stat ? parseInt(stat.querySelector('.count').getAttribute('data-to'), 10) : 30;
      gsap.to(bar, { height: (20 + (num / 60) * 64) + 'px', duration: 1.3, ease: 'power3.out',
        scrollTrigger: { trigger: bar, start: 'top 92%', once: true } });
    });

    // parallax: any [data-plx] image drifts inside its frame
    gsap.utils.toArray('[data-plx]').forEach(function(img){
      gsap.to(img, { yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: img.closest('figure') || img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // service card tilt (desktop pointers only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      document.querySelectorAll('.card').forEach(function(card){
        var qx = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        var qy = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        card.addEventListener('pointermove', function(e){
          var r = card.getBoundingClientRect();
          qx(((e.clientX - r.left) / r.width - 0.5) * 7);
          qy(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        card.addEventListener('pointerleave', function(){ qx(0); qy(0); });
      });
    }
  }
})();
