require 'rspec'
require 'rubocop'
require 'capybara'
require 'site_prism'
require 'selenium-webdriver'
require 'capybara/rspec/matchers'

Capybara.default_wait_time = 15
Capybara.app_host = ENV.keys.include?('EHMPUI_IP') ? ENV['EHMPUI_IP'] : "https://IP        "

World(Capybara::DSL)
World(Capybara::RSpecMatchers)

btype = ENV['BTYPE'] || 'phantomjs'
bob = nil
case btype.downcase
when 'chrome'
  # puts '-----------------Chrome is Running--------------------'
  Capybara.default_driver = :selenium
  Capybara.register_driver :selenium do |app|
    bob = Capybara::Selenium::Driver.new(app, :browser => :chrome)
  end

when 'firefox'
  # puts '-----------------Firefox is Running--------------------'
  Capybara.default_driver = :selenium
  Capybara.register_driver :selenium do |app|
    custom_profile = Selenium::WebDriver::Firefox::Profile.new
    custom_profile["network.http.prompt-temp-redirect"] = false
    Capybara::Selenium::Driver.new(app, browser: :firefox, profile: custom_profile)
  end

else
  Capybara.default_driver = :selenium
  Capybara.register_driver :selenium do |app|
    client = Selenium::WebDriver::Remote::Http::Default.new
    client.timeout = 300 # instead of the default 60
    bob =  Capybara::Selenium::Driver.new(app, :browser => :phantomjs, desired_capabilities: { 'phantomjs.cli.args' => ['--ignore-ssl-errors=yes'] }, :http_client => client)
  end
end

Before do |scenario|
  # Capybara.current_session.driver.browser.manage.delete_all_cookies
  RecordTime.record_start_time
  TestSupport.increment_counter
  p 'Before: maximize'
  Capybara.page.driver.browser.manage.window.maximize
  p 'Before: use default driver'
  Capybara.use_default_driver
  scenario.source_tag_names.each do |tag|
    driver_name = tag.sub(/^@/, '').to_sym
    Capybara.current_driver = driver_name if Capybara.drivers.key?(driver_name)
    # p "bob TestBrowser=  #{bob.browser}"
    SeleniumCommand.reuse_driver(bob.browser)
    # p "Before Scenario: #{Capybara.current_driver}"
  end
end

After do |scenario|
  RecordTime.record_end_time
  temp_location = nil
  begin
    temp_location = scenario.location
  rescue NoMethodError
    temp_location = scenario.scenario_outline.location
  end

  if scenario.failed?
    screenshot_name = "#{temp_location}".gsub! ':', '_'
    take_screenshot screenshot_name
    # p "logs through selenium: #{TestSupport.print_logs}"
    console_logs = Capybara.page.driver.browser.manage.logs.get("browser")
    # if console_logs.to_s.include?('(Bad Request)')
    p "Browser JS Console Logs:--***************-- #{console_logs.to_s}--***************--"
    # end
  end #if

  p "scenario tags: #{scenario.source_tag_names}"
  close_any_open_modals #if scenario.source_tag_names.include? '@modal_test'
  RecordTime.save_test_duration(scenario.source_tag_names, scenario.failed?, temp_location)
  step 'POB log me out' unless @skip_login
end
