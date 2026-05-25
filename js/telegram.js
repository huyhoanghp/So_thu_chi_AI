// --- TELEGRAM NOTIFICATIONS MODULE ---

window.telegramConfig = {
    enabled: false,
    token: "",
    chatId: "",
    reportTime: "off"
};

window.loadTelegramSettings = function() {
    window.telegramConfig.enabled = localStorage.getItem('telegram_enabled') === 'true';
    window.telegramConfig.token = localStorage.getItem('telegram_bot_token') || '';
    window.telegramConfig.chatId = localStorage.getItem('telegram_chat_id') || '';
    window.telegramConfig.reportTime = localStorage.getItem('telegram_report_time') || 'off';

    // Render in UI Cài đặt if elements exist
    const enableCheckbox = document.getElementById('settings-telegram-enable');
    const tokenInput = document.getElementById('settings-telegram-token');
    const chatIdInput = document.getElementById('settings-telegram-chatid');
    const reportTimeSelect = document.getElementById('settings-telegram-report-time');

    if (enableCheckbox) enableCheckbox.checked = window.telegramConfig.enabled;
    if (tokenInput) tokenInput.value = window.telegramConfig.token;
    if (chatIdInput) chatIdInput.value = window.telegramConfig.chatId;
    if (reportTimeSelect) reportTimeSelect.value = window.telegramConfig.reportTime;

    window.updateTelegramUIState();
};

window.updateTelegramUIState = function() {
    const reportBtn = document.getElementById('send-report-telegram-btn');
    if (reportBtn) {
        reportBtn.classList.toggle('hidden', !window.telegramConfig.enabled);
    }
};

window.saveTelegramSettings = function(enabled, token, chatId, reportTime) {
    localStorage.setItem('telegram_enabled', String(enabled));
    localStorage.setItem('telegram_bot_token', token);
    localStorage.setItem('telegram_chat_id', chatId);
    localStorage.setItem('telegram_report_time', reportTime);

    window.telegramConfig.enabled = enabled;
    window.telegramConfig.token = token;
    window.telegramConfig.chatId = chatId;
    window.telegramConfig.reportTime = reportTime;

    window.updateTelegramUIState();
    window.showToast("Đã lưu cấu hình Telegram!");
};

window.sendTelegramMessage = async function(text) {
    if (!window.telegramConfig.token || !window.telegramConfig.chatId) {
        window.showToast("Cấu hình Telegram Bot Token hoặc Chat ID chưa đầy đủ.", "error");
        return false;
    }

    const url = `https://api.telegram.org/bot${window.telegramConfig.token}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: window.telegramConfig.chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (data.ok) {
            return true;
        } else {
            window.showToast(`Lỗi gửi Telegram: ${data.description}`, "error");
            return false;
        }
    } catch (err) {
        window.showToast(`Không thể kết nối Telegram API: ${err.message}`, "error");
        return false;
    }
};

window.testTelegramConnection = async function() {
    const tokenInput = document.getElementById('settings-telegram-token');
    const chatIdInput = document.getElementById('settings-telegram-chatid');
    const token = tokenInput?.value.trim() || '';
    const chatId = chatIdInput?.value.trim() || '';

    if (!token || !chatId) {
        window.showToast("Vui lòng nhập Bot Token và Chat ID trước khi test.", "error");
        return;
    }

    // Temporarily apply input values for testing
    const originalToken = window.telegramConfig.token;
    const originalChatId = window.telegramConfig.chatId;
    window.telegramConfig.token = token;
    window.telegramConfig.chatId = chatId;

    const testMessage = `🔔 <b>KẾT NỐI THÀNH CÔNG!</b>\n` +
                        `-----------------------------\n` +
                        `Sổ Thu Chi Pro đã liên kết thành công với Telegram của bạn.\n` +
                        `Bạn sẽ nhận được cảnh báo kho và báo cáo doanh thu trực tiếp tại đây.`;

    const success = await window.sendTelegramMessage(testMessage);
    if (success) {
        window.showToast("Đã gửi tin nhắn test thành công! Hãy kiểm tra Telegram.");
    }

    // Revert config
    window.telegramConfig.token = originalToken;
    window.telegramConfig.chatId = originalChatId;
};

// Check and send alert for low stock for a specific product directly
window.sendTelegramProductStockAlert = function(productName, newStock) {
    if (!window.telegramConfig.enabled) return;

    const threshold = +(document.getElementById('low-stock-threshold')?.value || 10);
    if (newStock < threshold) {
        const text = `⚠️ <b>CẢNH BÁO: SẢN PHẨM SẮP HẾT KHO!</b>\n` +
                     `-----------------------------\n` +
                     `📦 <b>Sản phẩm:</b> ${productName}\n` +
                     `📉 <b>Tồn kho:</b> <code>${newStock}</code> (Báo động dưới: ${threshold})\n` +
                     `🕒 <b>Thời gian:</b> ${window.formatDisplayDateTime(new Date().toISOString())}\n` +
                     `👉 Vui lòng nhập thêm hàng để tránh gián đoạn!`;
        window.sendTelegramMessage(text);
    }
};

// Check and send alert for low stock during POS checkout
window.sendTelegramPOSAlert = function(txData) {
    if (!window.telegramConfig.enabled) return;

    txData.items.forEach(item => {
        if (typeof item.newStock === 'number') {
            window.sendTelegramProductStockAlert(item.productName, item.newStock);
        } else {
            const product = window.products.find(p => p.id === item.productId);
            if (product) {
                const newStock = product.stock - item.quantity;
                window.sendTelegramProductStockAlert(product.name, newStock);
            }
        }
    });
};

// Check and send alert for low stock during manual transactions
window.sendTelegramManualAlert = function(txData) {
    if (!window.telegramConfig.enabled || !txData.productId) return;

    const product = window.products.find(p => p.id === txData.productId);
    if (product) {
        // Alert only when selling (income)
        if (txData.type === 'income') {
            if (typeof txData.newStock === 'number') {
                window.sendTelegramProductStockAlert(product.name, txData.newStock);
            } else {
                const stockChange = txData.type === 'income' ? -txData.quantity : txData.quantity;
                const newStock = product.stock + stockChange;
                window.sendTelegramProductStockAlert(product.name, newStock);
            }
        }
    }
};

window.sendDailyReportTelegram = async function() {
    if (!window.telegramConfig.enabled) {
        window.showToast("Cấu hình Telegram chưa được bật.", "error");
        return;
    }

    const { currentPeriodData } = window.getReportData();
    const reportRangeEl = document.getElementById('report-range');
    const rangeText = reportRangeEl ? reportRangeEl.options[reportRangeEl.selectedIndex].textContent : 'Tất cả thời gian';

    const incomes = currentPeriodData.filter(t => t.type === 'income');
    const expenses = currentPeriodData.filter(t => t.type === 'expense');

    const totalIncome = incomes.reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpense = expenses.reduce((s, t) => s + (t.amount || 0), 0);
    const totalProfit = totalIncome - totalExpense;

    // Calculate top selling products in this period
    const productStats = {};
    incomes.forEach(tx => {
        if (tx.isPos && tx.items) {
            tx.items.forEach(item => {
                if (!productStats[item.productName]) productStats[item.productName] = 0;
                productStats[item.productName] += item.quantity;
            });
        } else if (tx.productId && tx.quantity > 0) {
            const productInfo = window.products.find(p => p.id === tx.productId);
            const name = productInfo ? productInfo.name : tx.description;
            if (!productStats[name]) productStats[name] = 0;
            productStats[name] += tx.quantity;
        }
    });

    const topSelling = Object.entries(productStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    let topSellingText = 'Chưa có dữ liệu bán lẻ';
    if (topSelling.length > 0) {
        topSellingText = topSelling.map(([name, qty], idx) => `   ${idx + 1}. <b>${name}</b> (x${qty})`).join('\n');
    }

    // Calculate stock levels for all products with low-stock alerts
    const threshold = +(document.getElementById('low-stock-threshold')?.value || 10);
    let stockText = '   Chưa có sản phẩm nào';
    if (window.products && window.products.length > 0) {
        stockText = window.products.map(p => {
            const isLow = p.stock < threshold;
            const prefix = isLow ? '⚠️' : '✅';
            return `   ${prefix} <b>${p.name}</b>: <code>${p.stock}</code>${isLow ? ' (Sắp hết)' : ''}`;
        }).join('\n');
    }

    const message = `📊 <b>BÁO CÁO DOANH THU & HIỆU SUẤT</b>\n` +
                    `-----------------------------\n` +
                    `📅 <b>Khoảng dữ liệu:</b> ${rangeText}\n` +
                    `💰 <b>Tổng thu:</b> <code>${window.formatCurrency(totalIncome)}</code>\n` +
                    `💸 <b>Tổng chi:</b> <code>${window.formatCurrency(totalExpense)}</code>\n` +
                    `📈 <b>Lợi nhuận ròng:</b> <code>${window.formatCurrency(totalProfit)}</code>\n` +
                    `-----------------------------\n` +
                    `🛒 <b>Top 3 sản phẩm bán chạy nhất:</b>\n` +
                    `${topSellingText}\n` +
                    `-----------------------------\n` +
                    `📦 <b>TỒN KHO CHI TIẾT:</b>\n` +
                    `${stockText}\n` +
                    `-----------------------------\n` +
                    `Báo cáo được gửi từ Sổ Thu Chi Pro.`;

    const success = await window.sendTelegramMessage(message);
    if (success) {
        window.showToast("Đã gửi báo cáo qua Telegram thành công!");
    }
};

window.checkAndSendScheduledReport = function() {
    if (!window.telegramConfig.enabled || window.telegramConfig.reportTime === 'off') return;

    const reportHour = parseInt(window.telegramConfig.reportTime, 10);
    if (isNaN(reportHour)) return;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if current hour is at or after scheduled hour
    if (currentHour >= reportHour) {
        const todayStr = now.toISOString().split('T')[0];
        const lastReportDate = localStorage.getItem('telegram_last_report_date');

        if (lastReportDate !== todayStr) {
            localStorage.setItem('telegram_last_report_date', todayStr);
            console.log(`[Telegram Scheduler] Automatically sending report...`);
            window.sendDailyReportTelegram().catch(err => {
                console.error("Scheduled Telegram report failed:", err);
            });
        }
    }
};

window.startScheduledTelegramReportTimer = function() {
    window.checkAndSendScheduledReport();
    setInterval(window.checkAndSendScheduledReport, 60000);
};

// Bind elements on DOMContentLoaded (run in categories.js context or app.js initialization)
window.initTelegramEventListeners = function() {
    const saveTelegramBtn = document.getElementById('save-telegram-btn');
    const testTelegramBtn = document.getElementById('test-telegram-btn');
    const sendReportBtn = document.getElementById('send-report-telegram-btn');

    saveTelegramBtn?.addEventListener('click', () => {
        const enabled = document.getElementById('settings-telegram-enable')?.checked || false;
        const token = document.getElementById('settings-telegram-token')?.value.trim() || '';
        const chatId = document.getElementById('settings-telegram-chatid')?.value.trim() || '';
        const reportTime = document.getElementById('settings-telegram-report-time')?.value || 'off';
        window.saveTelegramSettings(enabled, token, chatId, reportTime);
    });

    testTelegramBtn?.addEventListener('click', window.testTelegramConnection);
    sendReportBtn?.addEventListener('click', window.sendDailyReportTelegram);

    // Initial load
    window.loadTelegramSettings();

    // Start daily scheduler timer
    window.startScheduledTelegramReportTimer();
};
