// --- TRANSACTIONS MODULE ---

window.renderTransactionList = function(source) {
    const transactionList = document.getElementById('transaction-list');
    const transactionEmptyState = document.getElementById('transaction-empty-state');
    if (!transactionList) return;

    transactionList.innerHTML = '';
    if (transactionEmptyState) {
        transactionEmptyState.style.display = source.length === 0 ? 'block' : 'none';
    }
    source.forEach(tx => transactionList.appendChild(window.createTransactionElement(tx)));
};

window.createTransactionElement = function(tx) {
    const { id, type, description, amount, date, category, customerName, customerNote, createdAt, discountAmount } = tx;
    const isIncome = type === 'income';
    const item = document.createElement('li');
    item.className = `p-4 rounded-2xl border-l-4 transition hover:shadow-sm ${isIncome ? 'bg-emerald-500/5 border-emerald-500 dark:bg-emerald-500/5' : 'bg-rose-500/5 border-rose-500 dark:bg-rose-500/5'}`;
    const displayDateTimeStr = window.formatDisplayDateTime(createdAt, date);
    let extraInfoHtml = '';
    if ((isIncome && customerName) || customerNote) {
        extraInfoHtml = `<div class="mt-2 pt-2 border-t border-gray-150/20 dark:border-slate-800/85 text-xs text-slate-650 dark:text-slate-400">
            ${(isIncome && customerName) ? `<p class="mb-0.5"><strong>KH:</strong> ${customerName}</p>` : ''}
            ${customerNote ? `<p><strong>Ghi chú:</strong> ${customerNote}</p>` : ''}
        </div>`;
    }
    let discountHtml = '';
    if (discountAmount > 0) {
        discountHtml = `<p class="text-xs text-rose-500 font-medium mt-0.5" title="Đã trừ khuyến mại">KM: -${window.formatCurrency(discountAmount)}</p>`;
    }
    item.innerHTML = `<div class="flex justify-between items-start">
            <div class="flex-grow flex flex-col">
                <div>
                    <p class="font-bold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">${category || 'Chưa phân loại'}</p>
                    <p class="font-semibold text-lg text-slate-850 dark:text-slate-200 mt-1">${description || 'Không có nội dung'}</p>
                    ${extraInfoHtml}
                </div>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-2">${displayDateTimeStr}</p>
            </div>
            <div class="text-right flex-shrink-0 ml-4">
                <p class="font-bold text-xl ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-550'}">${isIncome ? '+' : '-'}${window.formatCurrency(amount)}</p>
                ${discountHtml}
                <div class="flex gap-1 justify-end mt-2">
                    <button data-action="edit" class="text-slate-455 hover:text-brand-655 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Sửa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <button data-action="delete" class="text-slate-455 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Xóa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </div>
            </div>
        </div>`;
    item.querySelector('button[data-action="edit"]').addEventListener('click', () => window.openFormModal('editTransaction', tx));
    item.querySelector('button[data-action="delete"]').addEventListener('click', () => window.deleteTransaction(tx));
    return item;
};

window.openFormModal = function(mode, data = {}) {
    window.currentFormMode = mode;
    const formModal = document.getElementById('form-modal');
    const mainForm = document.getElementById('main-form');
    const modalTitle = document.getElementById('modal-title');
    const editingIdInput = document.getElementById('editing-id');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const categorySelect = document.getElementById('category');
    const customerNameInput = document.getElementById('customerName');
    const customerNoteInput = document.getElementById('customerNote');
    const transactionQuantityInput = document.getElementById('transaction-quantity');
    const importQuantityInput = document.getElementById('import-quantity');
    const productSelect = document.getElementById('product-select');
    const importProductSelect = document.getElementById('import-product-select');

    if (!formModal || !mainForm) return;

    mainForm.reset();
    if (descriptionInput) descriptionInput.readOnly = false;
    if (productSelect) productSelect.value = '';
    if (importProductSelect) importProductSelect.value = '';

    const type = data.type || 'income';
    const radio = formModal.querySelector(`input[name="type"][value="${type}"]`);
    if (radio) radio.checked = true;
    
    if (window.updateCategoryOptions) window.updateCategoryOptions();

    if (mode === 'editTransaction') {
        window.currentEditingTransaction = window.transactions.find(t => t.id === data.id) || null;
    } else {
        window.currentEditingTransaction = null;
    }

    switch(mode) {
        case 'addPlan':
        case 'addTransaction':
            if (modalTitle) modalTitle.textContent = mode === 'addPlan' ? 'Thêm Kế Hoạch Mới' : 'Thêm Giao Gịch Nhanh';
            if (editingIdInput) editingIdInput.value = '';
            if (descriptionInput) descriptionInput.value = data.description || '';
            if (amountInput) amountInput.value = data.amount || '';
            if (dateInput) dateInput.value = data.date || new Date().toISOString().split('T')[0];
            if (categorySelect) categorySelect.value = data.category || (type === 'income' ? 'Bán hàng' : 'Chi phí khác');
            if (customerNameInput) customerNameInput.value = data.customerName || '';
            if (customerNoteInput) customerNoteInput.value = data.customerNote || '';
            if (transactionQuantityInput) transactionQuantityInput.value = data.quantity || 1;
            if (importQuantityInput) importQuantityInput.value = data.quantity || 1;
            break;
        case 'editPlan':
        case 'editTransaction':
            if (modalTitle) modalTitle.textContent = mode === 'editPlan' ? 'Chỉnh Sửa Kế Hoạch' : 'Chỉnh Sửa Giao Dịch';
            if (editingIdInput) editingIdInput.value = data.id || '';
            if (descriptionInput) descriptionInput.value = data.description || '';
            if (amountInput) {
                amountInput.value = data.amount || '';
                amountInput.dataset.promoId = data.promoId || '';
                amountInput.dataset.discountAmount = data.discountAmount || '0';
            }
            if (dateInput) dateInput.value = data.date || '';
            if (categorySelect) categorySelect.value = data.category || '';
            if (customerNameInput) customerNameInput.value = data.customerName || '';
            if (customerNoteInput) customerNoteInput.value = data.customerNote || '';
            if (transactionQuantityInput) transactionQuantityInput.value = data.quantity || 1;
            if (importQuantityInput) importQuantityInput.value = data.quantity || 1;
            break;
    }

    window.updateFormFieldsVisibility();

    // Pre-fill products if supplied
    if (data.productId) {
        if (type === 'income' && productSelect) {
            productSelect.value = data.productId;
            window.handleProductSelection(true);
        } else if (type === 'expense' && categorySelect?.value === 'Nhập hàng' && importProductSelect) {
            importProductSelect.value = data.productId;
            window.handleImportProductSelection(true);
        }
    }
    
    formModal.classList.remove('hidden');
    setTimeout(() => formModal.classList.remove('opacity-0'), 10);
};

window.closeFormModal = function() {
    const formModal = document.getElementById('form-modal');
    if (!formModal) return;
    formModal.classList.add('opacity-0');
    setTimeout(() => formModal.classList.add('hidden'), 300);
};

window.updateFormFieldsVisibility = function() {
    const formModal = document.getElementById('form-modal');
    const categorySelect = document.getElementById('category');
    const customerNameField = document.getElementById('customer-name-field');
    const productSection = document.getElementById('product-section');
    const importSection = document.getElementById('import-section');
    const productSelect = document.getElementById('product-select');
    const importProductSelect = document.getElementById('import-product-select');

    if (!formModal || !categorySelect) return;

    const selectedType = formModal.querySelector('input[name="type"]:checked').value;
    const selectedCategory = categorySelect.value;

    customerNameField?.classList.toggle('hidden', selectedType !== 'income'); 
    productSection?.classList.toggle('hidden', selectedType !== 'income');
    importSection?.classList.toggle('hidden', !(selectedType === 'expense' && selectedCategory === 'Nhập hàng'));
    
    if (selectedType === 'income' && productSelect) {
        window.populateProductDropdown(productSelect);
    } else if (selectedType === 'expense' && selectedCategory === 'Nhập hàng' && importProductSelect) {
        window.populateProductDropdown(importProductSelect);
    }
};

window.handleProductSelection = function(fromAI = false) {
    const productSelect = document.getElementById('product-select');
    const descriptionInput = document.getElementById('description');
    const transactionQuantityInput = document.getElementById('transaction-quantity');

    if (!productSelect || !descriptionInput) return;
    const selectedId = productSelect.value;
    if (selectedId) {
        const product = window.products.find(p => p.id === selectedId);
        if (product) {
            if (!fromAI && transactionQuantityInput) {
                transactionQuantityInput.value = 1;
            }
            descriptionInput.value = product.name;
            descriptionInput.readOnly = true;
            window.handleQuantityChange();
        }
    } else {
        descriptionInput.readOnly = false;
    }
};

window.handleQuantityChange = function() {
    const productSelect = document.getElementById('product-select');
    const transactionQuantityInput = document.getElementById('transaction-quantity');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');

    if (!productSelect || !amountInput || !descriptionInput) return;
    const selectedId = productSelect.value;
    if (selectedId) {
        const product = window.products.find(p => p.id === selectedId);
        const quantity = +(transactionQuantityInput?.value || 1);
        if (product && quantity > 0) {
            const now = new Date();
            const applicablePromos = (window.promotions || []).filter(pm => {
                if (!pm.enabled) return false;
                if (pm.productId && pm.productId !== selectedId) return false;
                const startOk = pm.startDate ? new Date(pm.startDate) <= now : true;
                const endOk = pm.endDate ? new Date(pm.endDate) >= now : true;
                return startOk && endOk;
            });

            let unitPrice = product.sellingPrice;
            let discountTotal = 0;
            let appliedPromoId = null;

            if (applicablePromos.length > 0) {
                const pm = applicablePromos[0];
                appliedPromoId = pm.id;
                if (pm.type === 'percent') {
                    const discountPerUnit = Math.max(0, Math.min(100, pm.value || 0)) * unitPrice / 100;
                    discountTotal = discountPerUnit * quantity;
                } else if (pm.type === 'fixed') {
                    discountTotal = Math.max(0, pm.value || 0) * quantity;
                } else if (pm.type === 'bxgy') {
                    const x = Math.max(1, pm.buy || 0);
                    const y = Math.max(0, pm.get || 0);
                    const group = x + y;
                    if (group > 0) {
                        const fullGroups = Math.floor(quantity / group);
                        discountTotal = fullGroups * y * unitPrice;
                    }
                }
            }

            const total = unitPrice * quantity - discountTotal;
            amountInput.value = Math.max(0, Math.round(total));
            amountInput.dataset.promoId = appliedPromoId || '';
            amountInput.dataset.discountAmount = String(Math.max(0, Math.round(discountTotal)));
            descriptionInput.value = quantity > 1 ? `${quantity} ${product.name}` : product.name;
        }
    }
};

window.handleImportProductSelection = function(fromAI = false) {
    const importProductSelect = document.getElementById('import-product-select');
    const descriptionInput = document.getElementById('description');
    const importQuantityInput = document.getElementById('import-quantity');
    const amountInput = document.getElementById('amount');

    if (!importProductSelect || !descriptionInput || !amountInput) return;
    const selectedId = importProductSelect.value;
    if (selectedId) {
        const product = window.products.find(p => p.id === selectedId);
        if (product) {
            if (!fromAI && importQuantityInput) {
                importQuantityInput.value = 1;
            }
            descriptionInput.value = `Nhập hàng: ${product.name}`;
            if (product.costPrice > 0) {
                amountInput.value = product.costPrice * (+(importQuantityInput?.value || 1));
            }
        }
    }
};

window.handleImportQuantityChange = function() {
    const importProductSelect = document.getElementById('import-product-select');
    const importQuantityInput = document.getElementById('import-quantity');
    const amountInput = document.getElementById('amount');

    if (!importProductSelect || !importQuantityInput || !amountInput) return;
    const selectedId = importProductSelect.value;
    if (selectedId) {
        const product = window.products.find(p => p.id === selectedId);
        const quantity = +importQuantityInput.value;
        if (product && quantity > 0 && product.costPrice > 0) {
            amountInput.value = product.costPrice * quantity;
        }
    }
};

window.handleFormSubmit = async function(e) {
    e.preventDefault();
    const formModal = document.getElementById('form-modal');
    const categorySelect = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const customerNameInput = document.getElementById('customerName');
    const customerNoteInput = document.getElementById('customerNote');
    const productSelect = document.getElementById('product-select');
    const transactionQuantityInput = document.getElementById('transaction-quantity');
    const importProductSelect = document.getElementById('import-product-select');
    const importQuantityInput = document.getElementById('import-quantity');
    const editingIdInput = document.getElementById('editing-id');

    const type = formModal.querySelector('input[name="type"]:checked').value;
    const category = categorySelect.value;
    
    let productId = null;
    let quantity = null;

    if (type === 'income' && productSelect.value) {
        productId = productSelect.value;
        quantity = +transactionQuantityInput.value;
    } else if (type === 'expense' && category === 'Nhập hàng' && importProductSelect.value) {
        productId = importProductSelect.value;
        quantity = +importQuantityInput.value;
    }

    const data = { 
        type: type, 
        description: descriptionInput.value.trim(), 
        amount: +amountInput.value || 0,
        promoId: amountInput.dataset.promoId || null,
        discountAmount: +(amountInput.dataset.discountAmount || 0),
        date: dateInput.value, 
        category: category, 
        customerName: customerNameInput.value.trim(), 
        customerNote: customerNoteInput.value.trim(), 
        createdAt: new Date().toISOString(),
        productId: productId,
        quantity: quantity
    };

    if (!data.description || data.amount < 0) {
        return window.showToast("Vui lòng nhập nội dung và số tiền hợp lệ.", "error");
    }
    
    const executeSave = async () => {
        try {
            if (window.currentFormMode === 'addPlan') {
                await window.plansCollection.add(data); 
                window.showToast("Đã thêm kế hoạch thành công!");
            } else if (window.currentFormMode === 'addTransaction') {
                await window.transactionsCollection.add(data);
                if (data.productId && data.quantity > 0) {
                    const stockChange = data.type === 'income' ? -data.quantity : data.quantity;
                    await window.productsCollection.doc(data.productId).update({ stock: firebase.firestore.FieldValue.increment(stockChange) });
                }
                window.showToast("Đã thêm giao dịch thành công!");
            } else if (window.currentFormMode === 'editPlan') {
                delete data.createdAt;
                await window.plansCollection.doc(editingIdInput.value).update(data); 
                window.showToast("Đã cập nhật kế hoạch!");
            } else if (window.currentFormMode === 'editTransaction') {
                const beforeTx = window.currentEditingTransaction;
                const afterTxData = data;
                delete afterTxData.createdAt; // Do not overwrite original transaction creation date
                const txDocRef = window.transactionsCollection.doc(editingIdInput.value);

                const oldProductId = beforeTx ? beforeTx.productId : null;
                const oldQuantity = beforeTx ? beforeTx.quantity || 0 : 0;
                const oldType = beforeTx ? beforeTx.type : null;
                const newProductId = afterTxData.productId;
                const newQuantity = afterTxData.quantity || 0;
                const newType = afterTxData.type;

                const batch = window.db.batch();
                batch.update(txDocRef, afterTxData);

                if (oldProductId !== newProductId || oldQuantity !== newQuantity || oldType !== newType) {
                    // Revert old stock change
                    if (oldProductId && oldQuantity > 0) {
                        const oldStockChange = oldType === 'income' ? oldQuantity : -oldQuantity;
                        batch.update(window.productsCollection.doc(oldProductId), { stock: firebase.firestore.FieldValue.increment(oldStockChange) });
                    }
                    // Apply new stock change
                    if (newProductId && newQuantity > 0) {
                        const newStockChange = newType === 'income' ? -newQuantity : newQuantity;
                        batch.update(window.productsCollection.doc(newProductId), { stock: firebase.firestore.FieldValue.increment(newStockChange) });
                    }
                }
                await batch.commit();
                window.showToast("Đã cập nhật giao dịch và kho hàng!");
            }
            window.closeFormModal();
        } catch (err) { 
            window.showToast(`Lỗi: ${err.message}`, "error"); 
        }
    };
    
    if (window.currentFormMode === 'addTransaction' && data.productId && data.quantity > 0 && data.type === 'income') {
        const product = window.products.find(p => p.id === data.productId);
        if (product && data.quantity > product.stock) {
            window.openConfirmationModal(
                `Số lượng bán (${data.quantity}) vượt quá tồn kho (${product.stock}). Bạn có chắc muốn tiếp tục?`,
                executeSave,
                "Tiếp tục"
            );
        } else {
            await executeSave();
        }
    } else {
        await executeSave();
    }
};

window.deleteTransaction = function(tx) {
    window.openConfirmationModal(`Bạn có chắc muốn xóa giao dịch "${tx.description}"?`, async () => { 
        try { 
            await window.transactionsCollection.doc(tx.id).delete();
            if (tx.productId && tx.quantity > 0) {
                const stockChange = tx.type === 'income' ? tx.quantity : -tx.quantity;
                await window.productsCollection.doc(tx.productId).update({ stock: firebase.firestore.FieldValue.increment(stockChange) });
            }
            window.showToast("Đã xóa giao dịch."); 
        } catch(e) { 
            window.showToast('Lỗi: '+e.message, "error"); 
        } 
    }); 
};

window.exportToXLSX = function() {
    if (typeof XLSX === 'undefined') {
        window.showToast('Lỗi: SheetJS chưa được tải.', 'error');
        return;
    }
    const { currentPeriodData } = window.getReportData();
    const sorted = [...currentPeriodData].sort((a,b)=> new Date(a.date) - new Date(b.date));
    const totalIncome = sorted.filter(t=>t.type==='income').reduce((s,t)=>s+(t.amount||0),0);
    const totalExpense = sorted.filter(t=>t.type==='expense').reduce((s,t)=>s+(t.amount||0),0);
    
    const summaryData = [
        ["BÁO CÁO TỔNG QUAN"], 
        [],
        ["Khoản mục", "Số tiền"],
        ["Tổng Thu", totalIncome],
        ["Tổng Chi", totalExpense],
        ["Lợi Nhuận", totalIncome-totalExpense]
    ];
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
    ws_summary['!cols'] = [{wch: 25}, {wch: 20}];

    const header = ['Ngày', 'Loại', 'Nội dung', 'Số tiền', 'Danh mục', 'Tên khách hàng', 'Ghi chú'];
    const dataRows = sorted.map(t => ({
        'Ngày': new Date(t.createdAt || t.date),
        'Loại': t.type === 'income' ? 'Thu' : 'Chi',
        'Nội dung': t.description,
        'Số tiền': t.type === 'income' ? t.amount : -t.amount,
        'Danh mục': t.category,
        'Tên khách hàng': t.customerName || '',
        'Ghi chú': t.customerNote || ''
    }));
    const ws_details = XLSX.utils.json_to_sheet(dataRows, {header: header});
    ws_details['!cols'] = [{wch:20},{wch:8},{wch:30},{wch:18},{wch:20},{wch:20},{wch:30}];

    const totalRowNum = dataRows.length + 2;
    ws_details[`C${totalRowNum}`] = {t:'s', v:'LỢI NHUẬN TỔNG CỘNG:'};
    ws_details[`D${totalRowNum}`] = {t:'n', f:`SUM(D2:D${totalRowNum-1})`, z: '#,##0 "₫"'};

    for(let i = 2; i <= totalRowNum; i++) {
        if(ws_details[`D${i}`]) ws_details[`D${i}`].z = '#,##0 "₫"';
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws_summary, "BaoCaoTongQuan");
    XLSX.utils.book_append_sheet(wb, ws_details, "GiaoDichChiTiet");
    XLSX.writeFile(wb, `SoThuChi_BaoCao_${new Date().toISOString().split('T')[0]}.xlsx`);
};

document.addEventListener('DOMContentLoaded', () => {
    const mainForm = document.getElementById('main-form');
    const productSelect = document.getElementById('product-select');
    const transactionQuantityInput = document.getElementById('transaction-quantity');
    const importProductSelect = document.getElementById('import-product-select');
    const importQuantityInput = document.getElementById('import-quantity');
    const exportXlsxBtn = document.getElementById('export-xlsx-btn');
    const searchHistoryInput = document.getElementById('search-history');

    mainForm?.addEventListener('submit', window.handleFormSubmit);
    mainForm?.querySelectorAll('.cancel-btn').forEach(btn => btn.addEventListener('click', window.closeFormModal));
    
    // Listen to changes on transaction type radio buttons to switch categories
    mainForm?.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (window.updateCategoryOptions) window.updateCategoryOptions();
        });
    });

    productSelect?.addEventListener('change', () => window.handleProductSelection(false));
    transactionQuantityInput?.addEventListener('input', window.handleQuantityChange);
    importProductSelect?.addEventListener('change', () => window.handleImportProductSelection(false));
    importQuantityInput?.addEventListener('input', window.handleImportQuantityChange);
    
    exportXlsxBtn?.addEventListener('click', window.exportToXLSX);
    searchHistoryInput?.addEventListener('input', () => {
        if (window.renderAll) window.renderAll();
    });
});

