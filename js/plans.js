// --- PLANS MODULE ---

window.renderPlanList = function(source) {
    const planList = document.getElementById('plan-list');
    const planEmptyState = document.getElementById('plan-empty-state');
    if (!planList) return;

    planList.innerHTML = '';
    if (planEmptyState) {
        planEmptyState.style.display = source.length === 0 ? 'block' : 'none';
    }
    source.forEach(plan => planList.appendChild(window.createPlanElement(plan)));
};

window.createPlanElement = function(plan) {
    const { id, type, description, amount, category, customerName, customerNote, createdAt, date, productId, quantity } = plan;
    const isIncome = type === 'income';
    const item = document.createElement('li');
    item.className = `p-4 rounded-2xl flex items-start gap-3 border-l-4 transition hover:shadow-sm ${isIncome ? 'bg-emerald-500/5 border-emerald-500 dark:bg-emerald-500/5' : 'bg-rose-500/5 border-rose-500 dark:bg-rose-500/5'}`;
    let extraInfoHtml = '';
    if ((isIncome && customerName) || customerNote) {
        extraInfoHtml = `<div class="mt-2 pt-2 border-t border-gray-200/20 dark:border-slate-800/85 text-xs text-slate-650 dark:text-slate-400">
            ${(isIncome && customerName) ? `<p class="mb-0.5"><strong>KH:</strong> ${customerName}</p>` : ''}
            ${customerNote ? `<p><strong>Ghi chú:</strong> ${customerNote}</p>` : ''}
        </div>`;
    }
    const displayDateTimeStr = window.formatDisplayDateTime(createdAt, date);
    item.innerHTML = `<input type="checkbox" class="plan-item-checkbox mt-1 h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500">
        <div class="flex-grow flex flex-col">
            <div>
                <p class="font-bold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">${category || 'Chưa phân loại'}</p>
                <p class="font-semibold text-slate-800 dark:text-slate-200 mt-1">${description || ''}</p>
                <p class="text-sm font-bold mt-1 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}">${window.formatCurrency(amount)}</p>
                ${extraInfoHtml}
            </div>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-2">${displayDateTimeStr}</p>
        </div>
        <div class="flex flex-col gap-2">
            <button data-action="edit" class="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Sửa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
            <button data-action="delete" class="text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Xóa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
        </div>`;
    item.querySelector('.plan-item-checkbox').addEventListener('change', (e) => { 
        if (e.target.checked) { 
            const planData = { id, type, description, amount, date, category, customerName, customerNote, productId, quantity };
            window.openCompletePlanModal(planData); 
            e.target.checked = false; 
        } 
    });
    item.querySelector('button[data-action="edit"]').addEventListener('click', () => window.openFormModal('editPlan', plan));
    item.querySelector('button[data-action="delete"]').addEventListener('click', () => window.deletePlan(id, description));
    return item;
};

window.openCompletePlanModal = function(plan) {
    const completePlanModal = document.getElementById('complete-plan-modal');
    const completePlanIdInput = document.getElementById('complete-plan-id');
    const completePlanDescriptionEl = document.getElementById('complete-plan-description');
    const completePlanAmountInput = document.getElementById('complete-plan-amount');
    
    if (!completePlanModal) return;

    if (completePlanIdInput) completePlanIdInput.value = JSON.stringify(plan);
    if (completePlanDescriptionEl) completePlanDescriptionEl.textContent = plan.description;
    if (completePlanAmountInput) completePlanAmountInput.value = plan.amount;
    
    completePlanModal.classList.remove('hidden');
    setTimeout(() => completePlanModal.classList.remove('opacity-0'), 10);
};

window.closeCompletePlanModal = function() {
    const completePlanModal = document.getElementById('complete-plan-modal');
    if (!completePlanModal) return;
    completePlanModal.classList.add('opacity-0');
    setTimeout(() => completePlanModal.classList.add('hidden'), 300);
};

window.handleCompletePlanSubmit = async function(e) {
    e.preventDefault();
    const completePlanIdInput = document.getElementById('complete-plan-id');
    const completePlanAmountInput = document.getElementById('complete-plan-amount');

    const plan = JSON.parse(completePlanIdInput.value);
    const actualAmount = +completePlanAmountInput.value;
    if (actualAmount <= 0 && plan.type !== 'expense') return window.showToast("Vui lòng nhập số tiền thực tế hợp lệ.", "error");
    
    const newTransaction = { ...plan, amount: actualAmount, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };
    delete newTransaction.id;
    
    try {
        const batch = window.db.batch();
        
        const newTxRef = window.transactionsCollection.doc();
        batch.set(newTxRef, newTransaction);
        
        if (newTransaction.productId && newTransaction.quantity > 0) {
            const stockChange = newTransaction.type === 'income' ? -newTransaction.quantity : newTransaction.quantity;
            const productRef = window.productsCollection.doc(newTransaction.productId);
            batch.update(productRef, { stock: firebase.firestore.FieldValue.increment(stockChange) });
        }
        
        const planRef = window.plansCollection.doc(plan.id);
        batch.delete(planRef);
        
        await batch.commit();
        
        window.showToast("Đã hoàn thành kế hoạch!");
        window.closeCompletePlanModal();
    } catch (err) { 
        window.showToast(`Lỗi: ${err.message}`, "error"); 
    }
};

window.deletePlan = function(id, description) {
    window.openConfirmationModal(`Bạn có chắc muốn xóa kế hoạch "${description}"?`, async () => { 
        try { 
            await window.plansCollection.doc(id).delete(); 
            window.showToast("Đã xóa kế hoạch."); 
        } catch(e) { 
            window.showToast('Lỗi: '+e.message, "error"); 
        } 
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const completePlanForm = document.getElementById('complete-plan-form');
    const searchPlanInput = document.getElementById('search-plan');

    completePlanForm?.addEventListener('submit', window.handleCompletePlanSubmit);
    completePlanForm?.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', window.closeCompletePlanModal));
    
    searchPlanInput?.addEventListener('input', () => {
        if (window.renderAll) window.renderAll();
    });
});
