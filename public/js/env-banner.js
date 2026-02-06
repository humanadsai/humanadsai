/**
 * Environment Banner Component
 * Shows current payment profile (TEST/PROD) at the top of all pages
 * Auto-initializes on DOMContentLoaded
 */

(function() {
  'use strict';

  // Cache config for 30 seconds
  let cachedConfig = null;
  let cacheTime = 0;
  const CACHE_TTL = 30000;

  /**
   * Fetch current payment profile config
   */
  async function fetchConfig() {
    const now = Date.now();
    if (cachedConfig && (now - cacheTime) < CACHE_TTL) {
      return cachedConfig;
    }

    try {
      const res = await fetch('/api/config', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        cachedConfig = data.data;
        cacheTime = now;
        return cachedConfig;
      }
    } catch (e) {
      console.error('EnvBanner: Failed to fetch config', e);
    }

    // Default to test mode if fetch fails
    return {
      payment_profile: {
        id: 'TEST_SEPOLIA_HUSD',
        is_testnet: true,
        chain: { name: 'Sepolia', id: 11155111 },
        token: { symbol: 'hUSD', decimals: 6 },
        ui: {
          bannerColor: '#FF6B35',
          bannerText: 'TEST MODE • Sepolia • hUSD ONLY',
          badgeClass: 'env-test',
        },
      },
    };
  }

  /**
   * Create and inject the environment banner
   */
  function createBanner(config) {
    const profile = config.payment_profile;
    const isTest = profile.is_testnet;

    // Remove existing banner if any
    const existing = document.getElementById('env-banner');
    if (existing) existing.remove();

    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'env-banner';
    banner.className = `env-banner ${isTest ? 'env-banner-test' : 'env-banner-prod'}`;

    const warningIcon = isTest ? '<svg class="env-banner-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>' : '';

    banner.innerHTML = `
      <div class="env-banner-content">
        ${warningIcon}
        <span class="env-banner-dot"></span>
        <span class="env-banner-text">${profile.ui?.bannerText || (isTest ? 'TEST MODE' : 'PRODUCTION')}</span>
        ${isTest ? '<span class="env-banner-chip">TESTNET</span>' : ''}
      </div>
    `;

    // Inject styles if not already present
    if (!document.getElementById('env-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'env-banner-styles';
      style.textContent = `
        .env-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          padding: 8px 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .env-banner-test {
          background: repeating-linear-gradient(
            -45deg,
            #FF6B35,
            #FF6B35 10px,
            #ff8c5a 10px,
            #ff8c5a 20px
          );
          color: #000;
          animation: env-scroll 20s linear infinite;
          background-size: 200% 100%;
        }

        @keyframes env-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 200% 0; }
        }

        .env-banner-prod {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          color: #fff;
        }

        .env-banner-content {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.15);
          padding: 4px 16px;
          border-radius: 4px;
        }

        .env-banner-icon {
          width: 16px;
          height: 16px;
        }

        .env-banner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: env-pulse 1s infinite;
        }

        @keyframes env-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .env-banner-chip {
          background: rgba(0,0,0,0.3);
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }

        /* Offset body to account for banner */
        body.has-env-banner {
          padding-top: 36px;
        }

        body.has-env-banner .header {
          top: 36px;
        }

        body.has-env-banner .hamburger-menu {
          top: calc(60px + 36px);
        }

        /* Chain/Token badge for inline use */
        .env-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 4px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
        }

        .env-badge-test {
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
          border: 1px solid rgba(255, 107, 53, 0.4);
        }

        .env-badge-prod {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        /* hUSD amount styling */
        .husd-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
        }

        .husd-amount.test-token {
          color: #FF6B35;
        }

        .husd-amount .token-symbol {
          font-size: 0.85em;
          opacity: 0.8;
          margin-right: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    // Insert banner at the very top of body
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('has-env-banner');
  }

  /**
   * Create a small badge showing chain/token
   */
  function createBadge(config) {
    const profile = config.payment_profile;
    const isTest = profile.is_testnet;

    const badge = document.createElement('span');
    badge.className = `env-badge ${isTest ? 'env-badge-test' : 'env-badge-prod'}`;
    badge.innerHTML = `<span style="opacity:0.7">${profile.chain?.name || 'Sepolia'}</span> • <strong>${profile.token?.symbol || 'hUSD'}</strong>`;

    return badge;
  }

  /**
   * Initialize environment banner
   * @param {Object} options
   * @param {boolean} options.showBanner - Show the top banner (default: true)
   * @param {string} options.badgeContainer - Selector for badge container (optional)
   */
  async function init(options = {}) {
    const { showBanner = true, badgeContainer = null } = options;

    const config = await fetchConfig();

    if (showBanner) {
      createBanner(config);
    }

    if (badgeContainer) {
      const container = document.querySelector(badgeContainer);
      if (container) {
        container.appendChild(createBadge(config));
      }
    }

    return config;
  }

  /**
   * Get current config (cached)
   */
  function getConfig() {
    return cachedConfig;
  }

  /**
   * Check if current profile is testnet
   */
  function isTestnet() {
    return cachedConfig?.payment_profile?.is_testnet !== false;
  }

  /**
   * Get token symbol (hUSD for test, USDC for prod)
   */
  function getTokenSymbol() {
    return cachedConfig?.payment_profile?.token?.symbol || 'hUSD';
  }

  /**
   * Format amount with current token symbol
   * Returns HTML with proper styling
   */
  function formatAmount(cents, options = {}) {
    const c = cachedConfig;
    const symbol = c?.payment_profile?.token?.symbol || 'hUSD';
    const isTest = c?.payment_profile?.is_testnet !== false;
    const dollars = (cents / 100).toFixed(2);

    if (options.html !== false) {
      const testClass = isTest ? ' test-token' : '';
      return `<span class="husd-amount${testClass}"><span class="token-symbol">${symbol}</span>${dollars}</span>`;
    }

    return `${symbol} ${dollars}`;
  }

  /**
   * Format amount as plain text
   */
  function formatAmountText(cents) {
    return formatAmount(cents, { html: false });
  }

  // Expose to global scope
  window.EnvBanner = {
    init,
    getConfig,
    isTestnet,
    getTokenSymbol,
    formatAmount,
    formatAmountText,
    createBadge,
    fetchConfig,
  };

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    // DOM already loaded
    init();
  }
})();
