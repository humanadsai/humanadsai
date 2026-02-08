/**
 * HumanAds - Frontend Application
 */

const API_BASE = '/api';

// ============================================
// Utility Functions
// ============================================

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth header if session token exists in localStorage (legacy)
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session auth
  });

  const data = await response.json();

  if (!response.ok) {
    // Create error with detailed information
    const errorMessage = data.error?.message || 'Request failed';
    const error = new Error(errorMessage);
    error.code = data.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    error.requestId = data.request_id;
    error.details = data.error?.details;
    throw error;
  }

  return data;
}

function formatCurrency(cents) {
  const value = (cents / 100).toFixed(2);
  if (window.EnvBanner && window.EnvBanner.isTestnet()) {
    return '$' + value + ' hUSD';
  }
  return '$' + value;
}

function formatCurrencyHtml(cents) {
  if (typeof cents !== 'number' || isNaN(cents)) cents = 0;
  const value = (cents / 100).toFixed(2);
  if (window.EnvBanner && window.EnvBanner.isTestnet()) {
    return '$' + value + '<span class="husd-suffix">hUSD</span>';
  }
  return '$' + value;
}

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function formatFollowerCount(count) {
  if (count === null || count === undefined || count === 0) {
    return null;
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(2) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(typeof date === 'number' ? date : date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeTime(date) {
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
  return formatDate(date);
}

function formatMonthYear(date) {
  if (!date) return 'N/A';
  const d = new Date(typeof date === 'number' ? date : date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

// ============================================
// Stats Loading
// ============================================

async function loadStats() {
  try {
    const data = await fetchApi('/stats');

    const campaignsEl = document.getElementById('campaigns-count');
    const operatorsEl = document.getElementById('operators-count');

    if (campaignsEl && data.data) {
      campaignsEl.textContent = formatNumber(data.data.ai_registered_campaigns || 0);
    }
    if (operatorsEl && data.data) {
      operatorsEl.textContent = formatNumber(data.data.human_operators || 0);
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// ============================================
// Authentication (X OAuth only)
// ============================================

// Note: Operator registration is now handled via X OAuth at /auth/x/login
// The old manual registration and bio verification methods have been removed

// ============================================
// Missions
// ============================================

async function loadAvailableMissions(limit = 20, offset = 0, agentId = null) {
  let url = `/missions/available?limit=${limit}&offset=${offset}`;
  if (agentId) url += `&agent_id=${encodeURIComponent(agentId)}`;
  const data = await fetchApi(url);
  return data.data;
}

async function loadMyMissions(status = null) {
  let url = '/missions/my';
  if (status) {
    url += `?status=${status}`;
  }
  const data = await fetchApi(url);
  return data.data;
}

async function acceptMission(dealId) {
  const data = await fetchApi('/missions/accept', {
    method: 'POST',
    body: JSON.stringify({ deal_id: dealId }),
  });
  return data.data;
}

async function submitMission(missionId, submissionUrl, submissionContent = null) {
  const data = await fetchApi('/missions/submit', {
    method: 'POST',
    body: JSON.stringify({
      mission_id: missionId,
      submission_url: submissionUrl,
      submission_content: submissionContent,
    }),
  });
  return data.data;
}

// ============================================
// Applications (Apply → AI Selection Model)
// ============================================

async function applyForMission(dealId, formData) {
  const data = await fetchApi(`/missions/${dealId}/apply`, {
    method: 'POST',
    body: JSON.stringify({
      proposed_angle: formData.proposed_angle || null,
      estimated_post_time_window: formData.estimated_post_time_window || null,
      draft_copy: formData.draft_copy || null,
      accept_disclosure: formData.accept_disclosure || false,
      accept_no_engagement_buying: formData.accept_no_engagement_buying || false,
      language: formData.language || null,
      audience_fit: formData.audience_fit || null,
      portfolio_links: formData.portfolio_links || null,
    }),
  });
  return data.data;
}

async function loadMyApplications(status = null) {
  let url = '/my/applications';
  if (status) {
    url += `?status=${status}`;
  }
  const data = await fetchApi(url);
  return data.data;
}

async function getApplicationDetails(applicationId) {
  const data = await fetchApi(`/applications/${applicationId}`);
  return data.data;
}

async function cancelApplication(applicationId) {
  const data = await fetchApi(`/applications/${applicationId}/cancel`, {
    method: 'POST',
  });
  return data.data;
}

// ============================================
// Session Management
// ============================================

function isLoggedIn() {
  return !!localStorage.getItem('session_token');
}

function saveSession(token, expiresAt) {
  localStorage.setItem('session_token', token);
  localStorage.setItem('session_expires_at', expiresAt);
}

function clearSession() {
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_expires_at');
}

function checkSessionExpiry() {
  const expiresAt = localStorage.getItem('session_expires_at');
  if (expiresAt && new Date(expiresAt) < new Date()) {
    clearSession();
    return false;
  }
  return isLoggedIn();
}

// ============================================
// UI Helpers
// ============================================

function showAlert(message, type = 'success') {
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.textContent = message;
  alertEl.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;min-width:200px;max-width:90vw;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s ease;font-size:0.8rem;padding:10px 20px;border-radius:8px;';

  document.body.appendChild(alertEl);

  setTimeout(() => {
    alertEl.style.opacity = '0';
    setTimeout(() => alertEl.remove(), 300);
  }, 5000);
}

function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    button.prepend(spinner);
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    const spinner = button.querySelector('.spinner');
    if (spinner) spinner.remove();
  }
}

// ============================================
// Page Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Load stats on homepage
  if (document.getElementById('campaigns-count')) {
    loadStats();
  }

  // Check session on protected pages
  checkSessionExpiry();
});

// ============================================
// Review & Reputation API
// ============================================

async function submitReview(missionId, data) {
  return fetchApi(`/api/missions/${missionId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function getMissionReviews(missionId) {
  return fetchApi(`/api/missions/${missionId}/reviews`);
}

async function getReputation(type, id) {
  // type: 'operators' or 'ai-advertisers'
  return fetchApi(`/api/${type}/${id}/reputation`);
}

async function reportReview(reviewId, reason) {
  return fetchApi(`/api/reviews/${reviewId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// Star rating HTML helper
function renderStars(rating, size = 'sm') {
  const sizeClass = size === 'lg' ? 'star-lg' : '';
  let html = `<span class="stars ${sizeClass}">`;
  for (let i = 1; i <= 5; i++) {
    html += i <= rating
      ? '<span class="star filled">&#9733;</span>'
      : '<span class="star empty">&#9734;</span>';
  }
  html += '</span>';
  return html;
}

// Export for use in other pages
window.HumanAds = {
  fetchApi,
  formatCurrency,
  formatCurrencyHtml,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatMonthYear,
  loadAvailableMissions,
  loadMyMissions,
  acceptMission,
  submitMission,
  applyForMission,
  loadMyApplications,
  getApplicationDetails,
  cancelApplication,
  isLoggedIn,
  saveSession,
  clearSession,
  showAlert,
  setButtonLoading,
  submitReview,
  getMissionReviews,
  getReputation,
  reportReview,
  renderStars,
};
