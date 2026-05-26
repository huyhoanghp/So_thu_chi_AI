// --- TELEGRAM NOTIFICATIONS MODULE ---

window.telegramConfig = {
    enabled: false,
    txAlertEnabled: false,
    token: "",
    chatId: "",
    reportTime: "off",
    reportCustomTime: ""
};

window.loadTelegramSettings = function() {
    window.telegramConfig.enabled = localStorage.getItem('telegram_enabled') === 'true';
    window.telegramConfig.txAlertEnabled = localStorage.getItem('telegram_tx_alert_enabled') === 'true';
    window.telegramConfig.token = localStorage.getItem('telegram_bot_token') || '';
    window.telegramConfig.chatId = localStorage.getItem('telegram_chat_id') || '';
    window.telegramConfig.reportTime = localStorage.getItem('telegram_report_time') || 'off';
    window.telegramConfig.reportCustomTime = localStorage.getItem('telegram_report_custom_time') || '';

    // Render in UI Cài đặt if elements exist
    const enableCheckbox = document.getElementById('settings-telegram-enable');
    const txAlertCheckbox = document.getElementById('settings-telegram-tx-alert');
    const tokenInput = document.getElementById('settings-telegram-token');
    const chatIdInput = document.getElementById('settings-telegram-chatid');
    const reportTimeSelect = document.getElementById('settings-telegram-report-time');
    const reportCustomInput = document.getElementById('settings-telegram-report-custom-time');

    if (enableCheckbox) enableCheckbox.checked = window.telegramConfig.enabled;
    if (txAlertCheckbox) txAlertCheckbox.checked = window.telegramConfig.txAlertEnabled;
    if (tokenInput) tokenInput.value = window.telegramConfig.token;
    if (chatIdInput) chatIdInput.value = window.telegramConfig.chatId;
    if (reportTimeSelect) reportTimeSelect.value = window.telegramConfig.reportTime;
    if (reportCustomInput) reportCustomInput.value = window.telegramConfig.reportCustomTime;

    // Toggle custom time input container visibility
    const customContainer = document.getElementById('settings-telegram-report-custom-container');
    if (customContainer && reportTimeSelect) {
        customContainer.classList.toggle('hidden', window.telegramConfig.reportTime !== 'custom');
    }

    window.updateTelegramUIState();
};

window.updateTelegramUIState = function() {
    const reportBtn = document.getElementById('send-report-telegram-btn');
    if (reportBtn) {
        reportBtn.classList.toggle('hidden', !window.telegramConfig.enabled);
    }
};

window.saveTelegramSettings = function(enabled, txAlertEnabled, token, chatId, reportTime, reportCustomTime) {
    localStorage.setItem('telegram_enabled', String(enabled));
    localStorage.setItem('telegram_tx_alert_enabled', String(txAlertEnabled));
    localStorage.setItem('telegram_bot_token', token);
    localStorage.setItem('telegram_chat_id', chatId);
    localStorage.setItem('telegram_report_time', reportTime);
    localStorage.setItem('telegram_report_custom_time', reportCustomTime);

    window.telegramConfig.enabled = enabled;
    window.telegramConfig.txAlertEnabled = txAlertEnabled;
    window.telegramConfig.token = token;
    window.telegramConfig.chatId = chatId;
    window.telegramConfig.reportTime = reportTime;
    window.telegramConfig.reportCustomTime = reportCustomTime;

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
    const isLow = newStock < threshold;

    const title = isLow ? `⚠️ <b>CẢNH BÁO: KHO THẤP / BIẾN ĐỘNG KHO</b>` : `📦 <b>THÔNG BÁO BIẾN ĐỘNG KHO</b>`;
    const text = `${title}\n` +
                 `-----------------------------\n` +
                 `📦 <b>Sản phẩm:</b> ${productName}\n` +
                 `📉 <b>Tồn kho hiện tại:</b> <code>${newStock}</code>${isLow ? ` (Báo động dưới: ${threshold})` : ''}\n` +
                 `🕒 <b>Thời gian:</b> ${window.formatDisplayDateTime(new Date().toISOString())}\n` +
                 (isLow ? `👉 Vui lòng nhập thêm hàng để tránh gián đoạn!` : `✅ Trạng thái tồn kho an toàn.`);
    window.sendTelegramMessage(text);
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
        if (typeof txData.newStock === 'number') {
            window.sendTelegramProductStockAlert(product.name, txData.newStock);
        } else {
            const stockChange = txData.type === 'income' ? -txData.quantity : txData.quantity;
            const newStock = product.stock + stockChange;
            window.sendTelegramProductStockAlert(product.name, newStock);
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

    let targetHour = null;
    let targetMinute = 0;

    if (window.telegramConfig.reportTime === 'custom') {
        const customTimeStr = window.telegramConfig.reportCustomTime;
        if (!customTimeStr) return; // Time not set yet
        const parts = customTimeStr.split(':');
        if (parts.length === 2) {
            targetHour = parseInt(parts[0], 10);
            targetMinute = parseInt(parts[1], 10);
        }
    } else {
        targetHour = parseInt(window.telegramConfig.reportTime, 10);
        targetMinute = 0;
    }

    if (targetHour === null || isNaN(targetHour) || isNaN(targetMinute)) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if current time is at or after scheduled target time
    const reachedTargetTime = currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute);
    
    if (reachedTargetTime) {
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

// --- TRANSACTION NOTIFICATIONS QUEUE & BATCHING ---
let txAlertQueue = [];
let txAlertTimeout = null;
let firstQueueTime = null;

window.queueTelegramTxAlert = function(actionType, txData) {
    if (!window.telegramConfig.enabled || !window.telegramConfig.txAlertEnabled) return;

    // Clone data to avoid modifications during delay
    const txCopy = JSON.parse(JSON.stringify(txData));
    txAlertQueue.push({ actionType, txData: txCopy });

    if (!firstQueueTime) {
        firstQueueTime = Date.now();
    }

    if (txAlertTimeout) clearTimeout(txAlertTimeout);

    // If it has been more than 10 seconds since the first item, send immediately to prevent endless delay
    if (Date.now() - firstQueueTime >= 10000) {
        window.processTelegramTxAlertQueue();
    } else {
        txAlertTimeout = setTimeout(window.processTelegramTxAlertQueue, 3000);
    }
};

window.processTelegramTxAlertQueue = async function() {
    if (txAlertTimeout) {
        clearTimeout(txAlertTimeout);
        txAlertTimeout = null;
    }
    firstQueueTime = null;

    if (txAlertQueue.length === 0) return;

    const items = [...txAlertQueue];
    txAlertQueue = [];

    let messageText = '';
    if (items.length === 1) {
        const item = items[0];
        const actionText = {
            'add': '➕ <b>THÊM GIAO DỊCH MỚI</b>',
            'edit': '📝 <b>CẬP NHẬT GIAO DỊCH</b>',
            'delete': '❌ <b>XÓA GIAO DỊCH</b>'
        }[item.actionType];

        const isIncome = item.txData.type === 'income';
        const typeText = isIncome ? 'Thu nhập (Thu)' : 'Chi phí (Chi)';
        const amountText = item.txData.exportZero ? 'Miễn phí' : `${isIncome ? '+' : '-'}${window.formatCurrency(item.txData.amount)}`;

        messageText = `${actionText}\n` +
                      `-----------------------------\n` +
                      `📝 <b>Nội dung:</b> ${item.txData.description || 'Không có'}\n` +
                      `💰 <b>Số tiền:</b> <code>${amountText}</code>\n` +
                      `🗂️ <b>Phân loại:</b> ${typeText}\n` +
                      `🏷️ <b>Danh mục:</b> ${item.txData.category || 'Chưa phân loại'}\n`;

        if (item.txData.customerName) {
            messageText += `👤 <b>Khách hàng:</b> ${item.txData.customerName}\n`;
        }
        if (item.txData.customerNote) {
            messageText += `💬 <b>Ghi chú:</b> ${item.txData.customerNote}\n`;
        }
        if (item.txData.discountAmount > 0) {
            messageText += `🎁 <b>Khuyến mại:</b> -${window.formatCurrency(item.txData.discountAmount)}\n`;
        }
        if (item.txData.exportZero && item.txData.exportReason) {
            messageText += `❓ <b>Lý do miễn phí:</b> ${item.txData.exportReason}\n`;
        }
        messageText += `🕒 <b>Thời gian:</b> ${window.formatDisplayDateTime(item.txData.createdAt || new Date().toISOString(), item.txData.date)}\n` +
                       `-----------------------------`;
    } else {
        messageText = `🔔 <b>THÔNG BÁO BIẾN ĐỘNG GIAO DỊCH (${items.length})</b>\n` +
                      `-----------------------------\n`;

        items.forEach((item, idx) => {
            const isIncome = item.txData.type === 'income';
            const amountText = item.txData.exportZero ? 'Miễn phí' : `${isIncome ? '+' : '-'}${window.formatCurrency(item.txData.amount)}`;
            const actionSymbol = {
                'add': '➕',
                'edit': '📝',
                'delete': '❌'
            }[item.actionType];

            messageText += `${idx + 1}. ${actionSymbol} <b>${item.txData.description || 'Không có'}</b>\n` +
                           `   • <b>Số tiền:</b> <code>${amountText}</code>\n` +
                           `   • <b>Phân loại:</b> ${isIncome ? 'Thu' : 'Chi'} | <b>Danh mục:</b> ${item.txData.category || 'N/A'}\n`;
            if (item.txData.customerName) {
                messageText += `   • <b>Khách hàng:</b> ${item.txData.customerName}\n`;
            }
            if (item.txData.customerNote) {
                messageText += `   • <b>Ghi chú:</b> ${item.txData.customerNote}\n`;
            }
            messageText += `   • <b>Thời gian:</b> ${window.formatDisplayDateTime(item.txData.createdAt || new Date().toISOString(), item.txData.date)}\n\n`;
        });

        messageText += `-----------------------------`;
    }

    await window.sendTelegramMessage(messageText);
};

// Bind elements on DOMContentLoaded (run in categories.js context or app.js initialization)
window.initTelegramEventListeners = function() {
    const saveTelegramBtn = document.getElementById('save-telegram-btn');
    const testTelegramBtn = document.getElementById('test-telegram-btn');
    const sendReportBtn = document.getElementById('send-report-telegram-btn');
    const reportTimeSelect = document.getElementById('settings-telegram-report-time');
    const customContainer = document.getElementById('settings-telegram-report-custom-container');

    // Toggle custom time container when selection changes
    reportTimeSelect?.addEventListener('change', () => {
        if (customContainer && reportTimeSelect) {
            customContainer.classList.toggle('hidden', reportTimeSelect.value !== 'custom');
        }
    });

    saveTelegramBtn?.addEventListener('click', () => {
        const enabled = document.getElementById('settings-telegram-enable')?.checked || false;
        const txAlertEnabled = document.getElementById('settings-telegram-tx-alert')?.checked || false;
        const token = document.getElementById('settings-telegram-token')?.value.trim() || '';
        const chatId = document.getElementById('settings-telegram-chatid')?.value.trim() || '';
        const reportTime = document.getElementById('settings-telegram-report-time')?.value || 'off';
        const reportCustomTime = document.getElementById('settings-telegram-report-custom-time')?.value || '';
        window.saveTelegramSettings(enabled, txAlertEnabled, token, chatId, reportTime, reportCustomTime);
    });

    testTelegramBtn?.addEventListener('click', window.testTelegramConnection);
    sendReportBtn?.addEventListener('click', window.sendDailyReportTelegram);

    // Initial load
    window.loadTelegramSettings();

    // Start daily scheduler timer
    window.startScheduledTelegramReportTimer();
};
