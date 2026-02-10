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
  // select(.goog-te-combo)を検出 → 値設定+changeイベント
  function autoSelectLanguage(lang) {
    var programmatic = true;
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
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
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // CSS注入
    var style = document.createElement('style');
    style.textContent = [
      '/* フッター: "Powered by"テキスト非表示、widget操作部のみ表示 */',
      '#google_translate_element .goog-te-gadget { font-size: 0 !important; color: transparent !important; }',
      '#google_translate_element .goog-te-gadget > span { display: none !important; }',
      '/* HORIZONTAL layout: selectプルダウン */',
      '#google_translate_element select.goog-te-combo { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text) !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; }',
      '/* SIMPLE layout: リンク形式ウィジェット（Safari等） */',
      '#google_translate_element .goog-te-gadget-simple { font-size: 0.75rem !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; display: inline-block !important; }',
      '#google_translate_element .goog-te-gadget-simple a { font-size: 0.75rem !important; color: var(--color-text-muted) !important; text-decoration: none !important; }',
      '#google_translate_element .goog-te-gadget-simple .goog-te-menu-value span { color: var(--color-text) !important; }',
      '#google_translate_element .goog-te-gadget-simple img { display: none !important; }',
      '/* ヘッダー: Google翻訳バー/通知を完全非表示 */',
      '.goog-te-banner-frame { display: none !important; }',
      '#goog-gt-tt, .goog-te-balloon-frame { display: none !important; }',
      'body > .skiptranslate { display: none !important; }',
      'body { top: 0 !important; }'
    ].join('\n');
    document.head.appendChild(style);
  });
})();
