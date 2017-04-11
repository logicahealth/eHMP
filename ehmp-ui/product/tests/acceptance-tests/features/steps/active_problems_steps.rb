path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

# require 'conditions_gist_steps.rb'

Before do
  @active_problems = ActiveProblems.instance
  @active_problems_modal = ActiveProblemsModal.instance
end

Then(/^the Problems applet is titled "([^"]*)"$/) do |title|
  expect(@active_problems.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(@active_problems.perform_verification("Title", title)).to be_true
end

Then(/^the Problems applet contains buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@active_problems.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Problems applet displays$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @active_problems.applet_grid_loaded }
  sleep 2 # addign this because the applet dsplays and then appears to resort...test has already tried to move on and it screws things up
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-problems tbody') }
end

Then(/^Problem Detail Modal contains data$/) do |table|
  table.rows.each do | label |
    selector = "#{label[0]} label"
    expect(@active_problems_modal.perform_verification(selector, label[0])).to eq(true)
  end
end

When(/^the user filters the Problems Applet by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = TableContainer.instance.get_elements("Rows - Active Problems Applet").size
  expect(@active_problems.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Active Problems Applet").size }
end

Then(/^the problems table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//table[@id='data-grid-problems']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = TableContainer.instance.get_elements("Rows - Active Problems Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user sorts the Problem grid by "([^"]*)"$/) do |arg1|
  label = "#{arg1} Header"
  expect(@active_problems.perform_action(label)).to eq(true)
end

Then(/^the Problem grid is sorted in alphabetic order based on Description$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-problems', 1, true) }
end

Then(/^the Problem grid is sorted in alphabetic order based on Acuity$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-problems', 2, true) }
end

Then(/^the expanded Problem grid is sorted in alphabetic order based on Description$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-problems', 1, true) }
end

Then(/^the expanded Problem grid is sorted in alphabetic order based on Acuity$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-problems', 3, true) }
end

When(/^the user views a problem applet row's details$/) do
  expect(@active_problems.perform_action('First Grid Row')).to eq(true)
  expect(@active_problems.perform_action('Problem detail icon')).to eq(true)
  @uc.wait_until_action_element_visible("Modal", 15)
end

When(/^the user clicks the Problems Expand Button$/) do
  # html_action_element = 'Problems Expand Button'
  # driver = TestSupport.driver
  # navigation = Navigation.instance
  # navigation.wait_until_action_element_visible(html_action_element, 40)
  # expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
  expect(@active_problems.perform_action('Control - applet - Expand View')).to eq(true)

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @active_problems.applet_grid_loaded }

  @active_problems.clear_filter('grid-filter-button-problems')
end

Then(/^the Conditions Applet contains data rows$/) do
  compare_item_counts("#data-grid-problems tr")
end

When(/^user refreshes Conditions Applet$/) do
  applet_refresh_action("problems")
end

Then(/^the message on the Conditions Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("problems", message_text)
end

