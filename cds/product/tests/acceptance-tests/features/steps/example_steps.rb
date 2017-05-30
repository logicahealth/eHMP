require "selenium-webdriver"
require 'rspec/expectations'

World(RSpec::Matchers)

Given(/^X$/) do
  true
end

When(/^Y$/) do
  true
end

Then(/^Z$/) do
  true
end

Given(/^that we have a browser available$/) do
  #@driver = Selenium::WebDriver.for :firefox

  @driver = Selenium::WebDriver.for :phantomjs

  @driver.manage.timeouts.implicit_wait = 60
end

When(/^I visit "(.*?)"$/) do |url|
  @driver.get(url)
end

When(/^I click on "(.*?)" on the bottom left navigation bar$/) do |section|
  # When we develop our frontend app, we will have elements indexed by id, so we can do:
  # @driver.find_element(:id, "my-element").click
  # @driver.find_element(:id, "my-input-element").send_keys "Stuff I type in"

  if section == "ABOUT"
    @driver.find_element(:xpath, "/html/body/div[2]/div/div[1]/div[1]/div/div/div[1]/ul/li[1]/a").click
  end
end

Then(/^should see the text "(.*?)"$/) do |text|
  expect(@driver.page_source).to include(text)
end

After do
  unless @driver.nil?
    @driver.close
  end
end
