/**
 * HumanAds Global Utility Library
 * Provides shared functions for all frontend pages
 */

(function() {
  'use strict';

  const HumanAds = {
    // ============================================
    // API Helpers
    // ============================================

    /**
     * Fetch API wrapper with credentials and JSON handling
     * @param {string} url - API endpoint (relative to /api)
     * @param {object} options - Fetch options
     * @returns {Promise<object>} - Parsed JSON response
     */
    async fetchApi(url, options = {}) {
      const fullUrl = url.startsWith('/api') ? url : `/api${url}`;

      const defaultOptions = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const response = await fetch(fullUrl, { ...defaultOptions, ...options });
      const data = await response.json();

      return data;
    },

    // ============================================
    // Data Loading
    // ============================================

    /**
     * Load available missions for the explore page
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object>}
     */
    async loadAvailableMissions(limit = 20, offset = 0) {
      const res = await this.fetchApi(`/missions/available?limit=${limit}&offset=${offset}`);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to load missions');
      }
      return res.data;
    },

    /**
     * Load user's missions
     * @param {string|null} status - Filter by status
     * @returns {Promise<object>}
     */
    async loadMyMissions(status = null) {
      let url = '/missions/my';
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      const res = await this.fetchApi(url);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to load missions');
      }
      return res.data;
    },

    /**
     * Load user's applications
     * @param {string|null} status - Filter by status
     * @returns {Promise<object>}
     */
    async loadMyApplications(status = null) {
      let url = '/my/applications';
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      const res = await this.fetchApi(url);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to load applications');
      }
      return res.data;
    },

    // ============================================
    // Mission Actions
    // ============================================

    /**
     * Submit a mission
     * @param {string} missionId
     * @param {string} submissionUrl
     * @param {string} submissionContent
     * @returns {Promise<object>}
     */
    async submitMission(missionId, submissionUrl, submissionContent = '') {
      const res = await this.fetchApi('/missions/submit', {
        method: 'POST',
        body: JSON.stringify({
          mission_id: missionId,
          submission_url: submissionUrl,
          submission_content: submissionContent,
        }),
      });
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to submit mission');
      }
      return res.data;
    },

    /**
     * Apply for a mission
     * @param {string} dealId
     * @param {object} formData
     * @returns {Promise<object>}
     */
    async applyForMission(dealId, formData) {
      const res = await this.fetchApi(`/missions/${dealId}/apply`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to apply for mission');
      }
      return res.data;
    },

    /**
     * Withdraw an application
     * @param {string} applicationId
     * @returns {Promise<object>}
     */
    async withdrawApplication(applicationId) {
      const res = await this.fetchApi(`/applications/${applicationId}/withdraw`, {
        method: 'POST',
      });
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to withdraw application');
      }
      return res.data;
    },

    // ============================================
    // Authentication
    // ============================================

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
      // Check for session cookie existence (basic check)
      return document.cookie.includes('session=');
    },

    // ============================================
    // UI Helpers
    // ============================================

    /**
     * Format cents to currency string
     * @param {number} cents
     * @returns {string}
     */
    formatCurrency(cents) {
      if (typeof cents !== 'number' || isNaN(cents)) {
        return '$0.00';
      }
      return '$' + (cents / 100).toFixed(2);
    },

    /**
     * Show alert/toast message
     * @param {string} message
     * @param {string} type - 'success' | 'error' | 'info'
     */
    showAlert(message, type = 'success') {
      // Remove existing alerts
      const existing = document.querySelectorAll('.humanads-alert');
      existing.forEach(el => el.remove());

      // Create alert element
      const alert = document.createElement('div');
      alert.className = `humanads-alert humanads-alert--${type}`;
      alert.innerHTML = `
        <span class="humanads-alert__message">${this.escapeHtml(message)}</span>
        <button class="humanads-alert__close" onclick="this.parentElement.remove()">&times;</button>
      `;

      // Add styles if not already added
      if (!document.getElementById('humanads-alert-styles')) {
        const style = document.createElement('style');
        style.id = 'humanads-alert-styles';
        style.textContent = `
          .humanads-alert {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 40px 12px 16px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-family: var(--font-mono, monospace);
            max-width: 90%;
            animation: humanads-alert-in 0.3s ease;
          }
          @keyframes humanads-alert-in {
            from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          .humanads-alert--success {
            background: rgba(52, 199, 89, 0.95);
            color: white;
          }
          .humanads-alert--error {
            background: rgba(255, 59, 48, 0.95);
            color: white;
          }
          .humanads-alert--info {
            background: rgba(255, 149, 0, 0.95);
            color: white;
          }
          .humanads-alert__close {
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: inherit;
            font-size: 1.25rem;
            cursor: pointer;
            opacity: 0.7;
            padding: 4px 8px;
          }
          .humanads-alert__close:hover {
            opacity: 1;
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(alert);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (alert.parentElement) {
          alert.style.animation = 'humanads-alert-in 0.3s ease reverse';
          setTimeout(() => alert.remove(), 300);
        }
      }, 5000);
    },

    /**
     * Set button loading state
     * @param {HTMLButtonElement} btn
     * @param {boolean} loading
     */
    setButtonLoading(btn, loading) {
      if (!btn) return;

      if (loading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="btn-spinner"></span> Loading...`;

        // Add spinner styles if not present
        if (!document.getElementById('humanads-spinner-styles')) {
          const style = document.createElement('style');
          style.id = 'humanads-spinner-styles';
          style.textContent = `
            .btn-spinner {
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 2px solid transparent;
              border-top-color: currentColor;
              border-radius: 50%;
              animation: btn-spin 0.8s linear infinite;
              vertical-align: middle;
              margin-right: 6px;
            }
            @keyframes btn-spin {
              to { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        btn.disabled = false;
        if (btn.dataset.originalText) {
          btn.innerHTML = btn.dataset.originalText;
          delete btn.dataset.originalText;
        }
      }
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Format date for display
     * @param {string|number} date
     * @returns {string}
     */
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(typeof date === 'number' ? date : date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {string|number} date
     * @returns {string}
     */
    formatRelativeTime(date) {
      if (!date) return 'N/A';
      const d = new Date(typeof date === 'number' ? date : date);
      const now = new Date();
      const diffMs = now - d;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return this.formatDate(date);
    },

    /**
     * Copy text to clipboard
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          return true;
        } catch (err) {
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
    },
  };

  // Expose to global scope
  window.HumanAds = HumanAds;
})();
