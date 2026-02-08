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

function getDeadlineUrgency(date) {
  if (!date) return 'normal';
  const d = new Date(typeof date === 'number' ? date : date);
  const now = new Date();
  const diffMs = d - now;
  if (diffMs <= 0) return 'expired';
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours <= 24) return 'urgent';
  if (diffHours <= 72) return 'warning';
  return 'normal';
}

function formatDeadline(date) {
  if (!date) return '';
  const d = new Date(typeof date === 'number' ? date : date);
  const now = new Date();
  const diffMs = d - now;
  if (diffMs <= 0) return 'Expired';
  const totalMin = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMin / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (totalHours > 0) return `${totalHours}h ${mins}m left`;
  return `${mins}m left`;
}

// ============================================
// Reputation Badges (inline, subtle)
// ============================================

const _repCache = {};

async function loadReputationBadges() {
  const els = document.querySelectorAll('[data-rep-type][data-rep-id]');
  if (!els.length) return;

  // Collect unique entity requests
  const requests = new Map();
  els.forEach(el => {
    const type = el.dataset.repType; // 'agent' or 'operator'
    const id = el.dataset.repId;
    if (id) requests.set(`${type}:${id}`, { type, id });
  });

  // Fetch all unique reputations
  const results = {};
  await Promise.all([...requests.values()].map(async ({ type, id }) => {
    const key = `${type}:${id}`;
    if (_repCache[key] !== undefined) {
      results[key] = _repCache[key];
      return;
    }
    try {
      const endpoint = type === 'agent' ? `/ai-advertisers/${id}/reputation` : `/operators/${id}/reputation`;
      const res = await fetchApi(endpoint);
      const rep = res.data?.reputation || null;
      _repCache[key] = rep;
      results[key] = rep;
    } catch {
      _repCache[key] = null;
      results[key] = null;
    }
  }));

  // Populate badges
  els.forEach(el => {
    const key = `${el.dataset.repType}:${el.dataset.repId}`;
    const rep = results[key];
    if (rep && rep.total_reviews > 0) {
      el.innerHTML = `<span class="rep-inline" title="${rep.avg_rating.toFixed(1)} avg from ${rep.total_reviews} reviews">★ ${rep.avg_rating.toFixed(1)}<span class="rep-count">(${rep.total_reviews})</span></span>`;
    }
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
  return fetchApi(`/missions/${missionId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function getMissionReviews(missionId) {
  return fetchApi(`/missions/${missionId}/reviews`);
}

async function getReputation(type, id) {
  // type: 'operators' or 'ai-advertisers'
  return fetchApi(`/${type}/${id}/reputation`);
}

async function reportReview(reviewId, reason) {
  return fetchApi(`/reviews/${reviewId}/report`, {
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

// ============================================
// Escrow Functions
// ============================================

async function getEscrowBalance() {
  return fetchApi('/operator/escrow-balance');
}

/**
 * Withdraw from escrow contract via MetaMask.
 * Operator signs tx from their connected wallet calling escrow.withdraw().
 */
async function escrowWithdraw() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not detected. Install MetaMask to withdraw.');
  }

  // Request account access
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No account connected');
  }

  // Ensure we're on Sepolia (chainId 0xaa36a7 = 11155111)
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError) {
      throw new Error('Please switch to Sepolia network in MetaMask');
    }
  }

  // Get escrow contract address from config
  const configRes = await fetchApi('/config');
  const escrowContract = configRes.data?.escrow_contract || '0xbA71c6a6618E507faBeDF116a0c4E533d9282f6a';

  // withdraw() function selector: keccak256("withdraw()") = 0x3ccfd60b
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: accounts[0],
      to: escrowContract,
      data: '0x3ccfd60b',
    }],
  });

  return {
    txHash,
    explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
  };
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
  formatDeadline,
  getDeadlineUrgency,
  loadReputationBadges,
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
  getEscrowBalance,
  escrowWithdraw,
};
