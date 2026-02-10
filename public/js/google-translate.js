// Google翻訳ウィジェットを動的にフッターへ挿入
(function() {
  // ブラウザ/OS言語を検出（en以外ならその言語で自動翻訳）
  function detectLanguage() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    // includedLanguagesに含まれる言語コードにマッピング
    var supported = {
      'ja': 'ja', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'zh': 'zh-CN',
      'ko': 'ko', 'es': 'es', 'fr': 'fr', 'de': 'de',
      'pt': 'pt', 'ar': 'ar', 'hi': 'hi', 'th': 'th', 'vi': 'vi'
    };
    return supported[lang] || supported[lang.split('-')[0]] || null;
  }

  // cookieでGoogle翻訳の言語を設定
  function setTranslateCookie(lang) {
    document.cookie = 'googtrans=/en/' + lang + ';path=/;';
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=' + location.hostname + ';';
  }

  // iOS / Safari検出（Google Translate widgetが動かない環境）
  function needsFallback() {
    var ua = navigator.userAgent;
    if (/iP(hone|ad|od)/.test(ua)) return true;
    if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua)) return true;
    return false;
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

  var MANUAL_LANG_KEY = 'gt_manual_lang';

  // widget読み込み後にプログラムで言語を選択（リロード不要で即翻訳）
  // また、ユーザーの手動切り替えを検知してlocalStorageに保存
  function autoSelectLanguage(lang) {
    var programmatic = true;
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(interval);
        // プログラム操作完了後、手動変更のリスナーを設定
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
  }

  // 手動選択なしの場合のみリスナー設定（自動翻訳不要時）
  function watchManualChange() {
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      if (select) {
        clearInterval(interval);
        select.addEventListener('change', function() {
          localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
        });
      }
      if (++attempts > 50) clearInterval(interval);
    }, 100);
  }

  // Safari/iOS用フォールバックプルダウン
  function initFallback(container) {
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

    // 現在の選択言語を反映
    var currentLang = localStorage.getItem(MANUAL_LANG_KEY) || detectLanguage() || '';
    if (currentLang) select.value = currentLang;

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

    // 自動翻訳: translate.goog内でなければリダイレクト
    var alreadyTranslated = location.hostname.indexOf('translate.goog') !== -1;
    var targetLang = localStorage.getItem(MANUAL_LANG_KEY) || detectLanguage();
    if (!alreadyTranslated && targetLang && targetLang !== 'en') {
      window.location.href = 'https://translate.google.com/translate?sl=en&tl=' + targetLang + '&u=' + encodeURIComponent(window.location.href);
    }
  }

  // DOMContentLoaded後にウィジェットを挿入
  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer.footer');
    if (!footer) return;

    // コンテナ作成
    var container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.margin = '12px 0';
    container.style.textAlign = 'center';

    // footer-disclaimer の前に挿入
    var disclaimer = footer.querySelector('.footer-disclaimer');
    if (disclaimer) {
      footer.insertBefore(container, disclaimer);
    } else {
      footer.appendChild(container);
    }

    // Safari/iOS → フォールバック、それ以外 → Google Translate widget
    if (needsFallback()) {
      initFallback(container);
    } else {
      // ユーザーが手動で言語を選んだ場合はそれを尊重
      var manualLang = localStorage.getItem(MANUAL_LANG_KEY);
      var browserLang = detectLanguage();

      if (manualLang) {
        // 手動選択済み: cookieだけ設定（autoSelectしない＝Google Translateが自分でcookieを読む）
        if (manualLang !== 'en') {
          setTranslateCookie(manualLang);
        }
        watchManualChange();
      } else if (browserLang) {
        // 初回: ブラウザ言語で自動翻訳
        setTranslateCookie(browserLang);
        autoSelectLanguage(browserLang);
      } else {
        watchManualChange();
      }

      // Google翻訳スクリプトをロード
      var script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }

    // CSS注入
    var style = document.createElement('style');
    style.textContent = [
      '/* フッター: "Powered by"テキスト非表示、selectプルダウンのみ表示 */',
      '#google_translate_element .goog-te-gadget { font-size: 0 !important; color: transparent !important; }',
      '#google_translate_element .goog-te-gadget > span { display: none !important; }',
      '#google_translate_element .goog-te-gadget a[href] { display: none !important; }',
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
