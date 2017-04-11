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

    # popover toolbar
    add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} div.toolbarActive [button-type=quick-look-button-toolbar]"))
    add_action(CucumberLabel.new("Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} div.toolbarActive [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("Info Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} div.toolbarActive [button-type=info-button-toolbar]"))

    # quickview
    add_action(CucumberLabel.new("Blood pressure Sistolic results"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] [data-cell-instanceid='time_since_BPS']"))
    add_verify(CucumberLabel.new("Popover Date"), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover th:nth-child(1)'))
    add_verify(CucumberLabel.new("Popover Ref. Range"), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover th:nth-child(3)'))
    add_verify(CucumberLabel.new("Popover Result"), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover th:nth-child(2)'))
    add_verify(CucumberLabel.new("Popover Facility"), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover th:nth-child(4)'))

    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
   
    # First Vital Gist Row
    add_action(CucumberLabel.new('First Vitals Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='vitals'] [data-row-instanceid='BPS'] .problem-name"))
    add_action(CucumberLabel.new('Detail View Icon'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid=vitals] div.toolbarActive [button-type=detailView-button-toolbar]"))
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
  expect(vg.perform_verification("Vitals Gist Rows", 10)).to be_true
end

# #Verify the first coloumn of the Vitals Coversheet view
# Then(/^the Vitals gist contains the data$/) do |table|
#   driver = TestSupport.driver
#   TestSupport.wait_for_page_loaded
#   vg = VitalsGist.instance
#   expect(vg.wait_until_action_element_visible("Pulse", 60)).to be_true
#   top_element = driver.find_element(:id, "vitals_problem_name_BPS")
#   bottom_element = driver.find_element(:id, "vitals_problem_name_BMI")
#   expect(driver.find_element(:id, "vitals_problem_name_BPS").text).to eq(table.rows[0][0])
#   expect(driver.find_element(:id, "vitals_problem_name_BPD").text).to eq(table.rows[1][0])
#   expect(driver.find_element(:id, "vitals_problem_name_P").text).to eq(table.rows[2][0])
#   expect(driver.find_element(:id, "vitals_problem_name_R").text).to eq(table.rows[3][0])
#   expect(driver.find_element(:id, "vitals_problem_name_T").text).to eq(table.rows[4][0])
#   #expect(driver.find_element(:id, "vitals_problem_name_PO2").text == table.rows[5][0]).to be_true
#   driver.execute_script("arguments[0].scrollIntoView(false)", bottom_element)
#   expect(driver.find_element(:id, "vitals_problem_name_PN").text).to eq(table.rows[6][0])
#   expect(driver.find_element(:id, "vitals_problem_name_WT").text).to eq(table.rows[7][0])
#   expect(driver.find_element(:id, "vitals_problem_name_HT").text).to eq(table.rows[8][0])
#   expect(driver.find_element(:id, "vitals_problem_name_BMI").text).to eq(table.rows[9][0])

#   driver.execute_script("arguments[0].scrollIntoView(true)", top_element)
#   expect(driver.find_element(:id, "vitals_problem_result_BPS").text).to eq(table.rows[0][1])
#   expect(driver.find_element(:id, "vitals_problem_result_BPD").text).to eq(table.rows[1][1])
#   expect(driver.find_element(:id, "vitals_problem_result_P").text).to eq(table.rows[2][1])
#   expect(driver.find_element(:id, "vitals_problem_result_R").text).to eq(table.rows[3][1])
#   expect(driver.find_element(:id, "vitals_problem_result_T").text).to eq(table.rows[4][1])
#   #expect(driver.find_element(:id, "vitals_problem_result_PO2").text == table.rows[5][1]).to be_true
#   driver.execute_script("arguments[0].scrollIntoView(false)", bottom_element)
#   expect(driver.find_element(:id, "vitals_problem_result_PN").text).to eq(table.rows[6][1])
#   expect(driver.find_element(:id, "vitals_problem_result_WT").text).to eq(table.rows[7][1])
#   expect(driver.find_element(:id, "vitals_problem_result_HT").text).to eq(table.rows[8][1])
#   expect(driver.find_element(:id, "vitals_problem_result_BMI").text).to eq(table.rows[9][1])
# end #Vitals Coversheet rows

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
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
  end

  def add_vital(vital, bp_format, date_format)
    add_verify(CucumberLabel.new("#{vital} label"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]"))
    add_verify(CucumberLabel.new("#{vital} value"), VerifyTextFormat.new(bp_format), AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]/following-sibling::td[1]"))
    add_verify(CucumberLabel.new("#{vital} date"), VerifyTextFormat.new(date_format), AccessHtmlElement.new(:xpath, "//*[@data-appletid='vitals']/descendant::td[starts-with(string(), '#{vital}')]/following-sibling::td[2]"))
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
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive_gist('[data-appletid=vitals] div.problem-name [data-cell-instanceid]', true) }
end

Then(/^the Vitals gist is sorted in reverse alphabetic order based on Type$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive_gist('[data-appletid=vitals] div.problem-name [data-cell-instanceid]', false) }
end

When(/^the user clicks "([^"]*)" vital column$/) do |arg1|
  column = "#{arg1} toolbar"
  expect(VitalsGist.instance.perform_action(column)).to eq(true)
end

Then(/^a popover toolbar displays buttons$/) do |table|
  vitals = VitalsGist.instance
  table.rows.each do | button |
    expect(vitals.am_i_visible? button[0]).to eq(true)
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
  expect(vitals.perform_action('First Vitals Row')).to eq(true)
  expect(vitals.perform_action('Detail View Icon')).to eq(true)
end


