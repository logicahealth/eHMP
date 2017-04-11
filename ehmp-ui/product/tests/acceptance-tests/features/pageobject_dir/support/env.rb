require 'rspec'
require 'rubocop'
require 'capybara'
require 'site_prism'
require 'selenium-webdriver'
require 'capybara/rspec/matchers'
require_relative '../../steps/helper/DefaultLogin'

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
  RecordTime.record_start_time
  TestSupport.increment_counter

  Capybara.page.driver.browser.manage.window.resize_to(1280, 4800)

  Capybara.use_default_driver
  scenario.source_tag_names.each do |tag|
    driver_name = tag.sub(/^@/, '').to_sym
    Capybara.current_driver = driver_name if Capybara.drivers.key?(driver_name)
    # p "bob TestBrowser=  #{bob.browser}"
    SeleniumCommand.reuse_driver(bob.browser)
    # p "Before Scenario: #{Capybara.current_driver}"
  end

  if scenario.test_steps.map(&:name).index { |s| s =~ DefaultLogin.login_step } and !DefaultLogin.logged_in
    p 'Logging in with non-Standard user!!!'

  elsif !scenario.test_steps.map(&:name).index { |s| s =~ DefaultLogin.login_step } and !DefaultLogin.logged_in
    p 'Logging in with Standard user!!!'
    step 'user is logged into eHMP-UI'

  elsif !scenario.test_steps.map(&:name).index { |s| s =~ DefaultLogin.login_step } and DefaultLogin.logged_in
    p 'User is already Logged in with Standard user!!!'

  elsif scenario.test_steps.map(&:name).index { |s| s =~ DefaultLogin.login_step } and DefaultLogin.logged_in
    step 'POB log me out'
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

  p "scenario tags: #{scenario.source_tag_names}"
  RecordTime.save_test_duration(scenario.source_tag_names, scenario.failed?, temp_location)

  if scenario.failed?
    DefaultLogin.logged_in = false

    screenshot_name = "#{temp_location}".gsub! ':', '_'
    take_screenshot screenshot_name

    p "On url: #{TestSupport.driver.current_url}"
    # p "logs through selenium: #{TestSupport.print_logs}"
    console_logs = Capybara.page.driver.browser.manage.logs.get("browser")
    p "Browser JS Console Logs:--***************-- #{console_logs.to_s}--***************--"
    
    TestSupport.driver.execute_script("ADK.Checks._checkCollection.reset();")
    close_any_open_modals #if scenario.source_tag_names.include? '@modal_test'
    step 'POB log me out'
  elsif scenario.test_steps.map(&:name).index { |s| s =~ DefaultLogin.login_step } and DefaultLogin.logged_in
    TestSupport.driver.execute_script("ADK.Checks._checkCollection.reset();")
    close_any_open_modals #if scenario.source_tag_names.include? '@modal_test'
    step 'POB log me out'
  elsif DefaultLogin.logged_in
    
    TestSupport.driver.execute_script("ADK.Checks._checkCollection.reset();")
    close_any_open_modals #if scenario.source_tag_names.include? '@modal_test'
    TestSupport.driver.execute_script("ADK.Messaging.getChannel('toolbar').trigger('close:toolbar');")
    step 'Navigate to Patient Search Screen'
  end
end
