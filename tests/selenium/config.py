"""
config.py - Central configuration for the Selenium test suite.
All sensitive values are loaded from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── App URLs ──────────────────────────────────────────────────────────────────
BASE_URL        = os.getenv("BASE_URL", "https://se-project-bucw.onrender.com")
LOGIN_URL       = f"{BASE_URL}/login"
DASHBOARD_URL   = f"{BASE_URL}/"          # URL user lands on after successful login

# ── Test Credentials ──────────────────────────────────────────────────────────
VALID_EMAIL     = os.getenv("VALID_EMAIL",    "testuser@example.com")
VALID_PASSWORD  = os.getenv("VALID_PASSWORD", "Test@1234")
INVALID_EMAIL   = os.getenv("INVALID_EMAIL",  "wrong@example.com")
INVALID_PASS    = os.getenv("INVALID_PASS",   "WrongPass!")

# ── WebDriver Settings ────────────────────────────────────────────────────────
HEADLESS        = os.getenv("HEADLESS", "true").lower() == "true"   # headless in CI
IMPLICIT_WAIT   = 0          # seconds  (we use explicit waits)
PAGE_LOAD_TIMEOUT = 30       # seconds
EXPLICIT_WAIT   = 15         # seconds  (max wait for elements)

# ── Browser ───────────────────────────────────────────────────────────────────
BROWSER = os.getenv("BROWSER", "chrome")   # only chrome is supported right now
