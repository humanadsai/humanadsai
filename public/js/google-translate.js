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

  // widget読み込み後にプログラムで言語を選択（リロード不要で即翻訳）
  function autoSelectLanguage(lang) {
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(interval);
      }
      if (++attempts > 50) clearInterval(interval); // 5秒でタイムアウト
    }, 100);
  }

  // DOMContentLoaded後にウィジェットを挿入
  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer.footer');
    if (!footer) return;

    // ブラウザ言語が英語以外なら自動翻訳
    var browserLang = detectLanguage();
    if (browserLang) {
      setTranslateCookie(browserLang);  // 次回以降のため（毎回上書きで確実に）
      autoSelectLanguage(browserLang);  // widget初期化後に即座に言語選択
    }

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

    // Google翻訳スクリプトをロード
    var script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // ダークテーマ用CSSを注入
    var style = document.createElement('style');
    style.textContent = [
      '/* フッター: selectプルダウンのみ表示、ラベル/ロゴ非表示 */',
      '#google_translate_element .goog-te-gadget > span { display: none !important; }',
      '#google_translate_element .goog-te-gadget > div:last-child:not(:first-child) { display: none !important; }',
      '#google_translate_element .goog-te-gadget a[href] { display: none !important; }',
      '#google_translate_element select.goog-te-combo { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text) !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; }',
      '/* ヘッダー: Google翻訳バー/通知を完全非表示 */',
      '.goog-te-banner-frame { display: none !important; }',
      '#goog-gt-tt, .goog-te-balloon-frame { display: none !important; }',
      'body > .skiptranslate { display: none !important; }',
      'body { top: 0 !important; }'
    ].join('\n');
    document.head.appendChild(style);
  });
})();
