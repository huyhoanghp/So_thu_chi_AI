// --- POINT OF SALE (POS) SALES SYSTEM MODULE ---

window.cart = [];

// Render Product List in POS Grid
window.renderPOSProducts = function() {
    const posProductGrid = document.getElementById('pos-product-grid');
    const posEmptyState = document.getElementById('pos-empty-state');
    const searchPosInput = document.getElementById('search-pos-products');
    if (!posProductGrid) return;

    const term = (searchPosInput?.value || '').toLowerCase().trim();
    const source = window.products.filter(p => {
        if (!term) return true;
        return p.name.toLowerCase().includes(term);
    });

    posProductGrid.innerHTML = '';
    if (posEmptyState) {
        posEmptyState.style.display = source.length === 0 ? 'block' : 'none';
    }

    source.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md';
        
        const isOutOfStock = product.stock <= 0;
        const stockColor = product.stock > 10 ? 'text-emerald-600 dark:text-emerald-500' : (product.stock > 0 ? 'text-amber-500' : 'text-rose-600 dark:text-rose-500');
        
        div.innerHTML = `
            <div>
                <div class="h-28 w-full bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <h4 class="font-bold text-slate-850 dark:text-slate-200 text-sm line-clamp-2">${product.name}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Tồn kho: <span class="${stockColor} font-semibold">${product.stock}</span></p>
            </div>
            <div class="mt-4 flex items-center justify-between gap-2">
                <span class="text-emerald-650 dark:text-emerald-400 font-extrabold text-base">${window.formatCurrency(product.sellingPrice)}</span>
                <button class="bg-brand-600 hover:bg-brand-700 text-white font-bold p-2 rounded-xl transition flex items-center justify-center shadow-sm disabled:opacity-50" ${isOutOfStock ? 'disabled' : ''} title="Thêm vào giỏ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                </button>
            </div>
        `;

        div.querySelector('button').addEventListener('click', () => {
            window.addProductToCart(product);
        });

        posProductGrid.appendChild(div);
    });
};

// Add product to cart
window.addProductToCart = function(product) {
    const existing = window.cart.find(item => item.product.id === product.id);
    if (existing) {
        if (existing.quantity >= product.stock) {
            window.showToast(`Chỉ có ${product.stock} sản phẩm trong kho.`, "error");
            return;
        }
        existing.quantity += 1;
    } else {
        window.cart.push({ product, quantity: 1 });
    }
    window.renderCart();
};

// Update cart quantity
window.updateCartQuantity = function(productId, delta) {
    const item = window.cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity > item.product.stock && delta > 0) {
        window.showToast(`Chỉ có ${item.product.stock} sản phẩm trong kho.`, "error");
        item.quantity = item.product.stock;
    }

    if (item.quantity <= 0) {
        window.removeFromCart(productId);
    } else {
        window.renderCart();
    }
};

// Remove from cart
window.removeFromCart = function(productId) {
    window.cart = window.cart.filter(item => item.product.id !== productId);
    window.renderCart();
};

// Clear cart
window.clearCart = function() {
    window.cart = [];
    const customerNameInput = document.getElementById('pos-customer-name');
    const customerNoteInput = document.getElementById('pos-customer-note');
    if (customerNameInput) customerNameInput.value = '';
    if (customerNoteInput) customerNoteInput.value = '';
    window.renderCart();
};

// Calculate Cart totals with automatic promotions
window.calculateCart = function() {
    let subtotal = 0;
    let totalDiscount = 0;
    const now = new Date();

    const items = window.cart.map(item => {
        const itemSubtotal = item.product.sellingPrice * item.quantity;
        subtotal += itemSubtotal;

        // Auto check promotions
        const applicablePromos = (window.promotions || []).filter(pm => {
            if (!pm.enabled) return false;
            if (pm.productId && pm.productId !== item.product.id) return false;
            const startOk = pm.startDate ? new Date(pm.startDate) <= now : true;
            const endOk = pm.endDate ? new Date(pm.endDate) >= now : true;
            return startOk && endOk;
        });

        let itemDiscount = 0;
        let appliedPromoId = null;

        if (applicablePromos.length > 0) {
            const pm = applicablePromos[0]; // Apply first match
            appliedPromoId = pm.id;
            if (pm.type === 'percent') {
                const percent = Math.max(0, Math.min(100, pm.value || 0));
                itemDiscount = (item.product.sellingPrice * percent / 100) * item.quantity;
            } else if (pm.type === 'fixed') {
                itemDiscount = Math.max(0, pm.value || 0) * item.quantity;
            } else if (pm.type === 'bxgy') {
                const buyX = Math.max(1, pm.buy || 0);
                const getY = Math.max(0, pm.get || 0);
                const group = buyX + getY;
                if (group > 0) {
                    const groups = Math.floor(item.quantity / group);
                    const freeCount = groups * getY;
                    itemDiscount = freeCount * item.product.sellingPrice;
                }
            }
        }

        totalDiscount += itemDiscount;

        return {
            ...item,
            subtotal: itemSubtotal,
            discount: itemDiscount,
            total: Math.max(0, itemSubtotal - itemDiscount),
            promoId: appliedPromoId
        };
    });

    const total = Math.max(0, subtotal - totalDiscount);
    return { items, subtotal, totalDiscount, total };
};

// Render Cart HTML
window.renderCart = function() {
    const cartItemsList = document.getElementById('pos-cart-items');
    const posSubtotalEl = document.getElementById('pos-subtotal');
    const posDiscountEl = document.getElementById('pos-discount');
    const posTotalEl = document.getElementById('pos-total');
    const checkoutBtn = document.getElementById('pos-checkout-btn');

    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';
    const calc = window.calculateCart();

    if (calc.items.length === 0) {
        cartItemsList.innerHTML = '<li class="text-center py-8 text-slate-400 text-xs">Giỏ hàng trống</li>';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        calc.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'py-3 border-b border-gray-150 dark:border-slate-800/80 flex items-center justify-between gap-3';
            
            const promoBadge = item.promoId ? '<span class="inline-block text-[9px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md">KM</span>' : '';
            
            li.innerHTML = `
                <div class="flex-grow min-w-0">
                    <h5 class="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                        ${item.product.name}
                        ${promoBadge}
                    </h5>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ${window.formatCurrency(item.product.sellingPrice)}
                        ${item.discount > 0 ? `<span class="line-through text-slate-400 ml-1.5">${window.formatCurrency(item.subtotal)}</span>` : ''}
                    </p>
                </div>
                <div class="flex items-center gap-2.5">
                    <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60">
                        <button class="px-2 py-1 text-slate-650 hover:bg-gray-200 dark:hover:bg-slate-800 transition" data-action="minus">-</button>
                        <span class="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">${item.quantity}</span>
                        <button class="px-2 py-1 text-slate-650 hover:bg-gray-200 dark:hover:bg-slate-800 transition" data-action="plus">+</button>
                    </div>
                    <button class="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-xl transition" data-action="remove">
                        ✕
                    </button>
                </div>
            `;

            li.querySelector('[data-action="minus"]').addEventListener('click', () => window.updateCartQuantity(item.product.id, -1));
            li.querySelector('[data-action="plus"]').addEventListener('click', () => window.updateCartQuantity(item.product.id, 1));
            li.querySelector('[data-action="remove"]').addEventListener('click', () => window.removeFromCart(item.product.id));

            cartItemsList.appendChild(li);
        });
    }

    if (posSubtotalEl) posSubtotalEl.textContent = window.formatCurrency(calc.subtotal);
    if (posDiscountEl) posDiscountEl.textContent = window.formatCurrency(calc.totalDiscount);
    if (posTotalEl) posTotalEl.textContent = window.formatCurrency(calc.total);
};

// Checkout Giỏ Hàng
window.checkoutCart = async function() {
    if (window.cart.length === 0) return;

    const calc = window.calculateCart();
    const customerNameInput = document.getElementById('pos-customer-name');
    const customerNoteInput = document.getElementById('pos-customer-note');

    const customerName = customerNameInput?.value.trim() || '';
    const customerNote = customerNoteInput?.value.trim() || '';

    // Description contains summary of items sold
    const itemDescriptions = calc.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');
    const description = `Bán hàng (POS): ${itemDescriptions}`;

    const executeCheckout = async () => {
        try {
            const batch = window.db.batch();

            // Record transaction
            const newTxRef = window.transactionsCollection.doc();
            const txData = {
                type: 'income',
                category: 'Bán hàng',
                description: description,
                amount: calc.total,
                discountAmount: calc.totalDiscount,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                customerName: customerName,
                customerNote: customerNote,
                isPos: true,
                items: calc.items.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.sellingPrice,
                    costPrice: item.product.costPrice || 0,
                    discount: item.discount,
                    total: item.total,
                    promoId: item.promoId || null
                }))
            };
            batch.set(newTxRef, txData);

            // Deduct stock for each item (skip virtual quick sale items)
            calc.items.forEach(item => {
                if (item.product.id && !item.product.id.startsWith('quick_')) {
                    const productRef = window.productsCollection.doc(item.product.id);
                    batch.update(productRef, {
                        stock: firebase.firestore.FieldValue.increment(-item.quantity)
                    });
                }
            });

            await batch.commit();

            window.showToast("Thanh toán thành công!");
            window.showReceipt(txData, calc.items);
            window.clearCart();
        } catch (err) {
            window.showToast(`Lỗi thanh toán: ${err.message}`, "error");
        }
    };

    // Check stock issues
    const stockIssues = calc.items.filter(i => i.quantity > i.product.stock);
    if (stockIssues.length > 0) {
        const issueNames = stockIssues.map(i => i.product.name).join(', ');
        window.openConfirmationModal(
            `Sản phẩm: ${issueNames} có số lượng bán vượt quá tồn kho. Bạn có chắc muốn tiếp tục không?`,
            executeCheckout,
            "Vẫn bán"
        );
    } else {
        await executeCheckout();
    }
};

// Render invoice print layout
window.showReceipt = function(tx, items) {
    const receiptModal = document.getElementById('receipt-modal');
    const receiptBody = document.getElementById('receipt-body');
    if (!receiptModal || !receiptBody) return;

    let itemsHtml = '';
    let totalDiscount = tx.discountAmount || 0;
    let subtotal = tx.amount + totalDiscount;

    items.forEach(item => {
        itemsHtml += `
            <div class="flex justify-between text-xs py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span class="font-medium">${item.product.name} (x${item.quantity})</span>
                <span>${window.formatCurrency(item.total)}</span>
            </div>
        `;
    });

    receiptBody.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200">HÓA ĐƠN BÁN LẺ</h3>
            <p class="text-[10px] text-slate-400 mt-0.5">Ngày: ${window.formatDisplayDateTime(tx.createdAt, tx.date)}</p>
        </div>
        <div class="space-y-1.5 text-xs mb-4 text-slate-650 dark:text-slate-400">
            ${tx.customerName ? `<p><strong>Khách hàng:</strong> ${tx.customerName}</p>` : ''}
            ${tx.customerNote ? `<p><strong>Ghi chú:</strong> ${tx.customerNote}</p>` : ''}
        </div>
        <div class="border-t border-b border-slate-300 dark:border-slate-700 py-2 mb-4 space-y-1">
            <div class="flex justify-between text-xs font-bold mb-1">
                <span>Tên món</span>
                <span>Thành tiền</span>
            </div>
            ${itemsHtml}
        </div>
        <div class="space-y-1.5 text-xs mb-4">
            <div class="flex justify-between text-slate-650 dark:text-slate-400">
                <span>Tạm tính:</span>
                <span>${window.formatCurrency(subtotal)}</span>
            </div>
            ${totalDiscount > 0 ? `
            <div class="flex justify-between text-rose-500">
                <span>Giảm giá khuyến mại:</span>
                <span>-${window.formatCurrency(totalDiscount)}</span>
            </div>` : ''}
            <div class="flex justify-between text-base font-extrabold text-slate-850 dark:text-slate-200 border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                <span>TỔNG CỘNG:</span>
                <span>${window.formatCurrency(tx.amount)}</span>
            </div>
        </div>
        <div class="text-center mt-6">
            <p class="text-[11px] font-bold text-brand-600 dark:text-brand-400">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
        </div>
    `;

    receiptModal.classList.remove('hidden');
    setTimeout(() => receiptModal.classList.remove('opacity-0'), 10);
};

// Close receipt
window.closeReceiptModal = function() {
    const receiptModal = document.getElementById('receipt-modal');
    if (!receiptModal) return;
    receiptModal.classList.add('opacity-0');
    setTimeout(() => receiptModal.classList.add('hidden'), 300);
};

// Print Invoice
window.printReceipt = function() {
    window.print();
};

// --- POS QUICK ADD (BÁN NHANH) FUNCTIONS ---
window.openQuickAddPOSModal = function() {
    const modal = document.getElementById('quick-add-pos-modal');
    const form = document.getElementById('quick-add-pos-form');
    if (!modal || !form) return;
    form.reset();
    document.getElementById('quick-pos-qty').value = 1;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

window.closeQuickAddPOSModal = function() {
    const modal = document.getElementById('quick-add-pos-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

window.handleQuickAddPOSSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('quick-pos-name').value.trim();
    const price = +document.getElementById('quick-pos-price').value || 0;
    const qty = +document.getElementById('quick-pos-qty').value || 1;

    if (!name || price <= 0) {
        return window.showToast("Vui lòng nhập tên và giá bán hợp lệ.", "error");
    }

    const virtualProduct = {
        id: 'quick_' + Date.now(),
        name: name,
        sellingPrice: price,
        costPrice: 0,
        stock: 99999,
        isVirtual: true
    };

    const existing = window.cart.find(item => item.product.isVirtual && item.product.name === name && item.product.sellingPrice === price);
    if (existing) {
        existing.quantity += qty;
    } else {
        window.cart.push({ product: virtualProduct, quantity: qty });
    }

    window.renderCart();
    window.closeQuickAddPOSModal();
    window.showToast("Đã thêm món vào giỏ hàng.");
};

document.addEventListener('DOMContentLoaded', () => {
    const searchPosInput = document.getElementById('search-pos-products');
    const clearCartBtn = document.getElementById('pos-clear-btn');
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    const receiptCloseBtn = document.getElementById('receipt-close-btn');
    const receiptPrintBtn = document.getElementById('receipt-print-btn');
    const quickAddPOSBtn = document.getElementById('pos-quick-add-btn');
    const quickAddPOSForm = document.getElementById('quick-add-pos-form');

    searchPosInput?.addEventListener('input', window.renderPOSProducts);
    clearCartBtn?.addEventListener('click', window.clearCart);
    checkoutBtn?.addEventListener('click', window.checkoutCart);
    receiptCloseBtn?.addEventListener('click', window.closeReceiptModal);
    receiptPrintBtn?.addEventListener('click', window.printReceipt);
    
    quickAddPOSBtn?.addEventListener('click', window.openQuickAddPOSModal);
    quickAddPOSForm?.addEventListener('submit', window.handleQuickAddPOSSubmit);
    quickAddPOSForm?.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', window.closeQuickAddPOSModal);
    });
});

