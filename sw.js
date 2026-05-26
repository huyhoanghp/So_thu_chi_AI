importScripts('./js/db.js');

const CACHE_NAME = 'sothuchi-v7-cache-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js?v=7.6',
  './js/db.js?v=7.6',
  './js/theme.js?v=7.6',
  './js/voice.js?v=7.6',
  './js/categories.js?v=7.6',
  './js/promotions.js?v=7.6',
  './js/products.js?v=7.6',
  './js/plans.js?v=7.6',
  './js/transactions.js?v=7.6',
  './js/pos.js?v=7.6',
  './js/reports.js?v=7.6',
  './js/app.js?v=7.6',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Cache-First for static third-party CDNs (e.g. SheetJS, Tailwind, Firebase, ChartJS, Fonts)
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Network-First for local files (so updates are reflected instantly when online)
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  }
});

// --- PERIODIC BACKGROUND SYNC TELEGRAM REPORT ---

const parseDate = (val) => {
    if (!val) return new Date(NaN);
    if (val instanceof Date) return val;
    if (typeof val.toDate === 'function') return val.toDate();
    if (typeof val === 'object') {
        if (val.seconds !== undefined) return new Date(val.seconds * 1000);
        if (val._seconds !== undefined) return new Date(val._seconds * 1000);
    }
    return new Date(val);
};

const formatCurrency = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const generateTelegramReportMessage = (periodData, rangeText, products, threshold = 10) => {
    const incomes = periodData.filter(t => t.type === 'income');
    const expenses = periodData.filter(t => t.type === 'expense');

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
            let name = tx.description || 'Sản phẩm lẻ';
            if (products) {
                const productInfo = products.find(p => p.id === tx.productId);
                if (productInfo) name = productInfo.name;
            }
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
    let stockText = '   Chưa có sản phẩm nào';
    if (products && products.length > 0) {
        stockText = products.map(p => {
            const isLow = p.stock < threshold;
            const prefix = isLow ? '⚠️' : '✅';
            return `   ${prefix} <b>${p.name}</b>: <code>${p.stock}</code>${isLow ? ' (Sắp hết)' : ''}`;
        }).join('\n');
    }

    return `📊 <b>BÁO CÁO DOANH THU & HIỆU SUẤT</b>\n` +
           `-----------------------------\n` +
           `📅 <b>Khoảng dữ liệu:</b> ${rangeText}\n` +
           `💰 <b>Tổng thu:</b> <code>${formatCurrency(totalIncome)}</code>\n` +
           `💸 <b>Tổng chi:</b> <code>${formatCurrency(totalExpense)}</code>\n` +
           `📈 <b>Lợi nhuận ròng:</b> <code>${formatCurrency(totalProfit)}</code>\n` +
           `-----------------------------\n` +
           `🛒 <b>Top 3 sản phẩm bán chạy nhất:</b>\n` +
           `${topSellingText}\n` +
           `-----------------------------\n` +
           `📦 <b>TỒN KHO CHI TIẾT:</b>\n` +
           `${stockText}\n` +
           `-----------------------------\n` +
           `Báo cáo được gửi tự động từ Sổ Thu Chi Pro.`;
};

async function sendScheduledReportFromServiceWorker() {
    try {
        const config = await getItem('telegramConfig');
        if (!config || !config.enabled || config.reportTime === 'off') {
            console.log('[SW Periodic Sync] Telegram or report not enabled.');
            return;
        }

        // Check time
        let targetHour = null;
        let targetMinute = 0;

        if (config.reportTime === 'custom') {
            const customTimeStr = config.reportCustomTime;
            if (!customTimeStr) return;
            const parts = customTimeStr.split(':');
            if (parts.length === 2) {
                targetHour = parseInt(parts[0], 10);
                targetMinute = parseInt(parts[1], 10);
            }
        } else {
            targetHour = parseInt(config.reportTime, 10);
            targetMinute = 0;
        }

        if (targetHour === null || isNaN(targetHour) || isNaN(targetMinute)) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Check if current time is at or after target time
        const reachedTargetTime = currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute);
        if (!reachedTargetTime) {
            console.log(`[SW Periodic Sync] Time not reached yet (current: ${currentHour}:${currentMinute}, target: ${targetHour}:${targetMinute}).`);
            return;
        }

        const todayStr = now.toISOString().split('T')[0];
        const lastReportDate = await getItem('telegram_last_report_date');

        if (lastReportDate === todayStr) {
            console.log('[SW Periodic Sync] Report already sent today.');
            return;
        }

        // Query transactions and products from IndexedDB
        const transactions = (await getItem('transactions')) || [];
        const products = (await getItem('products')) || [];

        // Filter transactions for today
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const todayTransactions = transactions.filter(t => {
            if (!t.date) return false;
            const d = parseDate(t.date);
            return d >= today && d <= todayEnd;
        });

        // Generate report message
        const message = generateTelegramReportMessage(todayTransactions, "Hôm nay (Tự động chạy ngầm)", products);

        // Send to Telegram
        const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (data.ok) {
            await setItem('telegram_last_report_date', todayStr);
            console.log('[SW Periodic Sync] Report sent successfully!');
        } else {
            console.error('[SW Periodic Sync] Telegram API error:', data.description);
        }
    } catch (err) {
        console.error('[SW Periodic Sync] Error sending report:', err);
    }
}

self.addEventListener('periodicsync', event => {
    if (event.tag === 'daily-report-sync') {
        event.waitUntil(sendScheduledReportFromServiceWorker());
    }
});
