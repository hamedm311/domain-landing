/**
 * Host Baran - Competitor Price Comparison Module
 * Handles loading and displaying competitor prices
 */

const Comparison = {
    // Configuration
    config: {
        apiUrl: './api/competitor-prices.php',
        loadButton: null,
        tableWrapper: null,
        tableBody: null,
        isLoading: false,
        hostBaranName: 'هاست باران'
    },

    // Host Baran prices (in Tomans)
    hostBaranPrices: {
        'com': 2100000,
        'net': 3500000,
        'org': 3100000,
        'ir': 85000
    },

    // Domain labels in Persian
    domainLabels: {
        'com': '.COM',
        'net': '.NET',
        'org': '.ORG',
        'ir': '.IR'
    },

    /**
     * Initialize the comparison functionality
     */
    init: function() {
        this.config.loadButton = document.getElementById('load-comparison-btn');
        this.config.tableWrapper = document.getElementById('comparison-table-wrapper');
        this.config.tableBody = document.getElementById('comparison-body');

        if (!this.config.loadButton) {
            console.warn('Comparison load button not found');
            return;
        }

        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents: function() {
        this.config.loadButton.addEventListener('click', () => {
            if (!this.config.isLoading) {
                this.loadCompetitorPrices();
            }
        });
    },

    /**
     * Load competitor prices from API
     */
    loadCompetitorPrices: async function() {
        if (this.config.isLoading) return;

        this.config.isLoading = true;
        this.showLoadingState();

        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            this.displayComparison(data);

        } catch (error) {
            console.error('Comparison load error:', error);
            this.showError('خطا در دریافت اطلاعات قیمت رقبا. لطفاً مجدداً تلاش کنید.');
        } finally {
            this.config.isLoading = false;
        }
    },

    /**
     * Show loading state on button
     */
    showLoadingState: function() {
        const btnText = this.config.loadButton.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        this.config.loadButton.disabled = true;
        btnText.textContent = 'در حال دریافت قیمت‌ها...';
        
        // Store original text for restoration
        this.config.loadButton.dataset.originalText = originalText;
    },

    /**
     * Restore button state
     */
    restoreButtonState: function() {
        const btnText = this.config.loadButton.querySelector('.btn-text');
        const originalText = this.config.loadButton.dataset.originalText || 'استعلام قیمت سایت‌های دیگر';
        
        this.config.loadButton.disabled = false;
        btnText.textContent = originalText;
    },

    /**
     * Display comparison table
     * @param {Object} data 
     */
    displayComparison: function(data) {
        const competitors = data.competitors || [];
        
        if (competitors.length === 0) {
            this.showError('هیچ داده‌ای از رقبا یافت نشد.');
            return;
        }

        // Update competitor names in header
        this.updateCompetitorHeaders(competitors);

        // Build table rows
        const rowsHtml = this.buildTableRows(competitors);
        this.config.tableBody.innerHTML = rowsHtml;

        // Show table with animation
        this.config.tableWrapper.classList.remove('hidden');
        
        // Update last update time
        this.updateLastUpdateTime(data.last_updated);

        // Hide button after successful load
        this.config.loadButton.style.display = 'none';

        Utils.showNotification('قیمت‌ها با موفقیت بارگذاری شدند', 'success');
    },

    /**
     * Update competitor name headers
     * @param {Array} competitors 
     */
    updateCompetitorHeaders: function(competitors) {
        competitors.forEach((comp, index) => {
            const headerEl = document.getElementById(`comp-${index + 1}-name`);
            if (headerEl) {
                headerEl.textContent = comp.site_name || `رقیب ${index + 1}`;
            }
        });
    },

    /**
     * Build table rows HTML
     * @param {Array} competitors 
     * @returns {string}
     */
    buildTableRows: function(competitors) {
        const domains = ['com', 'net', 'org', 'ir'];
        
        return domains.map(domain => {
            const hostBaranPrice = this.hostBaranPrices[domain];
            const label = this.domainLabels[domain];
            
            // Find lowest price among all
            let lowestPrice = hostBaranPrice;
            competitors.forEach(comp => {
                const compPrice = comp.domains?.[domain] || Infinity;
                if (compPrice < lowestPrice) {
                    lowestPrice = compPrice;
                }
            });

            // Build cells for each competitor
            let competitorCells = '';
            competitors.forEach(comp => {
                const compPrice = comp.domains?.[domain] || null;
                const priceDisplay = compPrice ? Utils.formatNumber(compPrice) : '--';
                
                let cellClass = 'price-tag';
                let diffHtml = '';
                
                if (compPrice) {
                    if (compPrice > hostBaranPrice) {
                        cellClass += ' cheapest';
                        const diff = compPrice - hostBaranPrice;
                        diffHtml = `<span class="price-diff">${Utils.formatNumber(diff)} تومان ارزان‌تر</span>`;
                    } else if (compPrice < hostBaranPrice) {
                        const diff = hostBaranPrice - compPrice;
                        diffHtml = `<span class="price-diff" style="color: var(--warning);">${Utils.formatNumber(diff)} تومان گران‌تر</span>`;
                    }
                }
                
                competitorCells += `
                    <td>
                        <div>${priceDisplay}</div>
                        ${diffHtml}
                    </td>
                `;
            });

            // Highlight if Host Baran has lowest price
            const isCheapest = hostBaranPrice <= lowestPrice;
            const hostBaranClass = isCheapest ? 'price-tag cheapest' : 'price-tag';
            const cheapestBadge = isCheapest ? '<span style="color: var(--success); font-size: 12px;">✓ بهترین قیمت</span>' : '';

            return `
                <tr>
                    <td style="font-weight: bold; color: var(--primary-dark);">${label}</td>
                    <td class="highlight-col">
                        <div class="${hostBaranClass}">${Utils.formatNumber(hostBaranPrice)}</div>
                        ${cheapestBadge}
                    </td>
                    ${competitorCells}
                </tr>
            `;
        }).join('');
    },

    /**
     * Update last update time
     * @param {string} timestamp 
     */
    updateLastUpdateTime: function(timestamp) {
        const timeEl = document.getElementById('last-update-time');
        if (timeEl) {
            timeEl.textContent = timestamp ? Utils.formatDate(timestamp) : new Date().toLocaleDateString('fa-IR');
        }
    },

    /**
     * Show error message
     * @param {string} message 
     */
    showError: function(message) {
        this.restoreButtonState();
        this.config.tableWrapper.classList.remove('hidden');
        this.config.tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 2rem; color: var(--error); text-align: center;">
                    ✕ ${Utils.sanitizeInput(message)}
                </td>
            </tr>
        `;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Comparison.init();
});
