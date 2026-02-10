// Google翻訳ウィジェット（Chrome: widget / Safari・モバイル: 自前プルダウン）
(function() {
  var MANUAL_LANG_KEY = 'gt_manual_lang';

  var LANG_OPTIONS = [
    { value: '', label: 'Language' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh-CN', label: '中文(简体)' },
    { value: 'zh-TW', label: '中文(繁體)' },
    { value: 'ko', label: '한국어' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'pt', label: 'Português' },
    { value: 'ar', label: 'العربية' },
    { value: 'hi', label: 'हिन्दी' },
    { value: 'th', label: 'ไทย' },
    { value: 'vi', label: 'Tiếng Việt' }
  ];

  function detectLanguage() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    var supported = {
      'ja': 'ja', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'zh': 'zh-CN',
      'ko': 'ko', 'es': 'es', 'fr': 'fr', 'de': 'de',
      'pt': 'pt', 'ar': 'ar', 'hi': 'hi', 'th': 'th', 'vi': 'vi'
    };
    return supported[lang] || supported[lang.split('-')[0]] || null;
  }

  function setTranslateCookie(lang) {
    document.cookie = 'googtrans=/en/' + lang + ';path=/;';
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=' + location.hostname + ';';
  }

  // iOS / モバイルSafari検出（Google Translate widgetが動かない環境）
  function needsFallback() {
    var ua = navigator.userAgent;
    // iOS (iPhone/iPad/iPod) — Chrome on iOS も WebKit なので widget 動かない
    if (/iP(hone|ad|od)/.test(ua)) return true;
    // Safari on macOS (Chrome/Firefox/Edge は含まない)
    if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua)) return true;
    return false;
  }

  // ========== Google Translate Widget (Chrome等) ==========

  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ja,zh-CN,zh-TW,ko,es,fr,de,pt,ar,hi,th,vi',
      layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false
    }, 'google_translate_element');
  };

  function initWidget(container, browserLang, manualLang) {
    // cookie設定
    var targetLang = manualLang || browserLang;
    if (targetLang && targetLang !== 'en') {
      setTranslateCookie(targetLang);
    }

    // スクリプトロード
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // 初回自動翻訳（手動選択がない場合のみ）
    if (!manualLang && browserLang) {
      var programmatic = true;
      var attempts = 0;
      var interval = setInterval(function() {
        var select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = browserLang;
          select.dispatchEvent(new Event('change'));
          clearInterval(interval);
          setTimeout(function() {
            programmatic = false;
            select.addEventListener('change', function() {
              if (!programmatic) {
                localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
              }
            });
          }, 500);
        }
        if (++attempts > 50) clearInterval(interval);
      }, 100);
    } else {
      // 手動変更リスナー
      var attempts2 = 0;
      var interval2 = setInterval(function() {
        var select = document.querySelector('.goog-te-combo');
        if (select) {
          clearInterval(interval2);
          select.addEventListener('change', function() {
            localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
          });
        }
        if (++attempts2 > 50) clearInterval(interval2);
      }, 100);
    }
  }

  // ========== フォールバック (Safari / iOS) ==========

  function initFallback(container, browserLang, manualLang) {
    var select = document.createElement('select');
    select.className = 'gt-fallback-select';
    for (var i = 0; i < LANG_OPTIONS.length; i++) {
      var opt = document.createElement('option');
      opt.value = LANG_OPTIONS[i].value;
      opt.textContent = LANG_OPTIONS[i].label;
      select.appendChild(opt);
    }

    // 現在の言語をselectedに
    var currentLang = manualLang || browserLang || '';
    if (currentLang) {
      select.value = currentLang;
    }

    select.addEventListener('change', function() {
      var lang = select.value;
      if (!lang) return;
      localStorage.setItem(MANUAL_LANG_KEY, lang);
      if (lang === 'en') {
        window.location.href = window.location.pathname + window.location.search;
      } else {
        window.location.href = 'https://translate.google.com/translate?sl=en&tl=' + lang + '&u=' + encodeURIComponent(window.location.href);
      }
    });

    container.appendChild(select);
  }

  // ========== メイン ==========

  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer.footer');
    if (!footer) return;

    // コンテナ作成
    var container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.margin = '12px 0';
    container.style.textAlign = 'center';

    var disclaimer = footer.querySelector('.footer-disclaimer');
    if (disclaimer) {
      footer.insertBefore(container, disclaimer);
    } else {
      footer.appendChild(container);
    }

    var manualLang = localStorage.getItem(MANUAL_LANG_KEY);
    var browserLang = detectLanguage();

    if (needsFallback()) {
      // Safari/iOS: 即座にフォールバックプルダウン表示
      initFallback(container, browserLang, manualLang);
    } else {
      // Chrome等: Google Translate widget
      initWidget(container, browserLang, manualLang);
    }

    // CSS注入
    var style = document.createElement('style');
    style.textContent = [
      '/* 共通: "Powered by"テキスト非表示 */',
      '#google_translate_element .goog-te-gadget { font-size: 0 !important; color: transparent !important; }',
      '#google_translate_element .goog-te-gadget > span { display: none !important; }',
      '/* HORIZONTAL layout (Chrome): selectプルダウン */',
      '#google_translate_element select.goog-te-combo { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text) !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; }',
      '/* フォールバックselect (Safari/iOS) */',
      '.gt-fallback-select { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text) !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; -webkit-appearance: menulist !important; }',
      '/* ヘッダー: Google翻訳バー/通知を完全非表示 */',
      '.goog-te-banner-frame { display: none !important; }',
      '#goog-gt-tt, .goog-te-balloon-frame { display: none !important; }',
      'body > .skiptranslate { display: none !important; }',
      'body { top: 0 !important; }'
    ].join('\n');
    document.head.appendChild(style);
  });
})();
