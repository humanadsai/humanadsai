from playwright.sync_api import sync_playwright
import time
import json

def main():
    console_errors = []
    page_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # Capture console errors
        def on_console(msg):
            if msg.type in ('error', 'warning'):
                console_errors.append({
                    'type': msg.type,
                    'text': msg.text,
                    'url': msg.location.get('url', '') if hasattr(msg, 'location') and msg.location else ''
                })

        # Capture page errors (uncaught exceptions)
        def on_page_error(error):
            page_errors.append(str(error))

        page.on('console', on_console)
        page.on('pageerror', on_page_error)

        page.goto('https://humanadsai.com/', wait_until='networkidle')

        # Wait 5 seconds after load
        time.sleep(5)

        # Get element text content
        selectors = [
            '#hero-proof-number',
            '#hero-proof-sub',
            '#showcase-total-earned',
            '#showcase-ai-budget',
            '#showcase-reward-range',
        ]

        element_values = {}
        for sel in selectors:
            el = page.query_selector(sel)
            if el:
                element_values[sel] = el.text_content()
            else:
                element_values[sel] = '[ELEMENT NOT FOUND]'

        # Screenshot hero section
        page.screenshot(
            path='/Users/hajimeataka/humanadsai/screenshots/homepage-hero-after-fix.png',
            full_page=False
        )

        browser.close()

    # Report
    print("=" * 60)
    print("CONSOLE ERRORS AND WARNINGS")
    print("=" * 60)
    if console_errors:
        for e in console_errors:
            print(f"  [{e['type'].upper()}] {e['text']}")
            if e['url']:
                print(f"    Source: {e['url']}")
    else:
        print("  None")

    print()
    print("=" * 60)
    print("PAGE ERRORS (uncaught exceptions)")
    print("=" * 60)
    if page_errors:
        for e in page_errors:
            print(f"  {e}")
    else:
        print("  None")

    print()
    print("=" * 60)
    print("ELEMENT VALUES")
    print("=" * 60)
    for sel, val in element_values.items():
        print(f"  {sel}: '{val}'")

if __name__ == '__main__':
    main()
