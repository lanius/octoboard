# -*- coding: utf-8 -*-

import os
import sys
import unittest

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

here = os.path.abspath(os.path.dirname(__file__))
project_root = os.path.join(here, '..')

extension_root = os.path.join(project_root, 'extension')
chromedriver_exe = os.path.join(project_root, 'bin', 'chromedriver.exe')

if not os.path.exists(chromedriver_exe):
    sys.exit('ERROR: ChromeDriver executable is not found.')


class OctoboardTestCase(unittest.TestCase):

    def setUp(self):
        caps = webdriver.DesiredCapabilities.CHROME
        caps['chrome.switches'] = [('--load-extension=' + extension_root)]
        self.browser = webdriver.Chrome(chromedriver_exe)

        self.browser.get('https://github.com/lanius')
        self.body = self.browser.find_element_by_tag_name('body')

    def tearDown(self):
        self.browser.close()

    def jump_to_next(self):
        self.body.send_keys('j')

    def jump_to_previous(self):
        self.body.send_keys('k')

    def get_cursored_element(self):
        try:
            return self.body.find_element_by_class_name('gdbd-cursor')
        except NoSuchElementException:
            return None

    def test_jump_to_next(self):
        self.jump_to_next()
        cursored_element = self.get_cursored_element()
        self.assertTrue(cursored_element)

    def test_jump_to_previous(self):
        self.jump_to_next()
        element_id = self.get_cursored_element().id

        self.jump_to_next()
        self.jump_to_previous()
        self.assertEqual(self.get_cursored_element().id, element_id)


if __name__ == '__main__':
    unittest.main()
