/**
 * Host Baran - Utility Functions
 * Helper functions for formatting, validation, etc.
 */

const Utils = {
    /**
     * Format number with Persian commas (e.g., 2100000 -> 2,100,000)
     * @param {number} num 
     * @returns {string}
     */
    formatNumber: function(num) {
        if (num === null || num === undefined) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Validate domain name format
     * @param {string} domain 
     * @returns {boolean}
     */
    isValidDomain: function(domain) {
        if (!domain || typeof domain !== 'string') return false;
        
        // Remove whitespace and convert to lowercase
        domain = domain.trim().toLowerCase();
        
        // Basic domain regex (allows common TLDs)
        const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i;
        
        return domainRegex.test(domain);
    },

    /**
     * Extract domain name without extension
     * @param {string} domain 
     * @returns {string}
     */
    getDomainName: function(domain) {
        if (!domain) return '';
        const parts = domain.split('.');
        if (parts.length > 1) {
            return parts.slice(0, -1).join('.');
        }
        return parts[0];
    },

    /**
     * Get domain extension
     * @param {string} domain 
     * @returns {string}
     */
    getDomainExtension: function(domain) {
        if (!domain) return '';
        const parts = domain.split('.');
        if (parts.length > 1) {
            return '.' + parts[parts.length - 1];
        }
        return '';
    },

    /**
     * Sanitize input to prevent XSS
     * @param {string} str 
     * @returns {string}
     */
    sanitizeInput: function(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.trim();
    },

    /**
     * Debounce function to limit API calls
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Show notification toast
     * @param {string} message 
     * @param {string} type (success, error, info)
     */
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Format date to Persian format
     * @param {Date|string} date 
     * @returns {string}
     */
    formatDate: function(date) {
        if (!date) return '--';
        const d = new Date(date);
        return d.toLocaleDateString('fa-IR');
    },

    /**
     * Calculate price difference percentage
     * @param {number} price1 
     * @param {number} price2 
     * @returns {number}
     */
    calculatePriceDiff: function(price1, price2) {
        if (!price1 || !price2) return 0;
        return Math.round(((price2 - price1) / price1) * 100);
    }
};

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);
