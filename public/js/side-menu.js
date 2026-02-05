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
      { label: 'Account', href: '/settings/account/delete', id: 'menu-account' },
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
    loggedOut: [
      { label: 'Explore Missions', href: '/missions', id: 'menu-explore' },
      { label: 'Become a Promoter', href: '/auth/x/login', id: 'menu-promoter' },
      { label: 'Are you an AI?', href: '/ai/how-it-works', id: 'menu-ai' },
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
    '/settings/account/delete': 'menu-account',
    '/faq.html': 'menu-faq',
    '/guidelines-promoters.html': 'menu-guidelines-promoters',
    '/guidelines-advertisers.html': 'menu-guidelines-advertisers',
    '/terms.html': 'menu-terms',
    '/privacy.html': 'menu-privacy',
    '/contact.html': 'menu-contact',
    '/ai/how-it-works': 'menu-ai',
    '/ai/how-it-works.html': 'menu-ai'
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
        return `<span class="menu-section-label">${item.label}</span>`;
      }

      const isActive = item.id === activeId;
      const classes = ['menu-item'];
      if (isActive) classes.push('active');
      if (item.danger) classes.push('menu-item-danger');

      return `<a href="${item.href}" class="${classes.join(' ')}" id="${item.id}">${item.label}</a>`;
    }).join('\n      ');
  }

  /**
   * Render the side menu
   */
  function renderSideMenu(isLoggedIn) {
    const menuContainer = document.getElementById('hamburger-menu');
    if (!menuContainer) return;

    const activeId = getActiveMenuId();
    const menuItems = isLoggedIn ? MENU_CONFIG.loggedIn : MENU_CONFIG.loggedOut;

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
   */
  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      const data = await res.json();
      return data.success && data.data && data.data.xConnected;
    } catch (e) {
      return false;
    }
  }

  /**
   * Initialize side menu
   * @param {boolean|null} isLoggedIn - Pass true/false if known, null to auto-detect
   */
  async function initSideMenu(isLoggedIn = null) {
    // If auth status not provided, check it
    if (isLoggedIn === null) {
      isLoggedIn = await checkAuthStatus();
    }

    renderSideMenu(isLoggedIn);
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
      if (explicitAuth !== undefined) {
        initSideMenu(explicitAuth === 'true');
      }
      // Otherwise auto-detect is handled by individual pages
    }
  });
})();
