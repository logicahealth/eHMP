Then(/^narrative lab results applet is loaded successfully$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  narrative_lab_results_loaded?
end

def narrative_lab_results_loaded?
  ehmp = PobNarrativeLabResultsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.fld_applet_table_rows) }
end

Then(/^user opens Narrative Lab Results summary view applet search filter$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_until_btn_applet_filter_toggle_visible
  expect(ehmp).to have_btn_applet_filter_toggle
  ehmp.btn_applet_filter_toggle.click
  ehmp.wait_until_fld_applet_text_filter_visible
end

When(/^user filters the Narrative Lab Results expand view applet by text "([^"]*)"$/) do |filter_text|
  ehmp = PobNarrativeLabResultsApplet.new
  row_count = ehmp.fld_applet_table_rows.length
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set filter_text
  #ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != ehmp.fld_applet_table_rows.length }
end

Then(/^Narrative Lab Results expand view applet table only displays rows including text "([^"]*)"$/) do |input_text|
  ehmp = PobNarrativeLabResultsApplet.new
  rows_text = ehmp.row_text
  rows_text.each do | tr_text |
    expect(tr_text.upcase).to include(input_text.upcase), "'#{tr_text}'' does not include filter text '#{input_text}'"
  end
end

When(/^user navigates to Narrative Lab Results Applet expanded view$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  narrative_lab_results_loaded?
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("NARRATIVE LAB RESULTS".upcase)
end

Then(/^the user sorts the Narrative Lab Results expand view applet by column Description$/) do 
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_until_fld_col_description_visible
  expect(ehmp).to have_fld_col_description
  ehmp.fld_col_description.click
end

Then(/^the Narrative Lab Results applet exapnd view applet is sorted in alphabetic order based on Description$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_for_fld_description_column_values
    
  column_values = ehmp.fld_description_column_values
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Narrative Lab Results applet expand view applet is sorted in reverse alphabetic order based on Description$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_for_fld_description_column_values

  column_values = ehmp.fld_description_column_values
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^the user views the details of the first Narrative Lab Results$/) do
  ehmp = PobNarrativeLabResultsApplet.new
  ehmp.wait_until_fld_applet_table_rows_visible
  rows = ehmp.fld_applet_table_rows
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end

