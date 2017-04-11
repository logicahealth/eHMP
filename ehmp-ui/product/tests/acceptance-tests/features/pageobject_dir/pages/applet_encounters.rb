require_relative 'parent_applet.rb'
class PobEncountersApplet < PobParentApplet
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_tab_new_visit, "[aria-controls^='New-Visit-tab-panel']"
  element :fld_tab_clinic_appointment, "[aria-controls^='Clinic-Appointments-tab-panel']"
  element :fld_tab_hospital_admission, "[aria-controls^='Hospital-Admissions-tab-panel']"
  element :fld_encounter_search_box, "input[class='select2-search__field']"
  element :fld_check_primary_provider, "input[id$='primaryProviderCheck']"
  element :fld_encounter_modal, "div.encounter-form-modal"
  element :fld_diagnosis_1, "[name='Type 2 diabetes mellitus without complications']"
  element :fld_diagnosis_2, "[name='Low back pain']"
  element :fld_primary_diagnosis, "input[id$='primary']"
  element :fld_add_other_diagnosis, "[data-original-title='Add Other Diagnosis']"
  element :fld_visit_type_selection, "#visitTypeSelection"
  element :fld_add_modifier_text, ".list-inline"
  element :fld_procedure_section, "#procedureSection"
  element :fld_select_procedure, "[id^='cptCodes-INTERMEDIATE']"

  elements :fld_selected_result, ".ncb-descriptive-text-region"
  elements :fld_limited_check_box, "[id^='cptCodes']"

  elements :fld_visits_last_column, "[data-group-instanceid='panel-Visits'] [data-cell-instanceid^='time_since']"

  elements :fld_visit_type_column_values, "[data-group-instanceid='panel-Visits'] [aria-label='Visits Grid'] .problem-name span:not(.sr-only)"
  elements :fld_hx_occurrence_column_values, "[data-group-instanceid='panel-Visits'] [data-cell-instanceid^='encounter_count_encounters-Visit']"

  element :fld_tray_loader, "div.tray-loader"
  
  # *****************  All_Button_Elements  ******************* #
  element :btn_encounter_form, "#patientDemographic-encounter [type='button']"
  element :btn_set_encounter, "#currentVisitContextButton"  
  element :current_encounter_text, '#currentVisitContextButton .encounter-location-provider span:first-of-type'
  element :btn_confirm_encounter, "#viewEncounters-btn"
  element :btn_confirm_encounter_disabled, "#viewEncounters-btn[disabled]"
  element :btn_add_primary_provider, "[title='Press enter to add Analyst,Pat.']"
  element :btn_ok, "#ok-btn"
  element :btn_diagnosis_cancel, "#add-other-diagnosis-cancel-btn"
  element :btn_add_modifier_visit_type, "#visit-modifiers-popover"
  element :btn_add_modifier_service, "[title='Press enter to add ACTUAL ITEM/SERVICE ORDERED.']"
  element :btn_done_add_modifier, "#add-visit-modifiers-close-btn"
  elements :btn_remove_primary_provider, "[title='Press enter to remove Audiologist,One.']"
  elements :btn_remove_diagnosis, ".remove-panel-button"
  
  element :btn_visits_encounter_arrow, "[data-group-instanceid='panel-Visits'] i"
  element :btn_visits_encounter, "[data-group-instanceid='panel-Visits'] button"
  element :btn_procedures_encounter, "[data-group-instanceid='panel-Procedures'] button"
  element :btn_admissions_encounter, "[data-group-instanceid='panel-Admissions'] button"
  element :btn_appointments_encounter, "[data-group-instanceid='panel-Appointments'] button"
  element :rtclk_btn_visits_encounter, "[data-group-instanceid='panel-Visits'] .right-side"
  element :rtclk_btn_procedures_encounter, "[data-group-instanceid='panel-Procedures'] .right-side"
  element :rtclk_btn_admissions_encounter, "[data-group-instanceid='panel-Admissions'] .right-side"
  element :rtclk_btn_appointments_encounter, "[data-group-instanceid='panel-Appointments'] .right-side"
  element :btn_first_appointment, "[data-cell-instanceid='event_name_encounters-Appointment-AUDIOLOGY']"
  element :btn_first_visit, "[data-cell-instanceid='event_name_encounters-Visit-GENERALINTERNALMEDICINE']"
  element :btn_first_procedure, "[data-cell-instanceid='event_name_encounters-Procedure-PULMONARYFUNCTIONINTERPRET']"
  element :btn_first_admission, "[data-cell-instanceid='event_name_encounters-Admission-SLKJFLKSDJF']"
  
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_encounter_provider, "[x-is-labelledby='select2-selectEncounterProvider-container']"
  element :ddl_encounter_location, "[x-is-labelledby='select2-selectNewEncounterLocation-container']"

  # *****************  All_Table_Elements  ******************* #
  element :tbl_clinic_appointment, "#selectableTableAppointments .body .table-row:nth-child(1)"
  element :tbl_hosptial_admission, "#selectableTableAdmissions .body .table-row:nth-child(1)"
  
  element :col_visit_type, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='name-header']"
  element :col_hx_occurrence, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header1']"
  element :col_last, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header2']"
  
  element :encounter_procedure, "[data-group-instanceid='panel-Procedures'] button"
  
  elements :tbl_encounters_headers, "#grid-panel-encounters .header span[data-header-instanceid]"
  elements :tbl_encounters_visit_type_headers, "[data-group-instanceid='panel-Visits'] .header [data-header-instanceid]"
  elements :tbl_encounters_procedures_type_headers, "[data-group-instanceid='panel-Procedures'] .header [data-header-instanceid]"
  elements :tbl_encounters_admissions_type_headers, "[data-group-instanceid='panel-Admissions'] .header [data-header-instanceid]"
  elements :tbl_encounters_appointments_type_headers, "[data-group-instanceid='panel-Appointments'] .header [data-header-instanceid]"
  elements :tbl_encounter_visit_type_quick_look_headers, "#encounters-Visit-GENERALINTERNALMEDICINE thead th"
  elements :tbl_encounter_procedure_type_quick_look_headers, "#encounters-Procedure-PULMONARYFUNCTIONINTERPRET thead th"
  elements :tbl_encounter_admission_type_quick_look_headers, "#encounters-Admission-SLKJFLKSDJF thead th"
  elements :tbl_encounter_appointment_type_quick_look_headers, "#encounters-Appointment-AUDIOLOGY thead th"
  elements :tbl_encounter_rtclk_visit_quick_look_headers, "#encountersTooltipVisits thead th"
  elements :tbl_encounter_rtclk_procedure_quick_look_headers, "#encountersTooltipProcedures thead th"
  elements :tbl_encounter_rtclk_admission_quick_look_headers, "#encountersTooltipAdmissions thead th"
  elements :tbl_encounter_rtclk_appointment_quick_look_headers, "#encountersTooltipAppointments thead th"
  elements :tbl_encounters_data, ".enc-gist-list [data-group-instanceid]"
  elements :tbl_encounter_cell_data, ".enc-gist-list [data-cell-instanceid] span:not(.sr-only)"
  elements :tbl_quick_view, ".table-condensed tr"
    
  def initialize
    super
    appletid_css = "[data-appletid=encounters]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
    add_text_filter appletid_css
  end

  def all_required_there?
    return false unless has_fld_tab_new_visit?
    return false unless has_fld_tab_clinic_appointment?
    return false unless has_fld_tab_hospital_admission?
    return true
  end

  def wait_until_encounter_loaded
    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    wait.until { 
      begin
        # all_there? We have some elements that are patient dependent so can't use built in function
        all_required_there?
      rescue Selenium::WebDriver::Error::StaleElementReferenceError
        retry
      end
    }
  end
end
