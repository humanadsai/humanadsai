// Google Analytics 4 with AI traffic tagging
(function(){
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-6QGP01F548';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-6QGP01F548');

  // AI traffic detection & tagging
  // Tags visits from AI agents/bots and AI search referrals as custom dimensions
  (function detectAiTraffic() {
    var ua = navigator.userAgent || '';
    var ref = document.referrer || '';
    var params = new URLSearchParams(window.location.search);

    // Detect AI bot user-agents
    var aiAgentPatterns = [
      /ChatGPT/i, /GPTBot/i, /OAI-SearchBot/i,
      /ClaudeBot/i, /Claude-User/i,
      /PerplexityBot/i, /Perplexity-User/i,
      /Google-Agent/i, /Google-Extended/i,
      /Bingbot/i, /BingPreview/i,
      /CopilotBot/i, /GeminiBot/i,
    ];
    var isAiAgent = aiAgentPatterns.some(function(p) { return p.test(ua); });

    // Detect AI search referral domains
    var aiReferrers = ['chat.openai.com', 'chatgpt.com', 'perplexity.ai', 'claude.ai', 'copilot.microsoft.com', 'gemini.google.com', 'you.com'];
    var isAiReferral = aiReferrers.some(function(d) { return ref.indexOf(d) !== -1; });

    // Detect UTM source from AI
    var utmSource = params.get('utm_source') || '';
    var utmMedium = params.get('utm_medium') || '';
    var isAiUtm = /ai|agent|chatgpt|claude|perplexity|copilot|gemini/i.test(utmSource + utmMedium);

    var aiTrafficType = 'none';
    if (isAiAgent) aiTrafficType = 'ai_agent';
    else if (isAiReferral) aiTrafficType = 'ai_referral';
    else if (isAiUtm) aiTrafficType = 'ai_utm';

    if (aiTrafficType !== 'none') {
      gtag('set', 'user_properties', { 'ai_traffic_type': aiTrafficType });
      gtag('event', 'ai_visit', {
        'ai_traffic_type': aiTrafficType,
        'ai_source': isAiAgent ? ua.match(/ChatGPT|GPTBot|ClaudeBot|PerplexityBot|Google-Agent|Bingbot|CopilotBot|GeminiBot/i)?.[0] || 'unknown'
                   : isAiReferral ? ref.match(/chat\.openai|chatgpt|perplexity|claude|copilot|gemini|you\.com/i)?.[0] || 'unknown'
                   : utmSource,
      });
    }
  })();
})();
