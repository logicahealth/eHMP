require "selenium-webdriver"
require 'rspec/expectations'
require 'httparty'

World(RSpec::Matchers)

When(/^I navigate to the cdsdashboard base url plus "(.*?)"$/) do |url|
  @driver = Selenium::WebDriver.for :phantomjs
  @driver.get "#{ENV['CDSDASHBOARD_IP']}/#{url}"
end

Then(/^the VA logo is present$/) do
  sleep 10
  logo = @driver.find_element(:xpath, "/html/body/div[3]/div/table/tbody/tr[2]/td[2]/div/table/tbody/tr/td[2]/table/tbody/tr[1]/td/img")
  src = logo.attribute("src")
  expect(src).to include "Seal_of_the_U.S._Department_of_Veterans_Affairs.png"
end
