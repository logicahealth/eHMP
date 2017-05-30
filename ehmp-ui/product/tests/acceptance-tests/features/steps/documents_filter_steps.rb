def open_text_filter
  documents = PobDocumentsList.new
  expect(documents).to have_btn_applet_filter_toggle
  max_attempt = 2
  begin
    documents.btn_applet_filter_toggle.click unless documents.has_fld_applet_text_filter? && documents.fld_applet_text_filter.visible?
    expect(documents.wait_for_fld_applet_text_filter(3)).to eq(true), "The Text Filter input box is not visible"
  rescue Exception => e
    p "#{e}: retrying?"
    max_attempt -= 1
    retry if max_attempt > 0
    raise e
  end
  true
end

def filter_document_applet_by(search_field)
  documents = PobDocumentsList.new
  expect(documents.wait_for_fld_applet_text_filter).to eq(true), "Documents Text Filter input box is not visible"
  row_count = documents.fld_document_data_rows.length
  p "start with #{row_count} rows"
  documents.fld_applet_text_filter.set search_field
  documents.fld_applet_text_filter.native.send_keys(:enter)
  documents.wait_for_loading_message

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2)

  max_attempt = 1
  wait.until { 
    begin
      (row_count != documents.fld_document_data_rows.length) && documents.has_no_loading_message? 
    rescue Exception => e
      p 'keep trying until timeout'
    end
  }
  true
end

def verify_documents_only_displays_text(input_text)
  upper = input_text.upcase
  lower = input_text.downcase
  documents_grid_xpath = "//*[@id='content-region']/descendant::div[@data-appletid='documents']/descendant::table"
  path =  "#{documents_grid_xpath}/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
  row_count = PobDocumentsList.new.fld_document_data_rows.length
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Given(/^the user has filtered the Documents Applet on text "([^"]*)"$/) do |search_term|
  expect(open_text_filter).to eq(true)
  expect(filter_document_applet_by search_term).to eq(true)
  expect(verify_documents_only_displays_text search_term).to eq(true)
end

Then(/^the user opens the text search filter in Documents Applet$/) do
  expect(open_text_filter).to eq(true)
end

When(/^the user filters the Document Applet by text "(.*?)"$/) do |search_field|
  expect(filter_document_applet_by search_field).to eq(true)
end

Then(/^the Documents table only diplays rows including text "(.*?)"$/) do |input_text|
  expect(verify_documents_only_displays_text input_text).to eq(true)
end

When(/^the user has navigated away and then back to Summary view$/) do
  summary_screen = PobSummaryScreen.new

  timeline_screen = PobTimeline.new

  expect(summary_screen.menu).to have_btn_workspace_select
  summary_screen.menu.btn_workspace_select.click
  links = summary_screen.menu.workspace_links_by_name('Timeline')
  expect(links.length).to be > 0
  links[0].click
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { timeline_screen.applet_loaded? }

  expect(timeline_screen.menu).to have_btn_workspace_select
  timeline_screen.menu.btn_workspace_select.click
  links = timeline_screen.menu.workspace_links_by_name('Summary')
  expect(links.length).to be > 0
  links[0].click

  step 'the Summary View is active by default'
end

When(/^the user navigates to Summary Screen$/) do
  documents = PobDocumentsList.new
  expect(documents.menu).to have_btn_workspace_select
  documents.menu.btn_workspace_select.click
  links = documents.menu.workspace_links_by_name('Summary')
  expect(links.length).to be > 0
  links[0].click

  step 'the Summary View is active by default'
end

When(/^the user expands and then minimizes the Documents Applet$/) do
  documents = PobDocumentsList.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  # expand documents applet
  expect(documents).to have_btn_applet_expand_view
  documents.btn_applet_expand_view.click
  expect(documents.wait_for_btn_applet_minimize).to eq(true)
  wait.until { documents.applet_loaded? }

  # minimize documents applet
  documents.btn_applet_minimize.click
  expect(documents.wait_for_btn_applet_expand_view).to eq(true)
  wait.until { documents.applet_loaded? }
end

Then(/^the Documents Applet title indicates a filter is applied$/) do
  applet_filter = PobUDAF.new
  filtered_applet = applet_filter.create_filtered_applet_element('documents')
  expect(applet_filter).to have_filtered_applet
end

Then(/^the Documents Applet filter field is displayed$/) do
  documents = PobDocumentsList.new
  expect(documents).to have_fld_applet_text_filter
  expect(documents.fld_applet_text_filter.visible?).to eq(true), 'Expected the filter input field to be visible'
end

Then(/^the Documents Applet filter field is populated with text "([^"]*)"$/) do |arg1|
  documents = PobDocumentsList.new
  expect(documents).to have_fld_applet_text_filter
  expect(documents.fld_applet_text_filter.value).to eq(arg1)
end

Then(/^the Documents Applet title does not indicate a filter is applied$/) do
  applet_filter = PobUDAF.new
  begin
    filtered_applet = applet_filter.create_filtered_applet_element('documents')
  rescue
    p 'ignore this'
  end
  expect(applet_filter).to_not have_filtered_applet
end

Then(/^the Documents Applet displays filter pill "([^"]*)"$/) do |pill_text|
  applet_filter = PobUDAF.new
  expect(applet_filter.fld_udaf_tags.length).to be > 0
  expect(applet_filter.udaf_tag_text.map(&:upcase)).to include(pill_text.upcase)
end

Then(/^the Documents Applet displays filter (\d+) pills$/) do |num_pills|
  applet_filter = PobUDAF.new
  expect(applet_filter.fld_udaf_tags.length).to eq(num_pills.to_i)
end

Then(/^the Documents Applet filter field is not displayed$/) do
  documents = PobDocumentsList.new
  expect(documents).to_not have_fld_applet_text_filter
end

When(/^the user clears the Documents applet filter input$/) do
  documents = PobDocumentsList.new

  expect(documents.wait_for_btn_clear_filter_text).to eq(true), "Cannot find clear filter text button (x)"
  documents.btn_clear_filter_text.click

  expect(documents.wait_for_btn_clear_filter_text).to eq(false), "Expected clear filter text button (x) to dissappear"
  expect(documents).to have_fld_applet_text_filter
  expect(documents.fld_applet_text_filter.value).to eq('')
end

When(/^the user removes the Document applet filter for "([^"]*)"$/) do |term|
  expect(remove_single_udaf_tag(term)).to eq(true)
end

When(/^the user removes all filters on Document applet$/) do
  tags = PobUDAF.new 
  documents = PobDocumentsList.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)

  expect(documents.wait_for_btn_remove_all).to eq(true), "'Remove All' button is not displayed"
  documents.btn_remove_all.click
  wait.until { tags.fld_udaf_tags.length == 0 }
end
