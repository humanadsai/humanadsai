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
   * Create and inject small env chips into the header
   */
  function createBanner(config) {
    const profile = config.payment_profile;
    const isTest = profile.is_testnet;

    // Remove existing chips if any
    const existing = document.getElementById('env-banner');
    if (existing) existing.remove();

    // Inject styles if not already present
    if (!document.getElementById('env-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'env-banner-styles';
      style.textContent = `
        /* Env chips in header */
        .env-chips {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .env-chip {
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          padding: 3px 7px;
          border-radius: 3px;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .env-chip-test {
          background: rgba(255, 107, 53, 0.15);
          color: #FF6B35;
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .env-chip-prod {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
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

    // Build chip HTML
    const chipClass = isTest ? 'env-chip-test' : 'env-chip-prod';
    const chainName = profile.chain?.name || 'Sepolia';
    const tokenSymbol = profile.token?.symbol || 'hUSD';

    const chips = document.createElement('div');
    chips.id = 'env-banner';
    chips.className = 'env-chips';

    if (isTest) {
      chips.innerHTML = `<span class="env-chip ${chipClass}">Testnet</span><span class="env-chip ${chipClass}">${chainName} · ${tokenSymbol}</span>`;
    } else {
      chips.innerHTML = `<span class="env-chip ${chipClass}">${chainName}</span>`;
    }

    // Insert chips into the header (before header-right)
    const header = document.querySelector('.header');
    const headerRight = document.querySelector('.header-right');
    if (header && headerRight) {
      header.insertBefore(chips, headerRight);
    } else {
      // Fallback: insert at top of body as a small inline bar
      chips.style.padding = '4px 12px';
      document.body.insertBefore(chips, document.body.firstChild);
    }
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
