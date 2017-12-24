path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

And(/^The applet "(.*?)" on the coversheet page has been displayed$/) do |title|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_applet_title
  expect(@ehmp.fld_applet_title.text.upcase).to include(title)
end

And(/^Applet ALLERGIES expanded view have the below table header$/) do |table|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_expanded_applet_thead
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_expanded_applet_thead, "#{headers[0]}")).to eq(true), "The value: <#{headers[0]}> is not present in the table header"
  end
end

When(/^user sorts the Expanded Allergies Applet by the Standardized Allergen$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_expanded_header_standardized_allergen
  expect(ehmp).to have_expanded_header_standardized_allergen
  ehmp.expanded_header_standardized_allergen.click
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Standardized Allergen$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_expanded_allergy_column_s_allergen
  column_values = @ehmp.expanded_allergy_column_s_allergen
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

When(/^user sorts the Expanded Allergies Applet by the Allergen Name$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_expanded_header_allergen_name
  expect(ehmp).to have_expanded_header_allergen_name
  ehmp.expanded_header_allergen_name.click
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Allergen Name$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_expanded_allergy_column_allergen_names
  column_values = @ehmp.expanded_allergy_column_allergen_names
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order, #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

When(/^the user expands the Allergies Applet$/) do
  allergy_applet = PobAllergiesApplet.new
  expect(allergy_applet.wait_for_btn_applet_expand_view).to eq(true), "Expected a expanded button"
  allergy_applet.btn_applet_expand_view.click
  expect(allergy_applet.wait_for_btn_applet_minimize).to eq(true), "Expected a minimize button to be visible after the applet was expanded"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(allergy_applet.has_fld_empty_row?, allergy_applet.fld_expanded_applet_table_rows) }
end

Then(/^the Allergy Detail modal displays$/) do |table|
  allergy_modal = AllergyModal.new
  expect(allergy_modal.wait_for_fld_modal_title).to eq(true), "Expected modal (with title) to display"
  expect(allergy_modal.wait_for_btn_modal_close).to eq(true), "Expected modal (with close button) to display"
  expect(allergy_modal.data_labels.length).to be > 0, "Expected data with labels to display"
  label_text_upcase = allergy_modal.data_labels.map { |element| element.text.upcase }
  table.rows.each do | row |
    expect(label_text_upcase).to include "#{row[0]}:".upcase
  end

  expect(allergy_modal).to have_fld_drug_classes
  expect(allergy_modal).to have_fld_nature_of_reaction
  expect(allergy_modal).to have_fld_entered_by
  expect(allergy_modal).to have_fld_originated
  expect(allergy_modal).to have_fld_verified
  expect(allergy_modal).to have_fld_observed_or_historical
  expect(allergy_modal).to have_fld_observed_date
  expect(allergy_modal).to have_fld_facility
  expect(allergy_modal).to have_fld_severity
end

Then(/^the Allergy Detail modal displays either "([^"]*)" or "([^"]*)"$/) do |arg1, arg2|
  allergy_modal = AllergyModal.new
  expect(allergy_modal.wait_for_fld_modal_title).to eq(true)
  allergy_modal.wait_for_btn_modal_close
  error_btn_visible = allergy_modal.has_btn_entered_in_error?
  error_msg = allergy_modal.has_fld_edit_error_msg?
  expect(error_btn_visible || error_msg).to eq(true)
  error_msg_text = "Only data originating in your facility may be edited."
  expect(error_msg.text.upcase).to eq(error_msg_text.upcase) if error_msg
end

Then(/^the Allergy Applet table contains rows$/) do 
  allergy_applet = PobAllergiesApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(allergy_applet.has_fld_empty_row?, @ehmp.fld_expanded_applet_table_rows) }
  expect(allergy_applet.fld_expanded_applet_table_rows.length).to be > 0
end

When(/^the Allergies Applet expand view contains data rows$/) do
  allergy_applet = PobAllergiesApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(allergy_applet.has_fld_empty_row?, allergy_applet.fld_expanded_applet_table_rows) }
  expect(allergy_applet.fld_expanded_applet_table_rows.length).to be > 0
end

When(/^user refreshes Allergies Applet$/) do
  applet = PobAllergiesApplet.new
  expect(applet.wait_for_btn_applet_refresh).to eq(true)
  applet.btn_applet_refresh.click
end

Then(/^the message on the Allergies Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("allergy_grid", message_text)
end

Then(/^the expanded Allergies Applet is displayed$/) do
  allergy_applet = PobAllergiesApplet.new
  expect(allergy_applet).to have_menu
  expect(allergy_applet.menu).to have_fld_screen_name
  expect(allergy_applet.menu.fld_screen_name.text.upcase).to eq('ALLERGIES')

  expect(allergy_applet).to have_fld_applet_title
  expect(allergy_applet.fld_applet_title.text.upcase).to eq('ALLERGIES')

  expect(allergy_applet.wait_for_btn_applet_minimize).to eq(true), "Expected a minimize button to be visible after the applet was expanded"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(allergy_applet.has_fld_empty_row?, allergy_applet.fld_expanded_applet_table_rows) }
end

Then(/^the Allergies Applet contains an Add button$/) do
  allergy_applet = PobAllergiesApplet.new
  expect(allergy_applet.wait_for_btn_applet_add).to eq(true)
end

Then(/^user notes number of reported allergies$/) do
  allergy_gist = PobAllergiesApplet.new
  @num_allergy_pills = allergy_gist.fld_allergy_gist_pills.length
  expect(@num_allergy_pills).to be > 0
end

Then(/^the number of reported allergies is unchanged$/) do
  allergy_gist = PobAllergiesApplet.new
  @num_allergy_pills = allergy_gist.fld_allergy_gist_pills.length
  expect(allergy_gist.fld_allergy_gist_pills.length).to eq(@num_allergy_pills)
end

When(/^the user views the first Allergies detail view$/) do 
  ehmp = PobAllergiesApplet.new
  expect(ehmp.fld_expanded_applet_table_rows.length).to be > 0
  expect(ehmp.expanded_allergy_names.length).to be > 0

  @first_allergy_name = ehmp.expanded_allergy_names[0].upcase
  ehmp.fld_expanded_applet_table_rows[0].click
end

Then(/^the Allergy modal's title starts with "([^"]*)"$/) do |starts|
  allergy_modal = AllergyModal.new
  expect(@first_allergy_name).to_not be_nil, "Expected variable @first_allergy_name to be set by previous step"
  expect(allergy_modal.wait_for_fld_modal_title).to eq(true)
  text_only = Regexp.new("#{starts} - #{@first_allergy_name}")
  expect(allergy_modal.fld_modal_title.text.upcase).to match(text_only)
end

Then(/^the Allergies expand Applet contains buttons Refresh, Help and Minimize$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_minimize

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_minimize
end

Then(/^the Allergies expand Applet does not contain buttons Filter Toggle or Expand$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to_not have_btn_applet_filter_toggle
  expect(ehmp).to_not have_btn_applet_expand_view
end

Then(/^the user notes the number of expanded allergy rows$/) do
  ehmp = PobAllergiesApplet.new
  @num_allergy_rows = ehmp.expanded_rows.length
end

Then(/^the expanded Allergies applet displays the expected number of allergy rows$/) do
  expect(@num_allergy_rows).to_not be_nil, "Expected variable num_allergy_rows to be set by previous step"
  ehmp = PobAllergiesApplet.new
  expect(ehmp.expanded_rows.length).to eq(@num_allergy_rows)
end
