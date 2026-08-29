/**
 * Host Baran - Domain Search Module
 * Handles domain availability checking via AJAX
 */

const DomainSearch = {
    // Configuration
    config: {
        apiUrl: './api/whois.php',
        searchForm: null,
        domainInput: null,
        extensionSelect: null,
        resultContainer: null,
        isSearching: false
    },

    // Host Baran prices (in Tomans)
    prices: {
        'com': 2100000,
        'net': 3500000,
        'org': 3100000,
        'ir': 85000
    },

    /**
     * Initialize the domain search functionality
     */
    init: function() {
        this.config.searchForm = document.getElementById('domain-search-form');
        this.config.domainInput = document.getElementById('domain-input');
        this.config.extensionSelect = document.getElementById('domain-extension');
        this.config.resultContainer = document.getElementById('search-result');

        if (!this.config.searchForm) {
            console.warn('Domain search form not found');
            return;
        }

        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents: function() {
        this.config.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Auto-detect extension when user types it
        this.config.domainInput.addEventListener('input', Utils.debounce((e) => {
            this.autoDetectExtension(e.target.value);
        }, 500));

        // Allow Enter key to trigger search
        this.config.domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });
    },

    /**
     * Auto-detect domain extension from user input
     */
    autoDetectExtension: function(value) {
        const ext = Utils.getDomainExtension(value).toLowerCase();
        if (ext && ['.com', '.net', '.org', '.ir'].includes(ext)) {
            this.config.extensionSelect.value = ext;
            // Remove extension from input for cleaner UX
            const name = Utils.getDomainName(value);
            if (name !== value) {
                this.config.domainInput.value = name;
            }
        }
    },

    /**
     * Handle search form submission
     */
    handleSearch: function() {
        if (this.config.isSearching) return;

        const domainName = this.config.domainInput.value.trim();
        const extension = this.config.extensionSelect.value;
        const fullDomain = domainName + extension;

        // Validate input
        if (!domainName) {
            this.showResult('error', 'لطفاً نام دامنه را وارد کنید');
            return;
        }

        if (domainName.length < 3) {
            this.showResult('error', 'نام دامنه باید حداقل ۳ کاراکتر باشد');
            return;
        }

        // Perform search
        this.checkDomain(fullDomain);
    },

    /**
     * Check domain availability via API
     * @param {string} domain 
     */
    checkDomain: async function(domain) {
        this.config.isSearching = true;
        this.showLoading();

        try {
            const response = await fetch(`${this.config.apiUrl}?domain=${encodeURIComponent(domain)}`, {
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
            this.displayResult(data, domain);

        } catch (error) {
            console.error('Domain search error:', error);
            this.showResult('error', 'خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
        } finally {
            this.config.isSearching = false;
        }
    },

    /**
     * Show loading state
     */
    showLoading: function() {
        this.config.resultContainer.classList.remove('hidden', 'success', 'error');
        this.config.resultContainer.classList.add('loading');
        this.config.resultContainer.innerHTML = `
            <div class="spinner"></div>
            <p style="text-align: center; color: var(--gray-600);">در حال بررسی دامنه...</p>
        `;
    },

    /**
     * Display search result
     * @param {Object} data 
     * @param {string} domain 
     */
    displayResult: function(data, domain) {
        this.config.resultContainer.classList.remove('hidden', 'loading');

        if (data.available) {
            this.showAvailable(domain, data.price || this.getPriceForDomain(domain));
        } else if (data.registered) {
            this.showRegistered(domain, data.suggestions || []);
        } else {
            this.showResult('error', data.message || 'وضعیت دامنه نامشخص است');
        }
    },

    /**
     * Show available domain result
     * @param {string} domain 
     * @param {number} price 
     */
    showAvailable: function(domain, price) {
        this.config.resultContainer.classList.add('success');
        this.config.resultContainer.innerHTML = `
            <div class="search-result-title" style="color: var(--success);">
                ✓ ${Utils.sanitizeInput(domain)} آزاد است
            </div>
            <div class="search-result-price">
                ${Utils.formatNumber(price)} تومان
            </div>
            <button class="btn btn-primary btn-block" onclick="addToCart('${domain.split('.')[0]}', ${price})">
                ثبت دامنه
            </button>
        `;
        
        Utils.showNotification('دامنه مورد نظر شما آزاد است!', 'success');
    },

    /**
     * Show registered domain result with suggestions
     * @param {string} domain 
     * @param {Array} suggestions 
     */
    showRegistered: function(domain, suggestions) {
        this.config.resultContainer.classList.add('error');
        
        let suggestionsHtml = '';
        if (suggestions && suggestions.length > 0) {
            suggestionsHtml = `
                <div style="margin-top: 1rem;">
                    <p style="font-weight: bold; margin-bottom: 0.5rem;">پیشنهادهای جایگزین:</p>
                    <ul class="suggestions-list">
                        ${suggestions.map(s => `
                            <li>
                                <span>${Utils.sanitizeInput(s.domain)}</span>
                                <span style="color: var(--success); font-weight: bold;">
                                    ${s.available ? '✓ آزاد' : '✕ ثبت شده'}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        this.config.resultContainer.innerHTML = `
            <div class="search-result-title" style="color: var(--error);">
                ✕ ${Utils.sanitizeInput(domain)} قبلاً ثبت شده است
            </div>
            <p style="color: var(--gray-600);">نگران نباشید! این پسوند‌ها را بررسی کنید:</p>
            ${suggestionsHtml}
        `;
    },

    /**
     * Show generic result message
     * @param {string} type 
     * @param {string} message 
     */
    showResult: function(type, message) {
        this.config.resultContainer.classList.remove('hidden', 'loading', 'success', 'error');
        this.config.resultContainer.classList.add(type);
        this.config.resultContainer.innerHTML = `
            <div class="search-result-title" style="color: var(--${type === 'success' ? 'success' : 'error'});">
                ${type === 'success' ? '✓' : '✕'} ${Utils.sanitizeInput(message)}
            </div>
        `;
    },

    /**
     * Get price for a domain based on extension
     * @param {string} domain 
     * @returns {number}
     */
    getPriceForDomain: function(domain) {
        const ext = Utils.getDomainExtension(domain).toLowerCase().replace('.', '');
        return this.prices[ext] || 2100000; // Default to .com price
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    DomainSearch.init();
});
