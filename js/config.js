// --- GLOBAL APPLICATION STATE & CONFIGURATION ---

// State variables
window.auth = null;
window.db = null;
window.geminiApiKey = localStorage.getItem('gemini_api_key') || "AIzaSyCb6WTOOMERzf_tu7SahPAhU21y6AyFMCc";

window.transactionsCollection = null;
window.plansCollection = null;
window.productsCollection = null;
window.promotionsCollection = null;

window.transactions = [];
window.plans = [];
window.products = [];
window.promotions = [];
window.currentUserId = null;

window.toastTimeout = null;
window.confirmAction = null;
window.chatHistory = [];
window.audioCache = {};
window.currentAudio = null;
window.currentlyPlayingButton = null;
window.currentEditingTransaction = null;
window.currentFormMode = null;

// SVG Icons
window.playIconSVG = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.377a1 1 0 011.09-.217zM14.5 12a4.5 4.5 0 000-8v8z"></path></svg>`;
window.stopIconSVG = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><rect width="10" height="10" x="5" y="5" rx="1"></rect></svg>`;

// Configurable Categories
window.categories = JSON.parse(localStorage.getItem('user_categories')) || {
    income: ['Bán hàng', 'Thu khác'],
    expense: ['Nhập hàng', 'Nguyên liệu chính', 'Nguyên liệu phụ', 'Vật tư', 'Chi phí vận hành', 'Chi phí khác']
};

// Formatting Utilities
window.formatCurrency = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

window.formatDisplayDateTime = (createdAt, date) => {
    const timestamp = createdAt || date;
    if (!timestamp) return 'Không có ngày';
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('vi-VN');
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
};

window.showToast = (message, type = "success") => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;
    
    clearTimeout(window.toastTimeout);
    toastMessage.textContent = message;
    
    // Reset background color
    toast.className = toast.className.replace(/bg-\w+-500/, '');
    toast.classList.add(type === "success" ? "bg-green-500" : "bg-red-500");
    
    toast.classList.remove("opacity-0", "translate-y-10");
    window.toastTimeout = setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-10");
    }, 3000);
};

window.showError = (msg) => {
    console.error(msg);
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `<p class="text-red-500 p-4 text-center">${msg}</p>`;
        loadingOverlay.style.display = 'flex';
    } else {
        window.showToast(msg, "error");
    }
};

// Global Firebase Init
window.firebaseConfig = {
    apiKey: "AIzaSyBkgzeseW1hFbiEiHrK6kXtMgdFE4gdUSI",
    authDomain: "sothuchiapp-5efc7.firebaseapp.com",
    projectId: "sothuchiapp-5efc7",
    storageBucket: "sothuchiapp-5efc7.firebasestorage.app",
    messagingSenderId: "537279498834",
    appId: "1:537279498834:web:b5277e19fc234d11e36d8b",
    measurementId: "G-XYK5Q974RP"
};

// Confirmation Modal Functions
window.openConfirmationModal = function(message, onConfirm, actionText = 'Xác nhận', title = 'Xác nhận') {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('confirmation-title');
    const msgEl = document.getElementById('confirmation-message');
    const actionBtn = document.getElementById('confirm-action-btn');

    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (actionBtn) {
        actionBtn.textContent = actionText;
        // Apply color based on action text
        actionBtn.className = "font-bold py-2 px-4 rounded-xl transition text-sm text-white " + 
            (actionText.toLowerCase().includes('xóa') || actionText.toLowerCase().includes('hủy') 
                ? "bg-rose-600 hover:bg-rose-700" 
                : (actionText.toLowerCase().includes('bán') || actionText.toLowerCase().includes('lưu')
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-brand-600 hover:bg-brand-700"));
    }

    window.confirmAction = onConfirm;

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

window.closeConfirmationModal = function() {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
    window.confirmAction = null;
};

// Bind Confirmation Modal events
document.addEventListener('DOMContentLoaded', () => {
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmActionBtn = document.getElementById('confirm-action-btn');

    confirmCancelBtn?.addEventListener('click', window.closeConfirmationModal);
    confirmActionBtn?.addEventListener('click', () => {
        if (typeof window.confirmAction === 'function') {
            window.confirmAction();
        }
        window.closeConfirmationModal();
    });
});

