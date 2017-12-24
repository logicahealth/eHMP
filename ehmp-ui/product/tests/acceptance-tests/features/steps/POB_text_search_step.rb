Given(/^user searches for "(.*?)"$/) do |text_term|
  ehmp = PobRecordSearch.new
  perform_search(text_term)
  ehmp.wait_for_fld_main_group(30)
end

def perform_search(text_term)
  ehmp = PobRecordSearch.new
  ehmp.wait_until_txt_search_text_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { ehmp.txt_search_text.disabled? != true }  
  ehmp.txt_search_text.set text_term
  ehmp.txt_search_text.native.send_keys(:enter) 
end

Then(/^the text search applets displays grouped results including "(.*?)"$/) do |grouped_result|
  @ehmp = PobSearchRecord.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { @ehmp.fld_group_titles.length > 0 }
  expect(@ehmp.group_titles_text).to include(grouped_result.upcase)
end

When(/^the user expands the grouped results for "(.*?)"$/) do |grouped_result|
  # //div[string() = 'Discharge Summary']/ancestor::button[starts-with(@data-target, '#result-group-')]
  @ehmp = PobSearchRecord.new unless @ehmp.is_a? PobSearchRecord

  expect(@ehmp.expand_group_element(grouped_result)['aria-expanded']).to eq('false')

  @ehmp.expand_group_element(grouped_result).click

  p @ehmp.expand_group_element(grouped_result)['aria-expanded']
  expect(@ehmp.expand_group_element(grouped_result)['aria-expanded']).to eq('true')

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { @ehmp.fld_sub_group_results.length > 0 }
end

When(/^the user expands the subgroup for "(.*?)"$/) do |grouped_result|
  #[groupontext='Discharge Summary'] button
  @ehmp = PobSearchRecord.new unless @ehmp.is_a? PobSearchRecord

  expect(@ehmp.expand_subgroup_element(grouped_result)['aria-expanded']).to eq('false')

  @ehmp.expand_subgroup_element(grouped_result).click

  expect(@ehmp.expand_subgroup_element(grouped_result)['aria-expanded']).to eq('true')

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { @ehmp.search_result_items(grouped_result).length > 0 }

end

When(/^the user enters record search term "([^"]*)"$/) do |text|
  search_text(text)

  @ehmp = PobSearchRecord.new unless @ehmp.is_a? PobSearchRecord
  @ehmp.wait_until_fld_search_suggest_search_for_visible
end

Then(/^the search suggestions display at least 1 inferred drug class$/) do
  @ehmp = PobSearchRecord.new unless @ehmp.is_a? PobSearchRecord
  labels = @ehmp.search_suggestion_labels
  expect(labels).to include('Inferred Drug Class'), "expected labels to contain at least 1 'Inferred Drug Class', but the only labels displayed are #{labels}"
end

Then(/^the search suggestions containing search term "([^"]*)" are bold$/) do |text|
  @ehmp = PobSearchRecord.new unless @ehmp.is_a? PobSearchRecord
  elements = @ehmp.search_suggestion_bold text
  expect(elements.length).to be > 0, "Expected at least 1 search suggestion to contain a bolded '#{text}'"
end

When(/^the user expands the main group "([^"]*)"$/) do |main_group_title|
  ehmp = PobRecordSearch.new
  ehmp.expand_main_group(main_group_title)
  ehmp.wait_for_fld_main_group_title
  expect(ehmp).to have_fld_main_group_title
  ehmp.fld_main_group_title.click
  ehmp.verify_main_group_data(main_group_title)
  ehmp.wait_for_fld_main_group_data
end

Then(/^the user expands the subgroup "([^"]*)"$/) do |sub_group_title|
  ehmp = PobRecordSearch.new
  ehmp.expand_sub_group(sub_group_title)
  ehmp.wait_for_fld_sub_group_title
  expect(ehmp).to have_fld_sub_group_title
  ehmp.fld_sub_group_title.click
  ehmp.verify_sub_group_data(sub_group_title)
  ehmp.wait_for_fld_sub_group_data
end

Then(/^text search returns data$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_until_fld_main_group_visible
  rows = ehmp.fld_main_group
    
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { rows.length >= 1 }
    
  expect(rows.length >= 1).to eq(true), "this test expects at least 1 row, found only #{rows.length}"
end

Then(/^text search results are grouped$/) do
  @ehmp = PobRecordSearch.new
  max_attempt = 2
  begin
    @ehmp.wait_until_fld_main_group_visible
    wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
    wait.until { @ehmp.fld_main_group.length > 0 }
  rescue => wait_exception
    p "#{wait_exception}"
    max_attempt-=1
    raise wait_exception if max_attempt <= 0
    retry if max_attempt > 0
  end
  expect(@ehmp.fld_main_group.length).to be > 0, "Expected at least one search result group, got #{@ehmp.fld_main_group.length}"
end

Then(/^the user expands all result groups$/) do
  @ehmp = PobRecordSearch.new
  @ehmp.expand_all_results
end

def choose_first_search_result
  ehmp = PobRecordSearch.new
  ehmp.wait_until_fld_search_results_data_rows_visible
  expect(ehmp).to have_fld_search_results_data_rows
  rows = ehmp.fld_search_results_data_rows
  expect(rows.length >= 1).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end

Then(/^the user views details of the first "([^"]*)"$/) do |not_used|
  choose_first_search_result
end

Then(/^the user views details of the first subgroup "([^"]*)"$/) do |sub_group_title|
  ehmp = PobRecordSearch.new
  ehmp.sub_group_search_items(sub_group_title)
  ehmp.wait_for_fld_sub_group_items
  expect(ehmp).to have_fld_sub_group_items
  rows = ehmp.fld_sub_group_items
  expect(rows.length >= 1).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click 
end

Then(/^modal detail status field has a value of "([^"]*)"$/) do |status_result|
  ehmp = PobRecordSearch.new
  ehmp.wait_until_status_result_visible
  expect(ehmp.status_result.text.upcase).to have_text(status_result.upcase)
end

Then(/^the sub group returns data$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_until_fld_document_sub_groups_visible
  rows = ehmp.fld_document_sub_groups
  expect(rows.length >= 1).to eq(true), "this test expects at least 1 row, found only #{rows.length}"
end

Then(/^the search results containing search term "([^"]*)" are highlighted$/) do |text|
  ehmp = PobRecordSearch.new
  ehmp.wait_until_search_term_match_visible(20)
  elements = ehmp.search_term_match
  expect(elements.length).to be > 0, "Expected at least 1 search suggestion to contain a highlighted text '#{text}'"
  elements.each do |element|
    expect(element.text.upcase == text.upcase).to be true
  end
end

Then(/^a the Radiology Report modal displays$/) do
  @ehmp = DocumentDetail.new
  helper = HelperMethods.new
  @ehmp.wait_until_fld_detail_label_visible
  @ehmp.wait_until_fld_results_links_visible
  @ehmp.wait_for_fld_results_region

  expect(@ehmp).to have_fld_detail_label
  expect(@ehmp).to have_fld_facility_label
  expect(@ehmp).to have_fld_facility
  expect(@ehmp).to have_fld_type_label
  expect(@ehmp).to have_fld_type
  expect(@ehmp).to have_fld_status_label
  expect(@ehmp).to have_fld_status
  expect(@ehmp).to have_fld_date_label
  expect(@ehmp).to have_fld_date
  expect(@ehmp).to have_fld_providers_label
  expect(@ehmp).to have_fld_providers
  
  expect(@ehmp.fld_modal_title.text.upcase).to_not start_with("LOADING")
  expect(helper.known_facilities).to include @ehmp.fld_facility.text.upcase
  expect(helper.date_only? @ehmp.fld_date.text).to eq(true), "#{@ehmp.fld_date.text} did not match expected format"
  
  expect(@ehmp).to have_fld_results_region
  expect(@ehmp.fld_results_links.length).to be > 0
  @ehmp.wait_for_fld_result_doc
  expect(@ehmp).to have_fld_result_doc
end

Then(/^no subgroup data rows are loaded$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_for_btn_expand_sub_group
  expect(ehmp.btn_expand_sub_group.length).to be > 0
  expect(ehmp.fld_search_results_data_rows.length).to eq(0)
  @subgroup_data_row_count = 0
end

Then(/^subgroup data rows are loaded$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_for_fld_search_results_data_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time) 
  wait.until { ehmp.fld_search_results_data_rows.length > 0 }
  expect(ehmp.fld_search_results_data_rows.length).to be > 0
  @subgroup_data_row_count = ehmp.fld_search_results_data_rows.length
end

Then(/^more subgroup data rows are loaded$/) do
  expect(@subgroup_data_row_count).to_not be_nil
  ehmp = PobRecordSearch.new
  ehmp.wait_for_fld_search_results_data_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time) 
  wait.until { ehmp.fld_search_results_data_rows.length > @subgroup_data_row_count }
  expect(ehmp.fld_search_results_data_rows.length).to be > @subgroup_data_row_count
end

When(/^user filters the text search results by predefined time frame 2yr$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_2yr
  @ehmp.btn_2yr.click
  @ehmp.wait_until_btn_active_2yr_visible

  begin
    @ehmp.wait_for_fld_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_num_result_count.text.to_i > 0
end

Then(/^the the text search results only display results from the last 2yrs \( or Unknown \)$/) do
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_year(2).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

When(/^user filters the text search results by predefined time frame 1yr$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_1yr
  @ehmp.btn_1yr.click
  @ehmp.wait_until_btn_active_1yr_visible

  begin
    @ehmp.wait_for_fld_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_num_result_count.text.to_i > 0
end

Then(/^user searches for "([^"]*)" and verifies spelling suggestions are displayed$/) do |text|
  perform_text_suggestion_search(text)

  @ehmp = PobRecordSearch.new
  @ehmp.wait_until_fld_suggestion_list_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp.fld_spelling_suggestions.length).to be > 0
end

def perform_text_suggestion_search(search_text)
  search = PobRecordSearch.new
  search.wait_until_txt_search_text_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 20)
  wait.until { search.txt_search_text.disabled? != true } 
  expect(search).to have_txt_search_text
  search.txt_search_text.set search_text
  search.wait_until_fld_suggestion_list_items_visible(30)
end

Then(/^user searches for "(.*?)" and verifies suggestions$/) do |text, table|
  search = PobRecordSearch.new
  suggest = []

  perform_text_suggestion_search(text)
  table.rows.each do |rows_value|
    expect(object_exists_in_list(search.fld_suggestion_list_items, "#{rows_value[0]}")).to eq(true), "#{rows_value[0]} was not found in the suggestion list"  
  end
end

Then(/^the the text search results only display results from the last 1yr \( or Unknown \)$/) do
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_year(1).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

When(/^user filters the text search results by predefined time frame 3mo$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_3m
  @ehmp.btn_3m.click
  @ehmp.wait_until_btn_active_3m_visible

  begin
    @ehmp.wait_for_fld_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_num_result_count.text.to_i > 0
end

Then(/^the the text search results only display results from the last 3mos \( or Unknown \)$/) do 
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_month(3).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

Then(/^the text search results contain document sub groups$/) do
  @ehmp = PobRecordSearch.new 
  @ehmp.wait_until_fld_first_document_subgroup_visible
  expect(@ehmp.fld_document_sub_groups.length).to be > 0
  expect(@ehmp.fld_document_sub_group_badges.length).to be > 0
  expect(@ehmp.fld_document_sub_group_badges.length).to eq(@ehmp.fld_document_sub_groups.length)
end

Then(/^the text search subgroup "([^"]*)" results display$/) do |groupontext, table|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new
  @ehmp.group_results(groupontext)
  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_subgroup_dates.length > 0 }

  facility_elements = @ehmp.fld_subgroup_facilities
  expect(facility_elements.length).to be > 0
  facility_elements.each do | facility |
    expect(helper.known_facilities).to include facility.text.upcase
  end

  date_elements = @ehmp.fld_subgroup_dates
  date_elements.each do | date_element |
    # p date_element.text
    next if date_element.text.upcase.eql?('UNKNOWN')
    expect(helper.date_only? date_element.text).to eq(true), "Date not in correct format: #{date_element.text}"
  end
end

Then(/^the text search community health summaries "([^"]*)" results display$/) do |groupontext, table|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new

  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_community_health_search_result_dates.length > 0 }

  title_elements = @ehmp.fld_community_health_search_result_titles
  expect(title_elements.length).to be > 0
  title_elements.each do | title |
    #p title.text
    expect(@ehmp.community_health_summaries_titles).to include title.text
  end

  facility_elements = @ehmp.fld_community_health_search_result_facilities
  expect(facility_elements.length).to be > 0
  facility_elements.each do | facility |
    #p facility.text
    expect(facility).to_not be_nil, "#{facility} not present"
    expect(@ehmp.community_health_facility_correct_format? facility.text).to eq(true), "Facility is not in correct format: #{facility.text}"
  end

  date_elements = @ehmp.fld_community_health_search_result_dates
  date_elements.each do | date_element |
    #p date_element.text
    next if date_element.text.upcase.eql?('UNKNOWN')
    expect(helper.date_only? date_element.text).to eq(true), "Date not in correct format: #{date_element.text}"
  end
end

When(/^the user selects a result from "([^"]*)" subgroup$/) do |groupontext|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new
  @ehmp.group_results(groupontext)
  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_subgroup_dates.length > 0 }

  @ehmp.fld_subgroup_dates[0].click
end

Then(/^the Search Results header displays statement in format Displaying number of result for searched term$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_for_fld_number_results
  expect(ehmp).to have_fld_number_results
  p "#{ehmp.fld_number_results.text}"
  expect(ehmp.fld_number_results.text.match(/Displaying \d+ results for “\w+”/)).to_not be_nil, "does not match the format"
end

Then(/^user selects the View Synonyms Used button$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_for_btn_view_synonyms_used
  expect(ehmp).to have_btn_view_synonyms_used
  ehmp.btn_view_synonyms_used.click
end

Then(/^the View Synonyms Used button is enabled$/) do
  ehmp = PobRecordSearch.new
  expect(ehmp.wait_for_btn_view_synonyms_used).to eq(true)
  expect(ehmp.btn_view_synonyms_used.disabled?).to eq(false), "Expected View Synonyms Used button to be enabled"
end

When(/^the text search synonym popover line 1 displays text "([^"]*)"$/) do |text|
  ehmp = PobRecordSearch.new
  ehmp.wait_for_popover_content_line1
  expect(ehmp).to have_popover_content_line1
  expect(ehmp.popover_content_line1.text).to eq(text)
end

When(/^the text search synonym popover displays synonyms "([^"]*)"$/) do |synonyms|
  ehmp = PobRecordSearch.new
  ehmp.wait_for_popover_content_synonyms
  expect(ehmp).to have_popover_content_synonyms
  expect(ehmp.popover_content_synonyms.text).to eq(synonyms)
end

Then(/^Current Status for Lab is ACTIVE$/) do
  ehmp = PobCommonElements.new
  ehmp.wait_for_fld_detail_modal_content
  expect(ehmp).to have_fld_detail_modal_content
  expect(ehmp.fld_detail_modal_content.text.upcase).to have_text("ACTIVE")
end

Then(/^Current Status for Radiology is "([^"]*)"$/) do |status|
  ehmp = DocumentDetail.new
  ehmp.wait_for_fld_status
  expect(ehmp).to have_fld_status
  expect(ehmp.fld_status.text.upcase).to have_text(status.upcase)
end

Then(/^user searches for "(.*?)" with no suggestion$/) do |search_text|
  search = PobRecordSearch.new
  search.wait_until_txt_search_text_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 20)
  wait.until { search.txt_search_text.disabled? != true } 
  expect(search).to have_txt_search_text
  search.txt_search_text.set search_text
  search.wait_until_fld_no_results_message_visible(30)
  expect(search.fld_no_results_message.text.upcase).to have_text("No Suggestions".upcase)
end

Then(/^user searches for "(.*?)" with no duplicates in the results dropdown$/) do |text|
  search = PobRecordSearch.new
  suggest = []

  perform_text_suggestion_search(text)
  for i in 1..search.fld_suggestion_list_items.length
    search.define_element_suggestion_text(i)
    search.wait_until_fld_text_search_suggestion_visible
    suggest[i] = search.fld_text_search_suggestion.text
  end
  
  p "#{suggest}"
  expect(suggest.uniq! == nil).to be_true
end

Then(/^the modal contains highlighted "(.*?)"$/) do |searchterm|
  ehmp = PobRecordSearch.new
  ehmp.wait_for_modal_search_term_highlights(20)
  expect(ehmp).to have_modal_search_term_highlights
  elements = ehmp.modal_search_term_highlights
  verify_highlights(elements, searchterm)
end

Then(/^the text search results containing search term "([^"]*)" are highlighted$/) do |searchterm|
  ehmp = PobRecordSearch.new
  ehmp.wait_until_search_term_match_visible(20)
  elements = ehmp.search_term_match
  verify_highlights(elements, searchterm)
end

def verify_highlights(elements, searchterm)
  highlights = []
  elements.each do |element|
    highlights << element.text.upcase
  end
  #p highlights
  expect(highlights.length).to be > 0, "Expected at least 1 highlighted text '#{text}'"
  expect(highlights).to include searchterm.upcase
end

Then(/^community health summaries modal contains term "([^"]*)" as highlighted$/) do |text|
  ehmp = PobRecordSearch.new
  driver = TestSupport.driver
  ehmp.wait_for_count_frame
  expect(ehmp.count_frame.length > 0).to be_true, "Expected to find one iframe"
  driver.switch_to.frame(0) #only one frame and iframe index starts at zero
  ehmp.wait_for_txt_highlighted_text(30)
  expect(ehmp).to have_txt_highlighted_text
  elements = ehmp.txt_highlighted_text
  expect(elements.length).to be > 0, "Expected at least 1 highlighted text '#{text}'"
  elements.each do |element|
    expect(element.text.upcase).to include(text.upcase), "#{element.text} does not include #{text}"  
  end
  driver.switch_to.default_content # need to switch control back to main window
end

Then(/^user searches for "([^"]*)" and verifies suggestion labels$/) do |text|
  perform_text_suggestion_search(text)
end

Then(/^the following choices should be displayed for the Text Search Date Filter$/) do |table|
  driver = TestSupport.driver
  expected_displays = table.headers
  key_append = "Range"
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)
  expected_displays.each do |expected_display|
    expected_display = "all" if expected_display.downcase == "any"
    actual_element = driver.find_element(:css, "[data-appletid='search'] [id^='#{expected_display.downcase}#{key_append}']")
    begin
      wait.until { actual_element.displayed? }
    rescue
      p "!! Not displayed: #{expected_display} !!"
      raise
    end #begin/rescue
  end
end

Then(/^the PRS text box is cleared$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_until_txt_search_text_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { ehmp.txt_search_text.disabled? != true }  
  expect(ehmp.txt_search_text.value).to eq('')
end

Then(/^user selects the close icon in serach record workspace$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_until_btn_text_search_close_visible
  ehmp.btn_text_search_close.click
end

Then(/^there exists a main group "([^"]*)"$/) do | main_group |
  ehmp = PobRecordSearch.new
  ehmp.expand_main_group(main_group)
  expect(ehmp).to have_fld_main_group_title
end

When(/^the text search main group Consult result display valid titles$/) do
  @ehmp = PobRecordSearch.new
  @ehmp.main_group_results('Consult')
  @ehmp.wait_until_fld_maingroup_titles_visible
  title_elements = @ehmp.fld_maingroup_titles
  expect(title_elements.length).to be > 0
  title_elements.each do | title |
    #p title.text
    expect(@ehmp.consult_titles).to include title.text.upcase
  end
end

When(/^the text search main group Request Activity result displays titles$/) do
  @ehmp = PobRecordSearch.new
  @ehmp.main_group_results('RequestActivity')
  @ehmp.wait_until_fld_maingroup_titles_visible
  title_elements = @ehmp.fld_maingroup_titles
  expect(title_elements.length).to be > 0
  title_elements.each do | title |
  # p title.text
    expect(title).to_not be_nil, "#{title} not present"
  end
end

Then(/^the text search main group "([^"]*)" results display$/) do |groupontext, table|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new
  @ehmp.main_group_results(groupontext)
  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_maingroup_dates.length > 0 }
  
  facility_elements = @ehmp.fld_maingroup_facilities
  expect(facility_elements.length).to be > 0
  facility_elements.each do | facility |
    expect(@ehmp.ehmp_facilities).to include facility.text.upcase
  end
  
  date_elements = @ehmp.fld_maingroup_dates
  date_elements.each do | date_element |
    # p date_element.text
    next if date_element.text.upcase.eql?('UNKNOWN')
    expect(helper.date_only? date_element.text).to eq(true), "Date not in correct format: #{date_element.text}"
  end
end

Then(/^user searches for "([^"]*)" with timestamp appended$/) do |text_term|
  ehmp = PobRecordSearch.new
  #p text_term + ' ' + @text_search_term
  perform_search(text_term + ' ' + @text_search_term)
  ehmp.wait_for_fld_main_group(30)
end
