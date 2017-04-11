Then(/^POB user selects and sets new encounter with location "(.*?)" and provider "(.*?)"$/) do  |encounter_location, encounter_provider|
  @ehmp = PobEncountersApplet.new

  @ehmp.wait_for_btn_set_encounter
  @ehmp.wait_for_btn_confirm_encounter_disabled
  @ehmp.wait_until_btn_set_encounter_visible(30) 

  expect(@ehmp.btn_set_encounter).to have_text("No Visit Set")
  expect(@ehmp).to have_btn_set_encounter
  @ehmp.btn_set_encounter.click
  @ehmp.wait_for_ddl_encounter_provider
  @ehmp.wait_for_fld_tab_new_visit
  @ehmp.wait_until_fld_tab_new_visit_visible
  expect(@ehmp).to have_fld_tab_new_visit
  @ehmp.fld_tab_new_visit.click

  # set location
  @ehmp.wait_for_ddl_encounter_location
  # @ehmp.wait_until_ddl_encounter_location_visible
  expect(@ehmp).to have_ddl_encounter_location
  @ehmp.ddl_encounter_location.click
  @ehmp.wait_until_fld_encounter_search_box_visible
  @ehmp.fld_encounter_search_box.set encounter_location
  @ehmp.fld_encounter_search_box.native.send_keys(:enter)

  # set provider
  @ehmp.wait_until_ddl_encounter_provider_visible
  expect(@ehmp).to have_ddl_encounter_provider
  @ehmp.ddl_encounter_provider.click
  @ehmp.wait_until_fld_encounter_search_box_visible
  @ehmp.fld_encounter_search_box.set encounter_provider
  @ehmp.fld_encounter_search_box.native.send_keys(:enter)
  #@ehmp.fld_encounter_search_box.native.send_keys(:tab)
  #p 'sent enter'
  #sleep 10
  @ehmp.wait_until_btn_confirm_encounter_disabled_invisible
  @ehmp.wait_until_btn_confirm_encounter_visible
  expect(@ehmp).to have_btn_confirm_encounter

  @ehmp.btn_confirm_encounter.click
  
  # verify_and_close_growl_alert_pop_up("Successfully set with no errors.")
  
  @ehmp.wait_until_btn_set_encounter_visible  
  expect(@ehmp.btn_set_encounter.text.upcase).to have_text(encounter_location.upcase), "Expected #{@ehmp.btn_set_encounter.text} to have #{encounter_location}"
end

When(/^the POB user selects change current encounter$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_set_encounter_visible(30) 
  expect(@ehmp.btn_set_encounter).to have_text("Current Encounter")
  expect(@ehmp).to have_btn_set_encounter
  @ehmp.btn_set_encounter.click

  @ehmp.wait_for_btn_confirm_encounter
  @ehmp.wait_until_fld_tray_loader_invisible(60)
  expect(@ehmp).to_not have_fld_tray_loader
end

When(/^POB user chooses to set a new visit$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_tab_new_visit_visible
  expect(@ehmp).to have_fld_tab_new_visit
  @ehmp.fld_tab_new_visit.click
end

Then(/^the POB set visit button is disabled$/) do
  @ehmp = PobEncountersApplet.new
  expect(@ehmp).to have_btn_confirm_encounter
  page.should have_xpath("//button[@id='viewEncounters-btn' and @disabled='']")
end

Then(/^POB user chooses new encounter location$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_ddl_encounter_location_visible(30)
  expect(@ehmp).to have_ddl_encounter_location
  @ehmp.ddl_encounter_location.click
  @ehmp.wait_until_fld_encounter_search_box_visible
  @ehmp.fld_encounter_search_box.set "Cardiology"
  @ehmp.fld_encounter_search_box.native.send_keys(:enter)
end

Then(/^POB user chooses new encounter provider$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_ddl_encounter_provider_visible(30)
  expect(@ehmp).to have_ddl_encounter_provider
  @ehmp.ddl_encounter_provider.click
  @ehmp.wait_until_fld_encounter_search_box_visible
  @ehmp.fld_encounter_search_box.set "Audiologist,One"
  @ehmp.fld_encounter_search_box.native.send_keys(:enter)
end

Then(/^the POB set visit button is enabled$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_confirm_encounter_visible(30)
  expect(@ehmp).to have_btn_confirm_encounter
end

Then(/^POB user selects set to apply changes$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.btn_confirm_encounter.click
  @ehmp.wait_until_btn_confirm_encounter_invisible(30)
end

Then(/^POB new visit encounter is set$/) do
  @ehmp.wait_until_btn_set_encounter_visible
  expect(@ehmp.btn_set_encounter).to have_text("Cardiology")
end

When(/^POB user chooses to set a clinic appointments$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_tab_clinic_appointment_visible
  expect(@ehmp).to have_fld_tab_clinic_appointment
  @ehmp.fld_tab_clinic_appointment.click
end

When(/^POB user chooses the first clinic appointment$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_clinic_appointment_visible(30)
  expect(@ehmp).to have_tbl_clinic_appointment
  @ehmp.tbl_clinic_appointment.click
end

Then(/^POB new clinic appointment encounter is set$/) do
  @ehmp.wait_until_btn_set_encounter_visible(30)
  expect(@ehmp.btn_set_encounter.text.upcase).to have_text("Audiology".upcase)
end

When(/^POB user chooses to set a hospital admissions$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_tab_hospital_admission_visible
  expect(@ehmp).to have_fld_tab_hospital_admission
  @ehmp.fld_tab_hospital_admission.click
end

When(/^POB user chooses the first hospital admission$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_tbl_hosptial_admission_visible(30)
  expect(@ehmp).to have_tbl_hosptial_admission
  @ehmp.tbl_hosptial_admission.click
end

When(/^POB new hospital admission encounter is set$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_set_encounter_visible(30)
  expect(@ehmp.btn_set_encounter.text.upcase).to have_text("Drugster".upcase)
end

When(/^POB user opens the encounter form$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_encounter_form_visible
  expect(@ehmp).to have_btn_encounter_form
  @ehmp.btn_encounter_form.click
  @ehmp.wait_until_fld_encounter_modal_visible(30)
end

When(/^POB user chooses primary provider$/) do
  @ehmp = PobEncountersApplet.new
  TestSupport.driver.find_element(:css, "input[id$='primaryProviderCheck']").location_once_scrolled_into_view
  @ehmp.wait_for_fld_check_primary_provider
  #@ehmp.wait_until_fld_check_primary_provider_visible(5)
  #expect(@ehmp).to have_fld_check_primary_provider
  #@ehmp.fld_check_primary_provider.click
  page.execute_script "$('input[id$=primaryProviderCheck]').trigger('click')"
end

When(/^POB user accepts the encounter$/) do
  @ehmp = PobEncountersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_btn_ok_visible
    expect(@ehmp).to have_btn_ok
    @ehmp.btn_ok.click
    @ehmp.wait_until_btn_ok_invisible(30)
  rescue Exception => e
    max_attempt-=1
    raise e if max_attempt <= 0
    p "*** Going to retry Accepting encounter ***"
    retry if max_attempt > 0
  end
end

Then(/^POB user verifies clinic appointment is set to the location "([^"]*)"$/) do |encounter_location|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_tab_clinic_appointment_visible
  expect(@ehmp).to have_fld_tab_clinic_appointment
  @ehmp.fld_tab_clinic_appointment.click
  @ehmp.wait_until_tbl_clinic_appointment_visible
  expect(@ehmp.tbl_clinic_appointment.text.upcase).to have_text(encounter_location.upcase)
end

Then(/^POB user is able to select a diagnosis from the list$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_diagnosis_1_visible
  expect(@ehmp).to have_fld_diagnosis_1
  @ehmp.fld_diagnosis_1.click
  @ehmp.wait_until_fld_diagnosis_2_visible
  expect(@ehmp).to have_fld_diagnosis_2
  @ehmp.fld_diagnosis_2.click
  @ehmp.wait_for_fld_selected_result
  expect(@ehmp).to have_fld_selected_result
  @ehmp.wait_for_fld_primary_diagnosis
  expect(@ehmp).to have_fld_primary_diagnosis
  @ehmp.wait_for_btn_remove_diagnosis
  expect(@ehmp).to have_btn_remove_diagnosis 
end

Then(/^POB user can add another diagnosis code$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_add_other_diagnosis_visible
  expect(@ehmp).to have_fld_add_other_diagnosis
  @ehmp.fld_add_other_diagnosis.click
  @ehmp.wait_until_btn_diagnosis_cancel_visible
  expect(@ehmp).to have_btn_diagnosis_cancel
  @ehmp.btn_diagnosis_cancel.click
end

Then(/^POB user is able to select a visit type from the options listed$/) do
  @ehmp = PobEncountersApplet.new
  TestSupport.driver.find_element(:css, "#visitTypeSelection").location_once_scrolled_into_view
  @ehmp.wait_until_fld_visit_type_selection_visible
  @ehmp.fld_visit_type_selection.select "***ESTABLISHED PATIENT***"
  @ehmp.wait_until_fld_limited_check_box_visible
  expect(@ehmp).to have_fld_limited_check_box
  rows = @ehmp.fld_limited_check_box
  rows[0].click
end

Then(/^POB user can add another visit type modifier$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_btn_add_modifier_visit_type_visible
  expect(@ehmp).to have_btn_add_modifier_visit_type
  @ehmp.btn_add_modifier_visit_type.click
  
  @ehmp.wait_until_btn_add_modifier_service_visible(20)
  expect(@ehmp).to have_btn_add_modifier_service
  @ehmp.btn_add_modifier_service.click
  
  @ehmp.wait_until_btn_done_add_modifier_visible
  expect(@ehmp).to have_btn_done_add_modifier
  @ehmp.btn_done_add_modifier.click
  @ehmp.wait_until_btn_done_add_modifier_invisible
  
  expect(@ehmp).to have_fld_add_modifier_text
end

Then(/^POB user is able to remove the option primary provider$/) do
  @ehmp = PobEncountersApplet.new
  TestSupport.driver.find_element(:css, "input[id$='primaryProviderCheck']").location_once_scrolled_into_view
  @ehmp.wait_until_btn_remove_primary_provider_visible
  expect(@ehmp).to have_btn_remove_primary_provider
  rows = @ehmp.btn_remove_primary_provider
  rows[1].click
  expect(@ehmp).to have_no_btn_remove_primary_provider
end

Then(/^POB user is able to select a procedure from the options listed$/) do
  @ehmp = PobEncountersApplet.new
  TestSupport.driver.find_element(:css, "#procedureSection").location_once_scrolled_into_view
  @ehmp.wait_until_fld_procedure_section_visible
  @ehmp.fld_procedure_section.select "***NEW PATIENT***"
  @ehmp.wait_until_fld_select_procedure_visible
  expect(@ehmp).to have_fld_select_procedure
  @ehmp.fld_select_procedure.click
  @ehmp.wait_for_fld_selected_result
  expect(@ehmp).to have_fld_selected_result
end

Given(/^user does not have an encounter set$/) do
  @ehmp = PobEncountersApplet.new

  @ehmp.wait_for_btn_set_encounter
  @ehmp.wait_until_btn_set_encounter_visible(30) 

  expect(@ehmp.btn_set_encounter).to have_text("No Visit Set")
end

Then(/^Encounter modal is displayed$/) do
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_encounter_loaded
  expect(@ehmp.all_required_there?).to eq(true)
end
