/**
 * Global Wallet Alert Banner (Minimal Version)
 * Shows thin persistent alert when user has pending rewards but no wallet registered
 * Design: Non-intrusive, collapsed by default, doesn't block navigation
 */

(function() {
  'use strict';

  let alertData = null;
  let isInitialized = false;
  let isExpanded = false;

  /**
   * Fetch pending rewards and wallet status
   */
  async function fetchPendingRewards() {
    try {
      const response = await fetch('/api/me/pending-rewards', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (e) {
      console.error('Failed to fetch pending rewards:', e);
      return null;
    }
  }

  /**
   * Format currency
   */
  function formatCurrency(cents) {
    const value = (cents / 100).toFixed(2);
    if (window.EnvBanner && window.EnvBanner.isTestnet()) {
      return value + ' hUSD';
    }
    return '$' + value;
  }

  /**
   * Toggle expanded state
   */
  function toggleExpand() {
    isExpanded = !isExpanded;
    const banner = document.getElementById('wallet-alert-banner');
    if (banner) {
      banner.classList.toggle('expanded', isExpanded);
    }
  }

  /**
   * Create and inject the alert banner
   */
  function renderAlertBanner(data) {
    // Remove existing banner if any
    const existing = document.getElementById('wallet-alert-banner');
    if (existing) {
      existing.remove();
    }

    // Remove body class
    document.body.classList.remove('has-wallet-alert');

    if (!data || !data.should_show_alert) {
      return;
    }

    const totalAmount = formatCurrency(data.pending_total_cents);
    const count = data.pending_count;

    // Create banner HTML
    const banner = document.createElement('div');
    banner.id = 'wallet-alert-banner';
    banner.className = 'wallet-alert-banner';

    const expandedText = count > 1
      ? `AI review in progress for ${count} missions (${totalAmount}). Payout can't be sent without your wallet address.`
      : `AI review in progress for 1 mission (${totalAmount}). Payout can't be sent without your wallet address.`;

    banner.innerHTML = `
      <div class="wallet-alert-collapsed" onclick="window.WalletAlert.toggle()">
        <span class="wallet-alert-icon">⚠️</span>
        <span class="wallet-alert-text">Reward pending (${totalAmount}) — wallet required</span>
        <span class="wallet-alert-expand-hint">▼</span>
      </div>
      <div class="wallet-alert-expanded">
        <div class="wallet-alert-detail">${expandedText}</div>
        <div class="wallet-alert-collapse" onclick="window.WalletAlert.toggle()">▲ Collapse</div>
      </div>
      <a href="/settings/payout?from=alert&next=${encodeURIComponent(window.location.pathname)}" class="wallet-alert-btn" onclick="event.stopPropagation()">
        Set wallet
      </a>
    `;

    // Inject styles if not already present
    if (!document.getElementById('wallet-alert-styles')) {
      const styles = document.createElement('style');
      styles.id = 'wallet-alert-styles';
      styles.textContent = `
        .wallet-alert-banner {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: #dc2626;
          color: white;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .wallet-alert-collapsed {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          gap: 8px;
          cursor: pointer;
          min-height: 44px;
          box-sizing: border-box;
        }
        .wallet-alert-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .wallet-alert-text {
          flex: 1;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wallet-alert-expand-hint {
          font-size: 10px;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .wallet-alert-banner.expanded .wallet-alert-expand-hint {
          display: none;
        }
        .wallet-alert-expanded {
          display: none;
          padding: 0 12px 10px 36px;
          font-size: 0.75rem;
          opacity: 0.9;
        }
        .wallet-alert-banner.expanded .wallet-alert-expanded {
          display: block;
        }
        .wallet-alert-detail {
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .wallet-alert-collapse {
          font-size: 0.7rem;
          opacity: 0.7;
          cursor: pointer;
        }
        .wallet-alert-collapse:hover {
          opacity: 1;
        }
        .wallet-alert-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          color: #dc2626;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          text-decoration: none;
          white-space: nowrap;
        }
        .wallet-alert-banner.expanded .wallet-alert-btn {
          top: 22px;
          transform: none;
        }
        .wallet-alert-btn:hover {
          background: #f3f3f3;
        }
        /* Adjust for banner - minimal padding */
        body.has-wallet-alert {
          padding-top: 0;
        }
        body.has-wallet-alert .header {
          position: relative;
        }
        /* Mobile adjustments */
        @media (max-width: 480px) {
          .wallet-alert-text {
            font-size: 0.75rem;
          }
          .wallet-alert-btn {
            padding: 5px 10px;
            font-size: 0.7rem;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Insert after header (not before body content)
    const header = document.querySelector('.header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
      // Fallback: insert at top of body
      document.body.insertBefore(banner, document.body.firstChild);
    }

    document.body.classList.add('has-wallet-alert');
    alertData = data;
  }

  /**
   * Initialize the wallet alert
   */
  async function init() {
    if (isInitialized) return;
    isInitialized = true;

    const data = await fetchPendingRewards();
    renderAlertBanner(data);
  }

  /**
   * Refresh the alert (call after wallet is updated)
   */
  async function refresh() {
    const data = await fetchPendingRewards();
    renderAlertBanner(data);
  }

  /**
   * Get current alert data
   */
  function getData() {
    return alertData;
  }

  // Expose to global scope
  window.WalletAlert = {
    init,
    refresh,
    getData,
    toggle: toggleExpand,
  };

  // Auto-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize for logged-in pages
    const requiresAlert = [
      '/missions',
      '/settings',
      '/dashboard',
    ];

    const currentPath = window.location.pathname;
    const shouldInit = requiresAlert.some(path => currentPath.startsWith(path));

    if (shouldInit) {
      init();
    }
  });
})();
