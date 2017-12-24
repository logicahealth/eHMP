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
  wait.until { infiniate_scroll('[data-appletid=problems] .data-grid table tbody') }
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

  path =  "//div[@data-appletid='problems']//table/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = TableContainer.instance.get_elements("Rows - Active Problems Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user sorts the Problem grid by "([^"]*)"$/) do |arg1|
  label = "#{arg1} Header"
  expect(@active_problems.perform_action(label)).to eq(true)
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

Then(/^the Problems Applet contains data rows$/) do
  compare_item_counts("[data-appletid=problems] .data-grid table tr")
end

When(/^user refreshes Problems Applet$/) do
  applet_refresh_action("problems")
end

Then(/^the message on the Problems Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("problems", message_text)
end

Given(/^the user navigates to expanded problems applet$/) do
  ehmp = PobProblemsApplet.new
  navigate_in_ehmp "#/patient/problems-full"
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { ehmp.applet_loaded? }

  expect(ehmp.menu.fld_screen_name.text.upcase).to eq('PROBLEMS')

  @active_problems.clear_filter('grid-filter-button-problems')
end

Given(/^the problems applet displays at least (\d+) problem rows$/) do |num_required_problems|
  @ehmp = PobProblemsApplet.new

  @ehmp.wait_for_tbl_problems
  expect(@ehmp.tbl_problems.length).to be > num_required_problems.to_i, "Prerequisite for test: num problems >= #{num_required_problems}. Currently there are only #{@ehmp.tbl_problems.length}"
end

Given(/^the user notes the first (\d+) problems$/) do |num_problems|
  @ehmp = PobProblemsApplet.new
  @titles = @ehmp.summary_problem_name
  expect(@titles.length).to be > num_problems.to_i
  @titles = @titles[0..num_problems.to_i - 1]
end

Then(/^the user can step through the problems using the next button$/) do
  @ehmp = PobProblemsApplet.new
  modal_element = ModalElements.new
  @titles.each do |modal_title|
    #expect(@uc.perform_verification("Modal Title", modal_title)).to eq(true), "Expected title to be #{modal_title}"
    p "title from UI = "
    p modal_element.fld_modal_title.text
    p "stored titles = "
    p modal_title
    expect(modal_element.fld_modal_title.text.upcase).to have_text(modal_title.upcase), "Expected title to be #{modal_title}"
    @ehmp.btn_next.click
  end
end

Then(/^the user can step through the problems using the previous button$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.btn_previous.click
  @titles.reverse.each  do |modal_title| 
    #expect(@uc.perform_verification("Modal Title", val)).to eq(true), "Expected title to be #{val}"
    expect(modal_element.fld_modal_title.text.upcase).to have_text(modal_title.upcase), "Expected title to be #{modal_title}"
    @ehmp.btn_previous.click
  end
end

