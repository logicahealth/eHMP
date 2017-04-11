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
    add_action(CucumberLabel.new('filter'), ClickAction.new, AccessHtmlElement.new(:id, 'grid-filter-button-lab_results_grid'))
    add_action(CucumberLabel.new('expand'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] button.applet-maximize-button'))

    add_verify(CucumberLabel.new('header - Lab Test'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .descriptionClass"))
    add_verify(CucumberLabel.new('header - Result'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .resultClass"))
    add_verify(CucumberLabel.new('header - Last'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='lab_results_grid'] .ageClass"))
    
    add_action(CucumberLabel.new('Lab Test Header Sort'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] [sortkey=shortName]"))
    
    add_verify(CucumberLabel.new('Empty Row'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] p.color-grey-darkest'))
      
    # Numeric Lab Results Gist Rows
    rows = AccessHtmlElement.new(:css, "div[id='grid-panel-lab_results_grid'] [class='gist-item table-row-toolbar']")
    add_verify(CucumberLabel.new('Numeric Lab Result Gist Rows'), VerifyXpathCount.new(rows), rows)
    
    # Numeric Lab Results Gist Rows
    rows = AccessHtmlElement.new(:css, '#data-grid-lab_results_grid tbody tr.selectable')
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

#Verify the first coloumn of the Numeric Lab Results Coversheet
Then(/^the first coloumn of the Numeric Lab Results gist contains the rows for patient "(.*?)"$/) do |patient, table|
  driver = TestSupport.driver

  TestSupport.wait_for_page_loaded

  vg = LabResultsGist.instance
  matched_patient = true

  p patient
  case patient
  # if (patient == "Ten,Patient")
  when "Ten,Patient"
    expect(vg.wait_until_action_element_visible("Numeric Lab Results Ten Check", 60)).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Leukocytes__Blood_Quantitative").text == table.rows[0][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Granulocytes_100_Leukocytes__Blood_Quantitative_Automated_Count").text == table.rows[1][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Platelet_Mean_Volume__Blood_Quantitative_Automated").text == table.rows[2][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Basophils_100_Leukocytes__Blood_Quantitative_Automated_Count").text == table.rows[3][0]).to be_true

    driver.execute_script("arguments[0].scrollIntoView(false)", driver.find_element(:id, "labs_problem_name_Monocytes_100_Leukocytes__Blood_Quantitative_Automated_Count"))
    expect(driver.find_element(:id, "labs_problem_name_Eosinophils_100_Leukocytes__Blood_Quantitative_Automated_Count").text == table.rows[4][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Hemoglobin__Blood_Quantitative").text == table.rows[5][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Lymphocytes_100_Leukocytes__Blood_Quantitative_Automated_Count").text == table.rows[6][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Monocytes_100_Leukocytes__Blood_Quantitative_Automated_Count").text == table.rows[7][0]).to be_true

    driver.execute_script("arguments[0].scrollIntoView(false)", driver.find_element(:id, "labs_problem_name_Mean_Corpuscular_Volume__RBC_Quantitative_Automated_Count"))
    expect(driver.find_element(:id, "labs_problem_name_Platelets__Blood_Quantitative_Automated_Count").text == table.rows[8][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Erythrocyte_Mean_Corpuscular_Hemoglobin__RBC_Quantitative_Automated_Count").text == table.rows[9][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Erythrocyte_Mean_Corpuscular_Hemoglobin_Concentration__RBC_Quantitative_Automated_Count").text == table.rows[10][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Mean_Corpuscular_Volume__RBC_Quantitative_Automated_Count").text == table.rows[11][0]).to be_true

    driver.execute_script("arguments[0].scrollIntoView(false)", driver.find_element(:id, "labs_problem_name_Hematocrit__Blood_Quantitative_Automated_Count"))
    expect(driver.find_element(:id, "labs_problem_name_Erythrocyte_Distribution_Width_CV__RBC_Quantitative_Automated_Count").text == table.rows[12][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Erythrocytes__Blood_Quantitative_Automated_Count").text == table.rows[13][0]).to be_true
    expect(driver.find_element(:id, "labs_problem_name_Hematocrit__Blood_Quantitative_Automated_Count").text == table.rows[14][0]).to be_true
  # elsif (patient == "Five,Patient")

  when "Five,Patient"
    expect(vg.wait_until_action_element_visible("Numeric Lab Results Five Check", 60)).to be_true
    bottom_element = driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='POTASSIUM'] .problem-name")
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='HDL'] .problem-name").text == table.rows[0][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='TRIGLYCERIDE'] .problem-name").text == table.rows[1][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='LDL_CHOLESTEROL'] .problem-name").text == table.rows[2][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='CHOLESTEROL'] .problem-name").text == table.rows[3][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='CREATININE'] .problem-name").text == table.rows[4][0]).to be_true
    driver.execute_script("arguments[0].scrollIntoView(false)", bottom_element)
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='UREA_NITROGEN'] .problem-name").text == table.rows[5][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='HEMOGLOBIN_A1C'] .problem-name").text == table.rows[6][0]).to be_true
    expect(driver.find_element(:css, "[data-appletid='lab_results_grid'] [data-row-instanceid='POTASSIUM'] .problem-name").text == table.rows[7][0]).to be_true
  else
    p "Use only Five,Patient or Ten,Patients"
    matched_patient = false
  end

  expect(matched_patient).to be_true
end #Numeric Lab Results Coversheet rows

Then(/^verify the Numeric Lab Results Gist title is "([^"]*)"$/) do |title|
  numeric_lab_results_gist = LabResultsGist.instance
  expect(numeric_lab_results_gist.perform_verification("Numeric Lab Results Gist Title", title)).to be_true
end

Then(/^verify the Numeric Lab Results Gist applet has the following applet buttons$/) do |table|
  numeric_lab_results_gist = LabResultsGist.instance
  table.rows.each do | row |
    expect(numeric_lab_results_gist.am_i_visible? row[0]).to eq(true), "Expected applet to have button #{row[0]}"
  end
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
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  
  numeric_lab_results_gist = LabResultsGist.instance
  wait.until { numeric_lab_results_gist.applet_grid_loaded }
  expect(numeric_lab_results_gist.am_i_visible? 'Empty Row').to eq(false), 'Cannot check Lab Result Gist applet with out some data'
  expect(TestSupport.driver.find_elements(:css, "[data-appletid=lab_results_grid] .grid-applet-panel [class='gist-item table-row-toolbar']").length).to be > (0), 'Cannot check Lab Result Gist applet with out some data'
end

Then(/^the Lab Test column contains data$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_lab_test_column_data
  expect(ehmp.fld_lab_test_column_data.length).to be > (0), "Expected Lab Test column to be populated"
end

Then(/^the Result column contains data$/) do
  
  css = "div[id='grid-panel-lab_results_grid'] [class='table-cell border-vertical']"

  driver = TestSupport.driver
  gist_items = driver.find_elements(:css, css)
  # check 
  expect(gist_items.length).to be > (0), "Expected Result column to be populated"
end

Then(/^the Last \(Age\) column in in the correct format$/) do
  css = "#grid-panel-lab_results_grid .gist-item.table-row-toolbar"

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

When(/^the user expands the Numeric Lab Results Gist Applet$/) do
  aa = LabResultsGist.instance
  expected_screen = 'Numeric Lab Results'
  expect(aa.perform_action('Control - Applet - Expand View')).to be_true
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_loaded? }
end

When(/^the Numeric Lab Results Gist Applet contains data rows$/) do
  compare_item_counts("div[id='grid-panel-lab_results_grid'] [class='gist-item table-row-toolbar']")
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
  @ehmp.wait_until_fld_toolbar_visible
  @ehmp.wait_until_btn_detail_view_visible
  @ehmp.btn_detail_view.click
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
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

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

When(/^the user views the first Numeric Lab Result Gist quick look via the toolbar$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_lab_names
  expect(ehmp.fld_lab_names.length).to be > 0
  ehmp.fld_lab_names[0].click
  ehmp.wait_until_fld_toolbar_visible
  ehmp.wait_for_btn_quick_view
  expect(ehmp).to have_btn_quick_view
  ehmp.btn_quick_view.click
  ehmp.wait_for_fld_quickview_popover
  expect(ehmp).to have_fld_quickview_popover
  ehmp.wait_until_fld_quickview_popover_visible
end

When(/^the user views the first Numeric Lab Result Gist quick look via the results column$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_results
  expect(ehmp.fld_results.length).to be > 0
  ehmp.fld_results[0].click
  ehmp.wait_for_fld_quickview_popover
  expect(ehmp).to have_fld_quickview_popover
  ehmp.wait_until_fld_quickview_popover_visible
end

Then(/^a quickview displays a numeric lab table with expected headers$/) do | expected_headers |
  ehmp = PobNumericLabApplet.new  
  ehmp.wait_for_quickview_tbl_headers
  expect(ehmp).to have_quickview_tbl_headers, "The vitals quickview did not display table headers"
  header_text = ehmp.quickview_th_text_only_upper
  expected_headers.rows.each do | temp_header |
    expect(header_text).to include(temp_header[0].upcase)
  end
end

