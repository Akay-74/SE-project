"""
test_login.py - Pytest test suite for the RoomBooking login page.

Test cases:
    TC-01  Successful login with valid credentials
    TC-02  Login with invalid password
    TC-03  Login with invalid / unregistered email
    TC-04  Login with empty email field
    TC-05  Login with empty password field
    TC-06  Login with both fields empty
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

from config import (
    VALID_EMAIL, VALID_PASSWORD,
    INVALID_EMAIL, INVALID_PASS,
    HEADLESS, DASHBOARD_URL
)
from login_page import LoginPage


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def driver():
    """
    Spin up a Chrome WebDriver for each test function.
    Yields the driver instance, then quits after the test completes.
    """
    options = Options()

    if HEADLESS:
        options.add_argument("--headless=new")          # new headless mode (Chrome 112+)

    # Flags required for CI / containerised environments
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")

    drv = webdriver.Chrome(options=options)
    drv.set_page_load_timeout(30)

    yield drv

    drv.quit()


@pytest.fixture()
def login_page(driver):
    """Open the login page and return a ready LoginPage object."""
    page = LoginPage(driver)
    page.open()
    return page


# ── Test Cases ────────────────────────────────────────────────────────────────

class TestLogin:

    # TC-01 ─────────────────────────────────────────────────────────────────
    def test_successful_login_with_valid_credentials(self, login_page):
        """
        GIVEN valid email and password
        WHEN  the user submits the login form
        THEN  they are redirected away from /login (to the home dashboard)
        """
        login_page.login(VALID_EMAIL, VALID_PASSWORD)
        login_page.wait_for_redirect_away_from_login()

        assert not login_page.is_on_login_page(), (
            f"Expected redirect away from /login but URL is still: "
            f"{login_page.driver.current_url}"
        )

    # TC-02 ─────────────────────────────────────────────────────────────────
    def test_login_with_invalid_password(self, login_page):
        """
        GIVEN a registered email but wrong password
        WHEN  the user submits the form
        THEN  an error message is displayed and user stays on /login
        """
        login_page.login(VALID_EMAIL, INVALID_PASS)

        error = login_page.get_error_message()
        assert error, "Expected an error message but none was shown."
        assert login_page.is_on_login_page(), "User should stay on the login page."

    # TC-03 ─────────────────────────────────────────────────────────────────
    def test_login_with_invalid_email(self, login_page):
        """
        GIVEN an unregistered email and any password
        WHEN  the user submits the form
        THEN  an error message is displayed and user stays on /login
        """
        login_page.login(INVALID_EMAIL, VALID_PASSWORD)

        error = login_page.get_error_message()
        assert error, "Expected an error message but none was shown."
        assert login_page.is_on_login_page(), "User should stay on the login page."

    # TC-04 ─────────────────────────────────────────────────────────────────
    def test_login_with_empty_email(self, login_page, driver):
        """
        GIVEN an empty email field and a valid password
        WHEN  the user tries to submit
        THEN  native HTML5 validation prevents submission and we stay on /login
        """
        login_page.enter_password(VALID_PASSWORD).click_submit()

        # The browser blocks submission via HTML5 required attribute.
        assert login_page.is_on_login_page(), (
            "Form should not submit with empty email field."
        )
        # No API error banner is expected — validation is client-side.
        with pytest.raises(TimeoutException):
            login_page.get_error_message()   # should NOT appear

    # TC-05 ─────────────────────────────────────────────────────────────────
    def test_login_with_empty_password(self, login_page):
        """
        GIVEN a valid email but empty password field
        WHEN  the user tries to submit
        THEN  native HTML5 validation prevents submission and we stay on /login
        """
        login_page.enter_email(VALID_EMAIL).click_submit()

        assert login_page.is_on_login_page(), (
            "Form should not submit with empty password field."
        )
        with pytest.raises(TimeoutException):
            login_page.get_error_message()   # no server error expected

    # TC-06 ─────────────────────────────────────────────────────────────────
    def test_login_with_both_fields_empty(self, login_page):
        """
        GIVEN both email and password fields are empty
        WHEN  the user clicks the submit button
        THEN  native HTML5 validation prevents submission and we stay on /login
        """
        login_page.click_submit()

        assert login_page.is_on_login_page(), (
            "Form should not submit when both fields are empty."
        )
        with pytest.raises(TimeoutException):
            login_page.get_error_message()
