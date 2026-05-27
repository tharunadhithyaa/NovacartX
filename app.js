/* ============================================================
   NovaCartX — Main Application JavaScript
   Handles: Cart, Wishlist, Theme, Search, Filters, Toast,
            Scroll animations, Product rendering, Auth UI
   ============================================================ */

'use strict';

/* ── Utilities ── */

// Show a toast notification
function showToast(message, type = 'success', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✅'}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 320);
}

// Generate star rating HTML
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// Format price
function formatPrice(n) {
  return '$' + Number(n).toFixed(2);
}

/* ── Loading Screen ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1700);
});

/* ── Theme Toggle ── */
const THEME_KEY = 'novacartx-theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

/* ── Cart Management ── */
const CART_KEY     = 'novacartx-cart';
const WISHLIST_KEY = 'novacartx-wishlist';

function getCart()     { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function getWishlist() { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
function saveCart(cart)         { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function saveWishlist(wishlist) { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }

// Add product to cart
function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${product.name} added to cart 🛒`, 'success');
}

// Remove from cart
function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  updateCartBadge();
  showToast('Item removed from cart', 'info');
}

// Update qty in cart
function updateCartQty(productId, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
}

// Get cart totals
function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
  const discount  = subtotal > 200 ? subtotal * 0.05 : 0;
  const total     = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total, count: cart.reduce((s, i) => s + i.qty, 0) };
}

// Update cart badge in navbar
function updateCartBadge() {
  const { count } = getCartTotals();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 400);
  });
}

// Wishlist toggle
function toggleWishlist(product) {
  const list = getWishlist();
  const idx  = list.findIndex(i => i.id === product.id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast(`Removed from wishlist`, 'info');
  } else {
    list.push(product);
    showToast(`${product.name} saved to wishlist ❤️`, 'success');
  }
  saveWishlist(list);
  updateWishlistBadge();
  return idx === -1; // true = now wishlisted
}

function isWishlisted(id) {
  return getWishlist().some(i => i.id === id);
}

function updateWishlistBadge() {
  document.querySelectorAll('.wishlist-badge').forEach(el => {
    el.textContent = getWishlist().length;
  });
}

/* ── Product Card Renderer ── */
function createProductCard(p) {
  const wishlisted = isWishlisted(p.id);
  const card = document.createElement('div');
  card.className = 'product-card scroll-reveal';
  card.dataset.id = p.id;

  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      <div class="product-actions">
        <button class="product-action-btn wishlist-btn ${wishlisted ? 'wishlisted' : ''}"
                title="Wishlist" data-id="${p.id}">
          ${wishlisted ? '❤️' : '🤍'}
        </button>
        <button class="product-action-btn quick-view-btn" title="Quick view" data-id="${p.id}">👁</button>
      </div>
    </div>
    <div class="product-info">
      <span class="product-cat">${p.category}</span>
      <a href="product.html?id=${p.id}" class="product-name">${p.name}</a>
      <div class="product-rating">
        <span class="stars">${renderStars(p.rating)}</span>
        <span class="rating-count">(${p.reviews.toLocaleString()})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${formatPrice(p.price)}</span>
        ${p.originalPrice ? `<span class="product-original">${formatPrice(p.originalPrice)}</span>` : ''}
        ${p.discount ? `<span class="product-discount">-${p.discount}%</span>` : ''}
      </div>
      <button class="product-add-btn" data-id="${p.id}">
        🛒 Add to Cart
      </button>
    </div>
  `;

  // Add to cart
  card.querySelector('.product-add-btn').addEventListener('click', () => {
    addToCart(p);
    const btn = card.querySelector('.product-add-btn');
    btn.textContent = '✅ Added!';
    setTimeout(() => { btn.innerHTML = '🛒 Add to Cart'; }, 1500);
  });

  // Wishlist
  card.querySelector('.wishlist-btn').addEventListener('click', function() {
    const now = toggleWishlist(p);
    this.classList.toggle('wishlisted', now);
    this.textContent = now ? '❤️' : '🤍';
  });

  // Quick view
  card.querySelector('.quick-view-btn').addEventListener('click', () => openQuickView(p));

  return card;
}

/* ── Quick Preview Modal ── */
function openQuickView(p) {
  const overlay = document.getElementById('quick-view-modal');
  if (!overlay) return;
  const content = overlay.querySelector('.modal-content');
  content.innerHTML = `
    <div class="modal-img">
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div style="padding:0.5rem 0;">
      <div class="detail-category">${p.category}</div>
      <h2 style="font-family:var(--font-head);font-size:1.4rem;font-weight:800;letter-spacing:-0.5px;margin:0.5rem 0;">${p.name}</h2>
      <div class="product-rating" style="margin-bottom:1rem;">
        <span class="stars">${renderStars(p.rating)}</span>
        <span class="rating-count">(${p.reviews.toLocaleString()} reviews)</span>
      </div>
      <div class="product-price-row" style="margin-bottom:1rem;">
        <span class="detail-price">${formatPrice(p.price)}</span>
        ${p.originalPrice ? `<span class="detail-original">${formatPrice(p.originalPrice)}</span>` : ''}
        ${p.discount ? `<span class="detail-discount-tag">-${p.discount}%</span>` : ''}
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.65;margin-bottom:1.5rem;">${p.description}</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="addToCart(window.__qv_product);showToast('Added to cart!','success');">
          🛒 Add to Cart
        </button>
        <a href="product.html?id=${p.id}" class="btn btn-outline">View Details</a>
      </div>
    </div>
  `;
  window.__qv_product = p;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ── Products Data Fetch ── */
let allProducts = [];

async function fetchProducts() {
  try {
    const res = await fetch('data/products.json');
    allProducts = await res.json();
    return allProducts;
  } catch (e) {
    console.error('Could not load products:', e);
    return [];
  }
}

/* ── Home Page ── */
async function initHomePage() {
  const featured = document.getElementById('featured-products');
  if (!featured) return;
  const products = await fetchProducts();
  const grid = featured.querySelector('.products-grid');
  if (!grid) return;

  products.filter(p => p.featured).forEach((p, i) => {
    const card = createProductCard(p);
    card.classList.add(`scroll-reveal-delay-${(i % 4) + 1}`);
    grid.appendChild(card);
  });
  initScrollReveal();
}

/* ── Products Page ── */
async function initProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const products = await fetchProducts();
  let filtered  = [...products];

  const countEl    = document.getElementById('products-count');
  const sortSel    = document.getElementById('sort-select');
  const searchInput = document.getElementById('search-input');
  const priceRange  = document.getElementById('price-range');
  const priceLabel  = document.getElementById('price-label');
  const filterBtns  = document.querySelectorAll('.filter-btn[data-cat]');

  let activeCategory = 'all';
  let maxPrice = 2000;

  function renderProducts() {
    grid.innerHTML = '';
    let list = [...filtered];

    // Sort
    const sort = sortSel ? sortSel.value : 'featured';
    if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (sort === 'rating')     list.sort((a,b) => b.rating - a.rating);
    if (sort === 'newest')     list.sort((a,b) => b.id - a.id);

    if (countEl) countEl.innerHTML = `Showing <strong>${list.length}</strong> products`;

    list.forEach((p, i) => {
      const card = createProductCard(p);
      card.classList.add(`scroll-reveal-delay-${(i % 4) + 1}`);
      grid.appendChild(card);
    });
    initScrollReveal();
  }

  function applyFilters() {
    filtered = products.filter(p => {
      const catOk   = activeCategory === 'all' || p.category === activeCategory;
      const priceOk = p.price <= maxPrice;
      const searchOk = !searchInput || p.name.toLowerCase().includes(searchInput.value.toLowerCase());
      return catOk && priceOk && searchOk;
    });
    renderProducts();
  }

  // Category filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      applyFilters();
    });
  });

  // Sort
  if (sortSel) sortSel.addEventListener('change', renderProducts);

  // Price range
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      maxPrice = Number(priceRange.value);
      if (priceLabel) priceLabel.textContent = formatPrice(maxPrice);
      applyFilters();
    });
  }

  // Search
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  // URL param category
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    activeCategory = catParam;
    const matchBtn = document.querySelector(`.filter-btn[data-cat="${catParam}"]`);
    if (matchBtn) { filterBtns.forEach(b => b.classList.remove('active')); matchBtn.classList.add('active'); }
  }

  applyFilters();
}

/* ── Product Detail Page ── */
async function initProductDetailPage() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const products = await fetchProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) { container.innerHTML = '<p class="text-muted text-center mt-3">Product not found.</p>'; return; }

  document.title = `${p.name} — NovaCartX`;

  // Gallery
  let currentImg = 0;
  const mainImg  = document.getElementById('gallery-main-img');
  const thumbs   = document.getElementById('gallery-thumbs');

  if (mainImg && thumbs) {
    mainImg.src = p.images[0];
    p.images.forEach((src, i) => {
      const t = document.createElement('div');
      t.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
      t.innerHTML = `<img src="${src}" alt="">`;
      t.addEventListener('click', () => {
        currentImg = i;
        mainImg.src = src;
        thumbs.querySelectorAll('.gallery-thumb').forEach((th, j) => th.classList.toggle('active', j === i));
      });
      thumbs.appendChild(t);
    });
  }

  // Info
  const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setHTML('detail-category',    p.category);
  setHTML('detail-title',       p.name);
  setHTML('detail-rating',      `<span class="stars">${renderStars(p.rating)}</span> <span>${p.rating}</span> <span class="rating-count">(${p.reviews.toLocaleString()} reviews)</span>`);
  setHTML('detail-price',       formatPrice(p.price));
  setHTML('detail-original',    p.originalPrice ? formatPrice(p.originalPrice) : '');
  setHTML('detail-discount',    p.discount ? `-${p.discount}%` : '');
  setHTML('detail-description', p.description);
  setHTML('detail-badge',       p.badge ? `<span class="product-badge" style="position:static;">${p.badge}</span>` : '');

  const specsEl = document.getElementById('detail-specs');
  if (specsEl && p.specs) {
    specsEl.innerHTML = p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('');
  }

  // Qty control
  let qty = 1;
  const qtyVal = document.getElementById('qty-val');
  document.getElementById('qty-minus')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); if (qtyVal) qtyVal.textContent = qty; });
  document.getElementById('qty-plus')?.addEventListener('click', () => { qty++; if (qtyVal) qtyVal.textContent = qty; });

  // Add to cart
  document.getElementById('detail-add-cart')?.addEventListener('click', () => addToCart(p, qty));

  // Wishlist
  const wBtn = document.getElementById('detail-wishlist');
  if (wBtn) {
    wBtn.textContent = isWishlisted(p.id) ? '❤️ Wishlisted' : '🤍 Wishlist';
    wBtn.addEventListener('click', () => {
      const now = toggleWishlist(p);
      wBtn.textContent = now ? '❤️ Wishlisted' : '🤍 Wishlist';
    });
  }

  // Related products
  const relGrid = document.getElementById('related-grid');
  if (relGrid) {
    const related = products.filter(pr => pr.category === p.category && pr.id !== p.id).slice(0, 4);
    related.forEach(rp => relGrid.appendChild(createProductCard(rp)));
    initScrollReveal();
  }
}

/* ── Cart Page ── */
function initCartPage() {
  const cartBody = document.getElementById('cart-items');
  if (!cartBody) return;

  function renderCart() {
    const cart = getCart();
    cartBody.innerHTML = '';

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <a href="products.html" class="btn btn-primary">Start Shopping</a>
        </div>`;
      updateSummary(0, 0, 0, 0);
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div>
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-controls" style="margin-top:0.75rem;">
            <div class="qty-control">
              <button class="qty-btn" onclick="changeCartQty(${item.id}, -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="changeCartQty(${item.id}, 1)">+</button>
            </div>
            <span style="color:var(--text-muted);font-size:0.85rem;">
              = ${formatPrice(item.price * item.qty)}
            </span>
            <button class="cart-remove-btn" onclick="removeItem(${item.id})">🗑 Remove</button>
          </div>
        </div>
        <div></div>
      `;
      cartBody.appendChild(row);
    });

    const { subtotal, shipping, discount, total } = getCartTotals();
    updateSummary(subtotal, shipping, discount, total);
  }

  function updateSummary(sub, ship, disc, tot) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('summary-subtotal', formatPrice(sub));
    set('summary-shipping', ship === 0 ? 'FREE' : formatPrice(ship));
    set('summary-discount', disc > 0 ? `-${formatPrice(disc)}` : '$0.00');
    set('summary-total',    formatPrice(tot));
    const itemCount = getCart().reduce((s,i) => s+i.qty, 0);
    const cTitle = document.querySelector('.cart-section-title');
    if (cTitle) cTitle.textContent = `Cart (${itemCount} items)`;
  }

  // Expose to inline handlers
  window.changeCartQty = function(id, delta) {
    updateCartQty(id, delta);
    renderCart();
    updateCartBadge();
  };
  window.removeItem = function(id) {
    removeFromCart(id);
    renderCart();
  };

  renderCart();
}

/* ── Checkout Page ── */
function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Populate order summary
  const summaryList = document.getElementById('checkout-summary-items');
  if (summaryList) {
    const cart = getCart();
    cart.forEach(item => {
      const li = document.createElement('div');
      li.className = 'summary-row';
      li.innerHTML = `<span>${item.name} ×${item.qty}</span><span>${formatPrice(item.price * item.qty)}</span>`;
      summaryList.appendChild(li);
    });
    const { subtotal, shipping, discount, total } = getCartTotals();
    document.getElementById('co-subtotal').textContent  = formatPrice(subtotal);
    document.getElementById('co-shipping').textContent  = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('co-discount').textContent  = discount > 0 ? `-${formatPrice(discount)}` : '$0.00';
    document.getElementById('co-total').textContent     = formatPrice(total);
  }

  // Real-time validation
  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;
    const errEl = group.querySelector('.form-error');
    let valid = true; let msg = '';

    if (input.required && !input.value.trim()) {
      valid = false; msg = 'This field is required';
    } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false; msg = 'Enter a valid email address';
    } else if (input.dataset.min && input.value.length < Number(input.dataset.min)) {
      valid = false; msg = `Minimum ${input.dataset.min} characters`;
    }

    group.classList.toggle('has-error', !valid);
    input.classList.toggle('error',    !valid);
    input.classList.toggle('success',  valid && input.value.trim() !== '');
    if (errEl) errEl.textContent = msg;
    return valid;
  }

  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('.form-control[required]').forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Fake payment success
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;

    setTimeout(() => {
      saveCart([]);
      updateCartBadge();
      window.location.href = 'checkout.html?success=1';
    }, 2000);
  });

  // Show success state
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === '1') {
    const formSection = document.getElementById('checkout-form-section');
    const successSection = document.getElementById('checkout-success');
    if (formSection) formSection.style.display = 'none';
    if (successSection) {
      successSection.style.display = 'flex';
      const orderId = 'NVX-' + Math.random().toString(36).substring(2,8).toUpperCase();
      const orderEl = document.getElementById('order-id');
      if (orderEl) orderEl.textContent = orderId;
    }
  }
}

/* ── Auth Page ── */
function initAuthPage() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.form);
      if (target) target.classList.add('active');
    });
  });

  // Password toggle
  document.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
      else { input.type = 'password'; btn.textContent = '👁'; }
    });
  });

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value;
      const pass  = loginForm.querySelector('[name="password"]').value;
      if (!email || !pass) { showToast('Please fill in all fields', 'error'); return; }
      showToast('Logging in…', 'info');
      setTimeout(() => { showToast('Welcome back! 🎉', 'success'); }, 1200);
    });
  }

  // Register form
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const pass    = regForm.querySelector('[name="password"]').value;
      const confirm = regForm.querySelector('[name="confirm"]').value;
      if (pass !== confirm) { showToast('Passwords do not match', 'error'); return; }
      if (pass.length < 8)  { showToast('Password must be at least 8 characters', 'error'); return; }
      showToast('Creating your account…', 'info');
      setTimeout(() => { showToast('Account created! Welcome to NovaCartX 🚀', 'success'); }, 1400);
    });
  }
}

/* ── Contact Page ── */
function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '⏳ Sending…';
    btn.disabled = true;
    setTimeout(() => {
      showToast('Message sent successfully! We\'ll reply within 24hrs 📬', 'success');
      form.reset();
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }, 1500);
  });
}

/* ── Newsletter ── */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input?.value) { showToast('Please enter your email', 'error'); return; }
      showToast('You\'re subscribed! 🎉 Welcome to the future.', 'success');
      input.value = '';
    });
  });
}

/* ── Navbar Search ── */
function initNavSearch() {
  const input = document.getElementById('nav-search');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `products.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });

  // Pre-fill from URL on products page
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  if (search) {
    input.value = search;
    const productSearch = document.getElementById('search-input');
    if (productSearch) productSearch.value = search;
  }
}

/* ── Countdown Timer ── */
function initCountdown() {
  const els = {
    h: document.getElementById('countdown-hours'),
    m: document.getElementById('countdown-mins'),
    s: document.getElementById('countdown-secs'),
    d: document.getElementById('countdown-days')
  };
  if (!els.h) return;

  // Target: 2 days from now
  const target = Date.now() + 2 * 24 * 60 * 60 * 1000;

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.d) els.d.textContent = String(d).padStart(2,'0');
    els.h.textContent = String(h).padStart(2,'0');
    els.m.textContent = String(m).padStart(2,'0');
    els.s.textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal:not(.revealed)');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('revealed'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  } else {
    els.forEach(el => el.classList.add('revealed'));
  }
}

/* ── Modal Close handlers ── */
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
  });
}

/* ── Sidebar mobile toggle ── */
function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const content = document.getElementById('sidebar-content');
  if (!toggle || !content) return;
  toggle.addEventListener('click', () => content.classList.toggle('open'));
}

/* ── Wishlist Page ── */
function initWishlistPage() {
  const grid = document.getElementById('wishlist-grid');
  if (!grid) return;
  const list = getWishlist();
  if (list.length === 0) {
    grid.innerHTML = `<div class="wishlist-empty">
      <div class="cart-empty-icon">❤️</div>
      <h3 style="font-family:var(--font-head);font-size:1.4rem;margin-bottom:0.5rem;">No wishlist items yet</h3>
      <p style="color:var(--text-muted);margin-bottom:2rem;">Save products you love and come back to them later.</p>
      <a href="products.html" class="btn btn-primary">Browse Products</a>
    </div>`;
  } else {
    list.forEach(p => grid.appendChild(createProductCard(p)));
  }
}

/* ── Active nav link ── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page);
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateCartBadge();
  updateWishlistBadge();
  initNavSearch();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initModals();
  initNewsletter();
  initCountdown();
  initSidebarToggle();
  setActiveNav();

  // Page-specific
  initHomePage();
  initProductsPage();
  initProductDetailPage();
  initCartPage();
  initCheckoutPage();
  initAuthPage();
  initContactPage();
  initWishlistPage();

  // Theme toggle button
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // Reveal immediately visible elements
  setTimeout(initScrollReveal, 300);
});
