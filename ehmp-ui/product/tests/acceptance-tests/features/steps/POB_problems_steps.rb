Then(/^problems gist is loaded successfully$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

Then(/^problems summary view is loaded successfully$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_applet_loaded 
end

When(/^user hovers over the problems applet trend view row$/) do
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_fld_problems_gist
  expect(ehmp).to have_fld_problems_gist
  rows = ehmp.fld_problems_gist
  expect(rows.length).to be > 0
  rows[0].hover
end

When(/^user hovers over the problems applet row$/) do
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_tbl_problems
  expect(ehmp).to have_tbl_problems
  rows = ehmp.tbl_problems
  expect(rows.length).to be > 0
  rows[0].hover
end

Then(/^user navigates to problems expanded view$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.load
#  expect(@ehmp).to be_displayed
  @ehmp.wait_until_applet_loaded 
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Problems".upcase)
end

Then(/^the user sorts the Problems trend view applet by column Problem$/) do 
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_col_problems_visible
  expect(@ehmp).to have_col_problems
  @ehmp.col_problems.click
end

Then(/^the Problems trend view applet is sorted in alphabetic order based on Problem$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_fld_gist_problem_names
  
  column_values_array = []
  @ehmp.gist_problem_names_only.each do |row|
    column_values_array << row.downcase
  end
  
  expect(column_values_array.length).to be >= 2
  is_ascending = ascending_array? column_values_array
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{column_values_array}"
end

Then(/^the Problems trend view applet is sorted in reverse alphabetic order based on Problem$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_fld_gist_problem_names
  
  column_values_array = []
  @ehmp.gist_problem_names_only.each do |row|
    column_values_array << row.downcase
  end
  
  expect(column_values_array.length).to be >= 2
  is_descending = descending_array? column_values_array
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{column_values_array}"
end

Then(/^the user sorts the Problems trend view applet by column Onset date$/) do 
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_col_acuity_visible
  expect(@ehmp).to have_col_acuity
  @ehmp.col_acuity.click
end

Then(/^the Problems trend view applet is sorted in alphabetic order based on Onset date$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_fld_gist_onset
    
  column_values = @ehmp.fld_gist_onset
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Problems trend view applet is sorted in reverse alphabetic order based on Onset date$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_fld_gist_onset

  column_values = @ehmp.fld_gist_onset
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

Then(/^the user sorts the Problems trend view applet by column Facility$/) do 
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_col_facility_visible
  expect(@ehmp).to have_col_facility
  @ehmp.col_facility.click
end

Then(/^user verifies Problems trend view applet is present$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_fld_applet_title_visible
  expect(@ehmp).to have_fld_applet_title
  expect(@ehmp.fld_applet_title.text.upcase).to have_text("PROBLEMS")
end

Then(/^Problems trend view applet has headers$/) do |table|
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_fld_problems_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_problems_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Problems Applet display"
  end
end

Then(/^Problems trend view has data rows$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_applet_gist_loaded 
  expect(@ehmp.fld_problems_gist.length).to be > 0
end

When(/^user can expand the Problems trend view applet$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_btn_applet_expand_view_visible
  expect(@ehmp).to have_btn_applet_expand_view
  @ehmp.btn_applet_expand_view.click
end

Then(/^Problems expand view applet contains data rows$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_tbl_problems_visible
  expect(@ehmp.tbl_problems.length > 0).to be(true), "Problems expand view does not contain any data rows"
end

When(/^user closes the Problems Applet expand view$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_btn_applet_minimize_visible
  expect(@ehmp).to have_btn_applet_minimize
  @ehmp.btn_applet_minimize.click
end

Then(/^user is navigated back to overview page from problems expand view$/) do
  @ehmp = PobProblemsApplet.new
  PobOverView.new.wait_for_all_applets_to_load_in_overview
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Overview".upcase)
end

Then(/^Problems trend view applet displays Refresh button$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_btn_applet_refresh
  expect(@ehmp).to have_btn_applet_refresh
end

Then(/^Problems trend view applet displays Expand View button$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_btn_applet_expand_view
  expect(@ehmp).to have_btn_applet_expand_view
end

Then(/^Problems trend view applet displays Help button$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_btn_applet_help
  expect(@ehmp).to have_btn_applet_help
end

Then(/^Problems trend view applet displays Filter Toggle button$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_btn_applet_filter_toggle
  expect(@ehmp).to have_btn_applet_filter_toggle
end

Then(/^user opens Problems trend view applet search filter$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_btn_applet_filter_toggle_visible
  expect(@ehmp).to have_btn_applet_filter_toggle
  @ehmp.btn_applet_filter_toggle.click
  @ehmp.wait_until_fld_applet_text_filter_visible
end

Then(/^user filters the Problems trend view applet by text "([^"]*)"$/) do |filter_text|
  @ehmp = PobProblemsApplet.new
  row_count = @ehmp.fld_problems_gist.length
  @ehmp.wait_until_fld_applet_text_filter_visible
  expect(@ehmp).to have_fld_applet_text_filter
  @ehmp.fld_applet_text_filter.set filter_text
  @ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != @ehmp.fld_problems_gist.length }
end

Then(/^Problems trend view applet table only diplays rows including text "([^"]*)"$/) do |input_text|
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_fld_problems_gist_visible
  expect(only_text_exists_in_list(@ehmp.fld_problems_gist, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

When(/^user refreshes Problems trend view applet$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_btn_applet_refresh_visible
  expect(@ehmp).to have_btn_applet_refresh
  @ehmp.btn_applet_refresh.click
end

Then(/^the message on the Problems trend view applet does not say an error has occurred$/) do
  @ehmp = PobProblemsApplet.new
  expect(@ehmp).to have_no_fld_error_msg, "Problems trend view did not refresh"
end

Then(/^problems detail view contain fields$/) do |table|
  @ehmp = ModalElements.new
  @ehmp.wait_until_fld_modal_detail_labels_visible
  table.rows.each do |fields|
    expect(object_exists_in_list(@ehmp.fld_modal_detail_labels, "#{fields[0]}")).to eq(true), "#{fields[0]} was not found"
  end
end

Then(/^Problems trend view facility column displays valid facility$/) do
  ehmp = PobProblemsApplet.new
  applet_facilities = ehmp.gist_facility_column_text
  known_monikers = known_facilities_monikers

  expect(applet_facilities.length).to be > 0, "Precondition not met: test needs at least 1 facility column text"

  applet_facilities.each do | temp_facility |
    expect(known_monikers).to include temp_facility.upcase
  end
end

When(/^the user sorts the Problems applet by column Problem$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_col_problem_name
  expect(@ehmp).to have_col_problem_name
  @ehmp.col_problem_name.click
end

Then(/^the Problems applet is sorted in alphabetic order based on Problem$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_tbl_summary_problem_names
  column_values = @ehmp.summary_problem_name
  expect(column_values.size).to be >= 2, "Need atleast 2 problems to verify sorting found only #{column_values.size}"
  is_ascending = ascending_array? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order"
end

Then(/^the Problems applet is sorted in reverse alphabetic order based on Problem$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_tbl_summary_problem_names
  column_values = @ehmp.summary_problem_name
  expect(column_values.size).to be >= 2, "Need atleast 2 problems to verify sorting found only #{column_values.size}"
  is_descending = descending_array? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order"
end

Then(/^the user expands the Problems Applet$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_btn_applet_expand_view
  expect(@ehmp).to have_btn_applet_expand_view
  @ehmp.btn_applet_expand_view.click 
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("PROBLEMS".upcase)
  @ehmp.wait_for_btn_applet_minimize
  expect(@ehmp).to have_btn_applet_minimize  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(@ehmp.has_fld_empty_row?, @ehmp.tbl_problems) }
end

Then(/^problem applet table displays headers$/) do |table|
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_fld_problems_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_problems_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Problems Applet display"
  end
end

When(/^the user views a problem applet row's details$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_for_tbl_problems
  expect(@ehmp.tbl_problems.length).to be > 0
  @ehmp.tbl_problems[0].click
  ModalElements.new.wait_for_modal_body
  ModalElements.new.wait_until_fld_modal_detail_labels_visible
end

Given(/^user can view the Quick Menu Icon in problems applet$/) do
  ehmp = PobProblemsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in problems applet$/) do
  ehmp = PobProblemsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in problems applet$/) do
  ehmp = PobProblemsApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the problems applet$/) do |table|
  ehmp = PobProblemsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Then(/^there exists a quick view popover table in problems applet$/) do 
  ehmp = PobProblemsApplet.new
  QuickMenuActions.verify_popover_table ehmp
end

Then(/^problems quick look table contains headers$/) do |table|
  ehmp = PobProblemsApplet.new
  QuickMenuActions.verify_popover_table_headers ehmp, table
end

Then(/^user scrolls the problems applet into view$/) do 
  ehmp = PobProblemsApplet.new
  ehmp.scroll_into_view
end

When(/^user selects the detail view from Quick Menu Icon of problems applet$/) do
  ehmp = PobProblemsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end


