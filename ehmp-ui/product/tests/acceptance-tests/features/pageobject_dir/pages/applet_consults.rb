require_relative 'parent_applet.rb'
class PobConsultApplet < PobParentApplet
  
  set_url '#/patient/consults-patient-full'
  set_url_matcher(/#\/patient\/consults-patient-full/)
  
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_consult_modal_title, "[id='main-workflow-label-Consult-Order']"

  element :fld_consult_drop_down, ".consultName [x-is-labelledby^='select2-consultName'][x-is-expanded]"
  element :fld_consult_drop_down_open, ".consultName [x-is-labelledby^='select2-consultName'][x-is-expanded=true]"
  elements :fld_consult_options, ".consultName select.form-control option:not([value=''])"

  element :fld_consult_results, ".select2-results ul[id^='select2-consultName']"
  elements :fld_consult_list_elements, ".select2-results ul[id^='select2-consultName'] li:not(.select2-results__message)"

  element :fld_request_reason, ".requestReason textarea"
  element :fld_override_reason, ".overrideReason textarea"
  element :fld_discontinue_comment, ".comment textarea"
  element :fld_consult_header, "[data-header-instanceid='consults-INSTANCENAME'] a"
  element :fld_consult_created_on, "[data-header-instanceid='consults-createdOn'] a"

  elements :fld_consult_column_data, "#data-grid-consults tr.selectable td:nth-child(3)"
  elements :fld_mode_column_data, "#data-grid-consults tr.selectable td:nth-child(10)"
  elements :fld_patient_column_data, "#data-grid-consults tr.selectable td:nth-child(2)"
  elements :fld_assignement_options, "div[data-appletid='consults'] .primarySelection select option"
  elements :fld_consult_steffview_headers, "#data-grid-consults thead tr th"
  elements :fld_consult_drop_down_options, ".select-control.consultName option"
  element :fld_provider_search_input, ".select2-search__field"

  element :ddl_neuro_question1, "#preReqQuestions-Has-patient-been-informed-to-bring-a-copy-of-all-external-reports-and-radiology-images-to-their-consult-visit-"
  element :ddl_neuro_question2, "#preReqQuestions-Has-the-patient-had-an-eight-8-week-trial-of-NSAIDs-"
  element :ddl_neuro_question3, "#preReqQuestions-Has-the-patient-completed-a-course-of-Physical-Therapy-for-their-back-pain-"
  element :ddl_neuro_question4, "#preReqQuestions-Has-the-patient-had-a-MRI-or-CT-Myelogram-POSITIVE-for-nerve-root-compression-or-foraminal-stenosis-in-the-past-6-months-"
  element :ddl_BMI, "#undefined-BMI"
  element :ddl_discontinue_reason, ".reason select"
  element :ddL_consult_provider, "#select2-acceptingProvider-container"
  element :ddL_display_only, ".mode select"
  
  element :ddl_rhem_question1, "#preReqQuestions-Has-patient-been-informed-to-bring-a-copy-of-all-external-reports-and-radiology-images-to-their-consult-visit-"
  element :ddl_rhem_question2, "#preReqQuestions-Has-the-patient-been-tried-on-a-regime-of-antiinflamatory-medications-for-at-least-4-weeks-"
  element :ddl_rhem_question3, "#preReqQuestions-Has-the-patient-had-recent-last-60-days-Xrays-of-any-effected-joint-Y-N"
  element :ddl_protein, "#undefined-C-Reactive-Protein"
  element :ddl_factor, "#undefined-Rheumatoid-Factor"
  element :ddl_consult_assignment, "div[data-appletid='consults'] .primarySelection select"
  # *****************  All_Button_Elements  ******************* #
  element :btn_consult_accept, "[id='consult-add-accept-button']"
  element :btn_close_consult_detail_modal, "#activityDetailClose"
  element :btn_close_consult_detail_modal, "#activityDetailClose"
  elements :btn_add_consult_order, "#collapse-items-orders li a"
  
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_urgency, ".urgency select"
  element :chk_flag, '.onlyShowFlaggedConsults input[type="checkbox"]'
  element :btn_discontinue, "#activityDetailDiscontinue"
  element :btn_discontinue_accept, "#submit-accept"
  element :btn_consult_modal_close, "#activityDetailClose"
  # *****************  All_Table_Elements  ******************* #
  elements :tbl_consult_rows, "#data-grid-consults tr.selectable"
  
  def initialize
    super
    appletid_css = "[data-appletid=consults]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
    add_text_filter_elements appletid_css
  end

  def applet_loaded?(allow_errors = DefaultLogin.local_testrun)
    return true if has_fld_error_msg? && allow_errors # this is here because locally this is allowed
    return true if has_fld_empty_row?
    return true if tbl_consult_rows.length > 0
    false
  end
  
  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_consult_rows.length
  end 
  
  def declare_consult_result_dropdown(consult_type)
    self.class.element :fld_consult_result_title, "[id$='#{consult_type}']"
  end
end

