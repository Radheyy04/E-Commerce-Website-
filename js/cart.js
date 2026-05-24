/**
 * RV Store — Cart Module
 * Manages cart state in localStorage and renders cart drawer
 */

const RVCart = (() => {
  const STORAGE_KEY = 'rv_cart';

  /* ---- State ---- */
  let cart = [];

  function load() {
    try {
      cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      cart = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ---- Public API ---- */

  function addItem(product) {
    load();
    const existing = cart.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    save();
    updateNavCount();
    renderDrawer();
    showToast(`${product.name} added to cart`);
    openCart();
  }

  function removeItem(id, size) {
    load();
    cart = cart.filter(i => !(i.id === id && i.size === size));
    save();
    updateNavCount();
    renderDrawer();
  }

  function changeQty(id, size, delta) {
    load();
    const item = cart.find(i => i.id === id && i.size === size);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => !(i.id === id && i.size === size));
    }
    save();
    updateNavCount();
    renderDrawer();
  }

  function getTotal() {
    load();
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    load();
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  /* ---- UI ---- */

  function updateNavCount() {
    document.querySelectorAll('.rv-cart-count').forEach(el => {
      el.textContent = getCount();
    });
  }

  function openCart() {
    document.querySelector('.rv-cart-overlay')?.classList.add('active');
    document.querySelector('.rv-cart-drawer')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.querySelector('.rv-cart-overlay')?.classList.remove('active');
    document.querySelector('.rv-cart-drawer')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    load();
    const container = document.querySelector('.rv-cart-items');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="rv-cart-empty">
          <i class="bi bi-bag d-block"></i>
          <p class="mt-2 mb-0">Your cart is empty</p>
          <a href="index.html" class="btn-rv-dark d-inline-block mt-3" style="padding:0.5rem 1.2rem;border-radius:4px;font-size:0.78rem;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;background:#111;color:#fff;border:2px solid #111;text-decoration:none;">
            Continue Shopping
          </a>
        </div>`;
    } else {
      container.innerHTML = cart.map(item => `
        <div class="rv-cart-item">
          <img src="${item.img}" alt="${item.name}" class="rv-cart-item-img" />
          <div class="rv-cart-item-info">
            <div class="rv-cart-item-name">${item.name}</div>
            <div class="rv-cart-item-price">$${item.price.toFixed(2)}${item.size ? ` · Size: ${item.size}` : ''}</div>
            <div class="rv-cart-qty mt-1">
              <button class="rv-qty-btn" onclick="RVCart.changeQty('${item.id}','${item.size}',-1)">−</button>
              <span class="rv-qty-value">${item.qty}</span>
              <button class="rv-qty-btn" onclick="RVCart.changeQty('${item.id}','${item.size}',1)">+</button>
            </div>
          </div>
          <button class="rv-cart-item-remove ms-auto" onclick="RVCart.removeItem('${item.id}','${item.size}')" title="Remove">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      `).join('');
    }

    const totalEl = document.querySelector('.rv-cart-total-amount');
    if (totalEl) totalEl.textContent = `$${getTotal().toFixed(2)}`;

    const checkoutBtn = document.querySelector('.rv-checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
  }

  let toastTimer;
  function showToast(msg) {
    let toast = document.querySelector('.rv-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'rv-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function injectCartUI() {
    if (document.querySelector('.rv-cart-drawer')) return;

    const overlay = document.createElement('div');
    overlay.className = 'rv-cart-overlay';
    overlay.addEventListener('click', closeCart);

    const drawer = document.createElement('div');
    drawer.className = 'rv-cart-drawer';
    drawer.innerHTML = `
      <div class="rv-cart-header">
        <h5>Your Cart <span class="rv-cart-count-header text-muted" style="font-size:0.85rem;font-weight:400;font-family:'DM Sans',sans-serif;"></span></h5>
        <button class="rv-cart-close" onclick="RVCart.closeCart()">×</button>
      </div>
      <div class="rv-cart-items"></div>
      <div class="rv-cart-footer">
        <div class="rv-cart-total">
          <span>Total</span>
          <span class="rv-cart-total-amount">$0.00</span>
        </div>
        <button class="btn-rv-dark w-100 rv-checkout-btn" style="padding:0.7rem;border-radius:4px;font-size:0.85rem;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;background:#111;color:#fff;border:2px solid #111;cursor:pointer;transition:all 0.3s;" disabled onclick="alert('Checkout coming soon!')">
          Checkout
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Wire up cart buttons in navbar
    document.querySelectorAll('.rv-open-cart').forEach(btn => {
      btn.addEventListener('click', e => { e.preventDefault(); openCart(); });
    });

    renderDrawer();
    updateNavCount();
  }

  /* ---- Init ---- */
  function init() {
    load();
    document.addEventListener('DOMContentLoaded', () => {
      injectCartUI();
      updateNavCount();
    });
  }

  init();

  return { addItem, removeItem, changeQty, openCart, closeCart, getCount, showToast };
})();
