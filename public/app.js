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

  // Add auth header if session token exists
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
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
// Operator Registration
// ============================================

async function registerOperator(xHandle) {
  const data = await fetchApi('/operator/register', {
    method: 'POST',
    body: JSON.stringify({ x_handle: xHandle }),
  });
  return data.data;
}

async function verifyOperator(operatorId) {
  const data = await fetchApi('/operator/verify', {
    method: 'POST',
    body: JSON.stringify({ operator_id: operatorId }),
  });
  return data.data;
}

// ============================================
// Missions
// ============================================

async function loadAvailableMissions(limit = 20, offset = 0) {
  const data = await fetchApi(`/missions/available?limit=${limit}&offset=${offset}`);
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

  const container = document.querySelector('.page-container') || document.querySelector('.app');
  if (container) {
    container.insertBefore(alertEl, container.firstChild);

    setTimeout(() => {
      alertEl.remove();
    }, 5000);
  }
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

// Export for use in other pages
window.HumanAds = {
  fetchApi,
  formatCurrency,
  formatNumber,
  registerOperator,
  verifyOperator,
  loadAvailableMissions,
  loadMyMissions,
  acceptMission,
  submitMission,
  isLoggedIn,
  saveSession,
  clearSession,
  showAlert,
  setButtonLoading,
};
