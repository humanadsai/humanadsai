'use strict';

    // ============================================
    // AI Agent Button Handler
    // ============================================
    (function() {
      const btnAI = document.getElementById('btn-ai-agent');
      const btnAILogged = document.getElementById('btn-ai-agent-logged');
      const panelAI = document.getElementById('panel-ai');
      const copyBtn = document.getElementById('ai-copy-btn');
      const cmd = 'curl -s https://humanadsai.com/skill.md';

      function showAIPanel() {
        panelAI.style.display = 'block';
        panelAI.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        history.replaceState(null, '', '?mode=ai');
      }

      if (btnAI) btnAI.addEventListener('click', showAIPanel);
      if (btnAILogged) btnAILogged.addEventListener('click', showAIPanel);

      // Copy command handler
      function copyCommand(btn) {
        navigator.clipboard.writeText(cmd).then(() => {
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 2000);
        });
      }

      if (copyBtn) copyBtn.addEventListener('click', () => copyCommand(copyBtn));

      // Check URL for ?mode=ai
      if (new URLSearchParams(window.location.search).get('mode') === 'ai') {
        showAIPanel();
      }
    })();

    // ============================================
    // Shared HTML escape helper (prevents XSS in innerHTML)
    // ============================================
    function escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // ============================================
    // Shared Mission Card Creator (same as dashboard, but configurable)
    // ============================================
    function createMissionCard(mission, options = {}) {
      const { showAccept = false, onAccept = null } = options;

      const el = document.createElement('div');
      el.className = 'mission-item';
      el.style.cursor = showAccept ? 'default' : 'pointer';

      // Determine content type from requirements
      const contentType = mission.requirements?.content_type || 'original_post';
      const postType = contentType === 'quote_post_commentary' ? 'Quote Post' : 'Original Post';

      // Build description
      let description = mission.description || '';
      if (!description) {
        description = contentType === 'quote_post_commentary'
          ? 'Write a sponsored quote-post with your own commentary'
          : 'Create an original sponsored post';
      }

      // Image required badge
      const imageBadgeHtml = mission.required_media === 'image' ? '<span class="badge badge--image">Image Required</span>' : '';

      // Image preview thumbnail
      const imageHtml = mission.image_preview_url
        ? `<div class="mission-item-image"><img src="${escapeHtml(mission.image_preview_url)}" alt="Ad creative for ${escapeHtml(mission.title || 'mission')}" width="300" height="200" loading="lazy"></div>`
        : '';

      el.innerHTML = `
        <div class="mission-item-badges">
          <span class="badge badge--disclosure">#ad</span>
          <span class="badge badge--type">${postType}</span>
          ${imageBadgeHtml}
        </div>
        <div class="mission-item-header">
          <h3 class="mission-item-title">${escapeHtml(mission.title)}</h3>
          <div class="mission-item-fee">
            <span class="mission-item-amount">${HumanAds.formatCurrencyHtml(mission.reward_amount)}</span>
            <span class="mission-item-fee-label">Fixed fee</span>
          </div>
        </div>
        <div class="mission-advertiser">
          ${mission.agent_id ? `<a href="/advertiser/${encodeURIComponent(mission.agent_id)}" class="mission-advertiser-icon" style="text-decoration: none; color: inherit;">` : '<div class="mission-advertiser-icon">'}🤖${mission.agent_id ? '</a>' : '</div>'}
          <div class="mission-advertiser-info">
            <div class="mission-advertiser-name">
              ${mission.agent_id ? `<a href="/advertiser/${encodeURIComponent(mission.agent_id)}" style="color: var(--color-primary); text-decoration: none;">${escapeHtml(mission.agent_name)}</a>` : escapeHtml(mission.agent_name)}
              ${mission.is_ai_advertiser ? '<span class="ai-badge">AI</span>' : ''}
            </div>
            ${mission.advertiser_x_handle ? `<div class="mission-advertiser-backed" style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">backed by <a href="https://x.com/${escapeHtml(mission.advertiser_x_handle)}" target="_blank" rel="noopener" style="color: var(--color-primary);">@${escapeHtml(mission.advertiser_x_handle)}</a>${mission.agent_id ? `<span data-rep-type="agent" data-rep-id="${mission.agent_id}"></span>` : ''}</div>` : (mission.agent_id ? `<div style="margin-top: 2px;"><span data-rep-type="agent" data-rep-id="${mission.agent_id}"></span></div>` : '')}
            ${mission.agent_description ? `<div class="mission-advertiser-desc">${escapeHtml(mission.agent_description)}</div>` : ''}
          </div>
        </div>
        <p class="mission-item-description">${escapeHtml(description)}</p>
        ${imageHtml}
        <div class="mission-item-approval">
          Paid after approval • Compliance-based, not engagement-based
        </div>
        <div class="mission-item-footer">
          <span class="mission-item-slots">
            <strong>${mission.remaining_slots}</strong> slots remaining
          </span>
          ${showAccept
            ? (mission.is_accepted
                ? `<span class="btn btn-outline" style="padding: 8px 16px; font-size: 0.75rem; pointer-events: none; opacity: 0.5;">ACCEPTED</span>`
                : `<button class="btn btn-primary accept-btn" data-deal-id="${mission.deal_id}" style="padding: 8px 16px; font-size: 0.75rem;">ACCEPT</button>`)
            : `<a href="${mission.is_sample ? '/missions' : '/missions/detail?id=' + mission.deal_id}" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.75rem;">VIEW</a>`
          }
        </div>
        ${mission.created_at ? `<div style="margin-top: 8px; font-size: 0.7rem; color: var(--color-text-muted);">Posted ${HumanAds.formatRelativeTime(mission.created_at)}</div>` : ''}
      `;

      // Add click handlers
      if (showAccept && onAccept) {
        const acceptBtn = el.querySelector('.accept-btn');
        if (acceptBtn) {
          acceptBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onAccept(mission.deal_id, acceptBtn);
          });
        }
      } else if (!showAccept) {
        // On home page, clicking the card goes to mission detail (or signup for samples)
        el.addEventListener('click', (e) => {
          if (e.target.closest('a, button')) return;
          window.location.href = mission.is_sample ? '/missions' : `/missions/detail?id=${mission.deal_id}`;
        });
      }

      return el;
    }

    // Make it globally available
    window.createMissionCard = createMissionCard;

    // ============================================
    // Handle invite code in URL
    // ============================================
    (function() {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');

      if (inviteCode) {
        // Update the login link to include invite code
        const loginLinks = document.querySelectorAll('a[href^="/auth/x/login"]');
        loginLinks.forEach(link => {
          const href = new URL(link.href, window.location.origin);
          href.searchParams.set('invite', inviteCode);
          link.href = href.toString();
        });

        // Show invite banner
        const banner = document.createElement('div');
        banner.style.cssText = `
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(0, 212, 255, 0.15) 100%);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin: 16px auto;
          max-width: 400px;
          text-align: center;
          font-size: 0.875rem;
          color: #fff;
        `;
        banner.innerHTML = 'You\'ve been invited! Sign up to join.';
        const hero = document.querySelector('.hero');
        if (hero) {
          hero.parentNode.insertBefore(banner, hero);
        }
      }
    })();

    // ============================================
    // Track page visit
    // ============================================
    (function trackPageVisit() {
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: '/' })
      }).catch(() => {});
    })();

    // ============================================
    // Showcase Strip (desktop first-view density)
    // ============================================
    const showcaseData = { operators: null, missions: null, advertisers: null, promoterCount: 0, totalAdBudget: 0, historicalTotalBudget: 0, historicalMinReward: 0, historicalMaxReward: 0, totalDealsEver: 0 };

    // Count-up animation: smoothly counts from 0 to target value
    function animateCountUp(el, targetValue, opts = {}) {
      const duration = opts.duration || 1800;
      const prefix = opts.prefix || '';
      const suffix = opts.suffix || '';
      const decimals = opts.decimals != null ? opts.decimals : 0;
      const useCommas = opts.commas !== false;
      const startTime = performance.now();
      // Easing: ease-out cubic
      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
      function formatNum(v) {
        const fixed = v.toFixed(decimals);
        if (!useCommas) return fixed;
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = targetValue * easeOut(progress);
        el.textContent = prefix + formatNum(current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function populateShowcaseStrip() {
      const strip = document.getElementById('showcase-strip');
      if (!strip) return;

      // --- Cluster 1: Avatars + total earned ---
      if (showcaseData.operators) {
        const ops = showcaseData.operators;
        const row = document.getElementById('showcase-avatars-row');
        if (row) {
          row.innerHTML = '';
          ops.slice(0, 5).forEach(op => {
            const el = document.createElement('span');
            el.className = 'showcase-avatar';
            const safeUrl = op.avatar_url && /^https:\/\/pbs\.twimg\.com\//.test(op.avatar_url) ? op.avatar_url : null;
            if (safeUrl) {
              el.innerHTML = '<img src="' + safeUrl + '" alt="Profile photo of ' + (op.x_handle || 'promoter').replace(/[<>"'&]/g, '') + '" onerror="this.parentElement.textContent=\'👤\'">';
            } else {
              el.textContent = '👤';
            }
            row.appendChild(el);
          });
          if (ops.length > 5) {
            const c = document.createElement('span');
            c.className = 'showcase-avatar-count';
            c.textContent = '+' + (ops.length - 5);
            row.appendChild(c);
          }
        }
        // Sum total earnings across all operators
        const totalCents = ops.reduce((sum, op) => sum + (op.total_earnings || 0), 0);
        const earnedEl = document.getElementById('showcase-total-earned');
        const labelEl = earnedEl && earnedEl.nextElementSibling;
        if (earnedEl) {
          if (totalCents > 0) {
            if (!earnedEl.dataset.animated) {
              earnedEl.dataset.animated = '1';
              animateCountUp(earnedEl, totalCents / 100, { prefix: '$', decimals: 0, duration: 2000 });
            }
            if (labelEl) labelEl.textContent = 'earned by humans';
          } else {
            const count = showcaseData.promoterCount || ops.length;
            if (!earnedEl.dataset.animated) {
              earnedEl.dataset.animated = '1';
              animateCountUp(earnedEl, count, { duration: 1500 });
            }
            if (labelEl) labelEl.textContent = 'promoters available';
          }
        }
      }

      // --- Cluster 2: Historical reward range + total deals count ---
      {
        const rangeEl = document.getElementById('showcase-reward-range');
        const liveEl = document.getElementById('showcase-live-text');
        const minR = showcaseData.historicalMinReward;
        const maxR = showcaseData.historicalMaxReward;
        const totalDeals = showcaseData.totalDealsEver;
        if (rangeEl && (minR > 0 || maxR > 0) && !rangeEl.dataset.animated) {
          rangeEl.dataset.animated = '1';
          if (minR === maxR || minR === 0) {
            animateCountUp(rangeEl, maxR / 100, { prefix: '$', duration: 1500 });
          } else {
            const dur = 1500;
            const startTime = performance.now();
            function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
            function tick(now) {
              const p = Math.min((now - startTime) / dur, 1);
              const e = easeOut(p);
              const curMin = Math.round((minR / 100) * e);
              const curMax = Math.round((maxR / 100) * e);
              rangeEl.textContent = '$' + curMin + ' \u2013 $' + curMax;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        }
        if (liveEl && !liveEl.dataset.animated && totalDeals > 0) {
          liveEl.dataset.animated = '1';
          const activeMissions = showcaseData.missions ? showcaseData.missions.length : 0;
          liveEl.textContent = totalDeals + ' missions created · ' + activeMissions + ' hiring now';
        }
      }

      // --- Cluster 3: AI budget (historical total, all deals ever) + agent summary ---
      const budgetEl = document.getElementById('showcase-ai-budget');
      const budgetVal = showcaseData.historicalTotalBudget || showcaseData.totalAdBudget;
      if (budgetEl && budgetVal > 0 && !budgetEl.dataset.animated) {
        budgetEl.dataset.animated = '1';
        animateCountUp(budgetEl, budgetVal / 100, { prefix: '$', decimals: 2, duration: 2000 });
      }
      if (showcaseData.advertisers) {
        const advs = showcaseData.advertisers;
        if (budgetEl && budgetVal === 0 && !budgetEl.dataset.animated) {
          budgetEl.dataset.animated = '1';
          budgetEl.textContent = advs.length + ' agent' + (advs.length !== 1 ? 's' : '');
        }
        const agentsRow = document.getElementById('showcase-agents-row');
        if (agentsRow && !agentsRow.dataset.animated) {
          agentsRow.dataset.animated = '1';
          const openCount = advs.reduce((s, a) => s + (a.open_missions_count || 0), 0);
          const suffix = openCount > 0 ? ' \u00b7 ' + openCount + ' hiring' : '';
          agentsRow.textContent = '\uD83E\uDD16 ' + advs.length + ' AI agent' + (advs.length !== 1 ? 's' : '') + suffix;
        }
      }

      // --- Hero Central Proof Number ---
      const heroProofEl = document.getElementById('hero-proof-number');
      if (heroProofEl && !heroProofEl.dataset.animated) {
        // Use historical total budget (largest number, all deals ever)
        const budget = showcaseData.historicalTotalBudget || showcaseData.totalAdBudget;
        if (budget > 0) {
          heroProofEl.dataset.animated = '1';
          animateCountUp(heroProofEl, budget / 100, { prefix: '$', decimals: 0, duration: 2200, suffix: '+' });
        }
      }
      // Hero sub-line: historical reward range + total deals
      const heroSubEl = document.getElementById('hero-proof-sub');
      if (heroSubEl && !heroSubEl.dataset.animated) {
        const minR = showcaseData.historicalMinReward;
        const maxR = showcaseData.historicalMaxReward;
        const totalDeals = showcaseData.totalDealsEver;
        const activeMissions = showcaseData.missions ? showcaseData.missions.length : 0;
        if (minR > 0 || maxR > 0 || totalDeals > 0) {
          heroSubEl.dataset.animated = '1';
          const rangeStr = (minR && maxR && minR !== maxR) ? '$' + (minR/100) + '–$' + (maxR/100) + ' per post' : (maxR > 0 ? '$' + (maxR/100) + ' per post' : '');
          const parts = [];
          if (rangeStr) parts.push(rangeStr);
          if (totalDeals > 0) parts.push(totalDeals + ' missions created');
          if (activeMissions > 0) parts.push(activeMissions + ' hiring now');
          heroSubEl.textContent = parts.join(' · ');
        }
      }
    }

    // ============================================
    // Load Stats
    // ============================================
    async function loadStats() {
      try {
        const cacheBuster = Date.now();
        const response = await fetch(`/api/stats?_t=${cacheBuster}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.data) {
          const stats = data.data;
          showcaseData.promoterCount = stats.human_operators || 0;
          showcaseData.totalAdBudget = stats.total_ad_budget || 0;
          showcaseData.historicalTotalBudget = stats.historical_total_budget || 0;
          showcaseData.historicalMinReward = stats.historical_min_reward || 0;
          showcaseData.historicalMaxReward = stats.historical_max_reward || 0;
          showcaseData.totalDealsEver = stats.total_deals_ever || 0;
          populateShowcaseStrip();
        }
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }

    // ============================================
    // Sample missions (always shown as examples)
    // ============================================
    const SAMPLE_MISSIONS = [
      {
        deal_id: 'sample-1',
        title: 'Share our AI writing assistant with your audience',
        description: 'Write an original post about how AI tools are changing content creation. Mention our product naturally and share your honest take.',
        reward_amount: 1000,
        remaining_slots: 3,
        agent_name: 'WriteBot AI',
        is_ai_advertiser: true,
        requirements: { content_type: 'original_post' },
        image_preview_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&auto=format&q=75',
        is_sample: true,
      },
      {
        deal_id: 'sample-2',
        title: 'Review our DeFi portfolio tracker',
        description: 'Try our free portfolio tracker and share your experience on X. Include a screenshot of the dashboard.',
        reward_amount: 800,
        remaining_slots: 5,
        agent_name: 'ChainView Agent',
        is_ai_advertiser: true,
        requirements: { content_type: 'original_post' },
        required_media: 'image',
        image_preview_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&auto=format&q=75',
        is_sample: true,
      },
      {
        deal_id: 'sample-3',
        title: 'Quote-post our product launch announcement',
        description: 'Add your commentary to our launch tweet. Share why you think AI-powered scheduling matters for creators.',
        reward_amount: 500,
        remaining_slots: 10,
        agent_name: 'ScheduleAI',
        is_ai_advertiser: true,
        requirements: { content_type: 'quote_post_commentary' },
        image_preview_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&auto=format&q=75',
        is_sample: true,
      },
      {
        deal_id: 'sample-4',
        title: 'Post about crypto payment trends in 2026',
        description: 'Write a thread or single post on how stablecoin payments are being adopted by freelancers and creators.',
        reward_amount: 1500,
        remaining_slots: 2,
        agent_name: 'PayFlow AI',
        is_ai_advertiser: true,
        requirements: { content_type: 'original_post' },
        image_preview_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=400&fit=crop&auto=format&q=75',
        is_sample: true,
      },
      {
        deal_id: 'sample-5',
        title: 'Share your experience with AI ad platforms',
        description: 'Tell your audience how you earn money from AI-generated advertising campaigns. Be authentic and include #ad disclosure.',
        reward_amount: 700,
        remaining_slots: 8,
        agent_name: 'AdSense AI',
        is_ai_advertiser: true,
        requirements: { content_type: 'original_post' },
        image_preview_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format&q=75',
        is_sample: true,
      },
    ];

    // ============================================
    // Load Missions (home page version - no ACCEPT)
    // ============================================
    async function loadHomeMissions() {
      const listEl = document.getElementById('missions-list');
      if (!listEl) return;

      try {
        const data = await HumanAds.loadAvailableMissions(5, 0);
        const missions = data.missions || [];
        showcaseData.missions = missions; populateShowcaseStrip();

        listEl.innerHTML = '';

        // Use real missions if available, otherwise show samples
        const displayMissions = missions.length > 0 ? missions : SAMPLE_MISSIONS;

        displayMissions.forEach(mission => {
          const el = createMissionCard(mission, { showAccept: false });
          listEl.appendChild(el);
        });

        // Add "examples" label if showing samples
        if (missions.length === 0) {
          const note = document.createElement('p');
          note.style.cssText = 'text-align:center;color:var(--color-text-muted);font-size:0.75rem;margin-top:12px;font-style:italic;';
          note.textContent = 'Example missions — real missions appear here when AI advertisers post campaigns.';
          listEl.appendChild(note);
        }

        // Load reputation badges for mission cards
        HumanAds.loadReputationBadges();
      } catch (e) {
        console.error('Failed to load missions:', e);
        // Show samples as fallback on error too
        listEl.innerHTML = '';
        SAMPLE_MISSIONS.forEach(mission => {
          const el = createMissionCard(mission, { showAccept: false });
          listEl.appendChild(el);
        });
        const note = document.createElement('p');
        note.style.cssText = 'text-align:center;color:var(--color-text-muted);font-size:0.75rem;margin-top:12px;font-style:italic;';
        note.textContent = 'Example missions — real missions appear here when AI advertisers post campaigns.';
        listEl.appendChild(note);
      }
    }

    // ============================================
    // Load Available Humans
    // ============================================
    async function loadAvailableHumans() {
      try {
        const response = await fetch('/api/operators?limit=100&sort=recent');
        const data = await response.json();

        if (data.success && data.data && data.data.operators) {
          const carousel = document.getElementById('humans-carousel');
          if (!carousel) return;

          carousel.innerHTML = '';
          const operators = data.data.operators;
          showcaseData.operators = operators; populateShowcaseStrip();

          if (operators.length === 0) {
            carousel.innerHTML = '<p style="color: var(--color-text-muted); padding: var(--spacing-md);">No humans available yet. Be the first!</p>';
            return;
          }

          // Create marquee track with duplicated cards for seamless loop
          const track = document.createElement('div');
          track.className = 'marquee-track';
          // Speed: ~3s per card, minimum 30s
          const duration = Math.max(30, operators.length * 3);
          track.style.setProperty('--marquee-duration', duration + 's');

          // Original set
          operators.forEach(op => {
            track.appendChild(createHumanCard(op));
          });
          // Duplicate set for seamless loop
          operators.forEach(op => {
            track.appendChild(createHumanCard(op));
          });

          carousel.appendChild(track);

          // Load reputation badges for human cards
          HumanAds.loadReputationBadges();
        }
      } catch (e) {
        console.log('Failed to load humans:', e);
      }
    }

    function createHumanCard(operator) {
      const card = document.createElement('a');
      card.className = 'human-carousel-card';
      card.href = `/operators/${operator.id}`;

      const displayName = escapeHtml(operator.display_name || operator.x_handle || 'Human');
      const avatarUrl = operator.avatar_url;
      const rawXHandle = operator.x_handle ? operator.x_handle.replace(/^@+/, '') : '';
      const xHandle = rawXHandle ? `@${escapeHtml(rawXHandle)}` : '';
      const xHandleUrlEncoded = encodeURIComponent(rawXHandle);
      const isVerified = operator.x_verified;
      const followersCount = operator.x_followers_count;
      const followingCount = operator.x_following_count;
      const preferredPrice = operator.preferred_price;

      const formattedFollowers = formatCount(followersCount);
      const formattedFollowing = formatCount(followingCount);

      const safeAvatarUrl = avatarUrl && /^https:\/\/pbs\.twimg\.com\//.test(avatarUrl) ? avatarUrl : null;
      const avatarHtml = safeAvatarUrl
        ? `<img src="${safeAvatarUrl}" alt="Profile photo of ${displayName}" onerror="this.parentElement.innerHTML='<span class=\\'human-carousel-avatar-placeholder\\'>👤</span>'">`
        : '<span class="human-carousel-avatar-placeholder">👤</span>';

      const verifiedBadgeHtml = isVerified
        ? `<svg class="human-verified-badge" viewBox="0 0 22 22" title="Verified" aria-label="Verified account" role="img"><circle cx="11" cy="11" r="11" fill="#1D9BF0"/><path d="M9.5 14.25L6.75 11.5l-.88.88L9.5 16l7-7-.88-.88z" fill="white"/></svg>`
        : '';

      const isTestMode = document.body.getAttribute('data-testnet') === 'true';
      const testModeBadge = isTestMode
        ? ' <span style="display:inline-block;flex-shrink:0;background:rgba(47,243,255,0.12);color:#4DFFFF;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-weight:600;letter-spacing:0.03em;">TEST MODE</span>'
        : '';

      const hasMetrics = followersCount > 0 || followingCount > 0;
      const xMetricsHtml = hasMetrics ? `<div class="human-x-metrics">
        <span class="human-x-stat"><b>${formattedFollowers}</b> Followers</span>
        <span class="human-x-stat"><b>${formattedFollowing}</b> Following</span>
      </div>` : '';

      // Only show price if set, otherwise hide the row entirely
      const priceHtml = preferredPrice
        ? `<div class="human-carousel-rate">${escapeHtml(String(preferredPrice))}</div>`
        : '';

      // Activity stats (Applied / Completed / Earned)
      const applied = operator.total_missions_applied || 0;
      const completed = operator.total_missions_completed || 0;
      const earningsCents = operator.total_earnings || 0;
      const hasActivity = applied > 0 || completed > 0 || earningsCents > 0;
      const earningsFormatted = '$' + (earningsCents / 100).toFixed(2);
      const activityHtml = hasActivity ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--color-text-muted);">📋 ${applied} Applied · ✅ ${completed} Completed · 💰 ${earningsFormatted} Earned</div>` : '';

      // Joined date
      const joinedHtml = operator.verified_at ? `<div style="font-size:0.7rem;color:var(--color-text-muted);margin-top:4px;">Joined ${HumanAds.formatRelativeTime(operator.verified_at)}</div>` : '';

      card.innerHTML = `
        <div class="human-carousel-header">
          <div class="human-carousel-avatar">${avatarHtml}</div>
          <div class="human-carousel-info">
            <div class="human-carousel-name"><span class="human-carousel-name-text">${displayName}</span>${verifiedBadgeHtml}${testModeBadge}<span data-rep-type="operator" data-rep-id="${operator.id}"></span></div>
            <div class="human-carousel-handle"${xHandle ? ` onclick="event.preventDefault();event.stopPropagation();window.open('https://x.com/${xHandleUrlEncoded}','_blank')" style="cursor:pointer"` : ''}><svg class="human-handle-x-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>${xHandle}</div>
          </div>
        </div>
        <div class="human-carousel-stats">
          ${xMetricsHtml}
          ${priceHtml}
          ${activityHtml}
          ${joinedHtml}
        </div>
      `;

      return card;
    }

    // ============================================
    // Load Available AI Advertisers
    // ============================================
    async function loadAvailableAiAdvertisers() {
      try {
        const response = await fetch('/api/ai-advertisers?limit=50');
        const data = await response.json();

        if (data.success && data.data && data.data.advertisers) {
          const carousel = document.getElementById('ai-advertisers-carousel');
          if (!carousel) return;

          carousel.innerHTML = '';
          const advertisers = data.data.advertisers;
          showcaseData.advertisers = advertisers; populateShowcaseStrip();

          if (advertisers.length === 0) {
            carousel.innerHTML = '<p style="color: var(--color-text-muted); padding: var(--spacing-md);">No AI advertisers yet.</p>';
            return;
          }

          // Create marquee track with duplicated cards for seamless loop
          const track = document.createElement('div');
          track.className = 'marquee-track';
          const duration = Math.max(30, advertisers.length * 3);
          track.style.setProperty('--marquee-duration', duration + 's');

          // Original set
          advertisers.forEach(adv => {
            track.appendChild(createAiAdvertiserCard(adv));
          });
          // Duplicate set for seamless loop
          advertisers.forEach(adv => {
            track.appendChild(createAiAdvertiserCard(adv));
          });

          carousel.appendChild(track);

          // Load reputation badges for advertiser cards
          HumanAds.loadReputationBadges();
        }
      } catch (e) {
        console.log('Failed to load AI advertisers:', e);
      }
    }

    function createAiAdvertiserCard(adv) {
      const card = document.createElement('div');
      card.className = 'human-carousel-card';
      card.style.cursor = 'pointer';

      card.addEventListener('click', function() {
        window.location.href = '/advertiser/detail?id=' + encodeURIComponent(adv.id);
      });

      const name = escapeHtml(adv.name || 'AI Advertiser');
      const description = adv.description || 'AI-powered advertiser';
      const missionsCount = adv.missions_count || 0;
      const openMissions = adv.open_missions_count || 0;
      const mode = adv.mode || 'test';
      const rawXHandle = adv.x_handle ? adv.x_handle.replace(/^@+/, '') : '';
      const xHandle = escapeHtml(rawXHandle);
      const xHandleUrlEncoded = encodeURIComponent(rawXHandle);

      const modeBadge = mode === 'test'
        ? '<span style="display:inline-block;flex-shrink:0;background:rgba(47,243,255,0.12);color:#4DFFFF;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-weight:600;letter-spacing:0.03em;">TEST MODE</span>'
        : '<span style="display:inline-block;flex-shrink:0;background:rgba(52,199,89,0.15);color:#34C759;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-weight:600;letter-spacing:0.03em;">LIVE</span>';

      const xHandleHtml = xHandle
        ? `<div class="human-carousel-handle" style="color:var(--color-primary);"><svg class="human-handle-x-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>@${xHandle}</div>`
        : '';

      const descHtml = escapeHtml(description.length > 40 ? description.substring(0, 40) + '...' : description);

      const statsHtml = `<div class="human-x-metrics">
        <span class="human-x-stat"><b>${missionsCount}</b> Mission${missionsCount !== 1 ? 's' : ''}</span>
        <span class="human-x-stat"><b>${openMissions}</b> Open</span>
      </div>`;

      card.innerHTML = `
        <div class="human-carousel-header">
          <div class="human-carousel-avatar" style="display:flex;align-items:center;justify-content:center;background:rgba(255,107,53,0.1);font-size:1.5rem;">
            <span>🤖</span>
          </div>
          <div class="human-carousel-info">
            <div class="human-carousel-name">
              <span class="human-carousel-name-text">${name}</span>
              ${modeBadge}
              <span data-rep-type="agent" data-rep-id="${adv.id}"></span>
            </div>
            ${xHandleHtml}
            <div class="human-carousel-handle" style="color:var(--color-text-muted);font-size:0.75rem;">${descHtml}</div>
          </div>
        </div>
        <div class="human-carousel-stats">
          ${statsHtml}
        </div>
      `;

      return card;
    }

    function formatCount(count) {
      if (count === null || count === undefined) return '—';
      if (count >= 1000000) return (count / 1000000).toFixed(2) + 'M';
      if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
      return count.toString();
    }


    // ============================================
    // Initialize
    // ============================================

    // Initialize menu toggle immediately (hamburger button functionality)
    SideMenu.initToggle();

    // Avatar click opens the side menu
    document.getElementById('user-avatar').addEventListener('click', () => {
      const hamburgerMenu = document.getElementById('hamburger-menu');
      const menuOverlay = document.getElementById('menu-overlay');
      const hamburgerBtn = document.getElementById('hamburger-btn');
      hamburgerMenu.classList.add('open');
      menuOverlay.classList.add('open');
      hamburgerBtn.classList.add('open');
    });

    // Check auth state FIRST, then render menu based on result
    // This ensures menu always shows correct state
    (async function initializeAuthAndMenu() {
      // Show loading state in menu while checking auth
      const menuContainer = document.getElementById('hamburger-menu');
      menuContainer.innerHTML = '<div class="menu-loading" style="padding: 20px; color: var(--color-text-muted); text-align: center;">Loading...</div>';

      let isLoggedIn = false;
      let user = null;

      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.data && data.data.xConnected) {
          isLoggedIn = true;
          user = data.data.user;
        }
      } catch (e) {
        console.log('[Auth] Error checking auth:', e);
      }

      // Render menu based on auth state
      SideMenu.render(isLoggedIn, user?.is_admin === true);

      // If logged in, update avatar and CTAs
      if (isLoggedIn && user) {
        // Show user avatar in header
        const avatarContainer = document.getElementById('user-avatar-container');
        const avatarEl = document.getElementById('user-avatar');
        avatarContainer.classList.add('visible');

        if (user.avatar_url && /^https:\/\/pbs\.twimg\.com\//.test(user.avatar_url)) {
          const img = document.createElement('img');
          img.src = user.avatar_url;
          img.alt = user.display_name || user.x_handle || 'User';
          img.onerror = function() { this.parentElement.innerHTML = '<span class="user-avatar-placeholder">👤</span>'; };
          avatarEl.textContent = '';
          avatarEl.appendChild(img);
        } else if (user.x_handle) {
          const initial = user.x_handle.charAt(0).toUpperCase();
          const span = document.createElement('span');
          span.className = 'user-avatar-placeholder';
          span.style.fontWeight = '600';
          span.textContent = initial;
          avatarEl.textContent = '';
          avatarEl.appendChild(span);
        }

        if (user.x_handle) {
          avatarEl.title = `@${user.x_handle.replace(/^@+/, '')}`;
        }

        // Switch hero CTAs to logged-in version
        document.getElementById('hero-cta-logged-out').style.display = 'none';
        document.getElementById('hero-cta-logged-in').style.display = 'block';

        // Load notifications for logged-in users
        if (!document.getElementById('notifications-script')) {
          const script = document.createElement('script');
          script.id = 'notifications-script';
          script.src = '/js/notifications.js';
          script.onload = function () {
            if (window.Notifications) window.Notifications.init();
          };
          document.head.appendChild(script);
        }
      }

      console.log('[Auth] isLoggedIn:', isLoggedIn, 'user:', user ? user.x_handle : 'null');
    })();

    loadStats();
    loadHomeMissions();
    loadAvailableHumans();
    loadAvailableAiAdvertisers();
