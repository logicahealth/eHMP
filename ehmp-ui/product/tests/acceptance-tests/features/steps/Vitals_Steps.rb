#Team Neptune
#F144_VitalsApplet.feature

class Vitals < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'vitals'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new('Empty Vital Row'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=vitals] table tr.empty'))
    add_action(CucumberLabel.new('Search Filter'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=vitals] .applet-filter-button'))
    # Vital Rows
    rows = AccessHtmlElement.new(:css, '#data-grid-vitals tbody tr.selectable')
    add_verify(CucumberLabel.new('Vital Rows'), VerifyXpathCount.new(rows), rows)
    # First Vital Row
    add_action(CucumberLabel.new('First Vital Row'), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']//table/descendant::td[contains(string(),'BMI')]"))
    add_action(CucumberLabel.new('Applet Toolbar Detail'), ClickAction.new, AccessHtmlElement.new(:css, '[button-type=detailView-button-toolbar]'))

    add_verify(CucumberLabel.new("Vital"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalDisplayName"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalResult"))
    add_verify(CucumberLabel.new("Observed"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalObservedFormatted"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalFacility"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalType"))
    add_verify(CucumberLabel.new("Entered"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalDateEntered"))

    add_applet_buttons appletid_css
    add_applet_title appletid_css
    add_applet_add_button appletid_css
    add_toolbar_buttons
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Vital Row'
    return TestSupport.driver.find_elements(:css, '[data-appletid=vitals] .grid-container tr.selectable').length > 0
  rescue => e
    p e
    false
  end
end

When(/^the user clears any existing filters$/) do
  expect(Vitals.instance.remove_all_filter).to eq(true)
end

Then(/^the Vitals expanded headers are$/) do |table|
  ehmp = PobVitalsApplet.new  
  ehmp.wait_for_fld_expanded_headers
  expect(ehmp.fld_expanded_headers.length).to be > 0
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_expanded_headers, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end #Vitals Headers

#Validate the Problems rows in the coversheet view
Then(/^the Vitals table contains the rows$/) do |table|
  driver = TestSupport.driver
  num_of_rows = driver.find_elements(:css, "[data-appletid=vitals] tbody tr")
  #Loop through rows in cucumber   
  table.rows.each do |row_defined_in_cucumber|
    matched = false
    #Loop through UI rows
    for i in 1..num_of_rows.length
      row_data = driver.find_elements(:css, "[data-appletid=vitals] tbody tr:nth-child(#{i}) td")
      if row_defined_in_cucumber.length != row_data.length
        matched = false
        p "The number of columns in the UI is #{row_data.length} but in cucumber it's #{row_defined_in_cucumber.length}"
      else 
        matched = avoid_block_nesting(row_defined_in_cucumber, row_data)            
      end         
      if matched
        break 
      end
    end # for loop  
    p "could not match data: #{row_defined_in_cucumber}" unless matched  
    driver.save_screenshot("incorrect_rows.png") unless matched
    expect(matched).to be_true
  end #do loop  
end #Problems Pills

Then(/^the user filters the Vitals Applet by text "([^"]*)"$/) do |filter_text|            
  ehmp = PobVitalsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=vitals] tbody') }
  row_count = ehmp.tbl_vitals_grid.length
  ehmp.wait_until_fld_vitals_search_filter_visible
  expect(ehmp).to have_fld_vitals_search_filter
  ehmp.fld_vitals_search_filter.set filter_text
  ehmp.fld_vitals_search_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != ehmp.tbl_vitals_grid.length }
end

Then(/^the vitals table only diplays rows including text "([^"]*)"$/) do |input_text|
  ehmp = PobVitalsApplet.new
  ehmp.wait_until_tbl_vitals_type_cell_data_visible
  expect(only_text_exists_in_list(ehmp.tbl_vitals_type_cell_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

When(/^the user clicks the All vitals range$/) do
  @ehmp = PobVitalsApplet.new
  expect(@ehmp.wait_for_date_range_filter).to eq(true), "Expected date range filter to display"
  expect(@ehmp.date_range_filter.wait_for_btn_all).to eq(true), "Expected date range filter to display btn all"

  @ehmp.date_range_filter.btn_all.click
  expect(@ehmp.date_range_filter.wait_for_btn_all_active).to eq(true), "Expected All button to be active"

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  Vitals.instance.applet_loaded? }
end

When(/^the user expands the vitals applet$/) do
  expected_screen = 'Vitals'

  ehmp = PobVitalsApplet.new
  expect(ehmp).to have_btn_applet_expand_view
  ehmp.btn_applet_expand_view.click
  ehmp.wait_until_btn_applet_expand_view_invisible
  wait_until { ehmp.applet_loaded? }
  expect(ehmp.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)
end

Then(/^the expanded vitals applet is displayed$/) do
  expected_screen = 'Vitals'

  ehmp = PobVitalsApplet.new
  ehmp.wait_until_btn_applet_expand_view_invisible
  ehmp.wait_for_fld_applet_title
  expect(ehmp).to have_fld_applet_title
  expect(ehmp.fld_applet_title.text.upcase).to eq(expected_screen.upcase)
  wait_until { ehmp.applet_loaded? }
  expect(ehmp.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)
end

Then(/^the Vitals Applet contains data rows$/) do
  compare_item_counts("[data-appletid=vitals] .grid-container table tr")
end

When(/^user refreshes Vitals Applet$/) do
  applet_refresh_action("vitals")
end

Then(/^the message on the Vitals Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("vitals", message_text)
end

Then(/^the Vitals applet is titled "([^"]*)"$/) do |title|
  expect(Vitals.instance.perform_verification("Title", title)).to be_true
end

Then(/^the Vitals applet contains buttons$/) do |table|
  vitals = Vitals.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Vitals Applet does not contain buttons$/) do |table|
  vitals = Vitals.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(false), "Should not find button #{button[0]}"
  end
end

When(/^the user minimizes the vitals applet$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
  ehmp.btn_applet_minimize.click
  ehmp.wait_until_btn_applet_minimize_invisible
end

When(/^the user views the first Vital detail view$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_tbl_vitals_grid
  expect(ehmp.tbl_vitals_grid.length).to be > 0
  ehmp.tbl_vitals_grid[0].click
end

Then(/^the Vital Detail modal displays$/) do |table|
  modal = Vitals.instance
  table.rows.each do | row |
    expect(modal.am_i_visible? row[0]).to eq(true), "#{row[0]} was not visible"
  end
end

def count_rows_that_contain_qualifier_text_in_qualifier_column(qualifier_text)
  upper = qualifier_text.upcase
  lower = qualifier_text.downcase
  qualifier_column_index = 5

  td = "contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}') and contains(position(), #{qualifier_column_index})"  
  path =  "//table[@id='data-grid-vitals']/descendant::td[#{td}]/ancestor::tr"
  p path
  
  row_count = TestSupport.driver.find_elements(:xpath, path).length
  row_count
end

def check_for_any_qualifiers(qualifiers)
  qualifiers.each do | qualifier |
    count = count_rows_that_contain_qualifier_text_in_qualifier_column(qualifier)
    #p "using #{qualifier} found #{count}"
    return true if count > 0
  end
  false
end

Then(/^some vitals display qualifiers$/) do
  qualifiers = %w(ORAL RADIAL SPONTANEOUS)

  driver = TestSupport.driver
  found_bottom = false
  number_of_attempts = 0
  table_id = '#data-grid-vitals tbody'
  found_qualifier = check_for_any_qualifiers(qualifiers)

  # loop until test finds 
  # a. qualifier text in the qualifier column or
  # b. test has scrolled the entire table without finding any qualifiers
  until (found_bottom && number_of_attempts >2) || found_qualifier

    count1 = driver.find_elements(:css, "#{table_id} tr").length
    p "scroll row #{count1} into view"
    element = driver.find_element(:css, "#{table_id} tr:nth-child(#{count1})")
    element.location_once_scrolled_into_view
    TestSupport.driver.execute_script("$('#{table_id}').scroll();")
    count2 = driver.find_elements(:css, "#{table_id} tr").length
    found_bottom = (count1 == count2)
    number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
    found_qualifier = check_for_any_qualifiers(qualifiers)
    sleep 1 if found_bottom
  end
  expect(found_qualifier).to eq(true), "Could not find any of the folowing qualifiers in the table: #{qualifiers}"
end

def verify_rows_within_year(css_string, year, empty_row = 'tr.empty')
  return true if TestSupport.driver.find_elements(:css, 'tr.empty').length > 0
  date_columns = TestSupport.driver.find_elements(:css, css_string)
  p date_columns.length
  return false unless date_columns.length > 0 # if there were no records, then there should be a tr.empty which we already determined there isn't
  start_time = (Time.now - (24*60*60*(365*year))).to_datetime
  # p start_time
  date_format_template = "%m/%d/%Y - %H:%M"
  date_columns.each do | date_element |
    date_element.location_once_scrolled_into_view
    row_date = DateTime.strptime(date_element.text, date_format_template)
    date_in_range = row_date > start_time
    p "#{row_date} is not after #{start_time}" unless date_in_range
    return false unless date_in_range    
  end
  return true
rescue => e 
  p e
  return false
end

Then(/^the Expanded Vitals applet only displays rows from the last (\d+) year$/) do |year|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { verify_rows_within_year('[data-appletid=vitals] tbody tr td:nth-child(2)', year.to_i) }
end

def verify_rows_last_hours(css_string, hours, empty_row = 'tr.empty')
  return true if TestSupport.driver.find_elements(:css, 'tr.empty').length > 0
  date_columns = TestSupport.driver.find_elements(:css, css_string)
  p date_columns.length
  return false unless date_columns.length > 0 # if there were no records, then there should be a tr.empty which we already determined there isn't
  start_time = (Time.now - (hours*60*60)).to_datetime

  # p start_time
  date_format_template = "%m/%d/%Y - %H:%M"
  date_columns.each do | date_element |
    date_element.location_once_scrolled_into_view
    row_date = DateTime.strptime(date_element.text, date_format_template)
    date_in_range = row_date > start_time
    p "#{row_date} is not after #{start_time}" unless date_in_range
    return false unless date_in_range    
  end
  return true
rescue => e 
  p e
  return false
end

Then(/^the Expanded Vitals applet only displays rows from the last (\d+) hours$/) do |hour|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { verify_rows_last_hours('[data-appletid=vitals] tbody tr td:nth-child(2)', hour.to_i) }
end

Then(/^the BMI Vital detail modal is displayed$/) do
  @ehmp = VitalModal.new
  expected_headers = ["Vital", "Result", "Observed", "Facility", "Type", "Entered"]
  expected_headers.each do | header_text |
    expect(@ehmp.latest_column_text).to include header_text
  end
  @ehmp.btn_all_range.click
  @ehmp.wait_until_tbl_vital_tests_date_header_visible
  expect(@ehmp.tbl_vital_tests.length).to be > 0
end

Then(/^user navigates to Vitals expanded view$/) do
  ehmp = PobVitalsApplet.new
  
  p "On url: #{TestSupport.driver.current_url}" 
  navigate_in_ehmp "#/patient/vitals-full"  
  p "On url: #{TestSupport.driver.current_url}"
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { ehmp.applet_loaded? }

  expect(ehmp.menu.fld_screen_name.text.upcase).to eq('VITALS')
end

Given(/^user navigates to expanded Vitals applet$/) do
  applet = PobVitalsApplet.new
  expected_screen = "Vitals"
  applet.load
  expect(applet).to have_menu
  expect(applet.menu).to have_fld_screen_name
  expect(applet.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

Given(/^user can view the Quick Menu Icon in vitals applet$/) do
  ehmp = PobVitalsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in vitals applet$/) do
  ehmp = PobVitalsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in vitals applet$/) do
  ehmp = PobVitalsApplet.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the vitals applet$/) do |table|
  ehmp = PobVitalsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Then(/^there exists a quick view popover table in vitals applet$/) do 
  ehmp = PobVitalsApplet.new
  QuickMenuActions.verify_popover_table ehmp
end

When(/^user hovers over the vitals applet trend view row$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vitals_gist
  expect(ehmp).to have_fld_vitals_gist
  rows = ehmp.fld_vitals_gist
  expect(rows.length).to be > 0
  rows[0].hover
end

When(/^user hovers over the vitals applet row$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_tbl_vitals_grid
  expect(ehmp).to have_tbl_vitals_grid
  rows = ehmp.tbl_vitals_grid
  expect(rows.length).to be > 0
  rows[0].hover
end

When(/^user selects the detail view from Quick Menu Icon of vitals applet$/) do
  ehmp = PobVitalsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Then(/^the Vitals Summary view contain (\d+) items$/) do |arg1|
  applet = PobVitalsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { VitalsCoversheet.instance.applet_loaded }
  expect(applet.tbl_vitals_grid.length).to eq(arg1.to_i)
end

