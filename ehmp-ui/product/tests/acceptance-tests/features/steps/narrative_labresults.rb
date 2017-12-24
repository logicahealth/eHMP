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
    add_toolbar_buttons
    
    # HEADERS
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-observed]"))
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-narrativeDescription]"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-displayTypeName]"))
    add_verify(CucumberLabel.new("Author/Verifier"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-author]"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=narrative_lab_results_grid-facilityMoniker]"))

    row_count = AccessHtmlElement.new(:css, "#{appletid_css} table tr.selectable")
    add_verify(CucumberLabel.new('row count'), VerifyXpathCount.new(row_count), row_count)
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Record'
    return TestSupport.driver.find_elements(:css, "[data-appletid=narrative_lab_results_grid] tbody tr.selectable").length > 0
  rescue => e 
    # p e
    false
  end
end

When(/^user navigates to expanded Narrative Lab Results Applet$/) do
  navigate_in_ehmp '#/patient/narrative-lab-results-grid-full'
end

Then(/^the narrative lab results applet title is "([^"]*)"$/) do |arg1|
  narrative_labresults = NarrativeLabResults.instance
  expect(narrative_labresults.perform_verification("Title", arg1)).to eq(true)
end

Then(/^the Narrative Lab Results expanded contains headers$/) do |table|
  driver = TestSupport.driver
  narrative_labresults = NarrativeLabResults.instance
  headers = driver.find_elements(:css, "##{narrative_labresults.table_id} th[role='columnheader']") 
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
  modal_open = @uc.wait_until_element_present("Modal", 15)
end

When(/^the user expands\/maximizes the Narrative Lab Results applet$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_until_btn_applet_expand_view_visible
  ehmp.btn_applet_expand_view.click
  ehmp.wait_until_btn_applet_expand_view_invisible
end

Then(/^the Narrative Lab Results applet contains buttons Refresh, Help, Filter Toggle and Minimize$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_filter_toggle
  ehmp.wait_for_btn_applet_minimize

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_minimize
end

Given(/^user scrolls the narrative lab applet into view$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.scroll_into_view
end

Given(/^user hovers over the narrative lab summary row$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_for_fld_applet_table_rows
  expect(ehmp.fld_applet_table_rows.length).to be > 0
  ehmp.fld_applet_table_rows[0].hover
end

Given(/^user can view the Quick Menu Icon in narrative lab applet$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in narrative lab applet$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in narrative lab applet$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the narrative lab applet$/) do |table|
  ehmp = PobNarrativeLabResultsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user hovers over the narrative lab expanded row$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_for_fld_applet_table_rows
  expect(ehmp.fld_applet_table_rows.length).to be > 0
  ehmp.fld_applet_table_rows[0].hover
end

Given(/^user selects the detail view from Quick Menu Icon of narrative lab applet$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end
