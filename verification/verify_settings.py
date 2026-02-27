from playwright.sync_api import sync_playwright

def verify_settings_widget():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock the backend response for get_items.php so we don't rely on DB
        page.route('**/backend/get_items.php', lambda route: route.fulfill(
            status=200,
            content_type='application/json',
            body='{"status":"success","data":[{"id":10,"nama_item":"Settings","deskripsi":"Pengaturan UI dan Grid alternatif.","gambar":"fa-sliders","tipe_item":"ui","is_active":1}]}'
        ))

        # Navigate to the PHP server
        try:
            page.goto("http://localhost:8000/index.php")
        except Exception as e:
            print(f"Error navigating to page: {e}")
            return

        # Wait for the page to load (initial state is login screen)
        page.wait_for_selector('#login-screen')

        # Bypass login by manually manipulating the DOM to show workspace
        # because actual login requires DB which might not be set up or populated in this env
        page.evaluate("""
            $('#login-screen').hide();
            $('#workspace-screen').show();
            $('#welcome-screen').show();
            // Trigger loadMasterItems again just in case it failed before mock was ready or something
            // But since we routed before goto, the initial loadMasterItems should work if it's called on document ready.
        """)

        # Wait for items to be populated in the welcome screen
        # The mock response returns one item: Settings
        try:
            page.wait_for_selector('.item-btn', state='visible', timeout=5000)
        except Exception:
             print("Timeout waiting for .item-btn. Trying to re-trigger loadMasterItems manually.")
             # Function loadMasterItems is defined inside $(document).ready scope in app.js, so it's not global.
             # We might need to rely on the initial load working.
             # Let's inspect if the mock was hit.
             pass

        # Check if the "Settings" item is present
        settings_btn = page.locator('.item-btn:has-text("Settings")')
        if settings_btn.count() > 0:
            print("Settings item found.")
            settings_btn.click()

            # Wait for widget to appear
            page.wait_for_selector('#widget-1', state='visible')

            # Verify content of Settings widget
            content = page.inner_text('#widget-1 .widget-content')
            # print(f"Widget Content Text: {content}")

            # Check for specific elements
            if page.locator('#widget-1-grid-size').is_visible():
                print("PASS: Grid Size slider found.")
            else:
                print("FAIL: Grid Size slider NOT found.")

            if page.locator('#widget-1-grid-opacity').is_visible():
                print("PASS: Grid Opacity slider found.")
            else:
                print("FAIL: Grid Opacity slider NOT found.")

            if page.locator('#widget-1-grid-color').is_visible():
                print("PASS: Grid Color picker found.")
            else:
                print("FAIL: Grid Color picker NOT found.")

            # Take screenshot of the result
            page.screenshot(path='verification/settings_widget_verification.png')
            print("Screenshot saved to verification/settings_widget_verification.png")

        else:
            print("Settings item NOT found on welcome screen.")
            # Debug: take screenshot of current state
            page.screenshot(path='verification/debug_failed_state.png')

        browser.close()

if __name__ == '__main__':
    verify_settings_widget()
