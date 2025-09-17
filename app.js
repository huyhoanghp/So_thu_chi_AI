// Firebase configuration should be in a separate file and imported
const STCApp = {
    promotions: [],
    async savePromotionFromForm() {
        try {
            const id = document.getElementById('promo-id').value || Date.now().toString();
            const name = document.getElementById('promo-name').value;
            const type = document.getElementById('promo-type').value;
            const value = document.getElementById('promo-value').value;
            const buyQty = document.getElementById('promo-buy-qty').value;
            const getQty = document.getElementById('promo-get-qty').value;
            const minSpend = document.getElementById('promo-min-spend').value;
            const startDate = document.getElementById('promo-start-date').value || new Date().toISOString().slice(0, 10);
            const endDate = document.getElementById('promo-end-date').value || new Date(Date.now() + 86400000).toISOString().slice(0, 10);

            const checked = Array.from(document.querySelectorAll('[id^="promo-prod-check-"]:checked')).map(i => i.value);

            const promo = {
                id, name, type, value, buyQty, getQty, productIds: checked, minSpend, startDate, endDate
            };

            const idx = STCApp.promotions.findIndex(p => p.id === id);
            if (idx >= 0) {
                STCApp.promotions[idx] = promo;
            } else {
                STCApp.promotions.push(promo);
            }

            if (typeof savePromotion === 'function') {
                try {
                    await savePromotion(promo);
                } catch (e) {
                    console.warn('savePromotion failed', e);
                }
            }

            if (typeof renderPromotionList === 'function') {
                renderPromotionList();
            }
            if (typeof showToast === 'function') {
                showToast('Lưu chương trình khuyến mại thành công');
            }
            if (typeof closePromotionModal === 'function') {
                closePromotionModal();
            }

            return promo;
        } catch (e) {
            console.error(e);
            alert('Lưu khuyến mại lỗi: ' + e.message);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const promoForm = document.getElementById('promotion-form') || document.getElementById('promoForm');
    if (promoForm) {
        promoForm.addEventListener('submit', function(ev) {
            ev.preventDefault();
            STCApp.savePromotionFromForm();
        });
    }
});
