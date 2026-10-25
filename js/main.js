(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
  };
  closeMenu();
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 1201px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  const reveals = document.querySelectorAll('.reveal, .steps, .hero-stage');
  let revealObserver;
  if ('IntersectionObserver' in window) {
    if (!motion.matches) root.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    reveals.forEach(element => revealObserver.observe(element));
    const sections = [...document.querySelectorAll('main > section[id]')];
    const activeSections = new Map();
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-menu a:not(.button)');
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting));
      const active = sections.find(section => activeSections.get(section.id));
      navLinks.forEach(link => {
        if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    sections.forEach(section => activeObserver.observe(section));
  }
  const stage = document.querySelector('.hero-stage');
  const finePointer = window.matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
  let frame = 0;
  const resetParallax = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    stage.style.removeProperty('--px');
    stage.style.removeProperty('--py');
    stage.style.removeProperty('--rx');
    stage.style.removeProperty('--ry');
  };
  stage.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches || event.pointerType === 'touch') {
      resetParallax();
      return;
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = stage.getBoundingClientRect();
      const x = Math.max(-0.5, Math.min(0.5, (event.clientX - box.left) / box.width - 0.5));
      const y = Math.max(-0.5, Math.min(0.5, (event.clientY - box.top) / box.height - 0.5));
      stage.style.setProperty('--px', x * 9 + 'px');
      stage.style.setProperty('--py', y * 7 + 'px');
      stage.style.setProperty('--rx', -y * 3 + 'deg');
      stage.style.setProperty('--ry', x * 4 + 'deg');
    });
  });
  stage.addEventListener('pointerleave', resetParallax);
  stage.addEventListener('pointercancel', resetParallax);
  finePointer.addEventListener('change', resetParallax);
  window.addEventListener('blur', resetParallax);
  motion.addEventListener('change', () => {
    resetParallax();
    if (motion.matches) {
      root.classList.remove('motion-ready');
      reveals.forEach(element => element.classList.add('is-visible'));
      if (revealObserver) revealObserver.disconnect();
    }
  });

  const form = document.querySelector('#sample-form');
  const fields = [...form.querySelectorAll('input, select')];
  const status = document.querySelector('#form-status');
  const fallback = document.querySelector('#mailto-fallback');
  const errors = {
    'first-name': 'Indiquez votre prénom.',
    email: 'Indiquez une adresse e-mail valide, par exemple vous@exemple.fr.',
    profession: 'Sélectionnez votre métier.',
    niche: 'Indiquez les commerces que vous souhaitez cibler.',
    city: 'Indiquez votre ville de prospection.'
  };
  const validate = field => {
    const valid = field.value.trim() !== '' && field.validity.valid;
    document.getElementById(field.id + '-error').textContent = valid ? '' : errors[field.id];
    if (valid) field.removeAttribute('aria-invalid');
    else field.setAttribute('aria-invalid', 'true');
    return valid;
  };
  fields.forEach(field => {
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validate(field);
      status.textContent = '';
      fallback.hidden = true;
    });
    field.addEventListener('change', () => {
      if (field.hasAttribute('aria-invalid')) validate(field);
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    fields.forEach(field => { field.value = field.value.trim(); });
    const invalid = fields.filter(field => !validate(field));
    fallback.hidden = true;
    status.classList.toggle('is-error', invalid.length > 0);
    if (invalid.length) {
      status.textContent = 'Vérifiez les champs indiqués avant de préparer votre demande.';
      invalid[0].focus();
      return;
    }
    const values = Object.fromEntries(fields.map(field => [field.id, field.value]));
    const subject = 'Mes 3 prospects gratuits Leadoly';
    const body = `Bonjour Sébastien,\r\n\r\nJe souhaite recevoir mes 3 prospects gratuits Leadoly.\r\n\r\nPrénom : ${values['first-name']}\r\nE-mail : ${values.email}\r\nMétier : ${values.profession}\r\nNiche : ${values.niche}\r\nVille : ${values.city}\r\n\r\nMerci et à bientôt !`;
    const mailto = 'mailto:sebastien.kothe.pro@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    fallback.href = mailto;
    fallback.hidden = false;
    status.textContent = 'Votre demande est prête. Envoyez-la depuis votre messagerie pour la transmettre. Si rien ne s’ouvre, utilisez le lien ci-dessous ou écrivez à sebastien.kothe.pro@gmail.com.';
    window.location.href = mailto;
  });
  form.noValidate = true;

  const legal = document.querySelector('#mentions');
  const legalLink = document.querySelector('#legal-link');
  const legalClose = document.querySelector('.legal-close');
  const syncLegal = () => {
    legal.hidden = window.location.hash !== '#mentions';
    legalLink.setAttribute('aria-expanded', String(!legal.hidden));
  };
  legalLink.setAttribute('aria-controls', 'mentions');
  legalClose.hidden = false;
  syncLegal();
  window.addEventListener('hashchange', syncLegal);
  legalLink.addEventListener('click', () => {
    legal.hidden = false;
    legalLink.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => document.querySelector('#legal-title').focus({ preventScroll: true }));
  });
  legalClose.addEventListener('click', () => {
    legal.hidden = true;
    legalLink.setAttribute('aria-expanded', 'false');
    if (window.location.hash === '#mentions') history.replaceState(null, '', window.location.pathname + window.location.search);
    legalLink.focus({ preventScroll: true });
  });
})();
