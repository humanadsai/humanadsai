/**
 * Notification Bell + Dropdown Component
 *
 * Shows a bell icon with red unread badge in the header.
 * Clicking opens a dropdown with recent notifications.
 * Polls /api/notifications/count every 60s for badge updates.
 */

(function () {
  'use strict';

  let pollInterval = null;
  let isDropdownOpen = false;

  // Notification type → icon mapping
  const TYPE_ICONS = {
    application_shortlisted: '📋',
    application_selected: '🎉',
    application_rejected: '❌',
    application_cancelled_advertiser_deleted: '🚫',
    submission_verified: '✅',
    submission_rejected: '🔄',
    submission_approved: '👍',
    payout_auf_paid: '⏳',
    payout_confirmed: '💸',
    payout_partial: '💱',
    payout_overdue: '⚠️',
    deal_hidden: '🔒',
    deal_expired: '⏰',
    new_mission_available: '🆕',
    review_received: '⭐',
    reviews_published: '📣',
  };

  // Notification type → navigation URL
  function getNotificationUrl(notification) {
    if (notification.reference_type === 'mission' && notification.reference_id) {
      return '/missions/my';
    }
    if (notification.reference_type === 'application' && notification.reference_id) {
      return '/missions/my';
    }
    if (notification.reference_type === 'deal' && notification.reference_id) {
      var meta = notification.metadata;
      if (meta && meta.deal_id) {
        return '/missions/detail?id=' + encodeURIComponent(meta.deal_id);
      }
      return '/missions/detail?id=' + encodeURIComponent(notification.reference_id);
    }
    return '/missions/my';
  }

  function timeAgo(dateStr) {
    var now = new Date();
    var s = String(dateStr);
    if (!s.endsWith('Z') && !/Z$|[+-]\d{2}(?::?\d{2})?$/.test(s)) s = s.replace(' ', 'T') + 'Z';
    var date = new Date(s);
    var seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'a few seconds ago';
    var minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return minutes + ' minutes ago';
    var hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return hours + ' hours ago';
    var days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    return date.toLocaleDateString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Create and inject the bell icon into the header
   */
  function injectBellIcon() {
    var headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // Don't inject twice
    if (document.getElementById('notification-bell-container')) return;

    var container = document.createElement('div');
    container.id = 'notification-bell-container';
    container.className = 'notification-bell-container';
    container.innerHTML =
      '<button class="notification-bell" id="notification-bell" aria-label="Notifications">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
      '</svg>' +
      '<span class="notification-badge" id="notification-badge" style="display:none;">0</span>' +
      '</button>' +
      '<div class="notification-dropdown" id="notification-dropdown">' +
      '<div class="notification-dropdown-header">' +
      '<span class="notification-dropdown-title">Notifications</span>' +
      '<button class="notification-mark-all-read" id="notification-mark-all-read">Mark all read</button>' +
      '</div>' +
      '<div class="notification-list" id="notification-list">' +
      '<div class="notification-empty">No notifications</div>' +
      '</div>' +
      '</div>';

    // Insert before hamburger button
    var hamburgerBtn = headerRight.querySelector('.hamburger-btn');
    if (hamburgerBtn) {
      headerRight.insertBefore(container, hamburgerBtn);
    } else {
      headerRight.appendChild(container);
    }

    // Event listeners
    document.getElementById('notification-bell').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    document.getElementById('notification-mark-all-read').addEventListener('click', function (e) {
      e.stopPropagation();
      markAllRead();
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (isDropdownOpen && !container.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  function toggleDropdown() {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    var dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    dropdown.classList.add('open');
    isDropdownOpen = true;
    loadNotifications();
  }

  function closeDropdown() {
    var dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    dropdown.classList.remove('open');
    isDropdownOpen = false;
  }

  /**
   * Fetch and display notifications in the dropdown
   */
  async function loadNotifications() {
    var list = document.getElementById('notification-list');
    if (!list) return;

    list.innerHTML = '<div class="notification-loading">Loading...</div>';

    try {
      var res = await fetch('/api/notifications?limit=20', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      var data = await res.json();

      if (!data.success || !data.data || !data.data.notifications || data.data.notifications.length === 0) {
        list.innerHTML = '<div class="notification-empty">No notifications yet</div>';
        return;
      }

      var html = '';
      data.data.notifications.forEach(function (n) {
        var icon = TYPE_ICONS[n.type] || '🔔';
        var unreadClass = n.is_read ? '' : ' unread';
        var url = getNotificationUrl(n);
        html +=
          '<a class="notification-item' + unreadClass + '" data-id="' + escapeHtml(n.id) + '" href="' + escapeHtml(url) + '">' +
          '<span class="notification-icon">' + icon + '</span>' +
          '<div class="notification-content">' +
          '<div class="notification-title">' + escapeHtml(n.title) + '</div>' +
          '<div class="notification-body">' + escapeHtml(n.body || '') + '</div>' +
          '<div class="notification-time">' + timeAgo(n.created_at) + '</div>' +
          '</div>' +
          (n.is_read ? '' : '<span class="notification-unread-dot"></span>') +
          '</a>';
      });

      list.innerHTML = html;

      // Click handler for individual notifications
      list.querySelectorAll('.notification-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          var id = item.getAttribute('data-id');
          if (id && item.classList.contains('unread')) {
            markRead(id);
          }
        });
      });
    } catch (err) {
      console.error('Load notifications error:', err);
      list.innerHTML = '<div class="notification-empty">Failed to load notifications</div>';
    }
  }

  /**
   * Fetch unread count and update badge
   */
  async function updateBadge() {
    try {
      var res = await fetch('/api/notifications/count', { credentials: 'include' });
      if (!res.ok) return;
      var data = await res.json();
      if (!data.success) return;

      var badge = document.getElementById('notification-badge');
      if (!badge) return;

      var count = data.data.unread || 0;
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    } catch (err) {
      // Silently ignore polling errors
    }
  }

  /**
   * Mark a single notification as read
   */
  async function markRead(id) {
    try {
      await fetch('/api/notifications/' + id + '/read', {
        method: 'POST',
        credentials: 'include',
      });
      updateBadge();
    } catch (err) {
      // ignore
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllRead() {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      });
      // Update UI immediately
      var badge = document.getElementById('notification-badge');
      if (badge) badge.style.display = 'none';
      var items = document.querySelectorAll('.notification-item.unread');
      items.forEach(function (item) {
        item.classList.remove('unread');
        var dot = item.querySelector('.notification-unread-dot');
        if (dot) dot.remove();
      });
    } catch (err) {
      // ignore
    }
  }

  /**
   * Start polling for unread count
   */
  function startPolling() {
    updateBadge();
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(updateBadge, 60000);
  }

  /**
   * Initialize notifications for authenticated users
   */
  function init() {
    injectBellIcon();
    startPolling();
  }

  /**
   * Destroy and clean up
   */
  function destroy() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    var container = document.getElementById('notification-bell-container');
    if (container) container.remove();
  }

  // Expose to global scope
  window.Notifications = {
    init: init,
    destroy: destroy,
    updateBadge: updateBadge,
  };
})();
