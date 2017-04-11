class NarrativeLabResults < AllApplets
  include Singleton
  attr_reader :applet_wait
  attr_reader :table_id
  def initialize
    super
    appletid_css = '[data-appletid=narrative_lab_results_grid]'

    @applet_wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
    @table_id = 'data-grid-narrative_lab_results_grid'

    add_verify(CucumberLabel.new("Empty Record"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))
    add_action(CucumberLabel.new("First Row"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} table tr.selectable:nth-child(1)"))

    # NarrativeLabResults Applet buttons
    add_applet_buttons appletid_css  
    add_applet_title appletid_css
    
    # HEADERS
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-observed]"))
    add_verify(CucumberLabel.new("Lab Test"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-typeName]"))
    add_verify(CucumberLabel.new("Flag"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-flag]"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-result]"))
    add_verify(CucumberLabel.new("Unit"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-units]"))
    add_verify(CucumberLabel.new("Ref Range"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-referenceRange]"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-facilityMoniker]"))

    row_count = AccessHtmlElement.new(:css, "#{appletid_css} table tr.selectable")
    add_verify(CucumberLabel.new('row count'), VerifyXpathCount.new(row_count), row_count)
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Record'
    return TestSupport.driver.find_elements(:css, "##{@table_id} tbody tr.selectable").length > 0
  rescue => e 
    # p e
    false
  end
end

When(/^user navigates to expanded Narrative Lab Results Applet$/) do
  navigate_in_ehmp '#narrative-lab-results-grid-full'
end

Then(/^the narrative lab results applet title is "([^"]*)"$/) do |arg1|
  narrative_labresults = NarrativeLabResults.instance
  expect(narrative_labresults.perform_verification("Title", arg1)).to eq(true)
end

Then(/^the Narrative Lab Results applet contains buttons$/) do |table|
  narrative_labresults = NarrativeLabResults.instance
  table.rows.each do | button|
    cucumber_label = "Control - Applet - #{button[0]}"
    expect(narrative_labresults.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Narrative Lab Results expanded contains headers$/) do |table|
  driver = TestSupport.driver
  narrative_labresults = NarrativeLabResults.instance
  headers = driver.find_elements(:css, "##{narrative_labresults.table_id} th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = NarrativeLabResults.instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end

Then(/^Narrative Lab Results applet loads without issue$/) do
  narrative_labresults = NarrativeLabResults.instance
  narrative_labresults.applet_wait.until { narrative_labresults.applet_loaded? }
end

When(/^the Narrative Lab results applet displays at least (\d+) row$/) do |num_result|
  narrative_labresults = NarrativeLabResults.instance
  expect(narrative_labresults.wait_until_xpath_count_greater_than('row count', num_result.to_i - 1)).to eq(true), "Test requires at least one result to verify functionality"
end

When(/^the user views the first narrative lab result in a modal$/) do
  narrative_labresults = NarrativeLabResults.instance
  driver = TestSupport.driver
  expect(narrative_labresults.perform_action('First Row')).to eq(true)
  driver.find_element(:id, "info-button-sidekick-detailView").click
  modal_open = @uc.wait_until_element_present("Modal", 15)
end
