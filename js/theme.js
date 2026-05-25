// --- THEME & NAVIGATION CONTROLS ---

window.initTheme = function() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark mode
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        window.showMoonIcon(false);
    } else {
        document.documentElement.classList.remove('dark');
        window.showMoonIcon(true);
    }
};

window.showMoonIcon = function(showMoon) {
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const mThemeIconSun = document.getElementById('m-theme-icon-sun');
    const mThemeIconMoon = document.getElementById('m-theme-icon-moon');

    if (showMoon) {
        themeIconSun?.classList.add('hidden');
        themeIconMoon?.classList.remove('hidden');
        mThemeIconSun?.classList.add('hidden');
        mThemeIconMoon?.classList.remove('hidden');
    } else {
        themeIconSun?.classList.remove('hidden');
        themeIconMoon?.classList.add('hidden');
        mThemeIconSun?.classList.remove('hidden');
        mThemeIconMoon?.classList.add('hidden');
    }
};

window.toggleTheme = function() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        window.showMoonIcon(true);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        window.showMoonIcon(false);
    }
};

// Bind Theme Toggle Buttons on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
    
    themeToggleBtn?.addEventListener('click', window.toggleTheme);
    mobileThemeToggleBtn?.addEventListener('click', window.toggleTheme);

    // Mobile Sidebar Drawer
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarEl = document.querySelector('aside');
    
    mobileMenuBtn?.addEventListener('click', () => {
        sidebarEl?.classList.toggle('hidden');
        sidebarEl?.classList.toggle('flex');
    });

    sidebarEl?.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            if (window.innerWidth < 768) {
                sidebarEl.classList.add('hidden');
                sidebarEl.classList.remove('flex');
            }
        }
    });

    // Mobile "Xem thêm" Bottom Sheet Drawer
    const bottomTabMore = document.getElementById('bottom-tab-more');
    const moreMenuSheet = document.getElementById('more-menu-sheet');
    const moreMenuBackdrop = document.getElementById('more-menu-backdrop');
    const closeMoreMenuBtn = document.getElementById('close-more-menu-btn');

    const toggleMoreMenu = () => {
        if (moreMenuSheet) {
            moreMenuSheet.classList.toggle('hidden-sheet');
            moreMenuSheet.classList.toggle('show-sheet');
        }
        moreMenuBackdrop?.classList.toggle('hidden');
    };

    bottomTabMore?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMoreMenu();
    });

    moreMenuBackdrop?.addEventListener('click', toggleMoreMenu);
    closeMoreMenuBtn?.addEventListener('click', toggleMoreMenu);

    // Close bottom sheet if any link inside is clicked
    moreMenuSheet?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMoreMenu();
        });
    });

    // --- Floating Action Button (FAB) ---
    const fabToggleBtn = document.getElementById('fab-toggle-btn');
    const fabActions = document.getElementById('fab-actions');
    const fabBackdrop = document.getElementById('fab-backdrop');

    const fabToggle = () => {
        if (fabActions && fabToggleBtn && fabBackdrop) {
            fabActions.classList.toggle('opacity-0');
            fabActions.classList.toggle('-translate-y-4');
            fabActions.classList.toggle('invisible');
            fabToggleBtn.classList.toggle('rotate-45');
            fabToggleBtn.classList.toggle('opacity-10');
            fabToggleBtn.classList.toggle('pointer-events-none');
            fabBackdrop.classList.toggle('hidden');
        }
    };
    fabToggleBtn?.addEventListener('click', fabToggle);
    fabBackdrop?.addEventListener('click', fabToggle);

    const closeFab = () => {
        if (fabActions && !fabActions.classList.contains('invisible')) {
            fabToggle();
        }
    };

    // FAB Action clicks
    document.getElementById('add-plan-btn')?.addEventListener('click', () => {
        closeFab();
        window.openFormModal?.('addPlan');
    });
    document.getElementById('add-transaction-btn')?.addEventListener('click', () => {
        closeFab();
        window.openFormModal?.('addTransaction');
    });
    document.getElementById('add-ai-btn')?.addEventListener('click', () => {
        closeFab();
        window.openAiEntryModal?.();
    });

    // --- Tab Links Navigation ---
    const tabMappings = {
        pos: ['side-tab-pos', 'bottom-tab-pos'],
        plan: ['side-tab-plan', 'bottom-tab-plan'],
        products: ['side-tab-products', 'bottom-tab-products'],
        history: ['side-tab-history', 'bottom-tab-history'],
        promotions: ['side-tab-promotions', 'bottom-tab-promotions'],
        dashboard: ['side-tab-dashboard', 'bottom-tab-dashboard'],
        settings: ['side-tab-settings', 'bottom-tab-settings']
    };

    Object.keys(tabMappings).forEach(tab => {
        tabMappings[tab].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.switchTab(tab);
                });
            }
        });
    });

    // --- Logout Buttons ---
    const logoutButtons = ['logout-btn', 'sidebar-logout-btn', 'bottom-logout-btn'];
    logoutButtons.forEach(id => {
        document.getElementById(id)?.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.auth) window.auth.signOut();
        });
    });

    // --- Close Modals on Backdrop Click ---
    const modalMappings = [
        { id: 'form-modal', closeFn: () => window.closeFormModal?.() },
        { id: 'product-modal', closeFn: () => window.closeProductModal?.() },
        { id: 'complete-plan-modal', closeFn: () => window.closeCompletePlanModal?.() },
        { id: 'confirmation-modal', closeFn: () => window.closeConfirmationModal?.() },
        { id: 'receipt-modal', closeFn: () => window.closeReceiptModal?.() },
        { id: 'ai-entry-modal', closeFn: () => window.closeAiEntryModal?.() },
        { id: 'promotion-modal', closeFn: () => window.closePromotionModal?.() },
        { id: 'quick-add-pos-modal', closeFn: () => window.closeQuickAddPOSModal?.() }
    ];

    modalMappings.forEach(mapping => {
        const modalEl = document.getElementById(mapping.id);
        modalEl?.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                mapping.closeFn();
            }
        });
    });
});
