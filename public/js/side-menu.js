/**
 * Shared Side Menu Component
 * Provides consistent navigation across all pages
 */

(function() {
  'use strict';

  // Menu configuration - single source of truth
  const MENU_CONFIG = {
    loggedIn: [
      { label: 'My Missions', href: '/missions/my', id: 'menu-my-missions' },
      { label: 'Explore Missions', href: '/missions', id: 'menu-explore' },
      { type: 'divider' },
      { type: 'section', label: 'Settings' },
      { label: 'Payout Wallets', href: '/settings/payout', id: 'menu-payout' },
      { label: 'Account', href: '/account', id: 'menu-account' },
      { type: 'divider' },
      { type: 'section', label: 'Help' },
      { label: 'FAQ', href: '/faq.html', id: 'menu-faq' },
      { label: 'Promoter Guidelines', href: '/guidelines-promoters.html', id: 'menu-guidelines-promoters' },
      { label: 'Advertiser Guidelines', href: '/guidelines-advertisers.html', id: 'menu-guidelines-advertisers' },
      { type: 'divider' },
      { type: 'section', label: 'Legal' },
      { label: 'Terms of Service', href: '/terms.html', id: 'menu-terms' },
      { label: 'Privacy Policy', href: '/privacy.html', id: 'menu-privacy' },
      { type: 'divider' },
      { type: 'section', label: 'Contact' },
      { label: 'Contact', href: '/contact.html', id: 'menu-contact' },
      { type: 'divider' },
      { label: 'Sign out', href: '/auth/logout', id: 'menu-signout', danger: true }
    ],
    // Admin menu items (added dynamically when user is admin)
    admin: [
      { type: 'divider' },
      { type: 'section', label: 'Admin' },
      { label: 'Admin Dashboard', href: '/admin', id: 'menu-admin-dashboard', admin: true },
      { label: 'Advertiser Dashboard', href: '/agent/dashboard', id: 'menu-advertiser-dashboard', admin: true },
      { label: 'Advertiser Test', href: '/advertiser/test', id: 'menu-advertiser-test', admin: true },
      { label: 'Agents', href: '/admin/agents', id: 'menu-admin-agents', admin: true },
      { label: 'Deals', href: '/admin/deals', id: 'menu-admin-deals', admin: true },
      { label: 'Operators', href: '/admin/operators', id: 'menu-admin-operators', admin: true },
      { label: 'Applications', href: '/admin/applications', id: 'menu-admin-applications', admin: true },
      { label: 'Missions', href: '/admin/missions', id: 'menu-admin-missions', admin: true },
      { label: 'Payments', href: '/admin/payments', id: 'menu-admin-payments', admin: true },
      { label: 'Token Ops', href: '/admin/token-ops', id: 'menu-admin-token-ops', admin: true },
      { label: 'Logs', href: '/admin/logs', id: 'menu-admin-logs', admin: true },
      { label: 'Settings', href: '/admin/settings', id: 'menu-admin-settings', admin: true },
    ],
    loggedOut: [
      { label: 'Explore Missions', href: '/missions', id: 'menu-explore' },
      { label: 'Become a Promoter', href: '/auth/x/login', id: 'menu-promoter' },
      { label: 'Are you an AI?', href: '/skill.md', id: 'menu-ai' },
      { type: 'divider' },
      { label: 'FAQ', href: '/faq.html', id: 'menu-faq' },
      { label: 'Promoter Guidelines', href: '/guidelines-promoters.html', id: 'menu-guidelines-promoters' },
      { label: 'Advertiser Guidelines', href: '/guidelines-advertisers.html', id: 'menu-guidelines-advertisers' },
      { type: 'divider' },
      { label: 'Terms of Service', href: '/terms.html', id: 'menu-terms' },
      { label: 'Privacy Policy', href: '/privacy.html', id: 'menu-privacy' },
      { label: 'Contact', href: '/contact.html', id: 'menu-contact' }
    ]
  };

  // Path to menu item mapping for active state
  const PATH_MAPPING = {
    '/missions': 'menu-explore',
    '/missions/index.html': 'menu-explore',
    '/missions/my': 'menu-my-missions',
    '/missions/my.html': 'menu-my-missions',
    '/missions/run.html': 'menu-my-missions',  // Run is part of My Missions flow
    '/missions/detail.html': 'menu-explore',   // Detail is part of Explore flow
    '/settings/payout': 'menu-payout',
    '/settings/payout.html': 'menu-payout',
    '/account': 'menu-account',
    '/account/index.html': 'menu-account',
    '/account/delete': 'menu-account',
    '/faq.html': 'menu-faq',
    '/guidelines-promoters.html': 'menu-guidelines-promoters',
    '/guidelines-advertisers.html': 'menu-guidelines-advertisers',
    '/terms.html': 'menu-terms',
    '/privacy.html': 'menu-privacy',
    '/contact.html': 'menu-contact',
    '/skill.md': 'menu-ai',
    '/ai/how-it-works': 'menu-ai',
    '/ai/how-it-works.html': 'menu-ai',
    '/agent/docs': 'menu-ai',
    '/agent/docs.html': 'menu-ai',
    '/agent/deploy': 'menu-ai',
    '/agent/deploy.html': 'menu-ai',
    '/agent/dashboard': 'menu-advertiser-dashboard',
    '/agent/dashboard.html': 'menu-advertiser-dashboard',
    // Admin paths
    '/admin': 'menu-admin-dashboard',
    '/admin/index.html': 'menu-admin-dashboard',
    '/admin/agents': 'menu-admin-agents',
    '/admin/deals': 'menu-admin-deals',
    '/admin/operators': 'menu-admin-operators',
    '/admin/applications': 'menu-admin-applications',
    '/admin/missions': 'menu-admin-missions',
    '/admin/payments': 'menu-admin-payments',
    '/admin/token-ops': 'menu-admin-token-ops',
    '/admin/logs': 'menu-admin-logs',
    '/admin/settings': 'menu-admin-settings',
    '/advertiser/test': 'menu-advertiser-test',
    '/advertiser/test.html': 'menu-advertiser-test'
  };

  /**
   * Get current active menu item ID based on pathname
   */
  function getActiveMenuId() {
    const path = window.location.pathname;

    // Direct match
    if (PATH_MAPPING[path]) {
      return PATH_MAPPING[path];
    }

    // Partial match for nested paths
    for (const [pattern, menuId] of Object.entries(PATH_MAPPING)) {
      if (path.startsWith(pattern.replace('.html', ''))) {
        return menuId;
      }
    }

    return null;
  }

  /**
   * Generate menu HTML from config
   */
  function generateMenuHTML(items, activeId) {
    return items.map(item => {
      if (item.type === 'divider') {
        return '<div class="menu-divider"></div>';
      }
      if (item.type === 'section') {
        const adminClass = item.label === 'Admin' ? ' admin-section' : '';
        return `<span class="menu-section-label${adminClass}">${item.label}</span>`;
      }

      const isActive = item.id === activeId;
      const classes = ['menu-item'];
      if (isActive) classes.push('active');
      if (item.danger) classes.push('menu-item-danger');
      if (item.admin) classes.push('admin-item');

      return `<a href="${item.href}" class="${classes.join(' ')}" id="${item.id}">${item.label}</a>`;
    }).join('\n      ');
  }

  /**
   * Render the side menu
   * @param {boolean} isLoggedIn - Whether user is logged in
   * @param {boolean} isAdmin - Whether user has admin role
   */
  function renderSideMenu(isLoggedIn, isAdmin = false) {
    const menuContainer = document.getElementById('hamburger-menu');
    if (!menuContainer) return;

    const activeId = getActiveMenuId();
    let menuItems = isLoggedIn ? [...MENU_CONFIG.loggedIn] : MENU_CONFIG.loggedOut;

    // Add admin items if user is admin
    if (isLoggedIn && isAdmin) {
      // Find the index of the sign out item
      const signOutIndex = menuItems.findIndex(item => item.id === 'menu-signout');
      if (signOutIndex !== -1) {
        // Insert admin items before sign out
        menuItems.splice(signOutIndex, 0, ...MENU_CONFIG.admin);
      } else {
        // Append at the end if no sign out found
        menuItems = [...menuItems, ...MENU_CONFIG.admin];
      }
    }

    menuContainer.innerHTML = generateMenuHTML(menuItems, activeId);
  }

  /**
   * Initialize hamburger menu toggle
   */
  function initMenuToggle() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    if (!hamburgerBtn || !hamburgerMenu || !menuOverlay) return;

    hamburgerBtn.addEventListener('click', () => {
      hamburgerMenu.classList.toggle('open');
      menuOverlay.classList.toggle('open');
      hamburgerBtn.classList.toggle('open');
    });

    menuOverlay.addEventListener('click', () => {
      hamburgerMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
      hamburgerBtn.classList.remove('open');
    });
  }

  /**
   * Check if user is logged in via /api/me
   * @returns {Promise<{isLoggedIn: boolean, isAdmin: boolean}>}
   */
  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      const data = await res.json();
      const isLoggedIn = data.success && data.data && data.data.xConnected;
      const isAdmin = isLoggedIn && data.data.user && data.data.user.is_admin === true;
      return { isLoggedIn, isAdmin };
    } catch (e) {
      return { isLoggedIn: false, isAdmin: false };
    }
  }

  /**
   * Initialize side menu
   * @param {boolean|null} isLoggedIn - Pass true/false if known, null to auto-detect
   * @param {boolean|null} isAdmin - Pass true/false if known, null to auto-detect
   */
  async function initSideMenu(isLoggedIn = null, isAdmin = null) {
    // If auth status not provided, or isAdmin not provided, check it
    if (isLoggedIn === null || isAdmin === null) {
      const authStatus = await checkAuthStatus();
      if (isLoggedIn === null) {
        isLoggedIn = authStatus.isLoggedIn;
      }
      if (isAdmin === null) {
        isAdmin = authStatus.isAdmin;
      }
    }

    renderSideMenu(isLoggedIn, isAdmin || false);
    initMenuToggle();
  }

  // Expose to global scope
  window.SideMenu = {
    init: initSideMenu,
    render: renderSideMenu,
    checkAuth: checkAuthStatus,
    initToggle: initMenuToggle  // Allow initializing toggle separately
  };

  // Auto-initialize on DOMContentLoaded if menu exists
  document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('hamburger-menu');
    if (menuContainer && menuContainer.dataset.autoInit !== 'false') {
      // Check for explicit auth state attribute
      const explicitAuth = menuContainer.dataset.loggedIn;
      const explicitAdmin = menuContainer.dataset.admin;
      if (explicitAuth !== undefined) {
        initSideMenu(explicitAuth === 'true', explicitAdmin === 'true');
      }
      // Otherwise auto-detect is handled by individual pages
    }
  });
})();
