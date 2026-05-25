// --- REPORTS, CHARTS, AND AI ASSISTANT MODULE ---

let expensePieChart = null;
let revenuePieChart = null;
let cashflowTrendChart = null;
let productSalesTrendChart = null;
let topSellingChart = null;
let topProfitChart = null;
let inventoryPieChart = null;

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
            const d = window.parseDate(t.date);
            if (isNaN(d.getTime())) return false;
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
    const revenuePieChartCtx = document.getElementById('revenue-pie-chart')?.getContext('2d');
    const expensePieChartCtx = document.getElementById('expense-pie-chart')?.getContext('2d');
    const cashflowTrendChartCtx = document.getElementById('cashflow-trend-chart')?.getContext('2d');
    const promoTableDiv = document.getElementById('promotion-report-table');
    const revenueLegendContainer = document.getElementById('revenue-legend-container');
    const expenseLegendContainer = document.getElementById('expense-legend-container');

    if (!comparisonSection) return;

    const currentIncome = currentData.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const currentExpense = currentData.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const currentProfit = currentIncome - currentExpense;

    const previousIncome = previousData.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const previousExpense = previousData.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
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

    // --- Calculate dynamic AOV & Margin ---
    const posSales = currentData.filter(t => t.type === 'income' && t.isPos);
    const currentAOV = posSales.length ? posSales.reduce((s, t) => s + (t.amount || 0), 0) / posSales.length : 0;
    const currentMargin = currentIncome ? (currentProfit / currentIncome) * 100 : 0;

    // Update KPIs on DOM
    const aovValueEl = document.getElementById('aov-value');
    const marginValueEl = document.getElementById('margin-value');
    if (aovValueEl) aovValueEl.textContent = window.formatCurrency(currentAOV);
    if (marginValueEl) marginValueEl.textContent = `${currentMargin.toFixed(1)}%`;

    // --- Sparkline Helper ---
    const drawSparkline = (canvasId, dataPoints, color) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const existingChart = Chart.getChart(canvasId);
        if (existingChart) existingChart.destroy();
        
        const points = dataPoints.length >= 2 ? dataPoints : (dataPoints.length === 1 ? [dataPoints[0], dataPoints[0]] : [0, 0]);
        const labels = points.map((_, i) => i);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: points,
                    borderColor: color,
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                layout: {
                    padding: { top: 2, bottom: 2, left: 2, right: 2 }
                }
            }
        });
    };

    // --- Group currentData by Date for Sparklines and Cashflow Trend ---
    const dataByDate = currentData.reduce((acc, curr) => { 
        const date = curr.date.split('T')[0]; 
        if (!acc[date]) acc[date] = { income: 0, expense: 0, posRevenue: 0, posCount: 0 }; 
        acc[date][curr.type] += (curr.amount || 0); 
        if (curr.type === 'income' && curr.isPos) {
            acc[date].posRevenue += (curr.amount || 0);
            acc[date].posCount += 1;
        }
        return acc; 
    }, {});

    const sortedDates = Object.keys(dataByDate).sort((a,b) => new Date(a) - new Date(b));

    // Limit sparklines to the last 30 data points for readability
    const sparkDates = sortedDates.length > 30 ? sortedDates.slice(-30) : sortedDates;
    const incomeSparkData = sparkDates.map(d => dataByDate[d].income);
    const expenseSparkData = sparkDates.map(d => dataByDate[d].expense);
    const profitSparkData = sparkDates.map(d => dataByDate[d].income - dataByDate[d].expense);
    const aovSparkData = sparkDates.map(d => dataByDate[d].posCount ? dataByDate[d].posRevenue / dataByDate[d].posCount : 0);
    const marginSparkData = sparkDates.map(d => dataByDate[d].income ? ((dataByDate[d].income - dataByDate[d].expense) / dataByDate[d].income) * 100 : 0);

    // Draw the sparklines
    drawSparkline('income-sparkline', incomeSparkData, '#10b981');
    drawSparkline('expense-sparkline', expenseSparkData, '#ef4444');
    drawSparkline('profit-sparkline', profitSparkData, '#6366f1');
    drawSparkline('aov-sparkline', aovSparkData, '#06b6d4');
    drawSparkline('margin-sparkline', marginSparkData, '#f59e0b');

    // --- Helper to build custom Glassmorphism Legend Cards ---
    const buildCustomLegend = (containerId, dataObj, colors) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        const entries = Object.entries(dataObj);
        const total = entries.reduce((s, [_, v]) => s + v, 0);
        if (total === 0) return;
        
        entries.forEach(([key, val], idx) => {
            const pct = ((val / total) * 100).toFixed(1);
            const color = colors[idx % colors.length];
            
            const card = document.createElement('div');
            card.className = "flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 shadow-sm text-slate-700 dark:text-slate-300";
            card.innerHTML = `
                <div class="flex items-center gap-1.5 truncate">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${color}; box-shadow: 0 0 8px ${color}"></span>
                    <span class="truncate font-medium">${key}</span>
                </div>
                <div class="text-right shrink-0 font-semibold pl-2">
                    <div>${window.formatCurrency(val)}</div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500">${pct}%</div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // --- Charts ---
    if (revenuePieChart) revenuePieChart.destroy();
    if (expensePieChart) expensePieChart.destroy();
    if (cashflowTrendChart) cashflowTrendChart.destroy();

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // 1. Revenue Pie Chart (Cơ cấu doanh thu)
    const incomes = currentData.filter(t => t.type === 'income');
    if (revenuePieChartCtx && incomes.length > 0) {
        const revenueByCategory = incomes.reduce((acc, curr) => { 
            const cat = curr.category || (curr.isPos ? 'Bán hàng POS' : 'Thu nhập khác');
            acc[cat] = (acc[cat] || 0) + (curr.amount || 0); 
            return acc; 
        }, {});
        const revenueColors = ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#14b8a6', '#0284c7'];
        
        revenuePieChart = new Chart(revenuePieChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(revenueByCategory),
                datasets: [{
                    data: Object.values(revenueByCategory),
                    backgroundColor: revenueColors.map(c => isDark ? c + 'cc' : c + 'dd'),
                    borderColor: isDark ? '#0f172a' : '#ffffff',
                    borderWidth: isDark ? 3 : 2,
                    hoverBackgroundColor: revenueColors,
                    hoverBorderColor: revenueColors,
                    hoverBorderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                        borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e2e8f0' : '#1e293b',
                        bodyColor: isDark ? '#94a3b8' : '#475569',
                        padding: 12, cornerRadius: 12,
                        callbacks: {
                            label: ctx => {
                                const val = ctx.parsed;
                                const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                                const pct = total ? ((val / total) * 100).toFixed(1) : 0;
                                return ` ${window.formatCurrency(val)} (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '65%',
                animation: { animateRotate: true, animateScale: true, duration: 700, easing: 'easeOutQuart' }
            }
        });
        buildCustomLegend('revenue-legend-container', revenueByCategory, revenueColors);
    } else if (revenueLegendContainer) {
        revenueLegendContainer.innerHTML = '<div class="col-span-2 text-center text-slate-400 py-4 text-xs">Không có dữ liệu doanh thu</div>';
    }

    // 2. Expense Pie Chart (Cơ cấu chi phí)
    const expenses = currentData.filter(t => t.type === 'expense');
    if (expensePieChartCtx && expenses.length > 0) {
        const expenseByCategory = expenses.reduce((acc, curr) => { 
            acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0); return acc; 
        }, {});
        const expenseColors = ['#ef4444', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#a855f7', '#f43f5e'];
        
        expensePieChart = new Chart(expensePieChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseByCategory),
                datasets: [{
                    data: Object.values(expenseByCategory),
                    backgroundColor: expenseColors.map(c => isDark ? c + 'cc' : c + 'dd'),
                    borderColor: isDark ? '#0f172a' : '#ffffff',
                    borderWidth: isDark ? 3 : 2,
                    hoverBackgroundColor: expenseColors,
                    hoverBorderColor: expenseColors,
                    hoverBorderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                        borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e2e8f0' : '#1e293b',
                        bodyColor: isDark ? '#94a3b8' : '#475569',
                        padding: 12, cornerRadius: 12,
                        callbacks: {
                            label: ctx => {
                                const val = ctx.parsed;
                                const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                                const pct = total ? ((val / total) * 100).toFixed(1) : 0;
                                return ` ${window.formatCurrency(val)} (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '65%',
                animation: { animateRotate: true, animateScale: true, duration: 700, easing: 'easeOutQuart' }
            }
        });
        buildCustomLegend('expense-legend-container', expenseByCategory, expenseColors);
    } else if (expenseLegendContainer) {
        expenseLegendContainer.innerHTML = '<div class="col-span-2 text-center text-slate-400 py-4 text-xs">Không có dữ liệu chi phí</div>';
    }

    // 3. Cashflow Combo Chart (Dòng tiền theo thời gian)
    if (cashflowTrendChartCtx && currentData.length > 0) {
        const incomeData = sortedDates.map(date => dataByDate[date].income);
        const expenseData = sortedDates.map(date => dataByDate[date].expense);
        const profitData = sortedDates.map(date => dataByDate[date].income - dataByDate[date].expense);

        cashflowTrendChart = new Chart(cashflowTrendChartCtx, {
            type: 'bar',
            data: {
                labels: sortedDates,
                datasets: [
                    { 
                        label: 'Doanh thu', 
                        data: incomeData, 
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.7)', 
                        borderColor: '#10b981',
                        borderWidth: 1.5,
                        borderRadius: 8,
                        barPercentage: 0.55,
                        order: 2
                    },
                    { 
                        label: 'Chi phí', 
                        data: expenseData, 
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.7)', 
                        borderColor: '#ef4444',
                        borderWidth: 1.5,
                        borderRadius: 8,
                        barPercentage: 0.55,
                        order: 2
                    },
                    { 
                        label: 'Lợi nhuận ròng', 
                        data: profitData, 
                        type: 'line',
                        borderColor: '#38bdf8', 
                        backgroundColor: 'rgba(56, 189, 248, 0.1)', 
                        fill: false, 
                        tension: 0.4,
                        borderWidth: 3.5,
                        pointBackgroundColor: '#38bdf8',
                        pointBorderColor: isDark ? '#070d19' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: sortedDates.length > 30 ? 0 : 4,
                        pointHoverRadius: 6,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 8,
                            padding: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                        borderColor: isDark ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.2)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e2e8f0' : '#1e293b',
                        bodyColor: isDark ? '#94a3b8' : '#475569',
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                            label: ctx => ` ${ctx.dataset.label}: ${window.formatCurrency(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, maxRotation: 45 }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v
                        }
                    }
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

    const selectedProductIds = Array.from(productReportFilter.selectedOptions).map(opt => opt.value).filter(val => val !== '');
    
    // Tổng hợp số liệu Tất cả sản phẩm (dùng cho Top 5 charts - không lọc)
    const allProductStats = {};
    // Tổng hợp số liệu sản phẩm được chọn (dùng cho Trend chart)
    const filteredProductStats = {};

    const addToStats = (target, productId, name, costPrice, quantity, amount, dateStr) => {
        if (!target[productId]) {
            target[productId] = {
                name: name || 'SP không xác định',
                costPrice: costPrice || 0,
                quantity: 0,
                totalRevenue: 0,
                salesByDate: {}
            };
        }
        target[productId].quantity += quantity;
        target[productId].totalRevenue += amount;
        if (dateStr) {
            target[productId].salesByDate[dateStr] = (target[productId].salesByDate[dateStr] || 0) + amount;
        }
    };

    const addStat = (productId, name, costPrice, quantity, amount, dateStr) => {
        // Luôn thêm vào allProductStats (không lọc)
        addToStats(allProductStats, productId, name, costPrice, quantity, amount, dateStr);
        // Chỉ thêm vào filteredProductStats nếu khớp bộ lọc
        if (selectedProductIds.length === 0 || selectedProductIds.includes(productId)) {
            addToStats(filteredProductStats, productId, name, costPrice, quantity, amount, dateStr);
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

    // statsArray dùng allProductStats - luôn bao gồm tất cả sản phẩm (cho Top 5 charts)
    const statsArray = Object.values(allProductStats).map(p => ({
        ...p,
        profit: p.totalRevenue - (p.costPrice * p.quantity)
    }));


    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Helper: tạo gradient màu ngang cho bar chart (hiệu ứng neon gradient)
    const makeHBarGradient = (ctx, color1, color2) => {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };

    // Top Selling Chart (Cột ngang với gradient + neon)
    if (topSellingChart) topSellingChart.destroy();
    const topSellingChartCtx = document.getElementById('top-selling-chart')?.getContext('2d');
    const topSellingEmpty = document.getElementById('top-selling-empty');
    if (topSellingChartCtx) {
        const topSelling = [...statsArray].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        if (topSelling.length === 0) {
            topSellingEmpty?.classList.remove('hidden');
            topSellingChartCtx.canvas.classList.add('hidden');
        } else {
            topSellingEmpty?.classList.add('hidden');
            topSellingChartCtx.canvas.classList.remove('hidden');
            const labels = topSelling.map(p => p.name);
            const data = topSelling.map(p => p.quantity);
            const sellingGradient = makeHBarGradient(topSellingChartCtx, 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0.85)');
            
            topSellingChart = new Chart(topSellingChartCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Số lượng bán',
                        data: data,
                        backgroundColor: sellingGradient,
                        borderColor: '#10b981',
                        borderWidth: isDark ? 1.5 : 1,
                        borderRadius: { topRight: 8, bottomRight: 8 },
                        barThickness: isDark ? 18 : 16
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                            borderColor: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)',
                            borderWidth: 1,
                            titleColor: isDark ? '#e2e8f0' : '#1e293b',
                            bodyColor: isDark ? '#94a3b8' : '#475569',
                            padding: 10,
                            cornerRadius: 12,
                            callbacks: {
                                label: ctx => ` ${ctx.parsed.x.toLocaleString('vi-VN')} sản phẩm`
                            }
                        }
                    },
                    scales: {
                        x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
                        y: { grid: { display: false }, ticks: { color: isDark ? '#e2e8f0' : '#1e293b', font: { weight: '700', size: 11 } } }
                    }
                }
            });
        }
    }

    // Top Profit Chart (Cột ngang với gradient indigo)
    if (topProfitChart) topProfitChart.destroy();
    const topProfitChartCtx = document.getElementById('top-profit-chart')?.getContext('2d');
    const topProfitEmpty = document.getElementById('top-profit-empty');
    if (topProfitChartCtx) {
        const topProfit = [...statsArray].sort((a, b) => b.profit - a.profit).slice(0, 5);
        if (topProfit.length === 0) {
            topProfitEmpty?.classList.remove('hidden');
            topProfitChartCtx.canvas.classList.add('hidden');
        } else {
            topProfitEmpty?.classList.add('hidden');
            topProfitChartCtx.canvas.classList.remove('hidden');
            const labels = topProfit.map(p => p.name);
            const data = topProfit.map(p => p.profit);
            const profitGradient = makeHBarGradient(topProfitChartCtx, 'rgba(99,102,241,0.15)', 'rgba(99,102,241,0.85)');
            
            topProfitChart = new Chart(topProfitChartCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Lợi nhuận',
                        data: data,
                        backgroundColor: profitGradient,
                        borderColor: '#6366f1',
                        borderWidth: isDark ? 1.5 : 1,
                        borderRadius: { topRight: 8, bottomRight: 8 },
                        barThickness: isDark ? 18 : 16
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                            borderColor: isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)',
                            borderWidth: 1,
                            titleColor: isDark ? '#e2e8f0' : '#1e293b',
                            bodyColor: isDark ? '#94a3b8' : '#475569',
                            padding: 10,
                            cornerRadius: 12,
                            callbacks: {
                                label: ctx => ` ${window.formatCurrency(ctx.parsed.x)}`
                            }
                        }
                    },
                    scales: {
                        x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, callback: v => (v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v) } },
                        y: { grid: { display: false }, ticks: { color: isDark ? '#e2e8f0' : '#1e293b', font: { weight: '700', size: 11 } } }
                    }
                }
            });
        }
    }

    // --- Product Trend Chart (chỉ hiện khi chọn ít nhất 1 sản phẩm cụ thể) ---
    if (productSalesTrendChart) productSalesTrendChart.destroy();
    
    const hasSalesData = Object.keys(allProductStats).length > 0;
    if (selectedProductIds.length > 0 && hasSalesData && chartContainer && productSalesTrendChartCtx) {
        chartContainer.classList.remove('hidden');
        
        const datesSet = new Set();
        selectedProductIds.forEach(pid => {
            const stats = filteredProductStats[pid];
            if (stats) {
                Object.keys(stats.salesByDate).forEach(d => datesSet.add(d));
            }
        });
        const allDates = [...datesSet].sort((a, b) => new Date(a) - new Date(b));

        if (allDates.length === 0) {
            chartContainer.classList.add('hidden');
        } else {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444'];
            const datasets = selectedProductIds.map((pid, idx) => {
                const stats = filteredProductStats[pid];
                if (!stats) return null;
                const productName = stats.name;
                const data = allDates.map(date => stats.salesByDate[date] || 0);
                const color = colors[idx % colors.length];
                
                return {
                    label: productName,
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '1a', // 10% opacity for fill
                    fill: selectedProductIds.length === 1, // Only fill if single product to avoid overlapping clutter
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointBackgroundColor: color,
                    pointBorderColor: isDark ? '#0f172a' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: allDates.length > 30 ? 0 : 4,
                    pointHoverRadius: 6
                };
            }).filter(ds => ds !== null);

            if (datasets.length === 0) {
                chartContainer.classList.add('hidden');
            } else {
                const isDark2 = document.documentElement.classList.contains('dark');
                const textColor2 = isDark2 ? '#94a3b8' : '#475569';
                const gridColor2 = isDark2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

                productSalesTrendChart = new Chart(productSalesTrendChartCtx, {
                    type: 'line',
                    data: {
                        labels: allDates,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: textColor2, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } },
                            tooltip: {
                                backgroundColor: isDark2 ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                                borderColor: isDark2 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                borderWidth: 1,
                                titleColor: isDark2 ? '#e2e8f0' : '#1e293b',
                                bodyColor: isDark2 ? '#94a3b8' : '#475569',
                                padding: 10, cornerRadius: 12,
                                callbacks: { label: ctx => ` ${ctx.dataset.label}: ${window.formatCurrency(ctx.parsed.y)}` }
                            }
                        },
                        scales: {
                            x: { grid: { color: gridColor2 }, ticks: { color: textColor2, maxRotation: 45 } },
                            y: { beginAtZero: true, grid: { color: gridColor2 }, ticks: { color: textColor2, callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } }
                        }
                    }
                });
            }
        }
    } else {
        chartContainer?.classList.add('hidden');
    }
};

window.renderInventoryReport = function() {
    const thresholdInput = document.getElementById('low-stock-threshold');
    const tableDiv = document.getElementById('inventory-report-table');
    if (!tableDiv) return;

    // Calculate inventory stats (Tổng tồn kho và Giá trị vốn tồn)
    const totalQty = window.products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalVal = window.products.reduce((acc, p) => acc + ((p.stock || 0) * (p.costPrice || 0)), 0);

    const totalInventoryQtyEl = document.getElementById('total-inventory-qty');
    const totalInventoryValueEl = document.getElementById('total-inventory-value');
    if (totalInventoryQtyEl) totalInventoryQtyEl.textContent = totalQty;
    if (totalInventoryValueEl) totalInventoryValueEl.textContent = window.formatCurrency(totalVal);

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

    // Render Inventory Pie Chart (Cơ cấu vốn tồn kho)
    if (inventoryPieChart) inventoryPieChart.destroy();
    const inventoryPieChartCtx = document.getElementById('inventory-pie-chart')?.getContext('2d');
    const inventoryLegendContainer = document.getElementById('inventory-legend-container');
    
    if (inventoryPieChartCtx && window.products.length > 0) {
        const productAllocation = {};
        window.products.forEach(p => {
            const cost = (p.stock || 0) * (p.costPrice || 0);
            if (cost > 0) {
                productAllocation[p.name] = cost;
            }
        });
        
        const sortedAllocation = Object.entries(productAllocation)
            .sort((a, b) => b[1] - a[1]) // Sắp xếp giảm dần theo vốn tồn
            .slice(0, 6); // Lấy top 6 sản phẩm nhiều vốn tồn nhất
            
        // Nếu có nhiều hơn 6 sản phẩm, gom phần còn lại vào "Khác"
        const topProductCapital = sortedAllocation.reduce((s, [_, v]) => s + v, 0);
        const totalCapital = window.products.reduce((acc, p) => acc + ((p.stock || 0) * (p.costPrice || 0)), 0);
        const diff = totalCapital - topProductCapital;
        if (diff > 0) {
            sortedAllocation.push(['Khác', diff]);
        }
        
        const labels = sortedAllocation.map(([name, _]) => name);
        const data = sortedAllocation.map(([_, val]) => val);
        const isDark = document.documentElement.classList.contains('dark');
        const allocationColors = ['#f59e0b', '#f97316', '#3b82f6', '#06b6d4', '#10b981', '#a855f7', '#64748b'];
        
        inventoryPieChart = new Chart(inventoryPieChartCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: allocationColors.map(c => isDark ? c + 'cc' : c + 'dd'),
                    borderColor: isDark ? '#0f172a' : '#ffffff',
                    borderWidth: isDark ? 3 : 2,
                    hoverBackgroundColor: allocationColors,
                    hoverBorderColor: allocationColors,
                    hoverBorderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        borderWidth: 1,
                        titleColor: isDark ? '#e2e8f0' : '#1e293b',
                        bodyColor: isDark ? '#94a3b8' : '#475569',
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.parsed;
                                const pct = totalCapital ? ((val / totalCapital) * 100).toFixed(1) : 0;
                                return ` ${window.formatCurrency(val)} (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '66%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 700,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Tải danh sách Legend Cards kính mờ
        if (inventoryLegendContainer) {
            inventoryLegendContainer.innerHTML = '';
            sortedAllocation.forEach(([key, val], idx) => {
                const pct = totalCapital ? ((val / totalCapital) * 100).toFixed(1) : 0;
                const color = allocationColors[idx % allocationColors.length];
                const card = document.createElement('div');
                card.className = "flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 shadow-sm text-slate-700 dark:text-slate-300";
                card.innerHTML = `
                    <div class="flex items-center gap-1.5 truncate">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${color}; box-shadow: 0 0 8px ${color}"></span>
                        <span class="truncate font-medium">${key}</span>
                    </div>
                    <div class="text-right shrink-0 font-semibold pl-2">
                        <div>${window.formatCurrency(val)}</div>
                        <div class="text-[10px] text-slate-400 dark:text-slate-500">${pct}%</div>
                    </div>
                `;
                inventoryLegendContainer.appendChild(card);
            });
        }
    } else if (inventoryLegendContainer) {
        inventoryLegendContainer.innerHTML = '<div class="text-center text-slate-400 py-4 text-xs">Không có dữ liệu tồn kho</div>';
    }
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
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-2.0-pro-exp-02-05',
        'gemini-2.0-flash-thinking-exp-01-21',
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-8b-latest',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-thinking-exp'
    ];
    
    let lastIndex = parseInt(localStorage.getItem('last_gemini_model_index') || '-1', 10);
    let startIndex = (lastIndex + 1) % models.length;
    
    const errors = [];
    for (let i = 0; i < models.length; i++) {
        const modelIdx = (startIndex + i) % models.length;
        const model = models[modelIdx];
        
        const apiVersions = ['v1beta', 'v1'];
        let modelErrors = [];
        let skippedModel = false;
        
        for (const apiVersion of apiVersions) {
            const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:${modelEndpointAction}?key=${window.geminiApiKey}`;
            try {
                console.log(`Trying Gemini model: ${model} (${apiVersion})`);
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadBody)
                });
                
                const errJson = await response.json().catch(() => ({}));
                if (response.ok) {
                    localStorage.setItem('last_gemini_model_index', modelIdx.toString());
                    return errJson;
                }
                
                const errMessage = errJson.error?.message || `Status code ${response.status}`;
                console.warn(`Model ${model} (${apiVersion}) failed: ${errMessage}`);
                modelErrors.push(`${apiVersion}: ${errMessage}`);
                
                // If it is a quota or rate limit error, trying other API version is redundant. Move to next model.
                if (response.status === 429 || errMessage.toLowerCase().includes("quota") || errMessage.toLowerCase().includes("rate limit") || errMessage.toLowerCase().includes("exceeded")) {
                    skippedModel = true;
                    break;
                }
            } catch (err) {
                console.warn(`Network error with model ${model} (${apiVersion}): ${err.message}`);
                modelErrors.push(`${apiVersion} (lỗi mạng): ${err.message}`);
            }
        }
        
        errors.push(`${model} [${modelErrors.join("; ")}]`);
        // If we broke out due to quota limits, we continue the outer loop to test the next model
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
            speakBtn.className = 'speak-btn ml-2.5 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition inline-block align-middle text-brand-500';
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
    const reportRangeEl = document.getElementById('report-range');
    const activePeriod = reportRangeEl ? reportRangeEl.value : 'all';
    
    // Sort all transactions chronologically
    const sortedAll = [...window.transactions].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    const allTransactionDetails = sortedAll.map((t, idx) => {
        const dateStr = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '');
        const typeStr = t.type === 'income' ? 'Thu' : 'Chi';
        const customerStr = t.customerName ? ` - Khách: ${t.customerName}` : '';
        const qtyStr = t.quantity ? ` (SL: ${t.quantity})` : '';
        return `${idx + 1}. [${dateStr}] ${typeStr} - ${t.category}: ${t.description}${qtyStr} - Số tiền: ${window.formatCurrency(t.amount)}${customerStr}`;
    }).join('\n');

    const dataSummary = `BÁO CÁO CỦA KỲ ĐANG XEM (Kỳ lọc: ${activePeriod}):
- Tổng thu trong kỳ: ${totalIncomeEl?.textContent || '0 ₫'}
- Tổng chi trong kỳ: ${totalExpenseEl?.textContent || '0 ₫'}
- Lợi nhuận ròng trong kỳ: ${netProfitEl?.textContent || '0 ₫'}

TOÀN BỘ DANH SÁCH LỊCH SỬ GIAO DỊCH TRONG HỆ THỐNG:
${allTransactionDetails || 'Chưa ghi nhận giao dịch nào.'}`;

    const systemPrompt = `Bạn là một chuyên gia phân tích tài chính thông minh của ứng dụng "Sổ Thu Chi Pro". Hãy dựa vào báo cáo tổng quan kỳ đang xem và danh sách toàn bộ lịch sử giao dịch được cung cấp để trả lời các câu hỏi của người dùng một cách chính xác, chuyên nghiệp, ngắn gọn và hữu ích. Nếu người dùng hỏi về các thống kê cụ thể (ví dụ: sản phẩm nào bán chạy nhất, khách hàng nào mua nhiều nhất, khoản chi nào tốn kém nhất, so sánh giữa các tháng/năm, chi tiết các giao dịch trong ngày/tuần), hãy tính toán trực tiếp từ danh sách toàn bộ giao dịch được cung cấp.`;
    
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

    // Setup report range pills
    const pills = document.querySelectorAll('#report-range-pills .report-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            const val = e.currentTarget.dataset.value;
            if (reportRangeEl) {
                reportRangeEl.value = val;
                reportRangeEl.dispatchEvent(new Event('change'));
            }
        });
    });

    window.syncReportRangePills = function() {
        const val = reportRangeEl?.value || 'all';
        pills.forEach(pill => {
            if (pill.dataset.value === val) {
                pill.classList.add('pill-active');
            } else {
                pill.classList.remove('pill-active');
            }
        });
    };

    // Listen for report-range change to sync pills
    reportRangeEl?.addEventListener('change', window.syncReportRangePills);
    
    // Initial sync
    window.syncReportRangePills();
    
    document.getElementById('low-stock-threshold')?.addEventListener('input', window.renderInventoryReport);
    document.getElementById('product-report-filter')?.addEventListener('change', () => {
        const { currentPeriodData } = window.getReportData();
        window.renderProductPerformanceReports(currentPeriodData);
    });
    const reportTabButtons = document.querySelectorAll('.report-tab-button');
    const mobileReportTabSelector = document.getElementById('mobile-report-tab-selector');

    function switchReportTab(tabName) {
        // Sync desktop buttons
        reportTabButtons.forEach(btn => {
            if (btn.dataset.report === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Sync mobile dropdown select
        if (mobileReportTabSelector && mobileReportTabSelector.value !== tabName) {
            mobileReportTabSelector.value = tabName;
            mobileReportTabSelector.dispatchEvent(new CustomEvent('custom-value-set'));
        }

        // Show/hide content panels
        document.querySelectorAll('[id^="report-content-"]').forEach(content => {
            if (content.id === `report-content-${tabName}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    reportTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.report;
            switchReportTab(tabName);
        });
    });

    mobileReportTabSelector?.addEventListener('change', (e) => {
        const tabName = e.target.value;
        switchReportTab(tabName);
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
