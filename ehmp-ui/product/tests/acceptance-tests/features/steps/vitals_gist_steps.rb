class VerifyNotBlank
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    return html_element.text.strip.length > 0
  end

  def error_message
    return @error_message
  end
end

class VerifyAgeFormat
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    age_format = /\d+\D/
    # age_format = /bad/
    return !(age_format.match(html_element.text.strip).nil?)
  end

  def error_message
    return @error_message
  end
end

class VitalsGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'vitals'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_applet_buttons appletid_css
    add_applet_add_button appletid_css

    add_verify(CucumberLabel.new("Vitals Gist Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=vitals] .panel-title"))
    add_verify(CucumberLabel.new("Blood pressure Sistolic"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] .problem-name"))
    add_verify(CucumberLabel.new("Blood pressure Diastolic"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPD'] .problem-name"))
    add_verify(CucumberLabel.new("Pulse"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='Pulse'] .problem-name"))
    add_verify(CucumberLabel.new("Respiration"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='RR'] .problem-name"))
    add_verify(CucumberLabel.new("Temperature"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='Temp'] .problem-name"))
    add_verify(CucumberLabel.new("Pulse oximetry"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='Sp02'] .problem-name"))
    add_verify(CucumberLabel.new("Pain"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='Pain'] .problem-name"))
    add_verify(CucumberLabel.new("Weight"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='Wt'] .problem-name"))

    add_action(CucumberLabel.new("Blood pressure Sistolic toolbar"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] .problem-name"))
    
    vitals_rows = AccessHtmlElement.new(:css, '[data-appletid=vitals] div.gist-item')
    add_verify(CucumberLabel.new("Vitals Gist Rows"), VerifyXpathCount.new(vitals_rows), vitals_rows)
  
    # not sure why [data-appletid=vitals] #name-header was not working so using a different css selector
    add_verify(CucumberLabel.new('Type Header'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="name-header"]'))
    add_verify(CucumberLabel.new('Result Header'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="results-header"]'))
    add_verify(CucumberLabel.new('Last Header'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="age-header"]'))

    add_action(CucumberLabel.new('Type Header Sort'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="name-header"]'))
    add_action(CucumberLabel.new('Result Header Sort'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="results-header"]'))
    add_action(CucumberLabel.new('Last Header Sort'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="vitals"] [data-header-instanceid="age-header"]'))

    add_toolbar_buttons 

    # quickview
    add_action(CucumberLabel.new("Blood pressure Sistolic results"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] [data-cell-instanceid='time_since_BPS']"))
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
   
    # First Vital Gist Row
    add_action(CucumberLabel.new('First Vitals Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] .problem-name"))
  end

  def add_vitals_verification(type, id)
    add_verify(CucumberLabel.new("#{type} Label"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='#{id}'] .problem-name"))
    add_verify(CucumberLabel.new("#{type} Result"), VerifyNotBlank.new, AccessHtmlElement.new(:css, "[data-appletid=vitals] [data-row-instanceid='#{id}'] [data-cell-instanceid='time_since_#{id}']"))
    add_verify(CucumberLabel.new("#{type} Age"), VerifyAgeFormat.new, AccessHtmlElement.new(:css, "[data-appletid=vitals] [data-row-instanceid='#{id}'] [data-cell-instanceid='encounter_count_#{id}']"))
    # used an xpath for Chart Area because css was not working and I dn't know why
    add_verify(CucumberLabel.new("#{type} Chart Area"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=vitals] [data-row-instanceid='#{id}'] [data-cell-instanceid='graph_#{id}']"))
    add_verify(CucumberLabel.new("#{type} No record"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='#{id}'] .no-record"))
  end

  def applet_loaded?
    return TestSupport.driver.find_elements(:css, '[data-appletid=vitals] .grid-container div.gist-item').length > 0
  rescue => e 
    # p e
    false
  end
end

Then(/^user sees Vitals Gist$/) do
  vg = VitalsGist.instance
  expect(vg.wait_until_action_element_visible("Vitals Gist Title", DefaultTiming.default_wait_time)).to be_true
  expect(vg.perform_verification("Vitals Gist Title", "VITALS")).to be_true
  expect(vg.wait_until_action_element_visible("Vitals Gist Rows", DefaultTiming.default_table_row_load_time)).to be_true
  expected_vitals = 11
  expect(vg.perform_verification("Vitals Gist Rows", expected_vitals)).to be_true, "expected #{expected_vitals} vitals to be displayed"
end

Then(/^the Vitals applet contains headers$/) do |table|
  vitals_gist = VitalsGist.instance
  table.rows.each do |header|
    expect(vitals_gist.perform_verification("#{header[0]} Header", header[0])).to eq(true)
  end
end

Then(/^the Vitals gist contains the data for rows$/) do |table|
  vitals_gist = VitalsGist.instance
  table.rows.each do |vital|
    vitals_gist.add_vitals_verification(vital[0], vital[1])
    expect(vitals_gist.am_i_visible?("#{vital[0]} No record")).to eq(false), "#{vital[0]} displays no record, the test expected data"
    expect(vitals_gist.perform_verification("#{vital[0]} Label", "#{vital[0]}")).to eq(true), "Expect vital label to display #{vital[0]}"
    expect(vitals_gist.perform_verification("#{vital[0]} Result", '')).to eq(true), "Expect vital #{vital[0]} to display a result"
    expect(vitals_gist.perform_verification("#{vital[0]} Age", '')).to eq(true), "Expect vital #{vital[0]} to be in the format digitsalpha (ex. 5m)"
    expect(vitals_gist.perform_verification("#{vital[0]} Chart Area", '')).to eq(true), "Expect vital #{vital[0]} to display a chart: #{vitals_gist.last_error_message}"
  end
end

Then(/^the Vitals gist displays no records for$/) do |table|
  vitals_gist = VitalsGist.instance
  table.rows.each do |vital|
    vitals_gist.add_vitals_verification(vital[0], vital[1])
    expect(vitals_gist.am_i_visible?("#{vital[0]} No record")).to eq(true), "Expect #{vital[0]} to display no record"
  end
end

class VitalsCoversheet < AccessBrowserV2
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'vitals'
    appletid_css = "[data-appletid=#{@appletid}]"

    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
    bp_format = Regexp.new("\\d+\/\\d+ mm\\[Hg\\]")

    add_vital('BP', bp_format, date_format)
    add_vital('P', Regexp.new("\\d+ /min"), date_format)
    add_vital('R', Regexp.new("\\d+ /min"), date_format)
    add_vital('T', Regexp.new("\\d+.*\\d* F \/ \\d+.*\\d* C"), date_format)
    add_vital('WT', Regexp.new("\\d+.*\\d* lb \/ \\d+.*\\d* kg"), date_format)
    add_vital('BMI', Regexp.new("\\d+.*\\d*"), date_format)
    add_vital('PO2', Regexp.new("\\d+ %"), date_format)
    add_vital('PN', Regexp.new("\\d+"), date_format)
    add_vital('CG', Regexp.new("\\d+"), date_format)
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
  end

  def add_vital(vital, bp_format, date_format)
    add_verify(CucumberLabel.new("#{vital} label"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]"))
    add_verify(CucumberLabel.new("#{vital} value"), VerifyTextFormat.new(bp_format), AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]/following-sibling::td[1]"))
    add_verify(CucumberLabel.new("#{vital} date"), VerifyTextFormat.new(date_format), AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]/following-sibling::td[2]"))
    add_verify(CucumberLabel.new("#{vital} no record"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]/following-sibling::td[1]"))
  end

  def applet_loaded
    # [data-appletid=vitals] tr
    return TestSupport.driver.find_elements(:css, "[data-appletid=vitals] tr").length > 0
  rescue Exception => myerror
    p myerror
    return false
  end
end

Then(/^the Coversheet Vitals table contains$/) do |table|
  vitals = VitalsCoversheet.instance
  table.rows.each do | label, value, date |
    expect(vitals.perform_verification("#{label} label", label)).to eq(true), "Failing on label #{label}"
    expect(vitals.perform_verification("#{label} value", label)).to eq(true), "Failing on value #{label}"
    expect(vitals.perform_verification("#{label} date", label)).to eq(true), "Failing on date #{label}"
  end
end

Then(/^the Coversheet Vitals table displays no data for$/) do |table|
  vitals = VitalsCoversheet.instance
  table.rows.each do | label |
    expect(vitals.perform_verification("#{label[0]} no record", "No Record")).to eq(true), "Failing on label #{label[0]}"
  end
end

Then(/^the Vitals Gist Applet contains data rows$/) do
  compare_item_counts("[data-appletid=vitals] div.gist-item")
end

When(/^user refreshes Vitals Gist Applet$/) do
  applet_refresh_action("vitals")
end

Then(/^the message on the Vitals Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("vitals", message_text)
end

Then(/^the Vitals Gist Applet contains buttons$/) do |table|
  vitals = VitalsGist.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Vitals Gist Applet does not contain buttons$/) do |table|
  vitals = VitalsGist.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(false), "Applet should not have button #{button[0]}"
  end
end

Then(/^the user sorts the Vitals Gist grid by "([^"]*)"$/) do |arg1|
  label = "#{arg1} Header Sort"
  expect(VitalsGist.instance.perform_action(label)).to eq(true)
end

Then(/^the Vitals gist is sorted in alphabetic order based on Type$/) do
  @ehmp = PobVitalsApplet.new
  @ehmp.wait_for_fld_vital_type_column_data
    
  column_values = @ehmp.fld_vital_type_column_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Vitals gist is sorted in reverse alphabetic order based on Type$/) do
  @ehmp = PobVitalsApplet.new
  @ehmp.wait_for_fld_vital_type_column_data

  column_values = @ehmp.fld_vital_type_column_data
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^the user clicks "([^"]*)" vital column$/) do |arg1|
  column = "#{arg1} toolbar"
  expect(VitalsGist.instance.perform_action(column)).to eq(true)
end

Then(/^a popover toolbar displays buttons$/) do |table|
  vitals = VitalsGist.instance
  table.rows.each do | button |
    expect(vitals.am_i_visible? button[0]).to eq(true), "#{button[0]} was not visible"
  end
end

When(/^the user clicks "([^"]*)" vital result column$/) do |arg1|
  column = "#{arg1} results"
  expect(VitalsGist.instance.perform_action(column)).to eq(true)
end

Then(/^a quickview displays table with headers$/) do |table|
  vitals = VitalsGist.instance
  table.rows.each do | header |
    header_label = "Popover #{header[0]}"
    expect(vitals.perform_verification(header_label, header[0])).to eq(true)
  end
end

When(/^the user views the first Vitals Gist detail view$/) do
  vitals = VitalsGist.instance
  expect(vitals.wait_until_xpath_count_greater_than('Vitals Gist Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(vitals.perform_action('First Vitals Row')).to eq(true), "Could not select first vital row"
  expect(vitals.perform_action('Detail View Button')).to eq(true), "Could not select detail view icon"
end

Given(/^the user notes the order of the vitals in the Vitals Gist$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vital_names
  @default_vital_gist_order = ehmp.gist_vital_names_only
  expect(@default_vital_gist_order.length).to be > 0, "Test requires at least 1 vital name to be displayed, right now there are only #{@default_vital_gist_order.length}"
  p @default_vital_gist_order
end

When(/^the user clicks the first row in the Vitals Gist applet$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vital_names
  expect(ehmp.fld_vital_names.length).to be > 2, "This test has a prerequestite requirement that the patient used has more then 2 vital results. There are currently only #{ehmp.fld_vital_names.length}"
  ehmp.fld_vital_names.first.click
  ehmp.wait_for_fld_toolbar
  expect(ehmp).to have_fld_toolbar
end

Then(/^Vital Type column is sorted in manual order in Vitals Gist$/) do
  ehmp = PobVitalsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  ehmp.wait_for_fld_vital_names
  expect(@manual_vitals_order).to_not be_nil, "Expected manual sort order to be saved in a previous step"
  wait.until { (ehmp.gist_vital_names_only <=> @manual_vitals_order) == 0 }
  expect(ehmp.gist_vital_names_only).to eq(@manual_vitals_order)
end

Then(/^the Vitals gist is sorted in default order$/) do
  ehmp = PobVitalsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  ehmp.wait_for_fld_vital_names
  expect(@default_vital_gist_order).to_not be_nil, "Expected default problem order to be saved in a previous step"
  wait.until { (ehmp.gist_vital_names_only <=> @default_vital_gist_order) == 0 }

  expect(ehmp.gist_vital_names_only).to eq(@default_vital_gist_order)
end

Then(/^a quickview displays a vitals table with expected headers$/) do
  expected_headers = ['DATE', 'REF. RANGE', 'RESULT', 'FACILITY']
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vital_quickview_popover
  expect(ehmp).to have_fld_vital_quickview_popover, "The vitals quickview did not display"
  
  ehmp.wait_for_quickview_tbl_headers
  expect(ehmp).to have_quickview_tbl_headers, "The vitals quickview did not display table headers"

  p "Verifying header text is #{expected_headers}"

  ehmp.wait_for_quickview_tbl_th_date
  expect(ehmp).to have_quickview_tbl_th_date
  expected_text = expected_headers[0]
  expect(ehmp.quickview_tbl_th_date.text.upcase).to eq(expected_text), "Expected the header text to be #{expected_text} but it was #{ehmp.quickview_tbl_th_date.text.upcase}"

  ehmp.wait_for_quickview_tbl_th_refrange
  expect(ehmp).to have_quickview_tbl_th_refrange
  expected_text = expected_headers[1]
  expect(ehmp.quickview_tbl_th_refrange.text.upcase).to eq(expected_text), "Expected the header text to be #{expected_text} but it was #{ehmp.quickview_tbl_th_refrange.text.upcase}"

  ehmp.wait_for_quickview_tbl_th_result
  expect(ehmp).to have_quickview_tbl_th_result
  expected_text = expected_headers[2]
  expect(ehmp.quickview_tbl_th_result.text.upcase).to eq(expected_text), "Expected the header text to be #{expected_text} but it was #{ehmp.quickview_tbl_th_result.text.upcase}"

  ehmp.wait_for_quickview_tbl_th_facility
  expect(ehmp).to have_quickview_tbl_th_facility
  expected_text = expected_headers[3]
  expect(ehmp.quickview_tbl_th_facility.text.upcase).to eq(expected_text), "Expected the header text to be #{expected_text} but it was #{ehmp.quickview_tbl_th_facility.text.upcase}"
end

When(/^the user views the first Vitals Gist quicklook table via the toolbar$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vital_names
  expect(ehmp.fld_vital_names.length).to be > 0
  ehmp.fld_vital_names[0].click
  ehmp.wait_until_fld_toolbar_visible
  ehmp.wait_for_btn_quick_view
  expect(ehmp).to have_btn_quick_view
  ehmp.btn_quick_view.click
  ehmp.wait_for_fld_vital_quickview_popover
  expect(ehmp).to have_fld_vital_quickview_popover
  ehmp.wait_until_fld_vital_quickview_popover_visible
end

Then(/^the Vitals Gist Applet contains buttons Refresh, Help and Expand$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_expand_view

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_expand_view
end
