// --- PRODUCTS MANAGEMENT MODULE ---

window.renderProductList = function(source) {
    const productList = document.getElementById('product-list');
    const productEmptyState = document.getElementById('product-empty-state');
    if (!productList) return;

    productList.innerHTML = '';
    if (productEmptyState) {
        productEmptyState.style.display = source.length === 0 ? 'block' : 'none';
    }
    source.forEach(product => productList.appendChild(window.createProductElement(product)));
};

window.createProductElement = function(product) {
    const { id, name, costPrice, sellingPrice, stock, image } = product;
    const item = document.createElement('li');
    item.className = 'p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 shadow-sm transition hover:shadow-md';
    
    const stockColor = stock > 10 ? 'text-emerald-600 dark:text-emerald-500' : (stock > 0 ? 'text-amber-500' : 'text-rose-600 dark:text-rose-500');

    const imageHtml = image 
        ? `<img src="${image}" class="w-full h-full object-cover">`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`;

    item.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div class="flex items-center gap-3.5 flex-grow min-w-0">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-gray-150 dark:border-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    ${imageHtml}
                </div>
                <div class="min-w-0">
                    <p class="font-bold text-lg text-brand-600 dark:text-brand-400 truncate">${name}</p>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-slate-400 mt-1">
                        <span>Giá bán: <strong class="text-emerald-600 dark:text-emerald-500">${window.formatCurrency(sellingPrice)}</strong></span>
                        <span>Giá vốn: <strong class="text-rose-600 dark:text-rose-450">${window.formatCurrency(costPrice)}</strong></span>
                        <span>Tồn kho: <strong class="${stockColor}">${stock}</strong></span>
                    </div>
                </div>
            </div>
            <div class="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto self-center justify-end">
                <button data-action="sell" class="w-1/2 sm:w-auto text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-sm">Bán</button>
                <button data-action="edit" class="w-1/4 sm:w-auto text-slate-450 hover:text-brand-600 dark:hover:text-brand-400 transition p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center" title="Sửa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                <button data-action="delete" class="w-1/4 sm:w-auto text-slate-450 hover:text-rose-600 transition p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center" title="Xóa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
            </div>
        </div>`;
        
    item.querySelector('button[data-action="sell"]').addEventListener('click', () => {
        if (window.switchTab) {
            window.switchTab('pos');
        }
        if (window.addProductToCart) {
            window.addProductToCart(product);
        }
    });
    item.querySelector('button[data-action="edit"]').addEventListener('click', () => window.openProductModal('edit', product));
    item.querySelector('button[data-action="delete"]').addEventListener('click', () => window.deleteProduct(id, name));
    return item;
};

window.populateProductDropdown = function(selectElement) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    let options = `<option value="">${selectElement.id === 'product-select' ? '-- Ghi nhận thủ công --' : '-- Chọn sản phẩm --'}</option>`;
    window.products.forEach(p => {
        options += `<option value="${p.id}">${p.name} (Tồn: ${p.stock})</option>`;
    });
    selectElement.innerHTML = options;
    selectElement.value = currentVal;
};

window.openProductModal = function(mode, data = {}) {
    const productModal = document.getElementById('product-modal');
    const productModalTitle = document.getElementById('product-modal-title');
    const productForm = document.getElementById('product-form');
    const editingProductIdInput = document.getElementById('editing-product-id');
    const productNameInput = document.getElementById('product-name');
    const productCostPriceInput = document.getElementById('product-cost-price');
    const productSellingPriceInput = document.getElementById('product-selling-price');
    const productStockInput = document.getElementById('product-stock');

    const imgEl = document.getElementById('product-img-el');
    const previewPlaceholder = document.getElementById('product-image-preview-placeholder');
    const deleteImageBtn = document.getElementById('delete-image-btn');
    const productImageInput = document.getElementById('product-image-input');

    if (!productModal || !productForm) return;

    productForm.reset();
    productForm.dataset.image = '';
    if (productImageInput) productImageInput.value = '';
    if (imgEl) { imgEl.src = ''; imgEl.classList.add('hidden'); }
    if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
    if (deleteImageBtn) deleteImageBtn.classList.add('hidden');

    if (mode === 'edit') {
        if (productModalTitle) productModalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
        if (editingProductIdInput) editingProductIdInput.value = data.id;
        if (productNameInput) productNameInput.value = data.name;
        if (productCostPriceInput) productCostPriceInput.value = data.costPrice;
        if (productSellingPriceInput) productSellingPriceInput.value = data.sellingPrice;
        if (productStockInput) productStockInput.value = data.stock;
        
        if (data.image) {
            productForm.dataset.image = data.image;
            if (imgEl) { imgEl.src = data.image; imgEl.classList.remove('hidden'); }
            if (previewPlaceholder) previewPlaceholder.classList.add('hidden');
            if (deleteImageBtn) deleteImageBtn.classList.remove('hidden');
        }
    } else {
        if (productModalTitle) productModalTitle.textContent = 'Thêm Sản Phẩm Mới';
        if (editingProductIdInput) editingProductIdInput.value = '';
    }
    productModal.classList.remove('hidden');
    setTimeout(() => productModal.classList.remove('opacity-0'), 10);
};

window.closeProductModal = function() {
    const productModal = document.getElementById('product-modal');
    if (!productModal) return;
    productModal.classList.add('opacity-0');
    setTimeout(() => productModal.classList.add('hidden'), 300);
};

window.handleProductFormSubmit = async function(e) {
    e.preventDefault();
    const editingProductIdInput = document.getElementById('editing-product-id');
    const productNameInput = document.getElementById('product-name');
    const productCostPriceInput = document.getElementById('product-cost-price');
    const productSellingPriceInput = document.getElementById('product-selling-price');
    const productStockInput = document.getElementById('product-stock');

    const productForm = document.getElementById('product-form');
    const data = {
        name: productNameInput.value.trim(),
        costPrice: +productCostPriceInput.value || 0,
        sellingPrice: +productSellingPriceInput.value || 0,
        stock: +productStockInput.value || 0,
        image: productForm?.dataset.image || ''
    };
    if (!data.name || data.sellingPrice <= 0) { 
        return window.showToast("Vui lòng nhập tên và giá bán hợp lệ.", "error"); 
    }
    
    const saveProduct = async () => {
        const editingId = editingProductIdInput.value;
        try {
            if (editingId) {
                await window.productsCollection.doc(editingId).update(data);
                window.showToast("Đã cập nhật sản phẩm!");
            } else {
                await window.productsCollection.add(data);
                window.showToast("Đã thêm sản phẩm thành công!");
            }
            window.closeProductModal();
        } catch (err) { 
            window.showToast(`Lỗi: ${err.message}`, "error"); 
        }
    };

    if (data.costPrice <= 0) {
        window.openConfirmationModal(
            "Giá vốn đang bị bỏ trống hoặc bằng 0. Bạn có chắc muốn lưu không?",
            saveProduct,
            "Vẫn lưu"
        );
    } else {
        saveProduct();
    }
};

window.deleteProduct = function(id, name) {
    window.openConfirmationModal(`Bạn có chắc muốn xóa sản phẩm "${name}"? Thao tác này không thể hoàn tác.`, async () => { 
        try { 
            await window.productsCollection.doc(id).delete(); 
            window.showToast("Đã xóa sản phẩm."); 
        } catch(e) { 
            window.showToast('Lỗi: '+e.message, "error"); 
        } 
    }); 
};

document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const searchProductsInput = document.getElementById('search-products');

    const uploadImageBtn = document.getElementById('upload-image-btn');
    const deleteImageBtn = document.getElementById('delete-image-btn');
    const productImageInput = document.getElementById('product-image-input');
    const imgEl = document.getElementById('product-img-el');
    const previewPlaceholder = document.getElementById('product-image-preview-placeholder');

    uploadImageBtn?.addEventListener('click', () => {
        productImageInput?.click();
    });

    productImageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 350000) {
                window.showToast("Cảnh báo: Ảnh hơi lớn (nên chọn dưới 300KB) để chạy mượt.", "error");
            }
            const reader = new FileReader();
            reader.onload = function(evt) {
                const base64 = evt.target.result;
                const form = document.getElementById('product-form');
                if (form) form.dataset.image = base64;
                if (imgEl) {
                    imgEl.src = base64;
                    imgEl.classList.remove('hidden');
                }
                if (previewPlaceholder) previewPlaceholder.classList.add('hidden');
                if (deleteImageBtn) deleteImageBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    deleteImageBtn?.addEventListener('click', () => {
        const form = document.getElementById('product-form');
        if (form) form.dataset.image = '';
        if (productImageInput) productImageInput.value = '';
        if (imgEl) {
            imgEl.src = '';
            imgEl.classList.add('hidden');
        }
        if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
        if (deleteImageBtn) deleteImageBtn.classList.add('hidden');
    });

    addProductBtn?.addEventListener('click', () => window.openProductModal('add'));
    productForm?.addEventListener('submit', window.handleProductFormSubmit);
    productForm?.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', window.closeProductModal));
    searchProductsInput?.addEventListener('input', () => {
        if (window.renderAll) window.renderAll();
    });
});
