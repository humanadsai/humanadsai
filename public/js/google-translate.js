// Google翻訳ウィジェットを動的にフッターへ挿入
(function() {
  // 初期化関数（Google翻訳APIが呼び出す）
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ja,zh-CN,zh-TW,ko,es,fr,de,pt,ar,hi,th,vi',
      layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false
    }, 'google_translate_element');
  };

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

    // Google翻訳スクリプトをロード
    var script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // ダークテーマ用CSSを注入
    var style = document.createElement('style');
    style.textContent = [
      '/* Google翻訳ウィジェットのダークテーマ調整 */',
      '.goog-te-gadget { font-family: var(--font-mono) !important; font-size: 0.75rem !important; color: var(--color-text-muted) !important; }',
      '.goog-te-gadget-simple { background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; }',
      '.goog-te-gadget-simple a { color: var(--color-text-muted) !important; text-decoration: none !important; }',
      '.goog-te-gadget-simple a:hover { color: var(--color-primary) !important; }',
      '.goog-te-menu-value span { color: var(--color-text) !important; }',
      '/* ページ上部の翻訳バーを非表示 */',
      '.goog-te-banner-frame { display: none !important; }',
      'body { top: 0 !important; }'
    ].join('\n');
    document.head.appendChild(style);
  });
})();
