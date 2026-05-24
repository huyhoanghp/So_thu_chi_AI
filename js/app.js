// --- MAIN APPLICATION CONTROLLER ---

window.switchTab = function(tab) {
    const panels = {
        pos: document.getElementById('content-pos'),
        plan: document.getElementById('content-plan'),
        products: document.getElementById('content-products'),
        history: document.getElementById('content-history'),
        promotions: document.getElementById('content-promotions'),
        dashboard: document.getElementById('content-dashboard'),
        settings: document.getElementById('content-settings')
    };

    // Hide all panels
    Object.values(panels).forEach(panel => {
        if (panel) panel.classList.add('hidden');
    });

    // Reset active styles on tabs
    const tabSelectors = [
        '#side-tab-pos', '#side-tab-plan', '#side-tab-products', '#side-tab-history', '#side-tab-promotions', '#side-tab-dashboard', '#side-tab-settings',
        '#bottom-tab-pos', '#bottom-tab-plan', '#bottom-tab-products', '#bottom-tab-history', '#bottom-tab-dashboard'
    ];

    tabSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.classList.remove('bg-brand-50', 'text-brand-600', 'dark:bg-brand-900/20', 'dark:text-brand-400', 'font-bold');
        el.classList.add('text-gray-500', 'dark:text-slate-400');
    });

    // Display selected panel and apply active classes
    const activePanel = panels[tab];
    if (activePanel) activePanel.classList.remove('hidden');

    const sideEl = document.getElementById(`side-tab-${tab}`);
    if (sideEl) {
        sideEl.classList.remove('text-gray-500', 'dark:text-slate-400');
        sideEl.classList.add('bg-brand-50', 'text-brand-600', 'dark:bg-brand-900/20', 'dark:text-brand-400');
    }

    const bottomEl = document.getElementById(`bottom-tab-${tab}`);
    if (bottomEl) {
        bottomEl.classList.remove('text-gray-500', 'dark:text-slate-400');
        bottomEl.classList.add('text-brand-600', 'dark:text-brand-400', 'font-bold');
    }

    // Dynamic Headers
    const pageTitle = document.getElementById('page-title');
    const titles = {
        pos: 'Bán hàng (POS)',
        plan: 'Kế hoạch tài chính',
        products: 'Quản lý sản phẩm & Kho',
        history: 'Lịch sử giao dịch sổ sách',
        promotions: 'Chương trình khuyến mại',
        dashboard: 'Báo cáo & Phân tích',
        settings: 'Cài đặt hệ thống'
    };
    if (pageTitle) pageTitle.textContent = titles[tab] || 'Sổ Thu Chi Pro';

    // Context Loading
    if (tab === 'pos') {
        window.renderPOSProducts();
        window.renderCart();
    } else if (tab === 'plan') {
        window.renderPlanList(window.plans);
    } else if (tab === 'products') {
        window.renderProductList(window.products);
    } else if (tab === 'history') {
        if (window.renderAll) {
            window.renderAll();
        } else {
            window.renderTransactionList(window.transactions);
        }
    } else if (tab === 'promotions') {
        window.renderPromotions();
    } else if (tab === 'settings') {
        window.renderSettingsCategories();
    } else if (tab === 'dashboard') {
        window.renderReports();
        if (window.chatHistory.length === 0) {
            window.chatHistory.push({ role: 'model', parts: [{ text: "Chào bạn, tôi là trợ lý phân tích tài chính. Bạn muốn biết điều gì về dữ liệu thu chi trong khoảng thời gian đã chọn?" }] });
            window.renderChat();
        }
    }

    // Show/Hide Floating Action Button based on active tab
    const fabContainer = document.getElementById('fab-container');
    if (fabContainer) {
        const showFabTabs = ['plan', 'history'];
        if (showFabTabs.includes(tab)) {
            fabContainer.classList.remove('hidden');
        } else {
            fabContainer.classList.add('hidden');
            // Close FAB actions menu if it was open
            const fabActions = document.getElementById('fab-actions');
            const fabToggleBtn = document.getElementById('fab-toggle-btn');
            const fabBackdrop = document.getElementById('fab-backdrop');
            if (fabActions && !fabActions.classList.contains('invisible')) {
                fabActions.classList.add('opacity-0', '-translate-y-4', 'invisible');
                fabToggleBtn?.classList.remove('rotate-45');
                fabBackdrop?.classList.add('hidden');
            }
        }
    }
};

window.renderAll = function() {
    const searchPlanInput = document.getElementById('search-plan');
    const searchHistoryInput = document.getElementById('search-history');
    const searchProductsInput = document.getElementById('search-products');

    const filterData = (data, searchTerm = '') => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return data;
        return data.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
    };

    const searchedPlans = filterData(window.plans, searchPlanInput?.value || '');
    const filteredHistoryTransactions = window.getFilteredHistoryData ? window.getFilteredHistoryData() : window.transactions;
    const searchedTransactions = filterData(filteredHistoryTransactions, searchHistoryInput?.value || '');
    const searchedProducts = filterData(window.products, searchProductsInput?.value || '');

    // Overview numbers
    const { currentPeriodData } = window.getReportData();
    const totalIncome = currentPeriodData.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpense = currentPeriodData.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netProfitEl = document.getElementById('net-profit');
    const exportXlsxBtn = document.getElementById('export-xlsx-btn');

    if (totalIncomeEl) totalIncomeEl.textContent = window.formatCurrency(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = window.formatCurrency(totalExpense);
    if (netProfitEl) {
        netProfitEl.textContent = window.formatCurrency(totalIncome - totalExpense);
        netProfitEl.classList.toggle('text-green-600', totalIncome - totalExpense >= 0);
        netProfitEl.classList.toggle('text-red-600', totalIncome - totalExpense < 0);
    }
    if (exportXlsxBtn) exportXlsxBtn.disabled = searchedTransactions.length === 0;

    window.renderTransactionList(searchedTransactions);
    window.renderPlanList(searchedPlans);
    window.renderProductList(searchedProducts);
    window.renderPromotions();
    window.renderPOSProducts();

    const contentDashboard = document.getElementById('content-dashboard');
    if (contentDashboard && !contentDashboard.classList.contains('hidden')) {
        window.renderReports();
    }
};

window.listenForData = function() {
    if (!window.transactionsCollection || !window.plansCollection || !window.productsCollection || !window.promotionsCollection) return;
    const loadingOverlay = document.getElementById('loading-overlay');
    
    window.transactionsCollection.onSnapshot(snapshot => {
        window.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateB = b.createdAt ? window.parseDate(b.createdAt) : window.parseDate(b.date);
                const dateA = a.createdAt ? window.parseDate(a.createdAt) : window.parseDate(a.date);
                return dateB - dateA;
            });
        window.renderAll();
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }, err => window.showError("Không thể tải lịch sử giao dịch: " + err.message));

    window.plansCollection.onSnapshot(snapshot => {
        window.plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateB = b.createdAt ? window.parseDate(b.createdAt) : window.parseDate(b.date);
                const dateA = a.createdAt ? window.parseDate(a.createdAt) : window.parseDate(a.date);
                return dateB - dateA;
            });
        window.renderAll();
    }, err => window.showError("Không thể tải danh sách kế hoạch: " + err.message));
    
    window.productsCollection.onSnapshot(snapshot => {
        window.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => a.name.localeCompare(b.name));
        window.renderAll();
        
        const filter = document.getElementById('product-report-filter');
        if (filter) {
            let options = '';
            window.products.forEach(p => {
                options += `<option value="${p.id}">${p.name}</option>`;
            });
            filter.innerHTML = options;
        }
    }, err => window.showError("Không thể tải danh sách sản phẩm: " + err.message));

    window.promotionsCollection.onSnapshot(snapshot => {
        window.promotions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => a.name.localeCompare(b.name));
        window.renderPromotions();
    }, err => window.showError("Không thể tải danh sách khuyến mại: " + err.message));
};

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const loadingOverlay = document.getElementById('loading-overlay');

    try {
        if (typeof firebase === 'undefined') throw new Error("Firebase SDK not loaded.");
        
        firebase.initializeApp(window.firebaseConfig);
        window.auth = firebase.auth();
        window.db = firebase.firestore();

        window.auth.onAuthStateChanged(user => {
            if (user) {
                window.currentUserId = user.uid;
                if (userName) userName.textContent = user.displayName;
                if (userPhoto) userPhoto.src = user.photoURL;
                
                const basePath = `/artifacts/${window.firebaseConfig.projectId}/users/${window.currentUserId}`;
                window.transactionsCollection = window.db.collection(`${basePath}/transactions`);
                window.plansCollection = window.db.collection(`${basePath}/plans`);
                window.productsCollection = window.db.collection(`${basePath}/products`);
                window.promotionsCollection = window.db.collection(`${basePath}/promotions`);
                
                loginScreen?.classList.add('hidden');
                appContainer?.classList.remove('hidden');
                if (loadingOverlay) loadingOverlay.style.display = 'flex';
                window.listenForData();
            } else {
                window.currentUserId = null;
                window.transactions = []; window.plans = []; window.products = []; window.promotions = [];
                window.renderAll();
                appContainer?.classList.add('hidden');
                loginScreen?.classList.remove('hidden');
            }
        });
    } catch (err) {
        if (loginScreen) {
            loginScreen.innerHTML = `<p class="text-red-500 text-center">${err.message}</p>`;
        }
    }

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        window.auth.signInWithPopup(provider).catch(error => alert("Đăng nhập thất bại: " + error.message));
    };
    const signOut = () => window.auth.signOut();
    loginBtn?.addEventListener('click', signInWithGoogle);
    logoutBtn?.addEventListener('click', signOut);

    // Initial setups
    const reportRangeEl = document.getElementById('report-range');
    if (reportRangeEl) reportRangeEl.value = 'week';
    window.initTheme();
    window.switchTab('pos'); // Start in the Bán hàng tab

    // Register Service Worker for PWA and handle automatic updates
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('Service Worker registered successfully:', reg);
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('New update available. Reloading...');
                                    window.showToast("Đang cập nhật phiên bản mới...", "success");
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1000);
                                }
                            }
                        };
                    };
                })
                .catch(err => console.error('Service Worker registration failed:', err));
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
});
