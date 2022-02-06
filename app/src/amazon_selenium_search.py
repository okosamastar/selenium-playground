from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import os
import sys
import time

URL_BASE = "https://www.amazon.co.jp/dp/{asin}"
PRICE_ELM_ID = "priceblock_ourprice"
CART_ELM_ID = "add-to-cart-button"
CHECKOUT_ELM_ID = "hlb-ptc-btn-native"
CHECKOUT_ALT1_ELM_ID = "a-autoid-0-announce"
CHECKOUT_ALT2_ELM_ID = "proceedToRetailCheckout"
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
    # ["B00C0838U4", 64000],
    # ["B08GGGBKRQ", 55000],  # Playstation5
    # ["B095HKG74J", 64000],
    # ["B091D2HGKP", 64000],
    # ["B091D2959B", 64000],
    ["B09CTLPY23", 64000],
    # ["B08GGGCH3Y", 56000],
    ["B09CTQPQNV", 55000],
]


def _main():
    local_time = time.localtime()
    year = str(local_time.tm_year)
    month = str(local_time.tm_mon)
    date = str(local_time.tm_mday)
    hour = str(local_time.tm_hour)
    min = str(local_time.tm_min + 1)
    print('TIME: ', year + '.' + month + '.' + date, hour + ':' + min)
    driver = open_chrome()
    for item in ITEM_LIST:
        print('Product ID: ', item[0])
        price = check_item(driver, item)
        if price != "" and int(price) <= item[1]:
            proceed_checkout(driver)
    print('--------------------------')
    driver.quit()


def open_chrome():
    options = webdriver.ChromeOptions()
    options.add_argument('user-data-dir=/tmp/chrome_profiles')
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
    add_to_cart(driver)
    # time.sleep(2)
    driver = goto_checkout(driver)
    # time.sleep(2)
    driver = input_id(driver)
    # time.sleep(2)
    driver = input_passwd(driver)
    # time.sleep(2)
    driver = select_address(driver)
    # time.sleep(2)
    ordered = place_order(driver)

    if ordered is True:
        sys.exit(1)


def get_price(driver):
    price = ""

    try:
        element = driver.find_element_by_id(PRICE_ELM_ID)
        priceRaw = element.text.replace(',', '').replace('￥', '').replace(
            '¥', '').replace(' ', '').replace('.00', '')
        price = int(priceRaw)
        print(price)
    except NoSuchElementException:
        print("fail to find the price of product")

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
            element = driver.find_element_by_id(CHECKOUT_ALT1_ELM_ID)
            element.click()
        except NoSuchElementException:
            try:
                element = driver.find_element_by_xpath("//input[@name='" +
                                                       CHECKOUT_ALT2_ELM_ID +
                                                       "']")
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
        print("fail to find the login button")
    return driver


def input_passwd(driver):
    try:
        element = driver.find_element_by_xpath("//input[@name='" +
                                               REMEMBERME_ELM_NAME + "']")
        element.click()
    except NoSuchElementException:
        print("fail to find the checkbox")

    try:
        element = driver.find_element_by_id(PASSWORD_ELM_ID)
        element.send_keys(LOGIN_PASSWORD)
        element.submit()
    except NoSuchElementException:
        print("fail to find the passwd field")
    return driver


def select_address(driver):
    try:
        element = driver.find_element_by_class_name(SHIP_ELM_ID)
        element.click()
    except NoSuchElementException:
        print("fail to find the shipping field")
    return driver


def place_order(driver):
    try:
        element = driver.find_element_by_id(ORDER_ELM_ID)
        element.click()
        print("success!!")
        return True
    except NoSuchElementException:
        print("fail to find the order button")
        return False


if __name__ == "__main__":
    _main()
