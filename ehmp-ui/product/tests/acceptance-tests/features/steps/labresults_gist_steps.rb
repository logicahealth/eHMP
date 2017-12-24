class LabResultsGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'lab_results_grid'
    add_toolbar_buttons
    add_verify(CucumberLabel.new("Numeric Lab Results Gist Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .panel-title"))
    add_verify(CucumberLabel.new("Numeric Lab Results Ten Check"), VerifyContainsText.new, AccessHtmlElement.new(:id, "labs_problem_name_Leukocytes__Blood_Quantitative"))
    add_verify(CucumberLabel.new("Numeric Lab Results Five Check"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='TRIGLYCERIDE'] .problem-name"))

    # applet buttons
    add_action(CucumberLabel.new('refresh'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] button.applet-refresh-button'))
    add_action(CucumberLabel.new('info'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] button.applet-help-button'))
    add_action(CucumberLabel.new('filter'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] .applet-filter-button'))
    add_action(CucumberLabel.new('expand'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] button.applet-maximize-button'))

    add_verify(CucumberLabel.new('header - Lab Test'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .descriptionClass"))
    add_verify(CucumberLabel.new('header - Result'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .resultClass"))
    add_verify(CucumberLabel.new('header - Last'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .ageClass"))
    
    add_action(CucumberLabel.new('Lab Test Header Sort'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] [sortkey=shortName]"))
    
    add_verify(CucumberLabel.new('Empty Row'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] p.color-grey-darkest'))
      
    # Numeric Lab Results Gist Rows
    rows = AccessHtmlElement.new(:css, "[appletid='lab_results_grid'] .data-grid [class='gist-item table-row-toolbar']")
    add_verify(CucumberLabel.new('Numeric Lab Result Gist Rows'), VerifyXpathCount.new(rows), rows)
    
    # Numeric Lab Results Gist Rows
    rows = AccessHtmlElement.new(:css, '[appletid=lab_results_grid] .data-grid table tbody tr.selectable')
    add_verify(CucumberLabel.new('Numeric Lab Result Rows'), VerifyXpathCount.new(rows), rows)
    
    # First Numberic Lab result Row
    add_action(CucumberLabel.new('First Numeric Lab Result Gist Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='HDL'] .problem-name"))
  end

  def applet_grid_loaded
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, '[data-appletid=lab_results_grid] .grid-container div.gist-item').length > 0
  rescue => e 
    p e
    false
  end
end

Then(/^user sees Numeric Lab Results Gist$/) do
  vg = LabResultsGist.instance
  expect(vg.wait_until_action_element_visible("Numeric Lab Results Gist Title", 60)).to be_true
  expect(vg.perform_verification("Numeric Lab Results Gist Title", "LAB RESULTS")).to be_true
end

Then(/^verify the Numeric Lab Results Gist title is "([^"]*)"$/) do |title|
  numeric_lab_results_gist = LabResultsGist.instance
  expect(numeric_lab_results_gist.perform_verification("Numeric Lab Results Gist Title", title)).to be_true
end

Then(/^verify the Numeric Lab Results Gist applet has the following headers$/) do |table|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  
  numeric_lab_results_gist = LabResultsGist.instance
  wait.until { numeric_lab_results_gist.applet_grid_loaded }
  # table.rows.each do | row |
  #   expect(numeric_lab_results_gist.perform_verification("header - #{row[0]}", row[0])).to eq(true), "Expected applet to have header #{row[0]}"
  # end
  @ehmp = PobLabResults.new
  table.rows.each do |header|
    @ehmp.fld_lab_results_modal_header.text.include? "#{header}"
  end
end

Then(/^the Numeric Lab Results Gist applet displays data$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_until_applet_gist_loaded
end

Then(/^the Lab Test column contains data$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_lab_test_column_data
  expect(ehmp.fld_lab_test_column_data.length).to be > (0), "Expected Lab Test column to be populated"
end

Then(/^the Result column contains data$/) do
  
  css = "[data-appletid='lab_results_grid'] [class='table-cell border-vertical']"

  driver = TestSupport.driver
  gist_items = driver.find_elements(:css, css)
  # check 
  expect(gist_items.length).to be > (0), "Expected Result column to be populated"
end

Then(/^the Last \(Age\) column in in the correct format$/) do
  css = "[data-appletid='lab_results_grid'] .gist-item [data-cell-instanceid^='encounter_count']"

  driver = TestSupport.driver
  gist_items = driver.find_elements(:css, css)
  # check
  text = gist_items[0].text.strip
  expect(text.length).to be > 0
  age_format = /\d\w/
  expect(age_format.match(text)).to_not be_nil, "Expected age (#{text}) to be in format #{age_format}"
end

Then(/^the Lab Test has a chart$/) do
  css = '#lab_results_grid-observations-gist-items div.gistItemInner .chartArea'

  driver = TestSupport.driver
  charts = driver.find_elements(:css, css)
  rows = driver.find_elements(:css, '#lab_results_grid-observations-gist-items div.gistItemInner')
  expect(charts.length).to eq(rows.length), "Expected every row to contain a chart"

end

When(/^the Numeric Lab Results Gist Applet contains data rows$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_until_applet_gist_loaded
end

When(/^user refreshes Numeric Lab Results Gist Applet$/) do
  applet_refresh_action("lab_results_grid")
end

Then(/^the message on the Numeric Lab Results Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("lab_results_grid", message_text)
end

When(/^the user sorts the Lab Results Gist by "([^"]*)"$/) do |arg1|
  lab_gist = LabResultsGist.instance
  label = "#{arg1} Header Sort"
  expect(lab_gist.perform_action(label)).to eq(true)
end

Then(/^the Lab Results Gist is sorted in alphabetic order based on Lab Test$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_for_fld_lab_test_column_data
  column_values = @ehmp.fld_lab_test_column_data
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Lab Results Gist is sorted in reverse alphabetic order based on Lab Test$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_for_fld_lab_test_column_data
  column_values = @ehmp.fld_lab_test_column_data
  expect(column_values.length).to be > 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^the user views the first Numeric Lab Result Gist detail view$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_for_fld_lab_names
  expect(@ehmp.fld_lab_names.length).to be > 0
  @ehmp.fld_lab_names[0].click
  @ehmp = ModalElements.new
  @ehmp.wait_for_fld_modal_title
  expect(@ehmp).to have_fld_modal_title
end

Then(/^the modal's title contains first Numeric Lab Result name$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_for_fld_lab_names
  expect(@ehmp.fld_lab_names.length).to be > 0
  title = @ehmp.fld_lab_names[0].text.strip
  @ehmp = ModalElements.new
  @ehmp.wait_until_fld_modal_title_visible
  expect(@ehmp.fld_modal_title).to have_text(title)
end

Then(/^Lab Test column is sorted in manual order in Numeric Lab Results Gist$/) do
  ehmp = PobNumericLabApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)

  ehmp.wait_for_fld_lab_names
  expect(@manual_numeric_gist_order).to_not be_nil, "Expected manual sort order to be saved in a previous step"
  wait.until { (ehmp.gist_numeric_lab_names_only <=> @manual_numeric_gist_order) == 0 }
  expect(ehmp.gist_numeric_lab_names_only).to eq(@manual_numeric_gist_order)
end

When(/^user clicks on the column header Lab Test in Numeric Lab Results Gist$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_gist_header_lab_test
  expect(ehmp).to have_gist_header_lab_test
  ehmp.gist_header_lab_test.click
end

Then(/^Lab Test column is sorted in default order in Numeric Lab Results Gist$/) do
  ehmp = PobNumericLabApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  ehmp.wait_for_fld_lab_names
  expect(@default_numeric_lab_gist_order).to_not be_nil, "Expected default lab result order to be saved in a previous step"
  wait.until { (ehmp.gist_numeric_lab_names_only <=> @default_numeric_lab_gist_order) == 0 }

  expect(ehmp.gist_numeric_lab_names_only).to eq(@default_numeric_lab_gist_order)
end

Then(/^Lab Test column is sorted in ascending order in Numeric Lab Results Gist$/) do
  ehmp = PobNumericLabApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  ehmp.wait_for_fld_lab_names
  expected_sort_result = ehmp.gist_numeric_lab_names_only.sort { |x, y| x.downcase <=> y.downcase }
  begin
    wait.until { ehmp.gist_numeric_lab_names_only == expected_sort_result }
  ensure
    expect(ehmp.gist_numeric_lab_names_only).to eq(expected_sort_result)
  end
end

Then(/^Lab Test column is sorted in descending order in Numeric Lab Results Gist$/) do
  ehmp = PobNumericLabApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  ehmp.wait_for_fld_lab_names
  expected_sort_result = ehmp.gist_numeric_lab_names_only.sort { |x, y| y.downcase <=> x.downcase }
  begin
    wait.until { ehmp.gist_numeric_lab_names_only == expected_sort_result }
  ensure
    expect(ehmp.gist_numeric_lab_names_only).to eq(expected_sort_result)
  end
end

Then(/^a quickview displays a numeric lab table with expected headers$/) do | expected_headers |
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.verify_popover_table ehmp
  QuickMenuActions.verify_popover_table_headers ehmp, expected_headers
end

Then(/^verify the Numeric Lab Results Gist applet has the buttons Refresh, Help, Filter Toggle and Expand$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_filter_toggle
  ehmp.wait_for_btn_applet_expand_view

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_expand_view 
end
