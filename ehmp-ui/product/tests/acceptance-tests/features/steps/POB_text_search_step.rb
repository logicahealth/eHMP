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
end

Then(/^the user expands the subgroup "([^"]*)"$/) do |sub_group_title|
  ehmp = PobRecordSearch.new
  ehmp.expand_sub_group(sub_group_title)
  ehmp.wait_for_fld_sub_group_title
  expect(ehmp).to have_fld_sub_group_title
  ehmp.fld_sub_group_title.click
end

Then(/^user enters the search term "([^"]*)" in the search record input field$/) do |search_text|
  ehmp = PobRecordSearch.new
  ehmp.wait_until_txt_search_text_visible(60)
  wait = Selenium::WebDriver::Wait.new(:timeout => 20)
  wait.until { ehmp.txt_search_text.disabled? != true } 
  expect(ehmp).to have_txt_search_text
  ehmp.txt_search_text.set search_text
  ehmp.txt_search_text.native.send_keys(:enter)
end

Then(/^text search returns data$/) do
  ehmp = PobRecordSearch.new
  ehmp.wait_until_fld_main_group_visible
  rows = ehmp.fld_main_group
  expect(rows.length >= 1).to eq(true), "this test expects at least 1 row, found only #{rows.length}"
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

