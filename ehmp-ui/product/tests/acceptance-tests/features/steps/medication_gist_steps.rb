class MedicationGistContainer <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'activeMeds'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_applet_buttons appletid_css

    add_verify(CucumberLabel.new("MedicationGistVisible"), VerifyText.new, AccessHtmlElement.new(:id, "activeMeds-interventions-gist-items"))
    add_verify(CucumberLabel.new("Medication Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'activeMeds-interventions-gist-items'))
    add_action(CucumberLabel.new("Amoxapine Tablet"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[text() = 'Amoxapine 150 MG Oral Tablet']"))
    add_action(CucumberLabel.new("Medication Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] [data-header-instanceid='name-header']"))
    add_action(CucumberLabel.new("Last Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] [data-header-instanceid='age-header']"))
    add_action(CucumberLabel.new("Refills Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] [data-header-instanceid='severity-header']"))
    add_verify(CucumberLabel.new("Medication Gist Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] .panel-title")) 
    add_action(CucumberLabel.new("Filter input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-activeMeds input"))
    add_verify(CucumberLabel.new("Name"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'name'))  
    add_verify(CucumberLabel.new("Description"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'description'))
    add_verify(CucumberLabel.new("Count"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'count'))
    add_verify(CucumberLabel.new("Graphic"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'graphic'))
    add_verify(CucumberLabel.new("Age"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'ageAdjust'))
    add_verify(CucumberLabel.new('Empty Med Row'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=activeMeds] .grid-container p.color-grey-darkest'))

    add_verify(CucumberLabel.new("Medication Gist Items"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'activeMeds-interventions-gist-items'))
    
    gist_view_count = AccessHtmlElement.new(:css, "[data-appletid=activeMeds] .gist-item-list .gist-item")
    add_verify(CucumberLabel.new('medication gist view count'), VerifyXpathCount.new(gist_view_count), gist_view_count)

    amoxapine_xpath = "//b[contains(string(), 'Amoxapine 150 MG Oral Tablet')]"
    applet_toolbar_xpath = "ancestor::div[contains(@class, 'toolbarActive')]"
    add_action(CucumberLabel.new("Amoxapine Tablet Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "#{amoxapine_xpath}/#{applet_toolbar_xpath}/descendant::a[@button-type='detailView-button-toolbar']"))
  
    add_verify(CucumberLabel.new('Header Medication'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new('Header Refills'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] [data-header-instanceid='severity-header']"))
  
    add_toolbar_buttons
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Med Row'
    return TestSupport.driver.find_elements(:css, '[data-appletid=activeMeds] .grid-container div.gist-item').length > 0
  rescue => e 
    p e
    false
  end
end 

Before do
  @mg = MedicationGistContainer.instance
end

Then(/^the "(.*?)" gist is displayed$/) do |expected_gist_title|
  @mg.wait_until_action_element_visible("Medication Gist Title")
  expect(@mg.perform_verification("Medication Gist Title", expected_gist_title)).to be_true
end

Then(/^the Medications Gist overview table contains headers$/) do |table|
  table.rows.each do | row |
    p row
    expect(@mg.perform_verification("Header #{row[0]}", row[0])).to eq(true)
  end
end

Then(/^the Medications Gist Applet displays results$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @mg.applet_loaded? }
  expect(@mg.applet_loaded?).to eq(true)
end

Then(/^the medication gist view has the following information$/) do |table|
  expect(@mg.wait_until_action_element_visible("MedicationGistVisible", DefaultLogin.wait_time)).to be_true
  
  table.rows.each do |row|
    expect(@mg.perform_verification('Medication Gist Items', row[0])).to be_true, "The value #{row[0]} is not present in the medication details"
    expect(@mg.perform_verification('Medication Gist Items', row[1])).to be_true, "The value #{row[1]} is not present in the medication details"
  end
end

Then(/^the medication gist view is filtered to (\d+) item$/) do |number_of_items|
  expect(@mg.perform_verification('medication gist view count', number_of_items)).to be_true
end

When(/^user clicks on "(.*?)" medication name$/) do |medication_name|
  expect(@mg.wait_until_action_element_visible("MedicationGistVisible", DefaultLogin.wait_time)).to be_true
  expect(@mg.perform_action(medication_name, "")).to be_true
end

When(/^user clicks on the column header "(.*?)"$/) do |name_column_header|
  expect(@mg.perform_action(name_column_header + " Header", "")).to be_true
end

Then(/^"(.*?)" column is sorted in ascending order$/) do |column_name|
  driver = TestSupport.driver
  column_values_array = []

  case column_name
  when 'Medication'
    element_column_values = driver.find_elements(id: 'name')
  when 'Refills'
    element_column_values = driver.find_elements(id: 'count')
  else
    fail "**** No function found! Check your script ****"
  end
        
  element_column_values.each do |row|
    p row.text
    column_values_array << row.text.downcase
  end

  (column_values_array == column_values_array.sort).should == true
end

Then(/^"(.*?)" column is sorted in descending order$/) do |column_name|
  driver = TestSupport.driver

  column_values_array = []

  case column_name
  when 'Medication'
    element_column_values = driver.find_elements(id: 'name')
  when 'Refills'
    element_column_values = driver.find_elements(id: 'count')
  else
    fail "**** No function found! Check your script ****"
  end
     
  element_column_values.each do |row|
    column_values_array << row.text.downcase
  end
  
  (column_values_array == column_values_array.sort { |x, y| y <=> x }).should == true
end

Then(/^user selects the "(.*?)" detail icon in Medications Gist$/) do |arg1|
  label = "#{arg1} Detail View Icon"
  expect(@mg.perform_action(label)).to be_true
end

Then(/^the Medications Gist table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase
  text_check = "descendant::div[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"
  path = "//div[@data-appletid='activeMeds']/#{text_check}/ancestor::div[contains(@class, 'table-row-toolbar')]"
  p path
  @ehmp = PobActiveRecentMedApplet.new
  row_count = @ehmp.fld_active_meds_gist.length 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user filters the Medications Gist Applet by text "([^"]*)"$/) do |search_field|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  @ehmp = PobActiveRecentMedApplet.new
  row_count = @ehmp.fld_active_meds_gist.length
  p "before filter: #{row_count}"
  aa = MedicationGistContainer.instance
  expect(aa.wait_until_action_element_visible("Filter input", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Filter input", search_field)).to be_true
  # wait.until { row_count != TableContainer.instance.get_elements('Rows - Active Medications Applet').size }
  wait.until { row_count != @ehmp.fld_active_meds_gist.length }
  p "After filtering, result count is #{@ehmp.fld_active_meds_gist.length }"
end

Then(/^the medication gist view displays at least (\d+) result$/) do |num_result|
  expect(@mg.wait_until_xpath_count_greater_than('medication gist view count', num_result.to_i - 1)).to eq(true), "Test requires at least #{num_result} result to verify functionality"
end

When(/^user views the details for a medication in Medications Gist$/) do
  css = '[data-appletid=activeMeds] div.gist-item-list div.gist-item'
  meds = TestSupport.driver.find_elements(:css, css)
  expect(meds.length).to be > (0), 'Test needs at least 1 medication to test medication detail view'
  @mg.add_action(CucumberLabel.new('first med'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=activeMeds] div.gist-item-list div.table-row [role=presentation]:nth-child(1)"))
  expect(@mg.perform_action('first med')).to eq(true)
  expect(@mg.perform_action('Detail View Button')).to be_true
end

Then(/^the Medications Gist Applet contains buttons Refresh, Help, Filter Toggle, Expand$/) do
  ehmp = PobActiveRecentMedApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_filter_toggle
  ehmp.wait_for_btn_applet_expand_view

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_expand_view
end
