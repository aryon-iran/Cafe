/* =====================================================
   LUXE CAFÉ — Main JavaScript
   ===================================================== */

'use strict';

/* ====================== PRODUCTS DATA ====================== */
const products = {
  tea: {
    id: 'tea',
    img: 'tea.png',
    price: 45,
    time: '5 min',
    cal: '~50',
    fa: { name: 'چای ممتاز', category: 'نوشیدنی گرم', priceDisplay: '۴۵' },
    en: { name: 'Premium Tea', category: 'Hot Beverage', priceDisplay: '45' }
  },
  coffee: {
    id: 'coffee',
    img: 'Cafe.png',
    price: 75,
    time: '7 min',
    cal: '~80',
    fa: { name: 'قهوه دست‌ساز', category: 'قهوه', priceDisplay: '۷۵' },
    en: { name: 'Artisan Coffee', category: 'Espresso Bar', priceDisplay: '75' }
  },
  cake: {
    id: 'cake',
    img: 'Cake.png',
    price: 95,
    time: '3 min',
    cal: '~320',
    fa: { name: 'چیز کیک خانگی', category: 'دسر', priceDisplay: '۹۵' },
    en: { name: 'Cheesecake', category: 'Patisserie', priceDisplay: '95' }
  }
};

/* ====================== TRANSLATIONS ====================== */
const translations = {
  fa: {
    tagline: 'منوی اختصاصی',
    tea_cat: 'نوشیدنی گرم',
    tea_title: 'چای ممتاز',
    tea_title_fa: 'Premium Tea',
    tea_desc: 'برگزیده‌ای از چای‌های اصیل با عطری ماندگار، دم‌آوری شده در دمای دقیق برای تجربه‌ای ناب.',
    tea_price: '۴۵<small>هزار تومان</small>',
    coffee_cat: 'قهوه',
    coffee_title: 'قهوه دست‌ساز',
    coffee_title_fa: 'Artisan Coffee',
    coffee_desc: 'دانه‌های تازه برشته‌شده با پروفایل طعمی متعادل، استخراج شده برای کرمایی مخملی و عمیق.',
    coffee_price: '۷۵<small>هزار تومان</small>',
    cake_cat: 'دسر',
    cake_title: 'چیز کیک خانگی',
    cake_title_fa: 'Cheesecake',
    cake_desc: 'بافتی ابریشمی از پنیر خامه‌ای تازه، بر پایه بیسکویتی کرِه‌ای با لایه‌ای از سس اختصاصی.',
    cake_price: '۹۵<small>هزار تومان</small>'
  },
  en: {
    tagline: 'Signature Menu',
    tea_cat: 'Hot Beverage',
    tea_title: 'Premium Tea',
    tea_title_fa: 'چای ممتاز',
    tea_desc: 'A selection of fine teas with a lasting aroma, brewed at the precise temperature for a pure experience.',
    tea_price: '45<small>K Toman</small>',
    coffee_cat: 'Espresso Bar',
    coffee_title: 'Artisan Coffee',
    coffee_title_fa: 'قهوه دست‌ساز',
    coffee_desc: 'Freshly roasted beans with a balanced flavor profile, extracted for a velvety, deep crema.',
    coffee_price: '75<small>K Toman</small>',
    cake_cat: 'Patisserie',
    cake_title: 'Cheesecake',
    cake_title_fa: 'چیز کیک خانگی',
    cake_desc: 'Silky texture from fresh cream cheese on a buttery biscuit base with a signature sauce layer.',
    cake_price: '95<small>K Toman</small>'
  }
};

/* ====================== STATE ====================== */
let currentLang = localStorage.getItem('luxe_lang') || 'fa';
let cart = JSON.parse(localStorage.getItem('luxe_cart') || '[]');
let currentModalId = null;
let toastTimer = null;

/* ====================== UTILITIES ====================== */
function toPersianNum(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function formatNumber(n) {
  return currentLang === 'fa' ? toPersianNum(n) : n;
}

function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

/* ====================== TOAST ====================== */
function showToast(msg) {
  const toast = $('#toast');
  $('#toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ====================== LANGUAGE ====================== */
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('luxe_lang', lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  $('#langToggle').textContent = lang === 'fa' ? 'EN' : 'FA';

  // ترجمه همه المان‌ها
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });

  // ترجمه کارت‌ها (عنوان‌ها)
  $$('.menu-card').forEach(card => {
    const id = card.dataset.id;
    const product = products[id];
    if (!product) return;
    card.querySelector('.card-title').textContent = product[lang === 'fa' ? 'en' : 'fa'].name;
    // title-fa رو برعکس می‌ذاریم
    card.querySelector('.card-title-fa').textContent = product[lang].name;
  });

  // بروزرسانی سبد
  renderCart();
}

/* ====================== CART LOGIC ====================== */
function saveCart() {
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
}

function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  updateCartCount();
  renderCart();
  showToast(`«${products[id][currentLang].name}» ${currentLang === 'fa' ? 'به سبد اضافه شد' : 'added to cart'}`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = $('#cartCount');
  badge.textContent = formatNumber(total);
  badge.classList.toggle('show', total > 0);
}

function getCartTotal() {
  return cart.reduce((s, i) => s + products[i.id].price * i.qty, 0);
}

/* ====================== RENDER CART ====================== */
function renderCart() {
  const container = $('#cartItems');
  const totalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>${currentLang === 'fa' ? 'سبد خرید شما خالی است' : 'Your cart is empty'}</p>
      </div>`;
    totalEl.innerHTML = `${formatNumber(0)}<small>${currentLang === 'fa' ? 'تومان' : 'Toman'}</small>`;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = currentLang === 'fa' ? 'نهایی کردن سفارش' : 'Checkout';
    return;
  }

  let html = '';
  cart.forEach(item => {
    const p = products[item.id];
    const name = p[currentLang].name;
    const sub = p.price * item.qty;

    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.img}" alt="${name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${formatNumber(p.price)} ${currentLang === 'fa' ? 'هزار تومان' : 'K'}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-value">${formatNumber(item.qty)}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="حذف">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>`;
  });

  container.innerHTML = html;

  const total = getCartTotal();
  totalEl.innerHTML = `${formatNumber(total)}<small>${currentLang === 'fa' ? 'تومان' : 'Toman'}</small>`;
  checkoutBtn.disabled = false;
  checkoutBtn.textContent = currentLang === 'fa' ? 'نهایی کردن سفارش' : 'Checkout';
}

/* ====================== CART SIDEBAR ====================== */
function openCart() {
  $('#cartSidebar').classList.add('active');
  $('#cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartSidebar').classList.remove('active');
  $('#cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ====================== MODAL ====================== */
function openModal(id) {
  const p = products[id];
  if (!p) return;

  currentModalId = id;
  $('#modalImg').src = p.img;
  $('#modalImg').alt = p[currentLang].name;
  $('#modalCategory').textContent = p[currentLang].category.toUpperCase();
  $('#modalTitle').textContent = p[currentLang].name;
  $('#modalTitleFa').textContent = p[currentLang === 'fa' ? 'en' : 'fa'].name;

  // توضیحات از ترجمه گرفته می‌شه
  const descKey = `${id}_desc`;
  $('#modalDesc').textContent = translations[currentLang][descKey] || '';

  $('#modalTime').textContent = p.time;
  $('#modalCal').textContent = p.cal;
  $('#modalPrice').innerHTML = `${formatNumber(p.price)}<small>${currentLang === 'fa' ? 'هزار تومان' : 'K Toman'}</small>`;
  $('#modalAdd').textContent = currentLang === 'fa' ? 'افزودن به سفارش' : 'Add to Order';

  $('#modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  currentModalId = null;
}

/* ====================== PARTICLES ====================== */
function createParticles() {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 15 + 15) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    fragment.appendChild(p);
  }
  document.body.appendChild(fragment);
}

/* ====================== INTERSECTION OBSERVER ====================== */
function initCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$('.menu-card').forEach(c => observer.observe(c));
}

/* ====================== 3D TILT ====================== */
function init3DTilt() {
  if (window.innerWidth < 768) return;

  $$('.menu-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / rect.height) * -6;
      const ry = ((x - cx) / rect.width) * 6;
      card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
    });
  });
}

/* ====================== BG PARALLAX ====================== */
function initParallax() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.pageYOffset;
        const bg = $('.bg-layer');
        if (bg) bg.style.transform = `scale(1.1) translateY(${y * 0.3}px)`;
        $('#topBar').classList.toggle('scrolled', y > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ====================== AUDIO ====================== */
function initAudio() {
  const audio = $('#bgMusic');
  const fab = $('#audioFab');
  const icon = $('#audioIcon');

  const playIcon = `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`;
  const pauseIcon = `<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>`;

  fab.addEventListener('click', () => {
    if (audio.paused) {
      audio.volume = 0.3;
      audio.play().then(() => {
        fab.classList.add('playing');
        icon.innerHTML = pauseIcon;
        showToast(currentLang === 'fa' ? '♪ موسیقی پخش شد' : '♪ Music playing');
      }).catch(() => {
        showToast(currentLang === 'fa' ? 'فایل music.mp3 یافت نشد' : 'music.mp3 not found');
      });
    } else {
      audio.pause();
      fab.classList.remove('playing');
      icon.innerHTML = playIcon;
    }
  });
}

/* ====================== EVENT BINDINGS ====================== */
function bindEvents() {
  // زبان
  $('#langToggle').addEventListener('click', () => {
    const newLang = currentLang === 'fa' ? 'en' : 'fa';
    setLanguage(newLang);
    showToast(newLang === 'fa' ? 'زبان: فارسی' : 'Language: English');
  });

  // سبد خرید
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', closeCart);

  // نهایی کردن سفارش
  $('#checkoutBtn').addEventListener('click', () => {
    showToast(currentLang === 'fa' ? '✓ سفارش شما ثبت شد. سپاسگزاریم!' : '✓ Order placed. Thank you!');
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    setTimeout(closeCart, 800);
  });

  // دکمه‌های سبد (event delegation)
  $('#cartItems').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'inc') changeQty(id, 1);
    if (action === 'dec') changeQty(id, -1);
    if (action === 'remove') removeFromCart(id);
  });

  // مودال
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  $('#modalAdd').addEventListener('click', () => {
    if (currentModalId) {
      addToCart(currentModalId);
      closeModal();
    }
  });

  // کارت‌ها — باز کردن مودال
  $$('.menu-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.order-btn')) return;
      openModal(card.dataset.id);
    });
  });

  // دکمه سفارش سریع
  $$('.order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.menu-card');
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => btn.style.transform = '', 200);
      addToCart(card.dataset.id);
    });
  });

  // کیبورد
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
  });
}

/* ====================== LOADER ====================== */
function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader').classList.add('hidden');
    }, 2400);
  });
}

/* ====================== INIT ====================== */
function init() {
  createParticles();
  setLanguage(currentLang);
  updateCartCount();
  renderCart();
  initCardAnimations();
  init3DTilt();
  initParallax();
  initAudio();
  bindEvents();
  initLoader();
}

document.addEventListener('DOMContentLoaded', init);