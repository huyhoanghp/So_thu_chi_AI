// --- TRANSACTIONS MODULE ---

window.getFilteredHistoryData = function() {
    const historyRangeEl = document.getElementById('history-range');
    const customStartEl = document.getElementById('history-custom-start');
    const customEndEl = document.getElementById('history-custom-end');
    if (!historyRangeEl) return window.transactions;

    const range = historyRangeEl.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStart, currentEnd;

    switch(range) {
        case 'day':
            currentStart = new Date(today);
            currentEnd = new Date(today);
            break;
        case 'week':
            currentStart = new Date(today);
            currentStart.setDate(currentStart.getDate() - (currentStart.getDay() || 7) + 1);
            currentEnd = new Date(currentStart);
            currentEnd.setDate(currentEnd.getDate() + 6);
            break;
        case 'month':
            currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
            currentEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'year':
            currentStart = new Date(today.getFullYear(), 0, 1);
            currentEnd = new Date(today.getFullYear(), 11, 31);
            break;
        case 'custom':
            currentStart = customStartEl?.value ? new Date(customStartEl.value) : null;
            currentEnd = customEndEl?.value ? new Date(customEndEl.value) : null;
            break;
        default: // all
            currentStart = null;
            currentEnd = null;
    }

    if (currentEnd) currentEnd.setHours(23, 59, 59, 999);
    
    if (!currentStart || !currentEnd) {
        return window.transactions;
    }

    return window.transactions.filter(t => {
        if (!t.date) return false;
        const d = window.parseDate(t.date);
        if (isNaN(d.getTime())) return false;
        return d >= currentStart && d <= currentEnd;
    });
};

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
        extraInfoHtml = `<div class="mt-2 pt-2 border-t border-gray-200/20 dark:border-slate-800/85 text-xs text-slate-650 dark:text-slate-400">
            ${(isIncome && customerName) ? `<p class="mb-0.5"><strong>KH:</strong> ${customerName}</p>` : ''}
            ${customerNote ? `<p><strong>Ghi chú:</strong> ${customerNote}</p>` : ''}
        </div>`;
    }
    if (tx.exportZero && tx.exportReason) {
        extraInfoHtml += `<div class="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Lý do: ${tx.exportReason}</div>`;
    }
    let discountHtml = '';
    if (discountAmount > 0) {
        discountHtml = `<p class="text-xs text-rose-500 font-medium mt-0.5" title="Đã trừ khuyến mại">KM: -${window.formatCurrency(discountAmount)}</p>`;
    }
    item.innerHTML = `<div class="flex justify-between items-start">
            <div class="flex-grow flex flex-col">
                <div>
                    <p class="font-bold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">${category || 'Chưa phân loại'}</p>
                    <p class="font-semibold text-lg text-slate-800 dark:text-slate-200 mt-1">${description || 'Không có nội dung'}</p>
                    ${extraInfoHtml}
                </div>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-2">${displayDateTimeStr}</p>
            </div>
            <div class="text-right flex-shrink-0 ml-4">
                <p class="font-bold text-xl ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${tx.exportZero ? 'Miễn phí' : (isIncome ? '+' : '-') + window.formatCurrency(amount)}</p>
                ${discountHtml}
                <div class="flex gap-1 justify-end mt-2">
                    <button data-action="edit" class="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Sửa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <button data-action="delete" class="text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition p-1.5 rounded-xl" title="Xóa"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
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
    const exportZeroCheckbox = document.getElementById('export-zero');
    const exportReasonSection = document.getElementById('export-reason-section');
    const exportReasonSelect = document.getElementById('export-reason');

    if (!formModal || !mainForm) return;

    mainForm.reset();
    if (descriptionInput) descriptionInput.readOnly = false;
    if (productSelect) productSelect.value = '';
    if (importProductSelect) importProductSelect.value = '';
    if (exportZeroCheckbox) {
        exportZeroCheckbox.checked = false;
        amountInput.readOnly = false;
        exportReasonSection?.classList.add('hidden');
    }

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
            if (exportZeroCheckbox) {
                exportZeroCheckbox.checked = !!data.exportZero;
                if (data.exportZero) {
                    amountInput.readOnly = true;
                    exportReasonSection?.classList.remove('hidden');
                    exportReasonSelect.value = data.exportReason || '';
                }
            }
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
    const exportZeroCheckbox = document.getElementById('export-zero');

    if (!productSelect || !amountInput || !descriptionInput || exportZeroCheckbox?.checked) return;
    const selectedId = productSelect.value;
    if (selectedId) {
        const product = window.products.find(p => p.id === selectedId);
        const quantity = +(transactionQuantityInput?.value || 1);
        if (product && quantity > 0) {
            const now = new Date();
            const best = window.getBestPromotion
                ? window.getBestPromotion(product, quantity, now)
                : { promoId: null, discountAmount: 0 };

            const discountTotal = best.discountAmount;
            const appliedPromoId = best.promoId;

            const total = product.sellingPrice * quantity - discountTotal;
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
    const exportZeroCheckbox = document.getElementById('export-zero');
    const exportReasonSelect = document.getElementById('export-reason');
    const exportReasonCustomInput = document.getElementById('export-reason-custom');
    const exportReasonSection = document.getElementById('export-reason-section');
    // Thêm listener để hiển thị/ẩn mục nhập tùy chỉnh khi chọn 'Khác' và xóa giá trị khi ẩn
    exportReasonSelect?.addEventListener('change', () => {
        const customSection = document.getElementById('export-reason-custom-section');
        if (exportReasonSelect.value === 'other') {
            customSection?.classList.remove('hidden');
        } else {
            customSection?.classList.add('hidden');
            // Xóa nội dung nhập liệu khi không còn hiển thị
            const customInput = document.getElementById('export-reason-custom');
            if (customInput) customInput.value = '';
        }
    });

    const type = formModal.querySelector('input[name="type"]:checked').value;
    const category = categorySelect.value;
    
    let productId = null;
    let quantity = null;
    let exportZero = exportZeroCheckbox?.checked || false;
    let exportReason = '';
    if (exportZero) {
        const selectedReason = exportReasonSelect?.value || '';
        exportReason = selectedReason === 'other' && exportReasonCustomInput ? exportReasonCustomInput.value.trim() : selectedReason;
    }

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
        quantity: quantity,
        exportZero: exportZero,
        exportReason: exportReason
    };

    if (!data.description) {
        return window.showToast("Vui lòng nhập nội dung giao dịch.", "error");
    }
    if (!exportZero && data.amount <= 0) {
        return window.showToast("Số tiền phải lớn hơn 0 hoặc chọn Xuất hàng miễn phí.", "error");
    }
    if (exportZero && !data.exportReason) {
        return window.showToast("Vui lòng chọn lý do xuất hàng miễn phí.", "error");
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
    
    if (window.currentFormMode === 'addTransaction' && data.productId && data.quantity > 0 && data.type === 'income' && !data.exportZero) {
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
    let revertItems = [];
    if (tx.items && tx.items.length > 0) {
        tx.items.forEach(item => {
            const prod = window.products.find(p => p.id === item.productId);
            if (prod) {
                const sign = tx.type === 'income' ? '+' : '-';
                revertItems.push(`${sign}${item.quantity} ${prod.name}`);
            }
        });
    } else if (tx.productId) {
        const prod = window.products.find(p => p.id === tx.productId);
        if (prod && tx.quantity > 0) {
            const sign = tx.type === 'income' ? '+' : '-';
            revertItems.push(`${sign}${tx.quantity} ${prod.name}`);
        }
    }

    const showRevert = revertItems.length > 0;
    const revertLabelText = showRevert ? `Đồng ý hoàn kho (${revertItems.join(', ')})` : '';

    window.openConfirmationModal(
        `Bạn có chắc muốn xóa giao dịch "${tx.description}"?`,
        async (revertStock) => {
            try {
                const batch = window.db.batch();
                
                // Delete transaction document
                const txRef = window.transactionsCollection.doc(tx.id);
                batch.delete(txRef);

                // Update stock if requested
                if (revertStock) {
                    if (tx.items && tx.items.length > 0) {
                        tx.items.forEach(item => {
                            if (item.productId && !item.productId.startsWith('quick_')) {
                                const prod = window.products.find(p => p.id === item.productId);
                                if (prod) {
                                    const productRef = window.productsCollection.doc(item.productId);
                                    const change = tx.type === 'income' ? item.quantity : -item.quantity;
                                    batch.update(productRef, {
                                        stock: firebase.firestore.FieldValue.increment(change)
                                    });
                                }
                            }
                        });
                    } else if (tx.productId) {
                        const prod = window.products.find(p => p.id === tx.productId);
                        if (prod) {
                            const productRef = window.productsCollection.doc(tx.productId);
                            const change = tx.type === 'income' ? tx.quantity : -tx.quantity;
                            batch.update(productRef, {
                                stock: firebase.firestore.FieldValue.increment(change)
                            });
                        }
                    }
                }

                await batch.commit();
                window.showToast(revertStock ? "Đã xóa giao dịch và hoàn tồn kho!" : "Đã xóa giao dịch (không hoàn kho).");
            } catch (e) {
                window.showToast('Lỗi: ' + e.message, "error");
            }
        },
        "Xóa giao dịch",
        "Xác nhận xóa",
        showRevert,
        revertLabelText
    );
};

window.exportToXLSX = function() {
    if (typeof XLSX === 'undefined') {
        window.showToast('Lỗi: Thư viện SheetJS chưa được tải.', 'error');
        return;
    }
    
    // Retrieve the currently filtered transactions in the History tab
    const filteredHistoryTransactions = window.getFilteredHistoryData ? window.getFilteredHistoryData() : window.transactions;
    
    // Apply search filter if there's text in search-history input
    const searchHistoryInput = document.getElementById('search-history');
    const term = (searchHistoryInput?.value || '').toLowerCase().trim();
    
    let exportedData = [...filteredHistoryTransactions];
    if (term) {
        exportedData = exportedData.filter(item => 
            Object.values(item).some(value => String(value || '').toLowerCase().includes(term))
        );
    }
    
    if (exportedData.length === 0) {
        window.showToast('Không có dữ liệu giao dịch nào để xuất.', 'error');
        return;
    }
    
    // Sort transactions chronologically
    const sorted = exportedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalIncome = sorted.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalExpense = sorted.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    
    const summaryData = [
        ["BÁO CÁO TỔNG QUAN PHÂN TÍCH THU CHI"], 
        [],
        ["Khoản mục", "Số tiền"],
        ["Tổng Thu", totalIncome],
        ["Tổng Chi", totalExpense],
        ["Lợi Nhuận", totalIncome - totalExpense]
    ];
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
    ws_summary['!cols'] = [{wch: 25}, {wch: 20}];

    const header = ['Ngày', 'Loại', 'Nội dung', 'Số tiền', 'Danh mục', 'Tên khách hàng', 'Ghi chú'];
    const dataRows = sorted.map(t => ({
        'Ngày': window.formatDisplayDateTime(t.createdAt, t.date),
        'Loại': t.type === 'income' ? 'Thu' : 'Chi',
        'Nội dung': t.description || '',
        'Số tiền': t.exportZero ? 0 : (t.type === 'income' ? (Number(t.amount) || 0) : -(Number(t.amount) || 0)),
        'Danh mục': t.category || '',
        'Tên khách hàng': t.customerName || '',
        'Ghi chú': t.customerNote || ''
    }));
    const ws_details = XLSX.utils.json_to_sheet(dataRows, {header: header});
    ws_details['!cols'] = [{wch:22},{wch:8},{wch:30},{wch:18},{wch:20},{wch:20},{wch:30}];

    const totalRowNum = dataRows.length + 2;
    ws_details[`C${totalRowNum}`] = {t:'s', v:'LỢI NHUẬN TỔNG CỘNG:'};
    ws_details[`D${totalRowNum}`] = {t:'n', f:`SUM(D2:D${totalRowNum-1})`, z: '#,##0 "₫"'};

    for(let i = 2; i <= totalRowNum; i++) {
        if(ws_details[`D${i}`]) ws_details[`D${i}`].z = '#,##0 "₫"';
    }
    
    // Explicitly update worksheet range reference (!ref) to include the manual summary row
    let range = XLSX.utils.decode_range(ws_details['!ref']);
    if (range.e.r < totalRowNum - 1) {
        range.e.r = totalRowNum - 1;
        ws_details['!ref'] = XLSX.utils.encode_range(range);
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
    const exportZeroCheckbox = document.getElementById('export-zero');
    const exportReasonSection = document.getElementById('export-reason-section');
    const exportReasonSelect = document.getElementById('export-reason');
    const amountInput = document.getElementById('amount');
    const exportXlsxBtn = document.getElementById('export-xlsx-btn');
    const searchHistoryInput = document.getElementById('search-history');

    mainForm?.addEventListener('submit', window.handleFormSubmit);
    
    if (exportZeroCheckbox) {
        exportZeroCheckbox.addEventListener('change', () => {
            const isZero = exportZeroCheckbox.checked;
            if (isZero) {
                amountInput.value = 0;
                amountInput.readOnly = true;
                exportReasonSection?.classList.remove('hidden');
            } else {
                amountInput.readOnly = false;
                exportReasonSection?.classList.add('hidden');
                // Hide custom reason input and clear its value
                const customSection = document.getElementById('export-reason-custom-section');
                if (customSection) customSection.classList.add('hidden');
                const customInput = document.getElementById('export-reason-custom');
                if (customInput) customInput.value = '';
                if (exportReasonSelect) exportReasonSelect.value = '';
            }
            console.log('Export zero checkbox changed:', isZero);
        });
    }
    // Listener for export reason dropdown – show custom input when "Khác" is selected
    exportReasonSelect?.addEventListener('change', () => {
        const customSection = document.getElementById('export-reason-custom-section');
        if (exportReasonSelect.value === 'other') {
            customSection?.classList.remove('hidden');
        } else {
            customSection?.classList.add('hidden');
            const customInput = document.getElementById('export-reason-custom');
            if (customInput) customInput.value = '';
        }
    });
    console.log('Export zero UI initialized', { exportZeroCheckbox, exportReasonSection, exportReasonSelect });

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

    const historyRange = document.getElementById('history-range');
    const historyCustomDateRange = document.getElementById('history-custom-date-range');
    const historyCustomStart = document.getElementById('history-custom-start');
    const historyCustomEnd = document.getElementById('history-custom-end');

    if (historyRange) {
        const toggleHistoryCustomRange = () => {
            if (historyCustomDateRange) {
                historyCustomDateRange.classList.toggle('hidden', historyRange.value !== 'custom');
                historyCustomDateRange.classList.toggle('flex', historyRange.value === 'custom');
            }
        };
        
        historyRange.addEventListener('change', () => {
            toggleHistoryCustomRange();
            if (window.renderAll) window.renderAll();
        });
        historyCustomStart?.addEventListener('change', () => {
            if (window.renderAll) window.renderAll();
        });
        historyCustomEnd?.addEventListener('change', () => {
            if (window.renderAll) window.renderAll();
        });
        
        toggleHistoryCustomRange();
    }
});

