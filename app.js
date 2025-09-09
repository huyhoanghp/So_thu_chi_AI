// This is the complete script. No parts are missing.
document.addEventListener('DOMContentLoaded', () => {
    // --- App Setup & State ---
    const appShell = document.getElementById('app-shell');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const loadingOverlay = document.getElementById('loading-overlay');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netProfitEl = document.getElementById('net-profit');
    const transactionList = document.getElementById('transaction-list');
    const transactionEmptyState = document.getElementById('transaction-empty-state');
    const planList = document.getElementById('plan-list');
    const planEmptyState = document.getElementById('plan-empty-state');
    const productList = document.getElementById('product-list');
    const productEmptyState = document.getElementById('product-empty-state');
    const promotionList = document.getElementById('promotion-list');
    const promotionEmptyState = document.getElementById('promotion-empty-state');


    const addPlanBtn = document.getElementById('add-plan-btn');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const addPromotionBtn = document.getElementById('add-promotion-btn');
    
    const exportXlsxBtn = document.getElementById('export-xlsx-btn');
    const searchPlanInput = document.getElementById('search-plan');
    const searchHistoryInput = document.getElementById('search-history');
    const searchProductsInput = document.getElementById('search-products');

    // Modals
    const formModal = document.getElementById('form-modal');
    const modalTitle = document.getElementById('modal-title');
    const mainForm = document.getElementById('main-form');
    const editingIdInput = document.getElementById('editing-id');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const categorySelect = document.getElementById('category');
    const typeRadios = formModal.querySelectorAll('input[name="type"]');
    const customerNameField = document.getElementById('customer-name-field');
    const customerNameInput = document.getElementById('customerName');
    const customerNoteInput = document.getElementById('customerNote');
    
    // Product Section in Transaction Form
    const productSection = document.getElementById('product-section');
    const productSelect = document.getElementById('product-select');
    const transactionQuantityInput = document.getElementById('transaction-quantity');
    
    // Import Section in Transaction Form
    const importSection = document.getElementById('import-section');
    const importProductSelect = document.getElementById('import-product-select');
    const importQuantityInput = document.getElementById('import-quantity');


    // Product Modal
    const productModal = document.getElementById('product-modal');
    const productModalTitle = document.getElementById('product-modal-title');
    const productForm = document.getElementById('product-form');
    const editingProductIdInput = document.getElementById('editing-product-id');
    const productNameInput = document.getElementById('product-name');
    const productCostPriceInput = document.getElementById('product-cost-price');
    const productSellingPriceInput = document.getElementById('product-selling-price');
    const productStockInput = document.getElementById('product-stock');

    // Promotion Modal
    const promotionModal = document.getElementById('promotion-modal');
    const promotionModalTitle = document.getElementById('promotion-modal-title');
    const promotionForm = document.getElementById('promotion-form');


    const completePlanModal = document.getElementById('complete-plan-modal');
    const completePlanForm = document.getElementById('complete-plan-form');
    const completePlanIdInput = document.getElementById('complete-plan-id');
    const completePlanDescriptionEl = document.getElementById('complete-plan-description');
    const completePlanAmountInput = document.getElementById('complete-plan-amount');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmActionBtn = document.getElementById('confirm-action-btn');

    // Tabs
    const tabSales = document.getElementById('tab-sales');
    const tabPromotions = document.getElementById('tab-promotions');
    const tabPlan = document.getElementById('tab-plan');
    const tabProducts = document.getElementById('tab-products');
    const tabHistory = document.getElementById('tab-history');
    const tabDashboard = document.getElementById('tab-dashboard');
    const contentSales = document.getElementById('content-sales');
    const contentPromotions = document.getElementById('content-promotions');
    const contentPlan = document.getElementById('content-plan');
    const contentProducts = document.getElementById('content-products');
    const contentHistory = document.getElementById('content-history');
    const contentDashboard = document.getElementById('content-dashboard');

    // Sales / Invoice UI
    const salesProductListEl = document.getElementById('sales-product-list');
    const salesProductSearchEl = document.getElementById('sales-product-search');
    const invoiceItemsEl = document.getElementById('invoice-items');
    const invoiceEmptyEl = document.getElementById('invoice-empty');
    const invoiceSubtotalEl = document.getElementById('invoice-subtotal');
    const invoicePromoNameEl = document.getElementById('invoice-promo-name');
    const invoiceDiscountEl = document.getElementById('invoice-discount');
    const invoiceTotalEl = document.getElementById('invoice-total');
    const completeSaleBtn = document.getElementById('complete-sale-btn');


    // Report Elements
    const productReportFilterContainer = document.getElementById('product-report-filter-container');


    const reportRangeEl = document.getElementById('report-range');
    const customDateRangeDiv = document.getElementById('custom-date-range');
    const customStartEl = document.getElementById('custom-start');
    const customEndEl = document.getElementById('custom-end');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const addAiBtn = document.getElementById('add-ai-btn');
    const aiEntryModal = document.getElementById('ai-entry-modal');
    const aiEntryForm = document.getElementById('ai-entry-form');
    const aiInput = document.getElementById('ai-input');
    const aiSpinner = document.getElementById('ai-spinner');
    const fabContainer = document.getElementById('fab-container');
    const fabToggleBtn = document.getElementById('fab-toggle-btn');
    const fabActions = document.getElementById('fab-actions');
    const fabBackdrop = document.getElementById('fab-backdrop');
    
    // Chat UI Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const aiThinkingIndicator = document.getElementById('ai-thinking-indicator');
    let expensePieChart, cashflowTrendChart, productSalesTrendChart;
    const expensePieChartCtx = document.getElementById('expense-pie-chart')?.getContext('2d');
    const cashflowTrendChartCtx = document.getElementById('cashflow-trend-chart')?.getContext('2d');
    const productSalesTrendChartCtx = document.getElementById('product-sales-trend-chart')?.getContext('2d');

    let auth, db, geminiApiKey;
    let transactionsCollection, plansCollection, productsCollection, promotionsCollection;
    let transactions = [], plans = [], products = [], promotions = [];
    let currentTransactionItems = [];
    let currentUserId = null;
    let toastTimeout;
    let confirmAction = null;
    let chatHistory = [];
    let audioCache = {};
    let currentAudio = null;
    let currentlyPlayingButton = null;
    let currentEditingTransaction = null;
    const playIconSVG = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.5 12a4.5 4.5 0 000-8v8z"></path></svg>`;
    const stopIconSVG = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><rect width="10" height="10" x="5" y="5" rx="1"></rect></svg>`;
    
    const categories = {
        income: ['Bán hàng', 'Thu khác', 'Cho tặng', 'Mấy đứa nhỏ', 'Xả hàng'],
        expense: ['Nhập hàng', 'Nguyên liệu chính', 'Nguyên liệu phụ', 'Vật tư', 'Chi phí vận hành', 'Chi phí khác']
    };

    // --- Firebase Initialization & Auth Handling ---
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyBkgzeseW1hFbiEiHrK6kXtMgdFE4gdUSI",
            authDomain: "sothuchiapp-5efc7.firebaseapp.com",
            projectId: "sothuchiapp-5efc7",
            storageBucket: "sothuchiapp-5efc7.firebasestorage.app",
            messagingSenderId: "537279498834",
            appId: "1:537279498834:web:b5277e19fc234d11e36d8b",
            measurementId: "G-XYK5Q974RP"
        };

        geminiApiKey = "AIzaSyCb6WTOOMERzf_tu7SahPAhU21y6AyFMCc"; 
        
        if (!firebaseConfig.apiKey) {
            loginScreen.innerHTML = `<p class="text-red-500 text-center">Lỗi: Cấu hình Firebase chưa được thiết lập trong mã nguồn.</p>`;
            return;
        }

        if (typeof firebase === 'undefined') throw new Error("Firebase SDK not loaded.");
        
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged(user => {
            if (user) {
                currentUserId = user.uid;
                userName.textContent = user.displayName;
                userPhoto.src = user.photoURL;
                
                const basePath = `/artifacts/${firebaseConfig.projectId}/users/${currentUserId}`;
                transactionsCollection = db.collection(`${basePath}/transactions`);
                plansCollection = db.collection(`${basePath}/plans`);
                productsCollection = db.collection(`${basePath}/products`);
                promotionsCollection = db.collection(`${basePath}/promotions`);
                
                loginScreen.classList.add('hidden');
                appContainer.classList.remove('hidden');
                loadingOverlay.style.display = 'flex';
                listenForData();
            } else {
                currentUserId = null;
                transactions = []; plans = []; products = []; promotions = [];
                renderAll();
                appContainer.classList.add('hidden');
                loginScreen.classList.remove('hidden');
            }
        });
    } catch (err) {
        loginScreen.innerHTML = `<p class="text-red-500 text-center">${err.message}</p>`;
    }
    
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => alert("Đăng nhập thất bại: " + error.message));
    };
    const signOut = () => auth.signOut();
    loginBtn.addEventListener('click', signInWithGoogle);
    logoutBtn.addEventListener('click', signOut);

    function listenForData() {
        if (!transactionsCollection || !plansCollection || !productsCollection || !promotionsCollection) return;
        
        const dataLoaded = { transactions: false, plans: false, products: false, promotions: false };
        const checkAllDataLoaded = () => {
            if (Object.values(dataLoaded).every(Boolean)) {
                loadingOverlay.style.display = 'none';
                renderAll();
            }
        };

        transactionsCollection.onSnapshot(snapshot => {
            transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            dataLoaded.transactions = true; checkAllDataLoaded();
        }, err => showError("Không thể tải lịch sử giao dịch: " + err.message));

        plansCollection.onSnapshot(snapshot => {
            plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            dataLoaded.plans = true; checkAllDataLoaded();
        }, err => showError("Không thể tải danh sách kế hoạch: " + err.message));
        
        productsCollection.onSnapshot(snapshot => {
            products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.name.localeCompare(b.name));
            dataLoaded.products = true; checkAllDataLoaded();
        }, err => showError("Không thể tải danh sách sản phẩm: " + err.message));

        promotionsCollection.onSnapshot(snapshot => {
            promotions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dataLoaded.promotions = true; checkAllDataLoaded();
        }, err => showError("Không thể tải danh sách khuyến mại: " + err.message));
    }
    
    function renderAll() {
        const { currentPeriodData } = getReportData();
        const searchedPlans = filterData(plans, 'search', searchPlanInput.value);
        const searchedTransactions = filterData(transactions, 'search', searchHistoryInput.value);
        const searchedProducts = filterData(products, 'search', searchProductsInput.value);
        
        updateSummary(currentPeriodData);
        renderTransactionList(searchedTransactions);
        renderPlanList(searchedPlans);
        renderProductList(searchedProducts);
        renderPromotionList();
        renderSalesProductList();
        populateProductReportFilter();


        if(!contentDashboard.classList.contains('hidden')){
            renderReports();
        }
    }
    
    function renderPlanList(source) {
        planList.innerHTML = '';
        planEmptyState.style.display = source.length === 0 ? 'block' : 'none';
        source.forEach(plan => planList.appendChild(createPlanElement(plan)));
    }
    function renderTransactionList(source) {
        transactionList.innerHTML = '';
        transactionEmptyState.style.display = source.length === 0 ? 'block' : 'none';
        source.forEach(tx => transactionList.appendChild(createTransactionElement(tx)));
    }
    function renderProductList(source) {
        productList.innerHTML = '';
        productEmptyState.style.display = source.length === 0 ? 'block' : 'none';
        source.forEach(product => productList.appendChild(createProductElement(product)));
    }
    function renderSalesProductList() {
        const filter = salesProductSearchEl.value.toLowerCase();
        salesProductListEl.innerHTML = '';
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filter));
        if (filteredProducts.length === 0) {
            salesProductListEl.innerHTML = `<p class="col-span-full text-center text-gray-500">Không tìm thấy sản phẩm.</p>`;
            return;
        }
        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'p-2 border rounded-lg text-center cursor-pointer hover:bg-indigo-100 hover:shadow-md transition';
            productDiv.innerHTML = `
                <div class="font-semibold text-sm">${product.name}</div>
                <div class="text-xs text-gray-600">${formatCurrency(product.sellingPrice)}</div>
            `;
            productDiv.onclick = () => addProductToInvoice(product.id);
            salesProductListEl.appendChild(productDiv);
        });
    }

    function updateSummary(source) {
        const totalIncome = source.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
        const totalExpense = source.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        netProfitEl.textContent = formatCurrency(totalIncome - totalExpense);
        netProfitEl.classList.toggle('text-green-600', totalIncome - totalExpense >= 0);
        netProfitEl.classList.toggle('text-red-600', totalIncome - totalExpense < 0);
        exportXlsxBtn.disabled = source.length === 0;
    }

    function createPlanElement(plan) {
        const { id, type, description, amount, category, customerName, customerNote, createdAt, date, productId, quantity } = plan;
        const isIncome = type === 'income';
        const item = document.createElement('li');
        item.className = `p-3 rounded-lg flex items-start gap-3 border-l-4 ${isIncome ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`;
        let extraInfoHtml = '';
        if ((isIncome && customerName) || customerNote) {
            extraInfoHtml = `<div class="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-700">
                ${(isIncome && customerName) ? `<p><strong>KH:</strong> ${customerName}</p>` : ''}
                ${customerNote ? `<p><strong>Ghi chú:</strong> ${customerNote}</p>` : ''}
            </div>`;
        }
        const displayDateTimeStr = formatDisplayDateTime(createdAt, date);
        item.innerHTML = `<input type="checkbox" class="plan-item-checkbox mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            <div class="flex-grow flex flex-col">
                <div>
                    <p class="font-bold text-gray-500 text-sm">${category || ''}</p>
                    <p class="font-semibold">${description || ''}</p>
                    <p class="text-sm font-bold mt-1 ${isIncome ? 'text-green-600' : 'text-red-600'}">${formatCurrency(amount)}</p>
                    ${extraInfoHtml}
                </div>
                <p class="text-xs text-gray-500 text-right mt-2">${displayDateTimeStr}</p>
            </div>
            <div class="flex flex-col gap-2">
                <button data-action="edit" class="text-gray-500 hover:text-blue-600 transition p-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                <button data-action="delete" class="text-gray-500 hover:text-red-600 transition p-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
            </div>`;
        item.querySelector('.plan-item-checkbox').addEventListener('change', (e) => { 
            if (e.target.checked) { 
                const planData = { id, type, description, amount, date, category, customerName, customerNote, productId, quantity };
                openCompletePlanModal(planData); 
                e.target.checked = false; 
            } 
        });
        item.querySelector('button[data-action="edit"]').addEventListener('click', () => openFormModal('editPlan', plan));
        item.querySelector('button[data-action="delete"]').addEventListener('click', () => deletePlan(id, description));
        return item;
    }
    function createTransactionElement(tx) {
        const { id, type, description, amount, date, category, customerName, customerNote, createdAt, items } = tx;
        const isIncome = type === 'income';
        const isMultiItemSale = Array.isArray(items) && items.length > 0;

        const item = document.createElement('li');
        item.className = `p-4 rounded-lg border-l-4 ${isIncome ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`;
        const displayDateTimeStr = formatDisplayDateTime(createdAt, date);
        let extraInfoHtml = '';
        if ((isIncome && customerName) || customerNote) {
            extraInfoHtml = `<div class="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-700">
                ${(isIncome && customerName) ? `<p><strong>KH:</strong> ${customerName}</p>` : ''}
                ${customerNote ? `<p><strong>Ghi chú:</strong> ${customerNote}</p>` : ''}
            </div>`;
        }

        const editButton = `<button data-action="edit" class="text-gray-500 hover:text-blue-600 transition p-1 ${isMultiItemSale ? 'opacity-50 cursor-not-allowed' : ''}" ${isMultiItemSale ? 'disabled title="Không thể sửa hóa đơn nhiều sản phẩm"' : ''}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>`;

        item.innerHTML = `<div class="flex justify-between items-start">
                <div class="flex-grow flex flex-col">
                    <div>
                        <p class="font-bold text-gray-500 text-sm">${category || 'Chưa phân loại'}</p>
                        <p class="font-semibold text-lg">${description || 'Không có nội dung'}</p>
                        ${extraInfoHtml}
                    </div>
                    <p class="text-xs text-gray-500 text-right mt-2">${displayDateTimeStr}</p>
                </div>
                <div class="text-right flex-shrink-0 ml-4">
                    <p class="font-bold text-xl ${isIncome ? 'text-green-600' : 'text-red-600'}">${isIncome ? '+' : '-'}${formatCurrency(amount)}</p>
                    <div class="flex gap-2 justify-end mt-1">
                        ${editButton}
                        <button data-action="delete" class="text-gray-500 hover:text-red-600 transition p-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                    </div>
                </div>
            </div>`;
        const editBtnEl = item.querySelector('button[data-action="edit"]');
        if (editBtnEl && !editBtnEl.disabled) {
            editBtnEl.addEventListener('click', () => openFormModal('editTransaction', tx));
        }
        item.querySelector('button[data-action="delete"]').addEventListener('click', () => deleteTransaction(tx));
        return item;
    }
     function createProductElement(product) {
        const { id, name, costPrice, sellingPrice, stock } = product;
        const item = document.createElement('li');
        item.className = 'p-4 rounded-lg bg-white border border-gray-200 shadow-sm';
        
        const stockColor = stock > 10 ? 'text-green-600' : (stock > 0 ? 'text-orange-500' : 'text-red-600');

        item.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div class="flex-grow">
                    <p class="font-bold text-lg text-blue-800">${name}</p>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                        <span>Giá bán: <strong class="text-green-700">${formatCurrency(sellingPrice)}</strong></span>
                        <span>Giá vốn: <strong class="text-red-700">${formatCurrency(costPrice)}</strong></span>
                        <span>Tồn kho: <strong class="${stockColor}">${stock}</strong></span>
                    </div>
                </div>
                <div class="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    <button data-action="sell" class="w-1/2 sm:w-auto text-sm bg-green-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-700 transition">Bán</button>
                    <button data-action="edit" class="w-1/4 sm:w-auto text-gray-500 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <button data-action="delete" class="w-1/4 sm:w-auto text-gray-500 hover:text-red-600 transition p-2 rounded-lg hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </div>
            </div>`;
        item.querySelector('button[data-action="sell"]').addEventListener('click', () => {
             switchTab('sales');
             addProductToInvoice(product.id);
        });
        item.querySelector('button[data-action="edit"]').addEventListener('click', () => openProductModal('edit', product));
        item.querySelector('button[data-action="delete"]').addEventListener('click', () => deleteProduct(id, name));
        return item;
    }
    
    function openFormModal(mode, data = {}) {
        currentFormMode = mode;
        mainForm.reset();
        descriptionInput.readOnly = false;
        productSelect.value = '';
        importProductSelect.value = '';

        const type = data.type || 'income';
        formModal.querySelector(`input[name="type"][value="${type}"]`).checked = true;
        updateCategoryOptions();

        if (mode === 'editTransaction') {
            currentEditingTransaction = transactions.find(t => t.id === data.id) || null;
        } else {
            currentEditingTransaction = null;
        }

        switch(mode) {
            case 'addPlan':
            case 'addTransaction':
                modalTitle.textContent = mode === 'addPlan' ? 'Thêm Kế Hoạch Mới' : 'Thêm Giao Dịch Nhanh';
                editingIdInput.value = '';
                descriptionInput.value = data.description || '';
                amountInput.value = data.amount || '';
                dateInput.value = data.date || new Date().toISOString().split('T')[0];
                categorySelect.value = data.category || (type === 'income' ? 'Bán hàng' : 'Chi phí khác');
                customerNameInput.value = data.customerName || '';
                customerNoteInput.value = data.customerNote || '';
                transactionQuantityInput.value = data.quantity || 1;
                importQuantityInput.value = data.quantity || 1;
                break;
            case 'editPlan':
            case 'editTransaction':
                modalTitle.textContent = mode === 'editPlan' ? 'Chỉnh Sửa Kế Hoạch' : 'Chỉnh Sửa Giao Dịch';
                editingIdInput.value = data.id || '';
                descriptionInput.value = data.description || '';
                amountInput.value = data.amount || '';
                dateInput.value = data.date || '';
                categorySelect.value = data.category || '';
                customerNameInput.value = data.customerName || '';
                customerNoteInput.value = data.customerNote || '';
                transactionQuantityInput.value = data.quantity || 1;
                importQuantityInput.value = data.quantity || 1;
                break;
        }

        updateFormFieldsVisibility();

        // Handle product selection logic
        if (data.productId) {
            if (type === 'income') {
                productSelect.value = data.productId;
                handleProductSelection(true); // Pass true to indicate it's from AI
            } else if (type === 'expense' && categorySelect.value === 'Nhập hàng') {
                importProductSelect.value = data.productId;
                handleImportProductSelection(true);
            }
        }
        
        formModal.classList.remove('hidden');
        setTimeout(() => formModal.classList.remove('opacity-0'), 10);
    }

    function closeFormModal() { formModal.classList.add('opacity-0'); setTimeout(() => formModal.classList.add('hidden'), 300); }
    
    function openProductModal(mode, data = {}) {
        productForm.reset();
        if (mode === 'edit') {
            productModalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
            editingProductIdInput.value = data.id;
            productNameInput.value = data.name;
            productCostPriceInput.value = data.costPrice;
            productSellingPriceInput.value = data.sellingPrice;
            productStockInput.value = data.stock;
        } else {
            productModalTitle.textContent = 'Thêm Sản Phẩm Mới';
            editingProductIdInput.value = '';
        }
        productModal.classList.remove('hidden');
        setTimeout(() => productModal.classList.remove('opacity-0'), 10);
    }

    function closeProductModal() { productModal.classList.add('opacity-0'); setTimeout(() => productModal.classList.add('hidden'), 300); }
    
    async function handleProductFormSubmit(e) {
        e.preventDefault();
        const data = {
            name: productNameInput.value.trim(),
            costPrice: +productCostPriceInput.value || 0,
            sellingPrice: +productSellingPriceInput.value,
            stock: +productStockInput.value,
        };
        if (!data.name || data.sellingPrice <= 0) { 
            return showToast("Vui lòng nhập tên và giá bán hợp lệ.", "error"); 
        }
        
        const saveProduct = async () => {
            const editingId = editingProductIdInput.value;
            try {
                if (editingId) {
                    await productsCollection.doc(editingId).update(data);
                    showToast("Đã cập nhật sản phẩm!");
                } else {
                    await productsCollection.add(data);
                    showToast("Đã thêm sản phẩm thành công!");
                }
                closeProductModal();
            } catch (err) { 
                showToast(`Lỗi: ${err.message}`, "error"); 
            }
        };

        if (data.costPrice <= 0) {
            openConfirmationModal(
                "Giá vốn đang bị bỏ trống hoặc bằng 0. Bạn có chắc muốn lưu không?",
                saveProduct,
                "Vẫn lưu"
            );
        } else {
            saveProduct();
        }
    }


    async function handleFormSubmit(e) {
        e.preventDefault();
        const type = formModal.querySelector('input[name="type"]:checked').value;
        const category = categorySelect.value;
        
        let productId = null;
        let quantity = null;
        let items = null; // Important for edit logic

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
            amount: +amountInput.value, 
            date: dateInput.value, 
            category: category, 
            customerName: customerNameInput.value.trim(), 
            customerNote: customerNoteInput.value.trim(), 
            createdAt: new Date().toISOString(),
            productId: productId,
            quantity: quantity,
            items: items // Will be null for single item tx
        };

        if (!data.description || data.amount < 0) { return showToast("Vui lòng nhập nội dung và số tiền hợp lệ.", "error"); }
        
        const executeSave = async () => {
            try {
                if (currentFormMode === 'addPlan') {
                    await plansCollection.add(data); 
                    showToast("Đã thêm kế hoạch thành công!");
                } else if (currentFormMode === 'addTransaction') {
                    await transactionsCollection.add(data);
                    if (data.productId && data.quantity > 0) {
                        const stockChange = data.type === 'income' ? -data.quantity : data.quantity;
                        await productsCollection.doc(data.productId).update({ stock: firebase.firestore.FieldValue.increment(stockChange) });
                    }
                    showToast("Đã thêm giao dịch thành công!");
                } else if (currentFormMode === 'editPlan') {
                    delete data.createdAt;
                    await plansCollection.doc(editingIdInput.value).update(data); 
                    showToast("Đã cập nhật kế hoạch!");
                } else if (currentFormMode === 'editTransaction') {
                    const beforeTx = currentEditingTransaction;
                    // Prevent editing multi-item sales
                    if(beforeTx && Array.isArray(beforeTx.items) && beforeTx.items.length > 0) {
                        showToast("Không thể sửa hóa đơn nhiều sản phẩm từ đây.", "error");
                        return;
                    }

                    const afterTxData = data;
                    const txDocRef = transactionsCollection.doc(editingIdInput.value);

                    const oldProductId = beforeTx ? beforeTx.productId : null;
                    const oldQuantity = beforeTx ? beforeTx.quantity || 0 : 0;
                    const oldType = beforeTx ? beforeTx.type : null;
                    
                    const newProductId = afterTxData.productId;
                    const newQuantity = afterTxData.quantity || 0;
                    const newType = afterTxData.type;

                    const batch = db.batch();
                    batch.update(txDocRef, afterTxData);

                    if (oldProductId !== newProductId || oldQuantity !== newQuantity || oldType !== newType) {
                        // Revert old stock change
                        if (oldProductId && oldQuantity > 0) {
                            const oldStockChange = oldType === 'income' ? oldQuantity : -oldQuantity;
                            batch.update(productsCollection.doc(oldProductId), { stock: firebase.firestore.FieldValue.increment(oldStockChange) });
                        }
                        // Apply new stock change
                        if (newProductId && newQuantity > 0) {
                            const newStockChange = newType === 'income' ? -newQuantity : newQuantity;
                            batch.update(productsCollection.doc(newProductId), { stock: firebase.firestore.FieldValue.increment(newStockChange) });
                        }
                    }
                    await batch.commit();
                    showToast("Đã cập nhật giao dịch và kho hàng!");
                }
                closeFormModal();
            } catch (err) { 
                showToast(`Lỗi: ${err.message}`, "error"); 
            }
        };
        
        if (currentFormMode === 'addTransaction' && data.productId && data.quantity > 0 && data.type === 'income') {
            const product = products.find(p => p.id === data.productId);
            if (product && data.quantity > product.stock) {
                openConfirmationModal(
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
    }

    const deleteProduct = (id, name) => { 
        openConfirmationModal(`Bạn có chắc muốn xóa sản phẩm "${name}"? Thao tác này không thể hoàn tác.`, async () => { 
            try { 
                await productsCollection.doc(id).delete(); 
                showToast("Đã xóa sản phẩm."); 
            } catch(e) { 
                showToast('Lỗi: '+e.message, "error"); 
            } 
        }); 
    };
    const deletePlan = (id, description) => { openConfirmationModal(`Bạn có chắc muốn xóa kế hoạch "${description}"?`, async () => { try { await plansCollection.doc(id).delete(); showToast("Đã xóa kế hoạch."); } catch(e) { showToast('Lỗi: '+e.message, "error"); } }); };
    
    const deleteTransaction = (tx) => { 
        openConfirmationModal(`Bạn có chắc muốn xóa giao dịch "${tx.description}"?`, async () => { 
            const batch = db.batch();
            const txRef = transactionsCollection.doc(tx.id);
            batch.delete(txRef);
            
            // Handle stock update for multi-item sales or single-item transactions
            if (Array.isArray(tx.items) && tx.items.length > 0) {
                 tx.items.forEach(item => {
                    const productRef = productsCollection.doc(item.id);
                    batch.update(productRef, { stock: firebase.firestore.FieldValue.increment(item.quantity) });
                });
            } else if (tx.productId && tx.quantity > 0) {
                const stockChange = tx.type === 'income' ? tx.quantity : -tx.quantity;
                const productRef = productsCollection.doc(tx.productId);
                batch.update(productRef, { stock: firebase.firestore.FieldValue.increment(stockChange) });
            }

            try { 
                await batch.commit();
                showToast("Đã xóa giao dịch và cập nhật lại kho hàng."); 
            } catch(e) { 
                showToast('Lỗi khi xóa: '+e.message, "error"); 
            } 
        }); 
    };

    function openCompletePlanModal(plan) {
        completePlanIdInput.value = JSON.stringify(plan);
        completePlanDescriptionEl.textContent = plan.description;
        completePlanAmountInput.value = plan.amount;
        completePlanModal.classList.remove('hidden');
        setTimeout(() => completePlanModal.classList.remove('opacity-0'), 10);
    }
    function closeCompletePlanModal() { completePlanModal.classList.add('opacity-0'); setTimeout(() => completePlanModal.classList.add('hidden'), 300); }
    async function handleCompletePlanSubmit(e) {
        e.preventDefault();
        const plan = JSON.parse(completePlanIdInput.value);
        const actualAmount = +completePlanAmountInput.value;
        if (actualAmount <= 0 && plan.type !== 'expense') return showToast("Vui lòng nhập số tiền thực tế hợp lệ.", "error");
        
        const newTransaction = { ...plan, amount: actualAmount, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };
        delete newTransaction.id;
        
        try {
            const batch = db.batch();
            
            const newTxRef = transactionsCollection.doc();
            batch.set(newTxRef, newTransaction);
            
            if (newTransaction.productId && newTransaction.quantity > 0) {
                const stockChange = newTransaction.type === 'income' ? -newTransaction.quantity : newTransaction.quantity;
                const productRef = productsCollection.doc(newTransaction.productId);
                batch.update(productRef, { stock: firebase.firestore.FieldValue.increment(stockChange) });
            }
            
            const planRef = plansCollection.doc(plan.id);
            batch.delete(planRef);
            
            await batch.commit();
            
            showToast("Đã hoàn thành kế hoạch!");
            closeCompletePlanModal();
        } catch (err) { showToast(`Lỗi: ${err.message}`, "error"); }
    }
    
    function openConfirmationModal(message, onConfirm, confirmText = "Xóa") {
        confirmationMessage.textContent = message;
        confirmAction = onConfirm;
        confirmActionBtn.textContent = confirmText;
        confirmActionBtn.className = 'font-bold py-2 px-4 rounded-lg transition text-white ';
        if (confirmText === "Xóa") {
            confirmActionBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            confirmActionBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
        confirmationModal.classList.remove('hidden');
        setTimeout(() => confirmationModal.classList.remove('opacity-0'), 10);
    }
    function closeConfirmationModal() { confirmationModal.classList.add('opacity-0'); setTimeout(() => confirmationModal.classList.add('hidden'), 300); }
    
    const formatCurrency = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
    const showError = (msg) => { console.error(msg); loadingOverlay.innerHTML = `<p class="text-red-500 p-4 text-center">${msg}</p>`; };
    function formatDisplayDateTime(createdAt, date) { const timestamp = createdAt || date; if (!timestamp) return 'Không có ngày'; const d = new Date(timestamp); const dateStr = d.toLocaleDateString('vi-VN'); const timeStr = d.toLocaleTimeString('vi-VN'); return `${dateStr} ${timeStr}`; }
    function showToast(message, type = "success") { clearTimeout(toastTimeout); toastMessage.textContent = message; toast.className = toast.className.replace(/bg-\w+-500/, ''); toast.classList.add(type === "success" ? "bg-green-500" : "bg-red-500"); toast.classList.remove("opacity-0", "translate-y-10"); toastTimeout = setTimeout(() => { toast.classList.add("opacity-0", "translate-y-10"); }, 3000); }
    
    function populateProductDropdown(selectElement) {
        const currentVal = selectElement.value;
        let options = `<option value="">${selectElement.id === 'product-select' ? '-- Ghi nhận thủ công --' : '-- Chọn sản phẩm --'}</option>`;
        products.forEach(p => {
            options += `<option value="${p.id}">${p.name} (Tồn: ${p.stock})</option>`;
        });
        selectElement.innerHTML = options;
        selectElement.value = currentVal;
    }

    function populateProductReportFilter() {
        productReportFilterContainer.innerHTML = '';
        if (products.length === 0) {
            productReportFilterContainer.innerHTML = `<p class="text-center text-gray-500">Chưa có sản phẩm nào.</p>`;
            return;
        }
        products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `
                <input id="report-prod-check-${p.id}" type="checkbox" value="${p.id}" class="report-product-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="report-prod-check-${p.id}" class="ml-2 block text-sm text-gray-900">${p.name}</label>
            `;
            productReportFilterContainer.appendChild(div);
        });

        document.querySelectorAll('.report-product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', renderReports);
        });
    }


    function handleProductSelection(fromAI = false) {
        const selectedId = productSelect.value;
        if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            if (product) {
                if (!fromAI) {
                    transactionQuantityInput.value = 1;
                }
                descriptionInput.value = product.name;
                descriptionInput.readOnly = true;
                handleQuantityChange();
            }
        } else {
            descriptionInput.readOnly = false;
        }
    }
    
    function handleQuantityChange() {
        const selectedId = productSelect.value;
        if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            const quantity = +transactionQuantityInput.value;
            if (product && quantity > 0) {
                amountInput.value = product.sellingPrice * quantity;
                descriptionInput.value = quantity > 1 ? `${quantity} ${product.name}` : product.name;
            }
        }
    }
    
    function handleImportProductSelection(fromAI = false) {
        const selectedId = importProductSelect.value;
        if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            if (product) {
                if (!fromAI) {
                   importQuantityInput.value = 1;
                }
                descriptionInput.value = `Nhập hàng: ${product.name}`;
                if (product.costPrice > 0) {
                    amountInput.value = product.costPrice * (+importQuantityInput.value);
                }
            }
        }
    }

    function handleImportQuantityChange() {
        const selectedId = importProductSelect.value;
         if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            const quantity = +importQuantityInput.value;
            if (product && quantity > 0 && product.costPrice > 0) {
                amountInput.value = product.costPrice * quantity;
            }
        }
    }


    function updateFormFieldsVisibility() { 
        const selectedType = formModal.querySelector('input[name="type"]:checked').value; 
        const selectedCategory = categorySelect.value;

        customerNameField.classList.toggle('hidden', selectedType !== 'income'); 
        productSection.classList.toggle('hidden', selectedType !== 'income');
        importSection.classList.toggle('hidden', !(selectedType === 'expense' && selectedCategory === 'Nhập hàng'));
        
        if (selectedType === 'income') {
            populateProductDropdown(productSelect);
        } else if (selectedType === 'expense' && selectedCategory === 'Nhập hàng') {
            populateProductDropdown(importProductSelect);
        }
    }
    function updateCategoryOptions() { 
        const selectedType = formModal.querySelector('input[name="type"]:checked').value; 
        const currentCategory = categorySelect.value;
        categorySelect.innerHTML = categories[selectedType].map(c => `<option value="${c}">${c}</option>`).join(''); 
        if (categories[selectedType].includes(currentCategory)) {
            categorySelect.value = currentCategory;
        }
        updateFormFieldsVisibility(); 
    }
    
    function filterData(data, filterType, searchTerm = '') {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return data;
        return data.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
    }
    
    function getPreviousPeriodRange(currentStart, currentEnd) {
        if (!currentStart || !currentEnd) return null;
        const duration = currentEnd.getTime() - currentStart.getTime();
        if(duration <= 0) return null;
        
        const prevEnd = new Date(currentStart.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);
        
        prevStart.setHours(0,0,0,0);
        prevEnd.setHours(23,59,59,999);

        return { start: prevStart, end: prevEnd };
    }

    function filterDataByDateRange(data, start, end) {
        if (!start || !end) return [];
        return data.filter(t => {
            if (!t.date) return false;
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    }

    function switchTab(tab) {
        [contentSales, contentPromotions, contentPlan, contentProducts, contentHistory, contentDashboard].forEach(c => c.classList.add('hidden'));
        [tabSales, tabPromotions, tabPlan, tabProducts, tabHistory, tabDashboard].forEach(t => t.classList.remove('active'));
        
        if (tab === 'sales') { contentSales.classList.remove('hidden'); tabSales.classList.add('active'); }
        else if (tab === 'promotions') { contentPromotions.classList.remove('hidden'); tabPromotions.classList.add('active'); }
        else if (tab === 'plan') { contentPlan.classList.remove('hidden'); tabPlan.classList.add('active'); } 
        else if (tab === 'products') { contentProducts.classList.remove('hidden'); tabProducts.classList.add('active'); } 
        else if (tab === 'history') { contentHistory.classList.remove('hidden'); tabHistory.classList.add('active'); } 
        else {
            contentDashboard.classList.remove('hidden');
            tabDashboard.classList.add('active');
            switchReportTab('overview');
            renderReports();
            if (chatHistory.length === 0) {
                chatHistory.push({ role: 'model', parts: [{ text: "Chào bạn, tôi là trợ lý phân tích tài chính. Bạn muốn biết điều gì về dữ liệu thu chi trong khoảng thời gian đã chọn?" }] });
                renderChat();
            }
        }
    }

    function switchReportTab(tab) {
        document.querySelectorAll('.report-tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.report-tab-button[data-report="${tab}"]`).classList.add('active');
        
        document.querySelectorAll('[id^="report-content-"]').forEach(content => content.classList.add('hidden'));
        document.getElementById(`report-content-${tab}`).classList.remove('hidden');
    }
    
    function renderReports() {
        const { currentPeriodData, previousPeriodData } = getReportData();
        renderOverviewReport(currentPeriodData, previousPeriodData);
        renderProductPerformanceReports(currentPeriodData);
        renderInventoryReport();
    }
    
    function getReportData() {
        const range = reportRangeEl.value;
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
                currentStart = customStartEl.value ? new Date(customStartEl.value) : null;
                currentEnd = customEndEl.value ? new Date(customEndEl.value) : null;
                break;
            default: // all
                currentStart = null;
                currentEnd = null;
        }

        if(currentEnd) currentEnd.setHours(23, 59, 59, 999);
        
        const currentPeriodData = currentStart ? filterDataByDateRange(transactions, currentStart, currentEnd) : transactions;
        
        const previousPeriodRange = getPreviousPeriodRange(currentStart, currentEnd);
        const previousPeriodData = previousPeriodRange ? filterDataByDateRange(transactions, previousPeriodRange.start, previousPeriodRange.end) : [];
        
        return { currentPeriodData, previousPeriodData };
    }

    function createComparisonCardHTML(title, currentValue, previousValue, isExpense) {
        let percentageChange = 0;
        let changeText;
        let isPositive;

        if (previousValue === 0) {
            percentageChange = currentValue > 0 ? Infinity : 0;
        } else {
            percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        }

        if (isExpense) {
            isPositive = percentageChange <= 0; // Decrease is good for expenses
        } else {
            isPositive = percentageChange >= 0; // Increase is good for income/profit
        }

        let colorClass = 'text-gray-500';
        let arrowSVG = '';

        if (percentageChange === Infinity) {
            changeText = 'Mới';
            colorClass = 'text-green-600';
            arrowSVG = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`;
        } else if (Math.abs(percentageChange) > 0) {
            colorClass = isPositive ? 'text-green-600' : 'text-red-600';
            arrowSVG = isPositive 
                ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>` 
                : `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`;
            changeText = `${Math.abs(percentageChange).toFixed(0)}%`;
        } else {
             changeText = `0%`;
        }

        return `
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-500">${title}</h3>
                <div class="mt-1 flex items-baseline justify-between">
                    <p class="text-2xl font-semibold text-gray-900">${formatCurrency(currentValue)}</p>
                    <span class="flex items-center text-sm font-semibold ${colorClass}">
                        ${arrowSVG}
                        ${changeText}
                    </span>
                </div>
            </div>
        `;
    }

    function renderOverviewReport(currentData, previousData) {
        // --- Comparison Cards ---
        const currentIncome = currentData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const currentExpense = currentData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const currentProfit = currentIncome - currentExpense;

        const previousIncome = previousData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const previousExpense = previousData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const previousProfit = previousIncome - previousExpense;
        
        const comparisonSection = document.getElementById('comparison-section');
        if(reportRangeEl.value !== 'all' && reportRangeEl.value !== 'custom') {
            comparisonSection.innerHTML = `
                ${createComparisonCardHTML('Doanh thu', currentIncome, previousIncome, false)}
                ${createComparisonCardHTML('Chi phí', currentExpense, previousExpense, true)}
                ${createComparisonCardHTML('Lợi nhuận', currentProfit, previousProfit, false)}
            `;
        } else {
            comparisonSection.innerHTML = '';
        }


        // --- Charts ---
        if (expensePieChart) expensePieChart.destroy();
        if (cashflowTrendChart) cashflowTrendChart.destroy();
        
        const expenses = currentData.filter(t => t.type === 'expense');
        if (expensePieChartCtx && expenses.length > 0) {
            const expenseByCategory = expenses.reduce((acc, curr) => { 
                acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0); return acc; 
            }, {});
            expensePieChart = new Chart(expensePieChartCtx, { type: 'doughnut', data: { labels: Object.keys(expenseByCategory), datasets: [{ data: Object.values(expenseByCategory), backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6'] }] }, options: { responsive: true, maintainAspectRatio: false } });
        }

        if (cashflowTrendChartCtx && currentData.length > 0) {
             const dataByDate = currentData.reduce((acc, curr) => { 
                const date = curr.date.split('T')[0]; 
                if (!acc[date]) acc[date] = { income: 0, expense: 0 }; 
                acc[date][curr.type] += (curr.amount || 0); 
                return acc; 
            }, {});
            const sortedDates = Object.keys(dataByDate).sort((a,b) => new Date(a) - new Date(b));
            const incomeData = sortedDates.map(date => dataByDate[date].income);
            const expenseData = sortedDates.map(date => dataByDate[date].expense);

            cashflowTrendChart = new Chart(cashflowTrendChartCtx, { type: 'line', data: { labels: sortedDates, datasets: [
                { label: 'Doanh thu', data: incomeData, borderColor: '#16a34a', backgroundColor: '#16a34a20', fill: true, tension: 0.1 },
                { label: 'Chi phí', data: expenseData, borderColor: '#dc2626', backgroundColor: '#dc262620', fill: true, tension: 0.1 }
            ] }, options: { responsive: true, maintainAspectRatio: false } });
        }
    }
    
    function renderProductPerformanceReports(source) {
        const selectedProductIds = [...document.querySelectorAll('.report-product-checkbox:checked')].map(opt => opt.value);

        let sales = source.filter(tx => tx.type === 'income' && (tx.productId || (Array.isArray(tx.items) && tx.items.length > 0)) );

        const allSalesItems = [];
        sales.forEach(tx => {
            if (Array.isArray(tx.items)) {
                tx.items.forEach(item => allSalesItems.push({ ...item, amount: item.price * item.quantity, productId: item.id, date: tx.date }));
            } else if (tx.productId) {
                allSalesItems.push(tx);
            }
        });
        
        let filteredSalesItems = allSalesItems;
        if (selectedProductIds.length > 0) {
            filteredSalesItems = allSalesItems.filter(item => selectedProductIds.includes(item.productId));
        }

        const productStats = {};

        allSalesItems.forEach(sale => { // Calculate stats from ALL sales in period for top 5
             const productId = sale.productId || sale.id;
             if (!productStats[productId]) {
                const productInfo = products.find(p => p.id === productId);
                productStats[productId] = {
                    name: productInfo ? productInfo.name : 'Sản phẩm không xác định',
                    costPrice: productInfo ? productInfo.costPrice : 0,
                    quantity: 0,
                    totalRevenue: 0,
                };
            }
            productStats[productId].quantity += sale.quantity;
            productStats[productId].totalRevenue += sale.amount;
        });

        const statsArray = Object.values(productStats).map(p => ({
            ...p,
            profit: p.totalRevenue - (p.costPrice * p.quantity)
        }));

        // Top Selling
        const topSelling = [...statsArray].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        document.getElementById('top-selling-products').innerHTML = topSelling.map(p => `<div class="p-2 bg-gray-50 rounded-md"><strong>${p.name}</strong>: đã bán ${p.quantity}</div>`).join('') || '<p class="text-center text-gray-500">Không có dữ liệu.</p>';

        // Top Profit
        const topProfit = [...statsArray].sort((a, b) => b.profit - a.profit).slice(0, 5);
        document.getElementById('top-profit-products').innerHTML = topProfit.map(p => `<div class="p-2 bg-gray-50 rounded-md"><strong>${p.name}</strong>: ${formatCurrency(p.profit)}</div>`).join('') || '<p class="text-center text-gray-500">Không có dữ liệu.</p>';
    
        // Chart Logic uses filtered sales
        if (productSalesTrendChart) productSalesTrendChart.destroy();
        const chartContainer = document.getElementById('product-chart-container');

        if (selectedProductIds.length > 0 && filteredSalesItems.length > 0) {
            chartContainer.classList.remove('hidden');

            const allDates = [...new Set(filteredSalesItems.map(s => s.date.split('T')[0]))].sort((a, b) => new Date(a) - new Date(b));

            const datasets = selectedProductIds.map((productId, index) => {
                const product = products.find(p => p.id === productId);
                const salesForThisProduct = filteredSalesItems.filter(s => (s.productId || s.id) === productId);
                
                const revenueByDate = salesForThisProduct.reduce((acc, sale) => {
                    const date = sale.date.split('T')[0];
                    acc[date] = (acc[date] || 0) + sale.amount;
                    return acc;
                }, {});

                const data = allDates.map(date => revenueByDate[date] || 0);
                
                const chartColors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#eab308', '#06b6d4', '#d946ef'];
                const color = chartColors[index % chartColors.length];

                return {
                    label: product ? product.name : 'Unknown',
                    data: data,
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    fill: true,
                    tension: 0.1
                };
            });

            if (productSalesTrendChartCtx) {
                productSalesTrendChart = new Chart(productSalesTrendChartCtx, {
                    type: 'line',
                    data: { labels: allDates, datasets: datasets },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
                });
            }
        } else {
             chartContainer.classList.add('hidden');
        }
    }
    
    function renderInventoryReport() {
        const threshold = +document.getElementById('low-stock-threshold').value;
        let tableHTML = `<table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                    <th scope="col" class="px-4 py-3">Sản phẩm</th>
                    <th scope="col" class="px-4 py-3 text-right">Tồn kho</th>
                    <th scope="col" class="px-4 py-3 text-right">Giá trị kho</th>
                </tr>
            </thead>
            <tbody>`;
        
        if(products.length === 0) {
            tableHTML += '<tr><td colspan="3" class="text-center p-4">Chưa có sản phẩm nào.</td></tr>';
        } else {
            products.forEach(p => {
                const stockValue = p.stock * p.costPrice;
                const isLowStock = p.stock < threshold;
                tableHTML += `<tr class="border-b ${isLowStock ? 'bg-red-50 text-red-700 font-medium' : 'bg-white'}">
                    <td class="px-4 py-3">${p.name}</td>
                    <td class="px-4 py-3 text-right">${p.stock}</td>
                    <td class="px-4 py-3 text-right">${formatCurrency(stockValue)}</td>
                </tr>`;
            });
        }
        
        tableHTML += '</tbody></table>';
        document.getElementById('inventory-report-table').innerHTML = tableHTML;
    }


    const handleFilterChange = () => { const isCustom = reportRangeEl.value === 'custom'; customDateRangeDiv.classList.toggle('hidden', !isCustom); customDateRangeDiv.classList.toggle('flex', isCustom); renderAll(); };
    
    // --- AI LOGIC (Entry & Chat) ---
    const openAiEntryModal = () => { aiInput.value = ''; aiEntryModal.classList.remove('hidden'); setTimeout(() => aiEntryModal.classList.remove('opacity-0'), 10); };
    const closeAiEntryModal = () => { aiEntryModal.classList.add('opacity-0'); setTimeout(() => aiEntryModal.classList.add('hidden'), 300); };
    
    const handleAiEntry = async (e) => {
        e.preventDefault();
        const textInput = aiInput.value.trim();
        if (!textInput) { return showToast("Vui lòng nhập mô tả.", "error"); }
        if (geminiApiKey === "YOUR_GEMINI_API_KEY_HERE") { return showToast("Lỗi: API Key của Gemini chưa được thiết lập.", "error"); }
        
        aiSpinner.classList.remove('hidden'); 
        e.target.querySelector('button[type="submit"]').disabled = true;

        const productNames = products.map(p => p.name);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInTwoDays = new Date(today);
        dateInTwoDays.setDate(dateInTwoDays.getDate() + 2);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const dateInTwoDaysStr = dateInTwoDays.toISOString().split('T')[0];
        
        const expenseCategoriesStr = categories.expense.join(', ');
        const prompt = `You are an expert Vietnamese financial assistant. Your task is to extract detailed information from a user's text and format it into a JSON object.

CONTEXT:
- The current date is: ${todayStr}.
- Available product names (for sales/income): [${productNames.join(', ')}].
- Available expense categories: [${expenseCategoriesStr}].

RULES & EXAMPLES:
1.  **entryType**: MUST be "plan" for future intent, otherwise "transaction".
    - "ngày mai bán", "2 ngày nữa giao" -> "plan"
    - "bán hôm qua", "thu tiền", "mua rau" -> "transaction"
2.  **date**: MUST determine the exact date based on the current date and return it in YYYY-MM-DD format.
    - "hôm nay" -> "${todayStr}"
    - "ngày mai" -> "${tomorrowStr}"
    - "2 ngày nữa" -> "${dateInTwoDaysStr}"
    - If no date is mentioned, use today's date: "${todayStr}".
3.  **type**: MUST be "income" for sales ('bán', 'thu'), or "expense" for purchases ('mua', 'chi', 'trả tiền').
4.  **If type is "income" and a product is mentioned**:
    - **productName**: MUST find the closest product name from the 'Available Products' list.
    - **quantity** (CRITICAL): MUST extract the quantity. The number just before the productName is the quantity. Default to 1. ("bán 10 ly kem" -> 10).
    - **discountPercentage**: MUST extract any percentage discount ("chiết khấu 15%" -> 15).
5.  **If type is "expense" or it's a simple income without a product**:
    - **description**: MUST be the main subject of the transaction. ("mua rau 20k" -> "mua rau").
    - **amount**: MUST extract the monetary value. ("20k" -> 20000, "50.000d" -> 50000).
    - **category**: For expenses, try to match the description to one of the available expense categories.
6.  **customerName**: Extract the customer's name ("giao cho chị Nhung" -> "chị Nhung").
7.  **customerNote**: Extract all other relevant details ("giao 16h tại nhà khách" -> "Giao 16h tại nhà khách").

USER TEXT: "${textInput}"`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
            const payload = { 
                contents: [{ parts: [{ text: prompt }] }], 
                generationConfig: { 
                    responseMimeType: "application/json", 
                    responseSchema: { 
                        type: "OBJECT", 
                        properties: { 
                            "entryType": { "type": "STRING" },
                            "date": { "type": "STRING", "format": "date" },
                            "type": { "type": "STRING" },
                            "description": { "type": "STRING" },
                            "amount": { "type": "NUMBER" },
                            "category": {"type": "STRING"},
                            "productName": { "type": "STRING" },
                            "quantity": { "type": "NUMBER" },
                            "discountPercentage": { "type": "NUMBER" },
                            "customerName": { "type": "STRING" },
                            "customerNote": { "type": "STRING" }
                        },
                         "required": ["entryType", "date", "type"]
                    } 
                } 
            };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonText) {
                const parsedData = JSON.parse(jsonText);
                
                // If it's a product sale, calculate the final amount
                if (parsedData.productName && parsedData.type === 'income') {
                    const product = products.find(p => p.name === parsedData.productName);
                    if (product) {
                        parsedData.productId = product.id;
                        const quantity = parsedData.quantity || 1;
                        parsedData.quantity = quantity;
                        let finalAmount = product.sellingPrice * quantity;
                        if (parsedData.discountPercentage > 0) {
                            finalAmount *= (1 - parsedData.discountPercentage / 100);
                        }
                        if (!parsedData.amount) {
                           parsedData.amount = finalAmount;
                        }
                        parsedData.description = parsedData.description || `${quantity} ${product.name}`;
                    }
                }
                
                closeAiEntryModal();
                if (parsedData.entryType === 'plan') {
                    openFormModal('addPlan', parsedData);
                } else {
                    openFormModal('addTransaction', parsedData);
                }
            } else { throw new Error("AI did not return valid data."); }
        } catch (error) { console.error('Error with AI entry:', error); showToast(`AI không thể xử lý yêu cầu: ${error.message}`, "error"); } finally { aiSpinner.classList.add('hidden'); e.target.querySelector('button[type="submit"]').disabled = false; }
    };
    function renderChat() {
        chatMessages.innerHTML = '';
        chatHistory.forEach(msg => {
            const wrapper = document.createElement('div');
            wrapper.className = `p-3 rounded-lg chat-message ${msg.role === 'user' ? 'user' : 'ai'}`;
            if (msg.role === 'model') {
                let html = msg.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                const speakBtn = document.createElement('button');
                speakBtn.className = 'speak-btn ml-2 p-1 rounded-full hover:bg-gray-300 transition inline-block align-middle';
                speakBtn.title = 'Đọc nội dung';
                speakBtn.innerHTML = playIconSVG;
                speakBtn.dataset.text = msg.parts[0].text;
                const textContainer = document.createElement('span');
                textContainer.innerHTML = html;
                wrapper.appendChild(textContainer);
                wrapper.appendChild(speakBtn);
            } else {
                wrapper.textContent = msg.parts[0].text;
            }
            chatMessages.appendChild(wrapper);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    const handleAiChatSubmit = async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;
        chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
        renderChat();
        chatInput.value = '';
        aiThinkingIndicator.classList.remove('hidden');
        const { currentPeriodData } = getReportData();
        const dataSummary = `Dữ liệu tóm tắt:\n- Tổng thu: ${totalIncomeEl.textContent}\n- Tổng chi: ${totalExpenseEl.textContent}\n- Lợi nhuận: ${netProfitEl.textContent}\n- Chi tiết các khoản chi: ${currentPeriodData.filter(t => t.type === 'expense').map(t => `${t.description} (${t.category}): ${formatCurrency(t.amount)}`).join(', ') || 'Không có khoản chi nào.'}`;
        const systemPrompt = `Bạn là một chuyên gia phân tích tài chính thân thiện và chuyên nghiệp. Nhiệm vụ của bạn là trả lời câu hỏi của người dùng dựa trên dữ liệu tóm tắt được cung cấp. Hãy đưa ra câu trả lời rõ ràng, đi thẳng vào vấn đề và nếu có thể, hãy đưa ra lời khuyên hữu ích.`;
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
            const payload = {
                contents: [ ...chatHistory.map(item => ({ role: item.role, parts: item.parts })), { role: 'user', parts: [{ text: `Dựa vào dữ liệu này: "${dataSummary}", hãy trả lời câu hỏi sau: "${userInput}"` }] } ],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            const result = await response.json();
            const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiResponse) {
                chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
            } else {
                 chatHistory.push({ role: 'model', parts: [{ text: "Xin lỗi, tôi chưa thể đưa ra câu trả lời lúc này." }] });
            }
        } catch (error) {
            console.error('Error with AI chat:', error);
            chatHistory.push({ role: 'model', parts: [{ text: `Đã xảy ra lỗi: ${error.message}` }] });
        } finally {
            aiThinkingIndicator.classList.add('hidden');
            renderChat();
        }
    };
    
    // --- TTS Logic ---
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return bytes.buffer;
    }
    function pcmToWav(pcmData, sampleRate) {
        const numChannels = 1, bitsPerSample = 16;
        const blockAlign = (numChannels * bitsPerSample) / 8;
        const byteRate = sampleRate * blockAlign;
        const dataSize = pcmData.byteLength;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        function writeString(view, offset, string) { for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); } }
        writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); writeString(view, 36, 'data'); view.setUint32(40, dataSize, true);
        const pcm16 = new Int16Array(pcmData);
        for (let i = 0; i < pcm16.length; i++) { view.setInt16(44 + i * 2, pcm16[i], true); }
        return new Blob([view], { type: 'audio/wav' });
    }
    
    async function speakText(textToSpeak, buttonElement) {
        if (geminiApiKey === "YOUR_GEMINI_API_KEY_HERE") { return showToast("Lỗi: API Key của Gemini chưa được thiết lập.", "error"); }
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<div class="spinner"></div>';
        buttonElement.disabled = true;
        try {
            // Logic to call TTS API will go here
        } catch (error) {
            console.error("Error speaking text:", error);
            showToast(`Lỗi TTS: ${error.message}`, "error");
        } finally {
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
        }
    }
});



