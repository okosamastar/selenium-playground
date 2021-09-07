from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import os
import time

URL_BASE = "https://www.amazon.co.jp/dp/{asin}"
PRICE_ELM_ID = "priceblock_ourprice"
CART_ELM_ID = "add-to-cart-button"
CHECKOUT_ELM_ID = "hlb-ptc-btn-native"
ALT_CHECKOUT_ELM_ID = "a-autoid-0-announce"
EMAIL_ELM_ID = "ap_email"
PASSWORD_ELM_ID = "ap_password"
REMEMBERME_ELM_NAME = "rememberMe"
SHIP_ELM_ID = "ship-to-this-address"
ORDER_ELM_ID = "placeYourOrder"

LOGIN_EMAIL = 'okosama.star.inc@gmail.com'
LOGIN_PASSWORD = 'dawn2196'

# ご自身の監視したい商品のASINと価格に書き換えてください
ITEM_LIST = [
    # ["ASINを文字列で入力", 価格を整数で入力]
    ["B07F76K6FJ", 54978],  # Playstation5
    # ["B08GGF7M7B", 43978],  # Playstation5 Digital Edition
]


def _main():
    print('start scraping')
    driver = open_chrome()
    for item in ITEM_LIST:
        print('fetch price')
        price = check_item(driver, item)
        print(price)
        if price != "" and int(price) <= item[1]:
            proceed_checkout(driver)
        time.sleep(2)
    driver.quit()


def open_chrome():
    options = webdriver.ChromeOptions()
    options.add_argument('user-data-dir=/tmp/chrome_profiles')
    # options.add_argument('--headless') #headlessで動作させる場合はこの行を有効に

    # driver_path = './chromedriver'  # 必要に応じてパスの書き換え
    # driver = webdriver.Chrome(driver_path, options=options)
    driver = webdriver.Remote(
        command_executor=os.environ['SELENIUM_URL'],
        desired_capabilities=DesiredCapabilities.CHROME.copy(),
        options=options)
    width = 0
    height = 0
    driver.set_window_position(height, width)
    driver.set_window_size(1280, 1000)
    return driver


def check_item(driver, item):
    url = URL_BASE.format(asin=item[0])
    driver.get(url)
    price = get_price(driver)
    return price


def proceed_checkout(driver):
    print('checkout')
    add_to_cart(driver)
    time.sleep(2)
    driver = goto_checkout(driver)
    time.sleep(2)
    driver = input_id(driver)
    time.sleep(2)
    driver = input_passwd(driver)
    time.sleep(2)
    driver = select_address(driver)
    time.sleep(2)
    # place_order(driver)


def get_price(driver):
    price = ""

    try:
        element = driver.find_element_by_id(PRICE_ELM_ID)
        priceRaw = element.text.replace(',', '').replace('￥', '').replace(
            '¥', '').replace(' ', '').replace('.00', '')
        price = int(priceRaw)
    except NoSuchElementException:
        print("couldn't get price")

    return price


def add_to_cart(driver):
    try:
        element = driver.find_element_by_id(CART_ELM_ID)
        element.click()
    except NoSuchElementException:
        pass
    return driver


def goto_checkout(driver):
    try:
        element = driver.find_element_by_id(CHECKOUT_ELM_ID)
        element.click()
    except NoSuchElementException:
        try:
            element = driver.find_element_by_id(ALT_CHECKOUT_ELM_ID)
            element.click()
        except NoSuchElementException:
            pass
    return driver


def input_id(driver):
    try:
        element = driver.find_element_by_id(EMAIL_ELM_ID)
        element.send_keys(LOGIN_EMAIL)
        element.submit()
    except NoSuchElementException:
        print("couldn't login")
    return driver


def input_passwd(driver):
    try:
        # element = driver.find_elements_by_name(name)
        driver.find_element_by_xpath("//input[@name='" + REMEMBERME_ELM_NAME +
                                     "']").click()
        # element.click()
        # return driver
    except NoSuchElementException:
        print("couldn't find checkbox")
        pass

    try:
        element = driver.find_element_by_id(PASSWORD_ELM_ID)
        element.send_keys(LOGIN_PASSWORD)
        element.submit()
    except NoSuchElementException:
        print("couldn't input passwd")
    return driver


def select_address(driver):
    try:
        element = driver.find_element_by_class_name(SHIP_ELM_ID)
        element.click()
    except NoSuchElementException:
        print("couldn't find ship to this address")
        # pass
    return driver


def place_order(driver):
    try:
        element = driver.find_element_by_id(ORDER_ELM_ID)
        element.click()
        return driver
    except NoSuchElementException:
        print("couldn't find place order button")
        pass


if __name__ == "__main__":
    print('start')
    _main()