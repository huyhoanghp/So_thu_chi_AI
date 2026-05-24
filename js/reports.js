// --- REPORTS, CHARTS, AND AI ASSISTANT MODULE ---

let expensePieChart = null;
let cashflowTrendChart = null;
let productSalesTrendChart = null;

window.renderReports = function() {
    const { currentPeriodData, previousPeriodData } = window.getReportData();
    window.renderOverviewReport(currentPeriodData, previousPeriodData);
    window.renderProductPerformanceReports(currentPeriodData);
    window.renderInventoryReport();
};

window.getReportData = function() {
    const reportRangeEl = document.getElementById('report-range');
    const customStartEl = document.getElementById('custom-start');
    const customEndEl = document.getElementById('custom-end');
    if (!reportRangeEl) return { currentPeriodData: [], previousPeriodData: [] };

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
            currentStart = customStartEl?.value ? new Date(customStartEl.value) : null;
            currentEnd = customEndEl?.value ? new Date(customEndEl.value) : null;
            break;
        default: // all
            currentStart = null;
            currentEnd = null;
    }

    if (currentEnd) currentEnd.setHours(23, 59, 59, 999);
    
    const filterDataByDateRange = (data, start, end) => {
        if (!start || !end) return [];
        return data.filter(t => {
            if (!t.date) return false;
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    };

    const getPreviousPeriodRange = (start, end) => {
        if (!start || !end) return null;
        const duration = end.getTime() - start.getTime();
        if (duration <= 0) return null;
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);
        prevStart.setHours(0,0,0,0);
        prevEnd.setHours(23,59,59,999);
        return { start: prevStart, end: prevEnd };
    };

    const currentPeriodData = currentStart ? filterDataByDateRange(window.transactions, currentStart, currentEnd) : window.transactions;
    const previousPeriodRange = getPreviousPeriodRange(currentStart, currentEnd);
    const previousPeriodData = previousPeriodRange ? filterDataByDateRange(window.transactions, previousPeriodRange.start, previousPeriodRange.end) : [];
    
    return { currentPeriodData, previousPeriodData };
};

// Overview comparison cards
function createComparisonCardHTML(title, currentValue, previousValue, isExpense) {
    let percentageChange = 0;
    let changeText = '0%';
    let isPositive = true;

    if (previousValue === 0) {
        percentageChange = currentValue > 0 ? Infinity : 0;
    } else {
        percentageChange = ((currentValue - previousValue) / previousValue) * 100;
    }

    if (isExpense) {
        isPositive = percentageChange <= 0; // Decrease is good for cost
    } else {
        isPositive = percentageChange >= 0; // Increase is good for profits
    }

    let colorClass = 'text-gray-500';
    let arrowSVG = '';

    if (percentageChange === Infinity) {
        changeText = 'Mới';
        colorClass = 'text-emerald-600';
        arrowSVG = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`;
    } else if (Math.abs(percentageChange) > 0) {
        colorClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
        arrowSVG = isPositive 
            ? `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>` 
            : `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`;
        changeText = `${Math.abs(percentageChange).toFixed(0)}%`;
    }

    return `
        <div class="bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${title}</h3>
            <div class="mt-2 flex items-baseline justify-between">
                <p class="text-xl font-black text-slate-800 dark:text-white">${window.formatCurrency(currentValue)}</p>
                <span class="flex items-center text-xs font-bold ${colorClass}">
                    ${arrowSVG}
                    ${changeText}
                </span>
            </div>
        </div>
    `;
}

window.renderOverviewReport = function(currentData, previousData) {
    const reportRangeEl = document.getElementById('report-range');
    const comparisonSection = document.getElementById('comparison-section');
    const expensePieChartCtx = document.getElementById('expense-pie-chart')?.getContext('2d');
    const cashflowTrendChartCtx = document.getElementById('cashflow-trend-chart')?.getContext('2d');
    const promoTableDiv = document.getElementById('promotion-report-table');

    if (!comparisonSection) return;

    const currentIncome = currentData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpense = currentData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const currentProfit = currentIncome - currentExpense;

    const previousIncome = previousData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const previousExpense = previousData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const previousProfit = previousIncome - previousExpense;

    if (reportRangeEl?.value !== 'all' && reportRangeEl?.value !== 'custom') {
        comparisonSection.innerHTML = `
            ${createComparisonCardHTML('Doanh thu', currentIncome, previousIncome, false)}
            ${createComparisonCardHTML('Chi phí', currentExpense, previousExpense, true)}
            ${createComparisonCardHTML('Lợi nhuận', currentProfit, previousProfit, false)}
            ${createComparisonCardHTML('Chiết khấu', currentData.reduce((s,t)=>s+(t.discountAmount||0),0), previousData.reduce((s,t)=>s+(t.discountAmount||0),0), true)}
        `;
    } else {
        comparisonSection.innerHTML = '';
    }

    // --- Charts ---
    if (expensePieChart) expensePieChart.destroy();
    if (cashflowTrendChart) cashflowTrendChart.destroy();

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const expenses = currentData.filter(t => t.type === 'expense');
    if (expensePieChartCtx && expenses.length > 0) {
        const expenseByCategory = expenses.reduce((acc, curr) => { 
            acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0); return acc; 
        }, {});
        expensePieChart = new Chart(expensePieChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseByCategory),
                datasets: [{
                    data: Object.values(expenseByCategory),
                    backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#6366f1'],
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } }
                }
            }
        });
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

        cashflowTrendChart = new Chart(cashflowTrendChartCtx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [
                    { label: 'Doanh thu', data: incomeData, borderColor: '#10b981', backgroundColor: '#10b98115', fill: true, tension: 0.2 },
                    { label: 'Chi phí', data: expenseData, borderColor: '#ef4444', backgroundColor: '#ef444415', fill: true, tension: 0.2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor } }
                }
            }
        });
    }

    // --- Promotions Table ---
    const promoAgg = currentData.reduce((acc, tx) => {
        if (tx.isPos && tx.items) {
            tx.items.forEach(item => {
                if (item.promoId && item.discount > 0) {
                    if (!acc[item.promoId]) acc[item.promoId] = { count: 0, discount: 0 };
                    acc[item.promoId].count += 1;
                    acc[item.promoId].discount += item.discount;
                }
            });
        } else {
            if (!tx.promoId || !tx.discountAmount) return acc;
            if (!acc[tx.promoId]) acc[tx.promoId] = { count: 0, discount: 0 };
            acc[tx.promoId].count += 1;
            acc[tx.promoId].discount += tx.discountAmount;
        }
        return acc;
    }, {});
    const rows = Object.entries(promoAgg).map(([pid, s]) => {
        const promo = window.promotions.find(p => p.id === pid);
        return `<tr class="border-b border-gray-200 dark:border-slate-800 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
            <td class="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">${promo ? promo.name : pid}</td>
            <td class="px-4 py-2.5 text-center text-slate-650 dark:text-slate-400">${s.count}</td>
            <td class="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">${window.formatCurrency(s.discount)}</td>
        </tr>`;
    }).join('');
    
    if (promoTableDiv) {
        promoTableDiv.innerHTML = `
            <table class="min-w-full bg-white dark:bg-slate-900 overflow-hidden text-sm">
                <thead class="bg-gray-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                        <th class="px-4 py-2.5 text-left">Chương trình</th>
                        <th class="px-4 py-2.5 text-center">Số lần áp dụng</th>
                        <th class="px-4 py-2.5 text-right">Tổng giảm giá</th>
                    </tr>
                </thead>
                <tbody>${rows || `<tr><td class='px-4 py-4 text-center text-gray-500 dark:text-slate-400' colspan='3'>Chưa có dữ liệu khuyến mại được áp dụng</td></tr>`}</tbody>
            </table>
        `;
    }
};

window.renderProductPerformanceReports = function(source) {
    const productReportFilter = document.getElementById('product-report-filter');
    const productSalesTrendChartCtx = document.getElementById('product-sales-trend-chart')?.getContext('2d');
    const chartContainer = document.getElementById('product-chart-container');
    if (!productReportFilter) return;

    const selectedProductIds = [...productReportFilter.selectedOptions].map(opt => opt.value);
    
    // Tổng hợp số liệu sản phẩm
    const productStats = {};

    const addStat = (productId, name, costPrice, quantity, amount, dateStr) => {
        if (selectedProductIds.length > 0 && !selectedProductIds.includes(productId)) return;
        
        if (!productStats[productId]) {
            productStats[productId] = {
                name: name || 'SP không xác định',
                costPrice: costPrice || 0,
                quantity: 0,
                totalRevenue: 0,
                salesByDate: {}
            };
        }
        productStats[productId].quantity += quantity;
        productStats[productId].totalRevenue += amount;
        
        if (dateStr) {
            productStats[productId].salesByDate[dateStr] = (productStats[productId].salesByDate[dateStr] || 0) + amount;
        }
    };

    // Duyệt qua tất cả giao dịch trong khoảng thời gian được chọn
    source.forEach(tx => {
        if (tx.type !== 'income') return;
        const txDate = tx.date.split('T')[0];

        if (tx.isPos && tx.items) {
            // Giao dịch POS chứa danh sách items
            tx.items.forEach(item => {
                addStat(item.productId, item.productName, item.costPrice, item.quantity, item.total, txDate);
            });
        } else if (tx.productId && tx.quantity > 0) {
            // Giao dịch thu chi thủ công liên kết sản phẩm
            const productInfo = window.products.find(p => p.id === tx.productId);
            const name = productInfo ? productInfo.name : tx.description;
            const costPrice = productInfo ? productInfo.costPrice : 0;
            addStat(tx.productId, name, costPrice, tx.quantity, tx.amount, txDate);
        }
    });

    const statsArray = Object.values(productStats).map(p => ({
        ...p,
        profit: p.totalRevenue - (p.costPrice * p.quantity)
    }));

    // Top Selling
    const topSelling = [...statsArray].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const topSellingDiv = document.getElementById('top-selling-products');
    if (topSellingDiv) {
        topSellingDiv.innerHTML = topSelling.map(p => `
            <div class="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-300">${p.name}</span>
                <span class="bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-lg">Đã bán ${p.quantity}</span>
            </div>
        `).join('') || '<p class="text-center text-gray-500 text-xs py-4">Không có dữ liệu.</p>';
    }

    // Top Profit
    const topProfit = [...statsArray].sort((a, b) => b.profit - a.profit).slice(0, 5);
    const topProfitDiv = document.getElementById('top-profit-products');
    if (topProfitDiv) {
        topProfitDiv.innerHTML = topProfit.map(p => `
            <div class="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-300">${p.name}</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">${window.formatCurrency(p.profit)}</span>
            </div>
        `).join('') || '<p class="text-center text-gray-500 text-xs py-4">Không có dữ liệu.</p>';
    }

    // --- Product Chart ---
    if (productSalesTrendChart) productSalesTrendChart.destroy();
    
    const hasSalesData = Object.keys(productStats).length > 0;
    if (selectedProductIds.length > 0 && hasSalesData && chartContainer && productSalesTrendChartCtx) {
        chartContainer.classList.remove('hidden');
        
        // Thu thập tất cả các ngày có giao dịch bán sản phẩm được chọn
        const datesSet = new Set();
        selectedProductIds.forEach(pid => {
            if (productStats[pid]) {
                Object.keys(productStats[pid].salesByDate).forEach(d => datesSet.add(d));
            }
        });
        const allDates = [...datesSet].sort((a, b) => new Date(a) - new Date(b));

        if (allDates.length === 0) {
            chartContainer.classList.add('hidden');
            return;
        }

        const datasets = selectedProductIds.map((productId, index) => {
            const stats = productStats[productId];
            const name = stats ? stats.name : (window.products.find(p => p.id === productId)?.name || 'SP');
            const data = allDates.map(date => (stats && stats.salesByDate[date]) || 0);
            
            const chartColors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#eab308', '#06b6d4', '#d946ef'];
            const color = chartColors[index % chartColors.length];

            return {
                label: name,
                data: data,
                borderColor: color,
                backgroundColor: `${color}15`,
                fill: true,
                tension: 0.1
            };
        });

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#475569';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        productSalesTrendChart = new Chart(productSalesTrendChartCtx, {
            type: 'line',
            data: { labels: allDates, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
                }
            }
        });
    } else {
        chartContainer?.classList.add('hidden');
    }
};

window.renderInventoryReport = function() {
    const thresholdInput = document.getElementById('low-stock-threshold');
    const tableDiv = document.getElementById('inventory-report-table');
    if (!tableDiv) return;

    const threshold = +(thresholdInput?.value || 10);
    let tableHTML = `
        <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead class="text-xs text-slate-700 dark:text-slate-350 uppercase bg-slate-100 dark:bg-slate-800">
                <tr>
                    <th scope="col" class="px-4 py-3">Sản phẩm</th>
                    <th scope="col" class="px-4 py-3 text-right">Tồn kho</th>
                    <th scope="col" class="px-4 py-3 text-right">Giá trị kho</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (window.products.length === 0) {
        tableHTML += '<tr><td colspan="3" class="text-center p-4 text-xs text-slate-400">Chưa có sản phẩm nào.</td></tr>';
    } else {
        window.products.forEach(p => {
            const stockValue = p.stock * p.costPrice;
            const isLowStock = p.stock < threshold;
            tableHTML += `
                <tr class="border-b border-gray-200 dark:border-slate-800/80 ${isLowStock ? 'bg-rose-500/5 text-rose-600 dark:text-rose-400 font-semibold' : 'bg-white dark:bg-slate-900'} hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td class="px-4 py-3 text-slate-800 dark:text-slate-200">${p.name}</td>
                    <td class="px-4 py-3 text-right">${p.stock}</td>
                    <td class="px-4 py-3 text-right">${window.formatCurrency(stockValue)}</td>
                </tr>
            `;
        });
    }
    
    tableHTML += '</tbody></table>';
    tableDiv.innerHTML = tableHTML;
};

window.handleFilterChange = function() {
    const reportRangeEl = document.getElementById('report-range');
    const customDateRangeDiv = document.getElementById('custom-date-range');
    if (!reportRangeEl) return;

    const isCustom = reportRangeEl.value === 'custom';
    if (customDateRangeDiv) {
        customDateRangeDiv.classList.toggle('hidden', !isCustom);
        customDateRangeDiv.classList.toggle('flex', isCustom);
    }
    if (window.renderAll) window.renderAll();
};

// --- AI LOGIC ---

window.callGeminiAPI = async function(modelEndpointAction, payloadBody) {
    const models = [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-pro'
    ];
    
    const errors = [];
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${modelEndpointAction}?key=${window.geminiApiKey}`;
        
        try {
            console.log(`Trying Gemini model: ${model}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadBody)
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            const errJson = await response.json().catch(() => ({}));
            const errMessage = errJson.error?.message || `Status code ${response.status}`;
            console.warn(`Model ${model} failed: ${errMessage}`);
            errors.push(`${model}: ${errMessage}`);
        } catch (err) {
            console.warn(`Network error with model ${model}: ${err.message}`);
            errors.push(`${model} (lỗi mạng): ${err.message}`);
        }
    }
    let finalError = errors.join(" | ");
    if (finalError.includes("Failed to fetch") && window.location.protocol === "file:") {
        finalError += " \n(Gợi ý: Trình duyệt chặn kết nối API khi mở trang trực tiếp bằng file://. Bạn cần chạy ứng dụng qua máy chủ Web cục bộ như Live Server hoặc Python http.server)";
    }
    throw new Error(finalError);
};

window.openAiEntryModal = function() {
    const aiEntryModal = document.getElementById('ai-entry-modal');
    const aiInput = document.getElementById('ai-input');
    if (!aiEntryModal) return;

    if (aiInput) aiInput.value = '';
    aiEntryModal.classList.remove('hidden');
    setTimeout(() => aiEntryModal.classList.remove('opacity-0'), 10);
};

window.closeAiEntryModal = function() {
    const aiEntryModal = document.getElementById('ai-entry-modal');
    if (!aiEntryModal) return;
    aiEntryModal.classList.add('opacity-0');
    setTimeout(() => aiEntryModal.classList.add('hidden'), 300);
};

window.handleAiEntry = async function(e) {
    e.preventDefault();
    const aiInput = document.getElementById('ai-input');
    const aiSpinner = document.getElementById('ai-spinner');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const textInput = aiInput?.value.trim();
    if (!textInput) return window.showToast("Vui lòng nhập hoặc nói mô tả giao dịch.", "error");
    if (window.geminiApiKey === "YOUR_GEMINI_API_KEY_HERE" || !window.geminiApiKey) {
        return window.showToast("Lỗi: API Key của Gemini chưa được cấu hình trong phần Cài đặt.", "error");
    }

    if (aiSpinner) aiSpinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    const productNames = window.products.map(p => p.name);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInTwoDays = new Date(today);
    dateInTwoDays.setDate(dateInTwoDays.getDate() + 2);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dateInTwoDaysStr = dateInTwoDays.toISOString().split('T')[0];
    const expenseCategoriesStr = window.categories.expense.join(', ');

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
    - **quantity**: MUST extract the quantity. The number just before the productName is the quantity. Default to 1. ("bán 10 ly kem" -> 10).
    - **discountPercentage**: MUST extract any percentage discount ("chiết khấu 15%" -> 15).
5.  **If type is "expense" or it's a simple income without a product**:
    - **description**: MUST be the main subject of the transaction. ("mua rau 20k" -> "mua rau").
    - **amount**: MUST extract the monetary value. ("20k" -> 20000, "50.000d" -> 50000).
    - **category**: For expenses, try to match the description to one of the available expense categories.
6.  **customerName**: Extract the customer's name ("giao cho chị Nhung" -> "chị Nhung").
7.  **customerNote**: Extract all other relevant details ("giao 16h tại nhà khách" -> "Giao 16h tại nhà khách").

USER TEXT: "${textInput}"`;

    try {
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
        const result = await window.callGeminiAPI('generateContent', payload);
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (jsonText) {
            const parsedData = JSON.parse(jsonText);
            
            if (parsedData.productName && parsedData.type === 'income') {
                const product = window.products.find(p => p.name === parsedData.productName);
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
            
            window.closeAiEntryModal();
            if (parsedData.entryType === 'plan') {
                window.openFormModal('addPlan', parsedData);
            } else {
                window.openFormModal('addTransaction', parsedData);
            }
        } else {
            throw new Error("Không nhận diện được nội dung hợp lệ.");
        }
    } catch (error) {
        console.error(error);
        window.showToast(`AI lỗi: ${error.message}`, "error");
    } finally {
        if (aiSpinner) aiSpinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
};

window.renderChat = function() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    window.chatHistory.forEach(msg => {
        const wrapper = document.createElement('div');
        wrapper.className = `p-3.5 chat-message ${msg.role === 'user' ? 'user' : 'ai'}`;
        if (msg.role === 'model') {
            let html = msg.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            const speakBtn = document.createElement('button');
            speakBtn.className = 'speak-btn ml-2.5 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition inline-block align-middle text-indigo-500';
            speakBtn.title = 'Đọc phân tích';
            speakBtn.innerHTML = window.playIconSVG;
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
};

window.handleAiChatSubmit = async function(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const aiThinkingIndicator = document.getElementById('ai-thinking-indicator');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netProfitEl = document.getElementById('net-profit');

    const userInput = chatInput?.value.trim();
    if (!userInput) return;

    if (window.geminiApiKey === "YOUR_GEMINI_API_KEY_HERE" || !window.geminiApiKey) {
        return window.showToast("Lỗi: API Key của Gemini chưa được cấu hình trong phần Cài đặt.", "error");
    }

    window.chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
    window.renderChat();
    if (chatInput) chatInput.value = '';
    
    aiThinkingIndicator?.classList.remove('hidden');
    const { currentPeriodData } = window.getReportData();
    
    const sortedData = [...currentPeriodData].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    const transactionDetails = sortedData.map((t, idx) => {
        const dateStr = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '');
        const typeStr = t.type === 'income' ? 'Thu (Doanh thu)' : 'Chi (Chi phí)';
        const customerStr = t.customerName ? ` - Khách: ${t.customerName}` : '';
        const qtyStr = t.quantity ? ` (SL: ${t.quantity})` : '';
        return `${idx + 1}. [${dateStr}] ${typeStr} - ${t.category}: ${t.description}${qtyStr} - Số tiền: ${window.formatCurrency(t.amount)}${customerStr}`;
    }).join('\n');

    const dataSummary = `BÁO CÁO TỔNG QUAN TÀI CHÍNH:
- Tổng thu: ${totalIncomeEl?.textContent || '0 ₫'}
- Tổng chi: ${totalExpenseEl?.textContent || '0 ₫'}
- Lợi nhuận ròng: ${netProfitEl?.textContent || '0 ₫'}

DANH SÁCH LỊCH SỬ GIAO DỊCH CHI TIẾT TRONG KỲ:
${transactionDetails || 'Chưa ghi nhận giao dịch nào.'}`;

    const systemPrompt = `Bạn là một chuyên gia phân tích tài chính thông minh của ứng dụng "Sổ Thu Chi Pro". Hãy dựa vào báo cáo tổng quan và danh sách lịch sử giao dịch chi tiết được cung cấp để trả lời các câu hỏi của người dùng một cách chính xác, chuyên nghiệp, ngắn gọn và hữu ích. Nếu người dùng hỏi về các thống kê cụ thể (ví dụ: sản phẩm nào bán chạy nhất, khách hàng nào mua nhiều nhất, khoản chi nào tốn kém nhất, chi tiết các giao dịch trong ngày/tuần), hãy tính toán trực tiếp từ danh sách chi tiết được cung cấp.`;
    
    try {
        const payload = {
            contents: [ ...window.chatHistory.map(item => ({ role: item.role, parts: item.parts })), { role: 'user', parts: [{ text: `Dữ liệu: "${dataSummary}". Hãy trả lời: "${userInput}"` }] } ],
            system_instruction: { parts: [{ text: systemPrompt }] }
        };
        const result = await window.callGeminiAPI('generateContent', payload);
        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiResponse) {
            window.chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
        } else {
            window.chatHistory.push({ role: 'model', parts: [{ text: "Tôi chưa phân tích được dữ liệu này." }] });
        }
    } catch (error) {
        console.error(error);
        window.chatHistory.push({ role: 'model', parts: [{ text: `Lỗi kết nối AI: ${error.message}` }] });
    } finally {
        aiThinkingIndicator?.classList.add('hidden');
        window.renderChat();
    }
};

// Clean markdown syntax for natural-sounding Text-to-Speech
window.cleanMarkdownForSpeech = function(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/__(.*?)__/g, '$1')     // Bold underscores
        .replace(/_(.*?)_/g, '$1')       // Italic underscores
        .replace(/`{1,3}(.*?)[^`]`{1,3}/g, '$1') // Code block ticks
        .replace(/#+\s+/g, '')           // Header hashes
        .replace(/^\s*[-*+]\s+/gm, '')   // List bullets
        .replace(/^\s*\d+\.\s+/gm, '')   // List numbers
        .replace(/-\s+/g, ' ')           // Indented bullet line indicators
        .replace(/[\n\r]+/g, ' ')        // New lines to spacing
        .replace(/\s+/g, ' ')            // Normalize white spacing
        .trim();
};

// TTS Audio Functions (Browser Native SpeechSynthesis)
window.speakText = function(textToSpeak, buttonElement) {
    if (!('speechSynthesis' in window)) {
        return window.showToast("Trình duyệt không hỗ trợ tổng hợp giọng nói.", "error");
    }

    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = '<div class="spinner border-2 w-4.5 h-4.5"></div>';
    buttonElement.disabled = true;

    try {
        const cleanedText = window.cleanMarkdownForSpeech(textToSpeak);
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'vi-VN';
        
        utterance.onstart = () => {
            buttonElement.innerHTML = window.stopIconSVG;
            buttonElement.disabled = false;
            window.currentlyPlayingButton = buttonElement;
            window.currentAudio = {
                pause: () => {
                    window.speechSynthesis.cancel();
                    buttonElement.innerHTML = window.playIconSVG;
                    window.currentAudio = null;
                    window.currentlyPlayingButton = null;
                }
            };
        };

        utterance.onend = () => {
            buttonElement.innerHTML = window.playIconSVG;
            window.currentAudio = null;
            window.currentlyPlayingButton = null;
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesis error:', event);
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
            window.currentAudio = null;
            window.currentlyPlayingButton = null;
        };

        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error(error);
        window.showToast("Lỗi phát âm thanh bằng trình duyệt.", "error");
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const reportRangeEl = document.getElementById('report-range');
    const customStartEl = document.getElementById('custom-start');
    const customEndEl = document.getElementById('custom-end');
    const addAiBtn = document.getElementById('add-ai-btn');
    const aiEntryForm = document.getElementById('ai-entry-form');
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    reportRangeEl?.addEventListener('change', window.handleFilterChange);
    customStartEl?.addEventListener('change', () => { if (window.renderAll) window.renderAll(); });
    customEndEl?.addEventListener('change', () => { if (window.renderAll) window.renderAll(); });
    
    document.getElementById('low-stock-threshold')?.addEventListener('input', window.renderInventoryReport);
    document.getElementById('product-report-filter')?.addEventListener('change', () => {
        const { currentPeriodData } = window.getReportData();
        window.renderProductPerformanceReports(currentPeriodData);
    });
    document.querySelectorAll('.report-tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.report-tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const tabName = e.currentTarget.dataset.report;
            document.querySelectorAll('[id^="report-content-"]').forEach(content => content.classList.add('hidden'));
            document.getElementById(`report-content-${tabName}`)?.classList.remove('hidden');
        });
    });

    addAiBtn?.addEventListener('click', window.openAiEntryModal);
    document.getElementById('ai-entry-modal')?.querySelector('.cancel-btn')?.addEventListener('click', window.closeAiEntryModal);
    aiEntryForm?.addEventListener('submit', window.handleAiEntry);
    chatForm?.addEventListener('submit', window.handleAiChatSubmit);

    chatMessages?.addEventListener('click', (e) => {
        const speakButton = e.target.closest('.speak-btn');
        if (speakButton) {
            const text = speakButton.dataset.text;
            if (text) {
                if (window.currentlyPlayingButton === speakButton && window.currentAudio) {
                    window.currentAudio.pause();
                    window.currentAudio = null;
                    speakButton.innerHTML = window.playIconSVG;
                    window.currentlyPlayingButton = null;
                } else {
                    if (window.currentAudio) {
                        window.currentAudio.pause();
                        if (window.currentlyPlayingButton) window.currentlyPlayingButton.innerHTML = window.playIconSVG;
                    }
                    window.speakText(text, speakButton);
                }
            }
        }
    });
});
