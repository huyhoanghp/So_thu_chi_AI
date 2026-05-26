// --- CATEGORIES MANAGEMENT MODULE ---

window.updateCategoryOptions = function() {
    const categorySelect = document.getElementById('category');
    const formModal = document.getElementById('form-modal');
    if (!categorySelect || !formModal) return;

    const selectedType = formModal.querySelector('input[name="type"]:checked').value;
    const currentCategory = categorySelect.value;
    
    categorySelect.innerHTML = window.categories[selectedType].map(c => `<option value="${c}">${c}</option>`).join('');
    if (window.categories[selectedType].includes(currentCategory)) {
        categorySelect.value = currentCategory;
    }
    
    if (window.updateFormFieldsVisibility) {
        window.updateFormFieldsVisibility();
    }
};

window.renderSettingsCategories = function() {
    const settingsGeminiKey = document.getElementById('settings-gemini-key');
    const settingsIncomeCategories = document.getElementById('settings-income-categories');
    const settingsExpenseCategories = document.getElementById('settings-expense-categories');
    
    if (settingsGeminiKey) settingsGeminiKey.value = window.geminiApiKey || '';

    if (settingsIncomeCategories) {
        settingsIncomeCategories.innerHTML = '';
        window.categories.income.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 text-sm';
            div.innerHTML = `
                <span class="font-medium">${cat}</span>
                <button class="text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 px-2 py-0.5 rounded-lg transition font-bold" data-category="${cat}" data-type="income">✕</button>
            `;
            settingsIncomeCategories.appendChild(div);
        });
    }

    if (settingsExpenseCategories) {
        settingsExpenseCategories.innerHTML = '';
        window.categories.expense.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 text-sm';
            div.innerHTML = `
                <span class="font-medium">${cat}</span>
                <button class="text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 px-2 py-0.5 rounded-lg transition font-bold" data-category="${cat}" data-type="expense">✕</button>
            `;
            settingsExpenseCategories.appendChild(div);
        });
    }

    // Bind delete buttons
    settingsIncomeCategories?.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => window.removeCategory('income', e.currentTarget.dataset.category));
    });
    settingsExpenseCategories?.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => window.removeCategory('expense', e.currentTarget.dataset.category));
    });
};

window.removeCategory = function(type, categoryName) {
    if (window.categories[type].length <= 1) {
        window.showToast('Không thể xóa danh mục cuối cùng.', 'error');
        return;
    }
    if (type === 'income' && categoryName === 'Bán hàng') {
        window.showToast('Không thể xóa danh mục hệ thống "Bán hàng".', 'error');
        return;
    }
    if (type === 'expense' && categoryName === 'Nhập hàng') {
        window.showToast('Không thể xóa danh mục hệ thống "Nhập hàng".', 'error');
        return;
    }

    window.openConfirmationModal(`Bạn có muốn xóa danh mục ${type === 'income' ? 'thu' : 'chi'} "${categoryName}"?`, () => {
        window.categories[type] = window.categories[type].filter(c => c !== categoryName);
        localStorage.setItem('user_categories', JSON.stringify(window.categories));
        window.renderSettingsCategories();
        window.showToast('Đã xóa danh mục.');
    }, 'Xóa');
};

document.addEventListener('DOMContentLoaded', () => {
    const saveGeminiKeyBtn = document.getElementById('save-gemini-key-btn');
    const settingsGeminiKey = document.getElementById('settings-gemini-key');
    const addIncomeCategoryBtn = document.getElementById('add-income-category-btn');
    const newIncomeCategory = document.getElementById('new-income-category');
    const addExpenseCategoryBtn = document.getElementById('add-expense-category-btn');
    const newExpenseCategory = document.getElementById('new-expense-category');

    saveGeminiKeyBtn?.addEventListener('click', () => {
        const key = settingsGeminiKey?.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            window.geminiApiKey = key;
            window.showToast('Đã lưu Gemini API Key!');
        } else {
            localStorage.removeItem('gemini_api_key');
            window.geminiApiKey = '';
            window.showToast('Đã xóa Gemini API Key!');
        }
    });

    addIncomeCategoryBtn?.addEventListener('click', () => {
        const val = newIncomeCategory?.value.trim();
        if (!val) return window.showToast('Vui lòng nhập tên danh mục.', 'error');
        if (window.categories.income.includes(val)) return window.showToast('Danh mục đã tồn tại.', 'error');
        window.categories.income.push(val);
        localStorage.setItem('user_categories', JSON.stringify(window.categories));
        if (newIncomeCategory) newIncomeCategory.value = '';
        window.renderSettingsCategories();
        window.showToast('Đã thêm danh mục thu.');
    });

    addExpenseCategoryBtn?.addEventListener('click', () => {
        const val = newExpenseCategory?.value.trim();
        if (!val) return window.showToast('Vui lòng nhập tên danh mục.', 'error');
        if (window.categories.expense.includes(val)) return window.showToast('Danh mục đã tồn tại.', 'error');
        window.categories.expense.push(val);
        localStorage.setItem('user_categories', JSON.stringify(window.categories));
        if (newExpenseCategory) newExpenseCategory.value = '';
        window.renderSettingsCategories();
        window.showToast('Đã thêm danh mục chi.');
    });
});
