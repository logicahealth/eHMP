When(/^the user sorts the Encounters trend view applet by column Visit Type$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_col_visit_type_visible
  expect(@ehmp).to have_col_visit_type
  @ehmp.col_visit_type.click  
end

Then(/^the Encounters trend view applet is sorted in alphabetic order based on Visit Type$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_visit_type_column_values
    
  column_values = @ehmp.fld_visit_type_column_values
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Encounters trend view applet is sorted in reverse alphabetic order based on Visit Type$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_visit_type_column_values

  column_values = @ehmp.fld_visit_type_column_values
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^the user sorts the Encounters trend view applet by column HxOccurrence$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_col_hx_occurrence_visible
  expect(@ehmp).to have_col_hx_occurrence
  @ehmp.col_hx_occurrence.click  
end

Then(/^the Encounters trend view applet is sorted in alphabetic order based on column HxOccurrence$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_hx_occurrence_column_values
  
  column_values_array = []
  @ehmp.fld_hx_occurrence_column_values.each do |row|
    column_values_array << row.text.downcase.to_i
  end

  expect(@ehmp.fld_hx_occurrence_column_values.length).to be >= 2
  expect(ascending_array? column_values_array).to be(true), "values are not in alphabetical order: #{column_values_array}"
end

Then(/^the Encounters trend view applet is sorted in reverse alphabetic order based on column HxOccurrence$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_hx_occurrence_column_values

  column_values_array = []
  @ehmp.fld_hx_occurrence_column_values.each do |row|
    column_values_array << row.text.downcase.to_i
  end

  expect(@ehmp.fld_hx_occurrence_column_values.length).to be >= 2
  expect(descending_array? column_values_array).to be(true), "values are not in reverse alphabetical order: #{column_values_array}"
end

When(/^the user sorts the Encounters trend view applet by column Last$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_col_last_visible
  expect(@ehmp).to have_col_last
  @ehmp.col_last.click  
end

Then(/^the Encounters trend view applet is sorted in alphabetic order based on column Last$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_visits_last_column
  
  column_values_array = []
  @ehmp.fld_visits_last_column.each do |row|
    column_values_array << row.text.downcase.chomp('y').to_i
  end

  expect(@ehmp.fld_visits_last_column.length).to be >= 2
  expect(ascending_array? column_values_array).to be(true), "values are not in alphabetical order: #{column_values_array}"
end

Then(/^the Encounters trend view applet is sorted in reverse alphabetic order based on column Last$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_fld_visits_last_column

  column_values_array = []
  @ehmp.fld_visits_last_column.each do |row|
    column_values_array << row.text.downcase.chomp('y').to_i
  end

  expect(@ehmp.fld_visits_last_column.length).to be >= 2
  expect(descending_array? column_values_array).to be(true), "values are not in reverse alphabetical order: #{column_values_array}"
end

Then(/^POB user verifies Encounters trend view applet is present$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_applet_title_visible
  expect(@ehmp).to have_fld_applet_title
  expect(@ehmp.fld_applet_title.text.upcase).to have_text("ENCOUNTERS")
end

Then(/^POB Encounters trend view applet has headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounters_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet display"
  end
end

Then(/^POB Encounters trend view has data rows$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_data_visible
  expect(@ehmp.tbl_encounters_data.length > 0).to be(true), "Encounters Gist does not contain any data rows"
end

When(/^POB user can expand the Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_applet_expand_view_visible
  expect(@ehmp).to have_btn_applet_expand_view
  @ehmp.btn_applet_expand_view.click
end

Then(/^POB Encounters expand view\(timeline\) applet contains data rows$/) do
  @ehmp = PobTimeline.new
  @ehmp.wait_until_tbl_timeline_table_data_visible
  expect(@ehmp.tbl_timeline_table_data.length > 0).to be(true), "Timeline does not contain any data rows"
end

When(/^POB user closes the Encounters Applet expand view$/) do
  @ehmp = PobTimeline.new
  @ehmp.wait_until_btn_applet_minimize_visible
  expect(@ehmp).to have_btn_applet_minimize
  @ehmp.btn_applet_minimize.click
end

Then(/^POB user is navigated back to overview page from encounters expand view$/) do
  @ehmp = PobEncountersApplet.new
  overview = PobOverView.new
  overview.wait_for_all_applets_to_load_in_overview
  expect(overview.fld_all_applets.length == 9).to be(true), "Overview didn't load all applets"
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Overview".upcase)
end

Then(/^POB Encounters trend view applet displays Refresh button$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_btn_applet_refresh
  expect(@ehmp).to have_btn_applet_refresh
end

Then(/^POB Encounters trend view applet displays Expand View button$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_btn_applet_expand_view
  expect(@ehmp).to have_btn_applet_expand_view
end

Then(/^POB Encounters trend view applet displays Help button$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_btn_applet_help
  expect(@ehmp).to have_btn_applet_help
end

Then(/^POB Encounters trend view applet displays Filter Toggle button$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_for_btn_applet_filter_toggle
  expect(@ehmp).to have_btn_applet_filter_toggle
end

Then(/^POB user opens Encounters trend view applet search filter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_applet_filter_toggle_visible
  expect(@ehmp).to have_btn_applet_filter_toggle
  @ehmp.btn_applet_filter_toggle.click
  @ehmp.wait_until_fld_applet_text_filter_visible
end

Then(/^POB user filters the Encounters trend view applet by text "([^"]*)"$/) do |filter_text|
  @ehmp = PobEncountersApplet.new
  row_count = @ehmp.tbl_encounters_data.length
  @ehmp.wait_until_fld_applet_text_filter_visible
  expect(@ehmp).to have_fld_applet_text_filter
  @ehmp.fld_applet_text_filter.set filter_text
  @ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != @ehmp.tbl_encounters_data.length }
end

Then(/^POB Encounters trend view applet table only diplays rows including text "([^"]*)"$/) do |input_text|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_encounter_procedure_visible(30)
  expect(@ehmp).to have_encounter_procedure
  @ehmp.encounter_procedure.click
  @ehmp.wait_until_tbl_encounter_cell_data_visible
  expect(only_text_exists_in_list(@ehmp.tbl_encounter_cell_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

When(/^user refreshes Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_applet_refresh_visible
  expect(@ehmp).to have_btn_applet_refresh
  @ehmp.btn_applet_refresh.click
end

Then(/^the message on the Encounters trend view applet does not say an error has occurred$/) do
  @ehmp = PobEncountersApplet.new
  expect(@ehmp).to have_no_fld_error_msg, "Encounters trend view did not refresh"
end

def choose_first_visit_encounter
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_visits_encounter_visible
  expect(@ehmp).to have_btn_visits_encounter
  @ehmp.btn_visits_encounter.click
  @ehmp.wait_until_btn_first_visit_visible
  expect(@ehmp).to have_btn_first_visit
  @ehmp.btn_first_visit.click
end

def choose_first_appointment_encounter
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_appointments_encounter_visible
  expect(@ehmp).to have_btn_appointments_encounter
  @ehmp.btn_appointments_encounter.click
  @ehmp.wait_until_btn_first_appointment_visible
  expect(@ehmp).to have_btn_first_appointment
  @ehmp.btn_first_appointment.click
end

def choose_first_procedure_encounter
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_procedures_encounter_visible
  expect(@ehmp).to have_btn_procedures_encounter
  @ehmp.btn_procedures_encounter.click
  @ehmp.wait_until_btn_first_procedure_visible
  expect(@ehmp).to have_btn_first_procedure
  @ehmp.btn_first_procedure.click
end

def choose_first_admission_encounter
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_admissions_encounter_visible
  expect(@ehmp).to have_btn_admissions_encounter
  @ehmp.btn_admissions_encounter.click
  @ehmp.wait_until_btn_first_admission_visible
  expect(@ehmp).to have_btn_first_admission
  @ehmp.btn_first_admission.click
end

def view_quick_look_table
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_quick_view_visible
  expect(@ehmp).to have_btn_quick_view
  @ehmp.btn_quick_view.click 
end

def view_detail_modal
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_detail_view_visible
  expect(@ehmp).to have_btn_detail_view
  @ehmp.btn_detail_view.click
end

Then(/^the quick look table is displayed$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_quick_view_visible
  expect(@ehmp.tbl_quick_view.length > 0).to be(true), "Quick look table does not contain any data rows"
end

When(/^the user expands type Visits in Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_visits_encounter_visible
  expect(@ehmp).to have_btn_visits_encounter
  @ehmp.btn_visits_encounter.click
end

Given(/^Encounter trend view applet contains type Visits$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_visits_encounter_visible
  expect(@ehmp).to have_btn_visits_encounter
end

When(/^the user views the details for the first Visit type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_visit_encounter
  view_detail_modal
end

Then(/^Encounter trend view applet type Visits contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_visit_type_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounters_visit_type_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on encounter Visit"
  end
end

When(/^the user views the quick look for the first Visit type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_visit_encounter
  view_quick_look_table
end

Then(/^the Visit type quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_visit_type_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_visit_type_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user selects the right side of Visit type encounter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_rtclk_btn_visits_encounter_visible
  expect(@ehmp).to have_btn_visits_encounter
  @ehmp.rtclk_btn_visits_encounter.click
end

Then(/^the Visit quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_rtclk_visit_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_rtclk_visit_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user expands type Procedures in Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_procedures_encounter_visible
  expect(@ehmp).to have_btn_procedures_encounter
  @ehmp.btn_procedures_encounter.click
end

Given(/^Encounter trend view applet contains type Procedures$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_procedures_encounter_visible
  expect(@ehmp).to have_btn_procedures_encounter
end

Then(/^Encounter trend view applet type Procedures contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_procedures_type_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounters_procedures_type_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on encounter Procedure"
  end
end

When(/^the user views the details for the first Procedure type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_procedure_encounter
  view_detail_modal
end

When(/^the user views the quick look for the first Procedure type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_procedure_encounter
  view_quick_look_table
end

Then(/^the Procedure type quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_procedure_type_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_procedure_type_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user selects the right side of Procedure type encounter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_rtclk_btn_procedures_encounter_visible
  expect(@ehmp).to have_btn_procedures_encounter
  @ehmp.rtclk_btn_procedures_encounter.click
end

Then(/^the Procedure quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_rtclk_procedure_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_rtclk_procedure_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user expands type Admissions in Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_admissions_encounter_visible
  expect(@ehmp).to have_btn_admissions_encounter
  @ehmp.btn_admissions_encounter.click
end

Given(/^Encounter trend view applet contains type Admissions$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_admissions_encounter_visible
  expect(@ehmp).to have_btn_admissions_encounter
end

Then(/^Encounter trend view applet type Admissions contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_admissions_type_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounters_admissions_type_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on encounter Admission"
  end
end

When(/^the user views the details for the first Admission type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_admission_encounter
  view_detail_modal
end

When(/^the user views the quick look for the first Admission type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_admission_encounter
  view_quick_look_table
end

Then(/^the Admission type quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_admission_type_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_admission_type_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user selects the right side of Admission type encounter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_rtclk_btn_admissions_encounter_visible
  expect(@ehmp).to have_btn_admissions_encounter
  @ehmp.rtclk_btn_admissions_encounter.click
end

Then(/^the Admission quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_rtclk_admission_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_rtclk_admission_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user expands type Appointments in Encounters trend view applet$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_appointments_encounter_visible
  expect(@ehmp).to have_btn_appointments_encounter
  @ehmp.btn_appointments_encounter.click
end

Given(/^Encounter trend view applet contains type Appointments$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_appointments_encounter_visible
  expect(@ehmp).to have_btn_appointments_encounter
end

Then(/^Encounter trend view applet type Appointments contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounters_appointments_type_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounters_appointments_type_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on encounter Appointments"
  end
end

When(/^the user views the details for the first Appointment type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_appointment_encounter
  view_detail_modal
end

When(/^the user views the quick look for the first Appointment type encounter$/) do
  @ehmp = PobEncountersApplet.new
  choose_first_appointment_encounter
  view_quick_look_table
end

Then(/^the Appointment type quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_appointment_type_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_appointment_type_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

When(/^the user selects the right side of Appointment type encounter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_rtclk_btn_appointments_encounter_visible
  expect(@ehmp).to have_btn_appointments_encounter
  @ehmp.rtclk_btn_appointments_encounter.click
end

Then(/^the Appointment quick look table contain headers$/) do |table|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_encounter_rtclk_appointment_quick_look_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_encounter_rtclk_appointment_quick_look_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Encounters Applet quick look"
  end
end

Then(/^Encounters trend view applet displays a dynamic arrow in "([^"]*)" position$/) do |arrow_position|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_visits_encounter_arrow_visible
  expect(@ehmp.btn_visits_encounter_arrow['arrowposition'].eql? arrow_position).to eq(true), "Dynamic arrow is not in expected position"
end

When(/^the user views the details for the "([^"]*)" Admission type encounter$/) do |type|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_spinal_cord_admission_visible
  expect(@ehmp).to have_btn_spinal_cord_admission
  @ehmp.btn_spinal_cord_admission.click
  view_detail_modal
end


