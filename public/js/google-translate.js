// Google翻訳ウィジェットを動的にフッターへ挿入
(function() {
  // ブラウザ/OS言語を検出（en以外ならその言語で自動翻訳）
  function detectLanguage() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
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

  // widget検出: select(Chrome) または gadget-simple(Safari)
  function findWidget(cb) {
    var attempts = 0;
    var interval = setInterval(function() {
      var select = document.querySelector('.goog-te-combo');
      var simple = document.querySelector('.goog-te-gadget-simple');
      if (select || simple) {
        clearInterval(interval);
        cb(select, simple);
      }
      if (++attempts > 50) clearInterval(interval);
    }, 100);
  }

  // widget読み込み後にプログラムで言語を選択（リロード不要で即翻訳）
  function autoSelectLanguage(lang) {
    var programmatic = true;
    findWidget(function(select, simple) {
      if (select) {
        // Chrome: selectプルダウンを直接操作
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
        // Safari: cookie設定済みなのでページ遷移時に反映される
        // 初回はリロードで反映（SIMPLEレイアウトはプログラム操作が困難）
        if (document.cookie.indexOf('googtrans') !== -1) {
          // cookie設定済みだがまだ翻訳されていない場合、1回だけリロード
          var reloaded = sessionStorage.getItem('gt_reloaded');
          if (!reloaded) {
            sessionStorage.setItem('gt_reloaded', '1');
            location.reload();
            return;
          }
        }
        watchSimpleWidget(simple);
      }
    });
  }

  // 手動選択の監視（select版）
  function watchManualChange() {
    findWidget(function(select, simple) {
      if (select) {
        select.addEventListener('change', function() {
          localStorage.setItem(MANUAL_LANG_KEY, select.value || 'en');
        });
      } else if (simple) {
        watchSimpleWidget(simple);
      }
    });
  }

  // Safari SIMPLE widget: iframe内の言語選択を監視
  function watchSimpleWidget(simple) {
    // MutationObserverでgadget-simpleのテキスト変更を監視（言語切り替え検知）
    var observer = new MutationObserver(function() {
      var span = simple.querySelector('.goog-te-menu-value span:first-child');
      if (span) {
        var langText = span.textContent.trim();
        if (langText && langText !== 'Select Language') {
          // 言語名からコードに逆引き（英語表示名 → コード）
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

  // DOMContentLoaded後にウィジェットを挿入
  document.addEventListener('DOMContentLoaded', function() {
    var footer = document.querySelector('footer.footer');
    if (!footer) return;

    // ユーザーが手動で言語を選んだ場合はそれを尊重
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

    // footer-disclaimer の前に挿入
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
      '/* SIMPLE layout (Safari): リンク形式ウィジェット */',
      '#google_translate_element .goog-te-gadget .goog-te-gadget-simple { font-size: 0.75rem !important; background: var(--color-surface) !important; border: 1px solid var(--color-border) !important; border-radius: 6px !important; padding: 4px 8px !important; display: inline-block !important; }',
      '#google_translate_element .goog-te-gadget-simple a { color: var(--color-text-muted) !important; text-decoration: none !important; font-size: 0.75rem !important; display: inline !important; }',
      '#google_translate_element .goog-te-gadget-simple .goog-te-menu-value span { color: var(--color-text) !important; font-size: 0.75rem !important; }',
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
