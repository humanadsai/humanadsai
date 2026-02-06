/**
 * Environment Banner Component
 * Shows current payment profile (TEST/PROD) at the top of all pages
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
        chain: { name: 'Sepolia' },
        token: { symbol: 'hUSD' },
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

    banner.innerHTML = `
      <div class="env-banner-content">
        <span class="env-banner-dot"></span>
        <span class="env-banner-text">${profile.ui.bannerText}</span>
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
          padding: 6px 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .env-banner-test {
          background: repeating-linear-gradient(
            45deg,
            #FF6B35,
            #FF6B35 10px,
            #e55a2b 10px,
            #e55a2b 20px
          );
          color: #000;
        }

        .env-banner-prod {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          color: #fff;
        }

        .env-banner-content {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .env-banner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: env-pulse 2s infinite;
        }

        @keyframes env-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Offset body to account for banner */
        body.has-env-banner {
          padding-top: 28px;
        }

        body.has-env-banner .header {
          top: 28px;
        }

        body.has-env-banner .hamburger-menu {
          top: calc(60px + 28px);
        }

        /* Chain/Token badge for headers */
        .env-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
        }

        .env-badge-test {
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .env-badge-prod {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
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
    badge.textContent = `${profile.chain.name} • ${profile.token.symbol}`;

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
   * Format amount with current token symbol
   */
  function formatAmount(cents, config = null) {
    const c = config || cachedConfig;
    if (!c) return `$${(cents / 100).toFixed(2)}`;

    const symbol = c.payment_profile.token.symbol;
    return `${symbol} ${(cents / 100).toFixed(2)}`;
  }

  // Expose to global scope
  window.EnvBanner = {
    init,
    getConfig,
    formatAmount,
    createBadge,
    fetchConfig,
  };
})();
