# require 'adk_steps.rb'
class ConditionsGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    
    @appletid = 'problems'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new("ProblemsGridVisible"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .gist-item-list"))
    add_verify(CucumberLabel.new("problems details"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .gist-item-list"))
    add_verify(CucumberLabel.new("problems column header"), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid=problems] .row.header-bar.noMargin'))
    
    add_applet_buttons appletid_css 
    add_applet_title appletid_css
    add_applet_add_button appletid_css
    add_toolbar_buttons

    add_action(CucumberLabel.new("quick view"), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='quickLook_urn_va_problem_9E7A_711_141']"))
    add_verify(CucumberLabel.new("Main Modal Label"), VerifyContainsText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_action(CucumberLabel.new("Problem Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='name-header']"))
    add_action(CucumberLabel.new("Acuity Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='comment-header']"))
    add_action(CucumberLabel.new("Status Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='status-name-header']"))
    add_action(CucumberLabel.new("Facility Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='facility-name-header']"))
    add_action(CucumberLabel.new("Manic Disorder"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .gist-item:nth-child(3) .col-sm-6.selectable.info-display.noPadding"))
    add_verify(CucumberLabel.new("No Records Found"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] p.color-grey-darkest"))

    add_action(CucumberLabel.new("Chronic sinusitis"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .gist-item:nth-child(2) .col-sm-6.selectable.border-vertical.info-display.noPadding"))
    add_action(CucumberLabel.new("Essential Hypertension"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'problem-name') and contains(string(), 'Essential hypertension (disorder)')]/ancestor::div[contains(@class, 'selectable')]"))
    
    #menu  
    add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] div.toolbarActive [button-type=quick-look-button-toolbar]"))
    add_action(CucumberLabel.new("Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] div.toolbarActive [button-type=detailView-button-toolbar]"))
    
    # START COMMENT
    # originally these buttons were found through css selectors.
    # the selectors worked locally but were failing when run on jenkins
    # when I say locally
    #     a. laptop terminal against laptop vms with browser phantomjs
    #     b. laptop terminal against jenkins acc test job url with browser phantomjs
    manic_disorder_xpath = "//*[@data-row-instanceid='row_urn:va:problem:9E7A:711:141']"
    applet_toolbar_xpath = "descendant::div[contains(@class, 'toolbarPopover')]"
    # //*[@data-row-instanceid='row_urn:va:problem:9E7A:711:141']/descendant::div[contains(@class, 'toolbarPopover')]/descendant::*[@button-type='detailView-button-toolbar']
    add_action(CucumberLabel.new("Mainic Disorder Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "#{manic_disorder_xpath}/#{applet_toolbar_xpath}/descendant::*[@button-type='quick-look-button-toolbar']"))
    add_action(CucumberLabel.new("Mainic Disorder Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "#{manic_disorder_xpath}/#{applet_toolbar_xpath}/descendant::*[@button-type='detailView-button-toolbar']"))
    # END COMMENT

    add_verify(CucumberLabel.new('Problems Popover'), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover'))
    add_verify(CucumberLabel.new('Popover Date Header'), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover thead th:nth-child(1)'))
    add_verify(CucumberLabel.new('Popover Description Header'), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover thead th:nth-child(2)'))
    add_verify(CucumberLabel.new('Popover Facility Header'), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover thead th:nth-child(3)'))
    @@popover_row_count = AccessHtmlElement.new(:xpath, "//div[contains(@class, 'gist-popover')]/descendant::tbody/descendant::tr")
    add_verify(CucumberLabel.new("Popover Rows"), VerifyXpathCount.new(@@popover_row_count), @@popover_row_count)
    
    @@conditions_gist_items = AccessHtmlElement.new(:css, "#problems-event-gist-items .gist-item")
    add_verify(CucumberLabel.new("Number of Problems Gist Items"), VerifyXpathCount.new(@@conditions_gist_items), @@conditions_gist_items)         
  
    add_verify(CucumberLabel.new("Empty Gist"), VerifyText.new, AccessHtmlElement.new(:css, "#{appletid_css} p.color-grey-darkest"))
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))

    # Headers
    add_verify(CucumberLabel.new('Header - Problem'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new('Header - Acuity'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='comment-header']"))
    add_verify(CucumberLabel.new('Header - Status'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='status-name-header']"))
    add_verify(CucumberLabel.new('Header - Facility'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-header-instanceid='facility-name-header']"))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Gist'
    return TestSupport.driver.find_elements(:css, '[data-appletid=problems] .gist-item').length > 0
  rescue => e 
    # p e
    false
  end
end 

class ConditionsGistHeaders < ADKContainer
  include Singleton
  def initialize
    super   

    add_verify(CucumberLabel.new('Description'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-problemText"]'))
    add_verify(CucumberLabel.new('Standardized Description'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-standardizedDescription"]'))
    add_verify(CucumberLabel.new('Acuity'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-acuityName"]'))
    add_verify(CucumberLabel.new('Onset Date'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-onsetFormatted"]'))
    add_verify(CucumberLabel.new('Last Updated'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-updatedFormatted"]'))
    add_verify(CucumberLabel.new('Provider'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-providerDisplayName"]'))
    add_verify(CucumberLabel.new('Facility'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] [data-header-instanceid="problems-facilityMoniker"]'))
  end
end

class ProblemList <  ADKContainer
  include Singleton
  def initialize
    super
    add_problem('MANIC DISORDER-MILD', 'urn_va_problem_9E7A_711_141')
    add_problem('UPPER EXTREMITY', 'urn_va_problem_9E7A_711_139')
    add_problem('Essential Hypertension', 'urn_va_problem_9E7A_711_79')
    add_problem('ALCOH DEP NEC/NOS-REMISS', 'urn_va_problem_9E7A_711_69')
    add_problem('Adjustment Reaction With Physical Symptoms', 'urn_va_problem_9E7A_711_70')
    add_problem('Chronic Sinusitis', 'urn_va_problem_9E7A_711_72')

    # the data-cell-instanceid for this problem appears to change
    xpath = "//div[@data-appletid='problems']/descendant::span[contains(string(), 'Essential hypertension')]/ancestor::div[starts-with(@data-cell-instanceid, 'event_name_urn_va_problem')]"
    add_action(CucumberLabel.new("Essential Hypertension - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  end

  def add_problem(cucumber_label, css)
    occurance = Regexp.new("\\d+")
    last = Regexp.new("\\d+y")

    add_verify(CucumberLabel.new("#{cucumber_label} - Problem"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-cell-instanceid='event_name_#{css}']"))
    add_verify(CucumberLabel.new("#{cucumber_label} - Acuity"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-item-instanceid='acuity_#{css}']"))
    add_verify(CucumberLabel.new("#{cucumber_label} - Status"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-cell-instanceid='status_name_#{css}']"))
    facility_element = AccessHtmlElement.new(:css, "[data-appletid=problems] [data-cell-instanceid='facility_moniker_#{css}']")
    add_verify(CucumberLabel.new("#{cucumber_label} - Facility"), VerifyFacilityMoniker.new(facility_element), facility_element)
    add_action(CucumberLabel.new("#{cucumber_label} - Problem Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] [data-cell-instanceid='event_name_#{css}']"))
  end
end 

class ActiveProblems <  ConditionsGist
  include Singleton
  def initialize
    super   
    add_verify(CucumberLabel.new('Empty Problem Row'), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-problems tr.empty'))
    add_action(CucumberLabel.new('Description Header'), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-problemText'] a")) 
    add_action(CucumberLabel.new('Acuity Header'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="problems"] .grid-header-acuityName a'))
    add_action(CucumberLabel.new('Problem detail icon'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=problems] [button-type=detailView-button-toolbar]'))
  end

  def applet_grid_loaded
    return true if am_i_visible? 'Empty Problem Row'
    return TestSupport.driver.find_elements(:css, '#data-grid-problems tr.selectable').length > 0
  rescue => e 
    p e
    false
  end
end

class ActiveProblemsModal <  ADKContainer
  include Singleton
  def initialize
    super  

    # add_verify(Cucucmber.new(''), VerifyText.new, AccessHtmlElement.new(:id, ''))
    add_verify(CucumberLabel.new('Primary ICD-9-CM label'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=Primary_ICD-9-CM_Label]"))
    add_verify(CucumberLabel.new('Primary ICD-9-CM'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=Primary_ICD-9-CM]'))

    add_verify(CucumberLabel.new('SNOMED CT label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=Snomed_Label]'))
    add_verify(CucumberLabel.new('SNOMED CT'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=Snomed]'))

    add_verify(CucumberLabel.new('Onset label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_onset_label]'))
    add_verify(CucumberLabel.new('Onset'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_onset]'))

    add_verify(CucumberLabel.new('Acuity label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_acuity_label]'))
    add_verify(CucumberLabel.new('Acuity'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_acuity]'))

    add_verify(CucumberLabel.new('Provider label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detai-label=problem_provider_label]'))
    add_verify(CucumberLabel.new('Provider'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_provider]'))

    add_verify(CucumberLabel.new('Status label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_status_label]'))
    add_verify(CucumberLabel.new('Status'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_status]'))

    add_verify(CucumberLabel.new('Facility label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_facility_label]'))
    add_verify(CucumberLabel.new('Facility'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_facility]'))

    add_verify(CucumberLabel.new('Location label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_location_label]'))
    add_verify(CucumberLabel.new('Location'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_location]'))

    add_verify(CucumberLabel.new('Entered label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_entered_label]'))
    add_verify(CucumberLabel.new('Entered'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_entered]'))

    add_verify(CucumberLabel.new('Updated label'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-detail-label=problem_updated_label]'))
    add_verify(CucumberLabel.new('Updated'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=problem_updated]'))
  end
end 

Before do
  @cg = ConditionsGist.instance
end

Then(/^user sees Problems Gist$/) do  
  expect(@cg.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(@cg.perform_verification("Title", "PROBLEMS")).to be_true
end

Then(/^the problems gist detail view contains$/) do |table|
  aa = ProblemList.instance    
  table.rows.each do |row|
    expect(aa.perform_verification("#{row[0]} - Problem", row[0])).to be_true, "The value #{row[0]} is not present in the problems gist"
    expect(aa.perform_verification("#{row[0]} - Acuity", row[1])).to be_true, "The value #{row[1]} is not present in the problems gist"
    expect(aa.perform_verification("#{row[0]} - Status", row[2])).to be_true, "The value #{row[2]} is not present in the problems gist"
    expect(aa.perform_verification("#{row[0]} - Facility", row[3])).to be_true, "The value displayed in the facility column is not considered a valid facility"
  end
end

Then(/^the problems gist detail view has headers$/) do |table|
  
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  table.rows.each do |row|
    expect(@cg.perform_verification("Header - #{row[0]}", row[0])).to be_true, "The value #{row[0]} is not present in the problems detail headers"
  end
end

Then(/^the Problems Gist applet title is "(.*?)"$/) do |title|
  expect(@cg.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(@cg.perform_verification("Title", title)).to be_true
end

Then(/^hovering over the right side of problem trend view and selecting the "(.*?)" pop\-up link$/) do |quick_view| 
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  @cg.add_action(CucumberLabel.new('hover'), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='problems']/descendant::*[contains(@class, 'quick-view-popover')][1]"))
  hover = wait.until { driver.find_element(:xpath, "//*[@data-appletid='problems']/descendant::*[contains(@class, 'quick-view-popover')][1]") }
  driver.action.move_to(hover).perform       
  expect(@cg.perform_action('hover', "")).to be_true
end

Then(/^clicking a second time on the "(.*?)" hover button will result in the closure of the quick draw data box$/) do |quick_view|
  expect(@cg.perform_action('hover', "")).to be_true
end

When(/^user clicks on the left hand side of the item "(.*?)"$/) do |problem_text|
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true 
  problem_list = ProblemList.instance 
  p "#{problem_text} - Problem Click"    
  expect(problem_list.perform_action("#{problem_text} - Problem Click", "")).to be_true, "cannot click on the problem text"
end

Then(/^it should show the detail modal of the most recent for this problem$/) do
  expect(@cg.wait_until_action_element_visible("Main Modal Label", DefaultLogin.wait_time)).to be_true
end

When(/^user clicks on the column header "(.*?)" in Problems Gist$/) do |name_column_header|
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  expect(@cg.perform_action(name_column_header + " Header", "")).to be_true
end

Given(/^the user notes the order of the problems in the Problems Gist$/) do
  problems = PobProblemsApplet.new
  problems.wait_for_fld_gist_problem_names
  @default_problem_gist_order = problems.gist_problem_names_only
  expect(@default_problem_gist_order.length).to be > 0
end

When(/^the user clicks the last row in the problems applet$/) do
  problems = PobProblemsApplet.new
  problems.wait_for_fld_gist_problem_names
  expect(problems.fld_gist_problem_names.length).to be > 2, "This test has a prerequestite requirement that the patient used has more then 2 problems"
  problems.fld_gist_problem_names.last.click
  problems.wait_for_fld_toolbar
  expect(problems).to have_fld_toolbar
end

Then(/^Problem column is sorted in default order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_problem_names
  expect(@default_problem_gist_order).to_not be_nil, "Expected default problem order to be saved in a previous step"
  wait.until { (problems.gist_problem_names_only <=> @default_problem_gist_order) == 0 }

  expect(problems.gist_problem_names_only).to eq(@default_problem_gist_order)
end

Then(/^Problem column is sorted in ascending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_problem_names
  expect(problems.gist_problem_names_only.length).to be >= 2
  expected_sort_result = problems.gist_problem_names_only.sort { |x, y| x.downcase <=> y.downcase }
  begin
    wait.until { problems.gist_problem_names_only == expected_sort_result }
  ensure
    expect(problems.gist_problem_names_only).to eq(expected_sort_result)
  end
end

Then(/^Problem column is sorted in descending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_problem_names
  expect(problems.gist_problem_names_only.length).to be >= 2
  expected_sort_result = problems.gist_problem_names_only.sort { |x, y| y.downcase <=> x.downcase }
  begin
    wait.until { problems.gist_problem_names_only == expected_sort_result }
  ensure
    expect(problems.gist_problem_names_only).to eq(expected_sort_result)
  end
end

Then(/^Acuity column is sorted in ascending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_acuity
  expect(problems.gist_acuity_column_text.length).to be >= 2
  expected_sort_result = problems.gist_acuity_column_text.sort { |x, y| x.downcase <=> y.downcase }
  begin
    wait.until { problems.gist_acuity_column_text == expected_sort_result }
  ensure
    expect(problems.gist_acuity_column_text).to eq(expected_sort_result)
  end
end

Then(/^Acuity column is sorted in descending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_acuity
  expect(problems.gist_acuity_column_text.length).to be >= 2
  expected_sort_result = problems.gist_acuity_column_text.sort { |x, y| y.downcase <=> x.downcase }
  begin
    wait.until { problems.gist_acuity_column_text == expected_sort_result }
  ensure
    expect(problems.gist_acuity_column_text).to eq(expected_sort_result)
  end
end

Then(/^Status column is sorted in ascending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_status
  expect(problems.gist_status_column_text.length).to be >= 2
  expected_sort_result = problems.gist_status_column_text.sort { |x, y| x.downcase <=> y.downcase }
  begin
    wait.until { problems.gist_status_column_text == expected_sort_result }
  ensure
    expect(problems.gist_status_column_text).to eq(expected_sort_result)
  end
end

Then(/^Status column is sorted in descending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_status
  expect(problems.gist_status_column_text.length).to be >= 2
  expected_sort_result = problems.gist_status_column_text.sort { |x, y| y.downcase <=> x.downcase }
  begin
    wait.until { problems.gist_status_column_text == expected_sort_result }
  ensure
    expect(problems.gist_status_column_text).to eq(expected_sort_result)
  end
end

Then(/^Facility column is sorted in ascending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_facility
  expect(problems.gist_facility_column_text.length).to be >= 2
  expected_sort_result = problems.gist_facility_column_text.sort { |x, y| x.downcase <=> y.downcase }
  begin
    wait.until { problems.gist_facility_column_text == expected_sort_result }
  ensure
    expect(problems.gist_facility_column_text).to eq(expected_sort_result)
  end
end

Then(/^Facility column is sorted in descending order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_facility
  expect(problems.gist_facility_column_text.length).to be >= 2
  expected_sort_result = problems.gist_facility_column_text.sort { |x, y| y.downcase <=> x.downcase }
  begin
    wait.until { problems.gist_facility_column_text == expected_sort_result }
  ensure
    expect(problems.gist_facility_column_text).to eq(expected_sort_result)
  end
end

Then(/^Problem column is sorted in manual order in Problems Gist$/) do
  problems = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  problems.wait_for_fld_gist_problem_names
  expect(@manual_problem_gist_order).to_not be_nil, "Expected manual sort order to be saved in a previous step"
  wait.until { (problems.gist_problem_names_only <=> @manual_problem_gist_order) == 0 }
  expect(problems.gist_problem_names_only).to eq(@manual_problem_gist_order)
end

Then(/^Last column is sorted in "(.*?)" order in Problems Gist$/) do |_arg1|
  driver = TestSupport.driver
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  element_column_values = driver.find_elements(css: '#problems-event-gist-items div.eventsTimeSince.counter2.text-center')
  column_values_array = []
  element_column_values.each do |row|
    #column_values_array << row.text.downcase
    column_values_array << (/\d+/.match(row.text.downcase)).to_s
  end
  p column_values_array
  
  if _arg1.eql?('descending')
    p 'check ascending'
    higher_placement = column_values_array[0].to_i
    column_values_array.each do |year|
      lower_placement = year.to_i
      expect(higher_placement).to be >= lower_placement, "#{higher_placement} is not >= #{lower_placement}"
    end
  else
    p 'check descending'
    higher_placement = column_values_array[0].to_i
    column_values_array.each do |year|
      lower_placement = year.to_i
      expect(higher_placement).to be <= lower_placement, "#{higher_placement} is not <= #{lower_placement}"
    end
  end
end

Then(/^a Menu appears on the Problems Gist$/) do
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  expect(@cg.wait_until_action_element_visible("Detail View Icon", DefaultLogin.wait_time)).to be_true, "Detail view icon is not displayed"
  expect(@cg.wait_until_action_element_visible("Quick View Icon", DefaultLogin.wait_time)).to be_true, "Quick view icon is not displayed"    
end

Then(/^a Menu appears on the Problems Gist for item "(.*?)"$/) do |arg1|
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  expect(@cg.wait_until_action_element_visible('Detail View Button')).to eq(true), "Detail View button is not displayed"
  expect(@cg.wait_until_action_element_visible('Quick View Button')).to eq(true), "Quick View button is not displayed"
end

When(/^user select the menu "(.*?)" in Problems Gist$/) do |icon|
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  expect(@cg.perform_action(icon, "")).to be_true, "#{icon} can't be clicked"
end

Then(/^the Problems Gist Applet table contains headers$/) do |table|
  headers = ConditionsGistHeaders.instance
  table.rows.each do |row|
    expect(headers.perform_verification(row[0], row[0])).to be_true
  end
end

Then(/^user selects the "(.*?)" detail icon in Problems Gist$/) do |arg1|
  expect(@cg.perform_action('Detail View Button')).to be_true
end

Then(/^user selects the "(.*?)" quick view icon in Problems Gist$/) do |arg1|
  label = "#{arg1} Quick View Icon"
  p label
  expect(@cg.perform_action(label)).to be_true
end

Then(/^"(.*?)" message is displayed in Problems Gist$/) do |no_records_message|
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  expect(@cg.perform_verification(no_records_message, no_records_message))
end

When(/^hovering over the "(.*?)" side of the tile "(.*?)"$/) do |direction, _problem_text|
  
  driver = TestSupport.driver
  expect(@cg.wait_until_action_element_visible("ProblemsGridVisible", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
       
  case direction
  when 'right'
    hover = wait.until { driver.find_element(:css, "[data-row-instanceid='quickLook_urn_va_problem_9E7A_711_139']") }
    driver.action.move_to(hover).perform 
    p hover.css_value("background-color")    
  when 'left'
    hover = wait.until { driver.find_element(:css, "[data-appletid=problems] #event_urn_va_problem_9E7A_711_139 .col-sm-6.selectable.info-display.noPadding") }
    driver.action.move_to(hover).perform 
    p hover.css_value("background-color")  
  else
    fail "**** No function found! Check your script ****"
  end
end

When(/^the user filters the Problems Gist Applet by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = TableContainer.instance.get_elements("Rows - Problems Gist Applet").size
  expect(@active_problems.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Problems Gist Applet").size }
end

Then(/^the problems gist table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//div[contains(@class, 'gist-item-list')]/descendant::div[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::div[@data-code]"

  row_count = TableContainer.instance.get_elements("Rows - Problems Gist Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Then(/^the Problems Gist Quick View Table table contains rows$/) do 
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @cg.am_i_visible? 'Problems Popover' }
  expect(@cg.perform_verification('Popover Date Header', 'Date')).to eq(true)
  expect(@cg.perform_verification('Popover Description Header', 'Description')).to eq(true)
  expect(@cg.perform_verification('Popover Facility Header', 'Facility')).to eq(true)
  expect(@cg.wait_until_xpath_count_greater_than('Popover Rows', 0)).to eq(true)
end

When(/^the Problems Gist Applet contains data rows$/) do
  compare_item_counts('[data-appletid=problems] .gist-item-list .gist-item')
end

When(/^user refreshes Problems Gist Applet$/) do
  applet_refresh_action("problems")
end

Then(/^the message on the Problems Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("problems", message_text)
end

Then(/^the expanded Problems Applet is displayed$/) do
  aa = ActiveProblems.instance
  expected_screen = 'Problems'
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", 'PROBLEMS')).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_grid_loaded }
end

# Then(/^the Problems applet contains buttons$/) do |table|
#   table.rows.each do | button|
#     cucumber_label = "Control - applet - #{button[0]}"
#     expect(@cg.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
#   end
# end

When(/^user clicks on the Problem Name of first problem$/) do
  conditions = PobProblemsApplet.new
  conditions.wait_for_fld_gist_problem_names
  expect(conditions.fld_gist_problem_names.length).to be > 0
  conditions.fld_gist_problem_names[0].click
  conditions.wait_for_fld_toolbar
  expect(conditions).to have_fld_toolbar
end

Then(/^user selects the quick view icon in Problems Gist$/) do
  conditions = PobProblemsApplet.new
  conditions.wait_for_btn_quick_view
  expect(conditions).to have_btn_quick_view
  conditions.btn_quick_view.click
end
