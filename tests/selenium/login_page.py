"""
login_page.py - Page Object Model for the Login page.

Encapsulates all locators and interactions for the login page,
keeping test logic cleanly separated from DOM details.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from config import EXPLICIT_WAIT, LOGIN_URL


class LoginPage:
    """
    Page Object representing the Login page at /login.

    Element IDs come directly from Login.jsx:
        - Email input   → id="email"
        - Password input→ id="password"
        - Submit button → type="submit"  (inside form.auth-form)
        - Error banner  → class="error-message"
    """

    # ── Locators ──────────────────────────────────────────────────────────────
    EMAIL_INPUT    = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    SUBMIT_BUTTON  = (By.CSS_SELECTOR, "form.auth-form button[type='submit']")
    ERROR_MESSAGE  = (By.CSS_SELECTOR, ".error-message")
    GOOGLE_BUTTON  = (By.CSS_SELECTOR, "button.btn-google")
    SIGNUP_LINK    = (By.CSS_SELECTOR, "a.auth-link")

    def __init__(self, driver):
        self.driver = driver
        self.wait   = WebDriverWait(driver, EXPLICIT_WAIT)

    # ── Navigation ────────────────────────────────────────────────────────────
    def open(self):
        """Navigate to the login page and wait until the email field is ready."""
        self.driver.get(LOGIN_URL)
        self.wait.until(EC.visibility_of_element_located(self.EMAIL_INPUT))
        return self

    # ── Actions ───────────────────────────────────────────────────────────────
    def enter_email(self, email: str):
        field = self.wait.until(EC.element_to_be_clickable(self.EMAIL_INPUT))
        field.clear()
        field.send_keys(email)
        return self

    def enter_password(self, password: str):
        field = self.wait.until(EC.element_to_be_clickable(self.PASSWORD_INPUT))
        field.clear()
        field.send_keys(password)
        return self

    def click_submit(self):
        btn = self.wait.until(EC.element_to_be_clickable(self.SUBMIT_BUTTON))
        btn.click()
        return self

    def login(self, email: str, password: str):
        """Convenience method: fill both fields and submit."""
        return (
            self.enter_email(email)
                .enter_password(password)
                .click_submit()
        )

    # ── Assertions / Queries ──────────────────────────────────────────────────
    def get_error_message(self) -> str:
        """
        Wait for the error banner to appear and return its text.
        Raises TimeoutException if no error appears within EXPLICIT_WAIT seconds.
        """
        element = self.wait.until(EC.visibility_of_element_located(self.ERROR_MESSAGE))
        return element.text.strip()

    def is_on_login_page(self) -> bool:
        """Check that we are still on the /login path (login did not succeed)."""
        return "/login" in self.driver.current_url

    def wait_for_redirect_away_from_login(self):
        """Wait until the URL no longer contains /login (successful login)."""
        self.wait.until(lambda d: "/login" not in d.current_url)

    def is_submit_disabled(self) -> bool:
        btn = self.driver.find_element(*self.SUBMIT_BUTTON)
        return not btn.is_enabled()
