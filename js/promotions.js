// --- PROMOTIONS MANAGEMENT MODULE ---

window.renderPromotions = function() {
    const promotionList = document.getElementById('promotion-list');
    const promotionEmptyState = document.getElementById('promotion-empty-state');
    const searchPromotionsInput = document.getElementById('search-promotions');
    if (!promotionList) return;

    const term = (searchPromotionsInput?.value || '').toLowerCase().trim();
    const source = window.promotions.filter(pm => {
        if (!term) return true;
        return [pm.name, pm.type].some(v => String(v || '').toLowerCase().includes(term));
    });

    promotionList.innerHTML = '';
    if (promotionEmptyState) {
        promotionEmptyState.style.display = source.length === 0 ? 'block' : 'none';
    }
    
    // Sort by latest end date or creation (we default to the order from Firestore snapshot)
    const sorted = [...source].sort((a, b) => new Date(b.endDate || b.startDate) - new Date(a.endDate || a.startDate));
    sorted.forEach(pm => promotionList.appendChild(window.createPromotionElement(pm)));
};

window.createPromotionElement = function(pm) {
    const productInfo = window.products.find(p => p.id === pm.productId);
    const wrapper = document.createElement('li');
    wrapper.className = 'p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-150 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:shadow-sm';
    
    let typeLabel = '';
    if (pm.type === 'percent') typeLabel = `Chiết khấu ${pm.value}%`;
    else if (pm.type === 'fixed') typeLabel = `Giảm giá ${window.formatCurrency(pm.value)}`;
    else if (pm.type === 'bxgy') typeLabel = `Mua ${pm.buy} tặng ${pm.get}`;

    const dateRange = (pm.startDate || pm.endDate) 
        ? `${pm.startDate ? pm.startDate : 'bất kỳ'} đến ${pm.endDate ? pm.endDate : 'bất kỳ'}`
        : 'Mọi lúc';

    wrapper.innerHTML = `
        <div class="space-y-1">
            <h4 class="font-bold text-sm text-gray-900 dark:text-white">${pm.name || 'Khuyến mại'}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Sản phẩm: <span class="font-semibold text-brand-600 dark:text-brand-400">${productInfo ? productInfo.name : 'Tất cả'}</span></p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Hình thức: <span class="font-bold text-slate-700 dark:text-slate-200">${typeLabel}</span></p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Hiệu lực: ${dateRange}</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${pm.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500'}">
                ${pm.enabled ? 'Đang kích hoạt' : 'Đang tắt'}
            </span>
        </div>
        <div class="flex items-center gap-1.5 self-center w-full sm:w-auto justify-end sm:justify-start">
            <button class="p-2 rounded-xl text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 transition" data-action="edit" title="Sửa">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
            <button class="p-2 rounded-xl text-slate-500 hover:text-red-650 hover:bg-white dark:hover:bg-slate-800 transition" data-action="delete" title="Xóa">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            </button>
            <button class="px-2.5 py-1.5 rounded-xl text-xs font-semibold ${pm.enabled ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200' : 'bg-brand-600 hover:bg-brand-700 text-white'} transition" data-action="toggle">
                ${pm.enabled ? 'Tắt' : 'Bật'}
            </button>
        </div>
    `;
    
    wrapper.querySelector('[data-action="edit"]').addEventListener('click', () => window.openPromotionModal(pm));
    wrapper.querySelector('[data-action="delete"]').addEventListener('click', () => window.deletePromotion(pm));
    wrapper.querySelector('[data-action="toggle"]').addEventListener('click', () => window.togglePromotion(pm));
    return wrapper;
};

window.populatePromotionProductDropdown = function() {
    const promotionProductSelect = document.getElementById('promotion-product-select');
    if (!promotionProductSelect) return;
    let options = '<option value="">-- Áp dụng tất cả sản phẩm --</option>';
    window.products.forEach(p => {
        options += `<option value="${p.id}">${p.name}</option>`;
    });
    promotionProductSelect.innerHTML = options;
};

window.openPromotionModal = function(pm = null) {
    const promotionModal = document.getElementById('promotion-modal');
    const promotionForm = document.getElementById('promotion-form');
    const editingPromotionIdInput = document.getElementById('editing-promotion-id');
    const promotionNameInput = document.getElementById('promotion-name');
    const promotionProductSelect = document.getElementById('promotion-product-select');
    const promotionValueInput = document.getElementById('promotion-value');
    const promotionBuyInput = document.getElementById('promotion-buy');
    const promotionGetInput = document.getElementById('promotion-get');
    const promotionStartInput = document.getElementById('promotion-start');
    const promotionEndInput = document.getElementById('promotion-end');
    const promotionEnabledInput = document.getElementById('promotion-enabled');

    if (!promotionModal || !promotionForm) return;

    promotionForm.reset();
    window.populatePromotionProductDropdown();
    
    if (pm) {
        document.getElementById('promotion-modal-title').textContent = 'Chỉnh sửa chương trình';
        editingPromotionIdInput.value = pm.id;
        promotionNameInput.value = pm.name || '';
        promotionProductSelect.value = pm.productId || '';
        
        const type = pm.type || 'percent';
        const radio = promotionForm.querySelector(`input[name="promo-type"][value="${type}"]`);
        if (radio) radio.checked = true;
        
        promotionValueInput.value = pm.value || '';
        promotionBuyInput.value = pm.buy || 1;
        promotionGetInput.value = pm.get || 0;
        promotionStartInput.value = pm.startDate || '';
        promotionEndInput.value = pm.endDate || '';
        promotionEnabledInput.checked = !!pm.enabled;
    } else {
        document.getElementById('promotion-modal-title').textContent = 'Thêm chương trình khuyến mại';
        editingPromotionIdInput.value = '';
        promotionBuyInput.value = 1;
        promotionGetInput.value = 0;
        promotionEnabledInput.checked = true;
        const defaultRadio = promotionForm.querySelector(`input[name="promo-type"][value="percent"]`);
        if (defaultRadio) defaultRadio.checked = true;
    }
    
    window.updatePromoFieldsVisibility();
    promotionModal.classList.remove('hidden');
    setTimeout(() => promotionModal.classList.remove('opacity-0'), 10);
};

window.closePromotionModal = function() {
    const promotionModal = document.getElementById('promotion-modal');
    if (!promotionModal) return;
    promotionModal.classList.add('opacity-0');
    setTimeout(() => promotionModal.classList.add('hidden'), 300);
};

window.updatePromoFieldsVisibility = function() {
    const promotionForm = document.getElementById('promotion-form');
    const promoValueSection = document.getElementById('promo-value-section');
    const promoBxgySection = document.getElementById('promo-bxgy-section');
    const promoValueLabel = document.getElementById('promo-value-label');
    
    if (!promotionForm || !promoValueSection || !promoBxgySection) return;

    const checkedRadio = promotionForm.querySelector('input[name="promo-type"]:checked');
    const selectedType = checkedRadio ? checkedRadio.value : 'percent';

    if (selectedType === 'bxgy') {
        promoValueSection.classList.add('hidden');
        promoBxgySection.classList.remove('hidden');
    } else {
        promoValueSection.classList.remove('hidden');
        promoBxgySection.classList.add('hidden');
        if (promoValueLabel) {
            promoValueLabel.textContent = selectedType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)';
        }
    }
};

window.handlePromotionFormSubmit = async function(e) {
    e.preventDefault();
    const promotionForm = document.getElementById('promotion-form');
    const editingPromotionIdInput = document.getElementById('editing-promotion-id');
    const promotionNameInput = document.getElementById('promotion-name');
    const promotionProductSelect = document.getElementById('promotion-product-select');
    const promotionValueInput = document.getElementById('promotion-value');
    const promotionBuyInput = document.getElementById('promotion-buy');
    const promotionGetInput = document.getElementById('promotion-get');
    const promotionStartInput = document.getElementById('promotion-start');
    const promotionEndInput = document.getElementById('promotion-end');
    const promotionEnabledInput = document.getElementById('promotion-enabled');

    if (!promotionForm) return;

    const id = editingPromotionIdInput.value;
    const checkedRadio = promotionForm.querySelector('input[name="promo-type"]:checked');
    const type = checkedRadio ? checkedRadio.value : 'percent';
    
    const data = {
        name: promotionNameInput.value.trim(),
        productId: promotionProductSelect.value || '',
        type: type,
        value: type === 'bxgy' ? 0 : +promotionValueInput.value || 0,
        buy: type === 'bxgy' ? +promotionBuyInput.value || 1 : 0,
        get: type === 'bxgy' ? +promotionGetInput.value || 0 : 0,
        startDate: promotionStartInput.value,
        endDate: promotionEndInput.value,
        enabled: promotionEnabledInput.checked
    };

    if (!data.name) return window.showToast("Vui lòng nhập tên chương trình.", "error");

    try {
        if (id) {
            await window.promotionsCollection.doc(id).update(data);
            window.showToast("Đã cập nhật khuyến mại!");
        } else {
            await window.promotionsCollection.add(data);
            window.showToast("Đã tạo khuyến mại thành công!");
        }
        window.closePromotionModal();
    } catch (err) {
        window.showToast(`Lỗi: ${err.message}`, "error");
    }
};

window.deletePromotion = function(pm) {
    window.openConfirmationModal(`Xóa khuyến mại "${pm.name}"?`, async () => {
        try {
            await window.promotionsCollection.doc(pm.id).delete();
            window.showToast('Đã xóa khuyến mại.');
        } catch (e) {
            window.showToast(`Lỗi: ${e.message}`, "error");
        }
    });
};

window.togglePromotion = function(pm) {
    window.promotionsCollection.doc(pm.id).update({ enabled: !pm.enabled })
        .catch(e => window.showError("Không thể bật/tắt khuyến mại: " + e.message));
};

document.addEventListener('DOMContentLoaded', () => {
    const addPromotionBtn = document.getElementById('add-promotion-btn');
    const searchPromotionsInput = document.getElementById('search-promotions');
    const promotionForm = document.getElementById('promotion-form');

    addPromotionBtn?.addEventListener('click', () => window.openPromotionModal());
    searchPromotionsInput?.addEventListener('input', window.renderPromotions);
    promotionForm?.addEventListener('submit', window.handlePromotionFormSubmit);
    
    promotionForm?.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', window.closePromotionModal);
    });

    promotionForm?.querySelectorAll('input[name="promo-type"]').forEach(radio => {
        radio.addEventListener('change', window.updatePromoFieldsVisibility);
    });
});
