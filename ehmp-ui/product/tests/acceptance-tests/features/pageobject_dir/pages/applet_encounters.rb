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
  
  # *****************  All_Button_Elements  ******************* #
  element :btn_encounter_form, "#patientDemographic-encounter [type='button']"
  element :btn_set_encounter, "#current-visit-context-button"  
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
  
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_encounter_provider, "[x-is-labelledby='select2-selectEncounterProvider-container']"
  element :ddl_encounter_location, "[x-is-labelledby='select2-selectNewEncounterLocation-container']"

  # *****************  All_Table_Elements  ******************* #
  element :tbl_clinic_appointment, "#selectableTableAppointments .body .table-row:nth-child(1)"
  element :tbl_hosptial_admission, "#selectableTableAdmissions .body .table-row:nth-child(1)"
  
  def initialize
    super
    appletid_css = "[data-appletid=encounters]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
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
