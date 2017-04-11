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
