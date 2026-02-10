// Google翻訳ウィジェットを動的にフッターへ挿入
(function() {
  var MANUAL_LANG_KEY = 'gt_manual_lang';

  var LANGUAGES = {
    'ja': 'ja', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'zh': 'zh-CN',
    'ko': 'ko', 'es': 'es', 'fr': 'fr', 'de': 'de',
    'pt': 'pt', 'ar': 'ar', 'hi': 'hi', 'th': 'th', 'vi': 'vi'
  };

  // ブラウザ/OS言語を検出（en以外ならその言語で自動翻訳）
  function detectLanguage() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return LANGUAGES[lang] || LANGUAGES[lang.split('-')[0]] || null;
  }

  // cookieでGoogle翻訳の言語を設定
  function setTranslateCookie(lang) {
    document.cookie = 'googtrans=/en/' + lang + ';path=/;';
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=' + location.hostname + ';';
  }

  // 初期化関数（Google翻訳APIが呼び出す）
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ja,zh-CN,zh-TW,ko,es,fr,de,pt,ar,hi,th,vi',
      layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false
    }, 'google_translate_element');
  };

  // widget検出: select(Chrome) または gadget-simple(Safari)
  function findWidget(cb, fallbackCb) {
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      var simple = document.querySelector('.goog-te-gadget-simple');
      if (select || simple) {
        clearInterval(interval);
        cb(select, simple);
      }
      if (++attempts > 60) {
        clearInterval(interval);
        // widget読み込み失敗 → フォールバック
        if (fallbackCb) fallbackCb();
      }
    }, 100);
  }

  // widget読み込み後にプログラムで言語を選択
  function autoSelectLanguage(lang) {
    var programmatic = true;
    findWidget(function(select, simple) {
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        setTimeout(function() {
          programmatic = false;
          select.addEventListener('change', function() {
            if (!programmatic) {
              localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
            }
          });
        }, 500);
      } else if (simple) {
        if (document.cookie.indexOf('googtrans') !== -1) {
          var reloaded = sessionStorage.getItem('gt_reloaded');
          if (!reloaded) {
            sessionStorage.setItem('gt_reloaded', '1');
            location.reload();
            return;
          }
        }
        watchSimpleWidget(simple);
      }
    }, function() {
      showFallbackSelect(lang);
    });
  }

  // 手動選択の監視
  function watchManualChange() {
    findWidget(function(select, simple) {
      if (select) {
        select.addEventListener('change', function() {
          localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
        });
      } else if (simple) {
        watchSimpleWidget(simple);
      }
    }, function() {
      showFallbackSelect(null);
    });
  }

  // Safari SIMPLE widget: 言語選択を監視
  function watchSimpleWidget(simple) {
    var observer = new MutationObserver(function() {
      var span = simple.querySelector('.goog-te-menu-value span:first-child');
      if (span) {
        var langText = span.textContent.trim();
        if (langText && langText !== 'Select Language') {
          var langMap = {
            'Japanese': 'ja', 'Chinese (Simplified)': 'zh-CN', 'Chinese (Traditional)': 'zh-TW',
            'Korean': 'ko', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
            'Portuguese': 'pt', 'Arabic': 'ar', 'Hindi': 'hi', 'Thai': 'th', 'Vietnamese': 'vi',
            'English': 'en'
          };
          var code = langMap[langText] || langText.toLowerCase();
          localStorage.setItem(MANUAL_LANG_KEY, code);
        }
      }
    });
    observer.observe(simple, { childList: true, subtree: true, characterData: true });
  }

  // フォールバック: widget読み込み失敗時の自前プルダウン
  function showFallbackSelect(autoLang) {
    var container = document.getElementById('google_translate_element');
    if (!container) return;

    var options = [
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

    var select = document.createElement('select');
    select.className = 'gt-fallback-select';
    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option');
      opt.value = options[i].value;
      opt.textContent = options[i].label;
      select.appendChild(opt);
    }

    select.addEventListener('change', function() {
      var lang = select.value;
      if (!lang) return;
      localStorage.setItem(MANUAL_LANG_KEY, lang);
      if (lang === 'en') {
        // 英語 = 翻訳なし、現在のページをそのまま表示
        window.location.href = window.location.pathname + window.location.search;
      } else {
        // Google翻訳のURL経由で翻訳
        window.location.href = 'https://translate.google.com/translate?sl=en&tl=' + lang + '&u=' + encodeURIComponent(window.location.href);
      }
    });

    container.innerHTML = '';
    container.appendChild(select);

    // 自動翻訳が必要な場合（初回訪問）
    if (autoLang) {
      localStorage.setItem(MANUAL_LANG_KEY, autoLang);
      window.location.href = 'https://translate.google.com/translate?sl=en&tl=' + autoLang + '&u=' + encodeURIComponent(window.location.href);
    }
  }

  // DOMContentLoaded後にウィジェットを挿入
  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer.footer');
    if (!footer) return;

    var manualLang = localStorage.getItem(MANUAL_LANG_KEY);
    var browserLang = detectLanguage();

    if (manualLang) {
      if (manualLang !== 'en') {
        setTranslateCookie(manualLang);
      }
      watchManualChange();
    } else if (browserLang) {
      setTranslateCookie(browserLang);
      autoSelectLanguage(browserLang);
    } else {
      watchManualChange();
    }

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

    // Google翻訳スクリプトをロード
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // CSS注入
    var style = document.createElement('style');
    style.textContent = [
      '/* 共通: "Powered by"テキスト非表示 */',
      '#google_translate_element .goog-te-gadget { font-size: 0 !important; color: transparent !important; }',
      '#google_translate_element .goog-te-gadget > span { display: none !important; }',
      '/* HORIZONTAL layout (Chrome): selectプルダウン */',
      '#google_translate_element select.goog-te-combo { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text) !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; }',
      '/* SIMPLE layout (Safari desktop): リンク形式ウィジェット */',
      '#google_translate_element .goog-te-gadget .goog-te-gadget-simple { font-size: 0.75rem !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; display: inline-block !important; }',
      '#google_translate_element .goog-te-gadget-simple a { color: var(--color-text-muted) !important; text-decoration: none !important; font-size: 0.75rem !important; display: inline !important; }',
      '#google_translate_element .goog-te-gadget-simple .goog-te-menu-value span { color: var(--color-text) !important; font-size: 0.75rem !important; }',
      '#google_translate_element .goog-te-gadget-simple img { display: none !important; }',
      '/* フォールバックselect (mobile Safari等) */',
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
