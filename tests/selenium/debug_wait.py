from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)
driver.set_page_load_timeout(30)

driver.get("https://se-project-bucw.onrender.com/login")
time.sleep(2)

driver.find_element(By.ID, "email").send_keys("admin@kamra.com")
driver.find_element(By.ID, "password").send_keys("WrongPass123!@#")
driver.find_element(By.CSS_SELECTOR, "form.auth-form button[type='submit']").click()

time.sleep(5) # wait for error

driver.save_screenshot("error_screenshot.png")
print("Screenshot saved to error_screenshot.png")
with open("page_source.html", "w") as f:
    f.write(driver.page_source)

driver.quit()
