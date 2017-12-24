require_relative 'skip_links'
class PobPatientSearch < SitePrism::Page
  set_url '/#patient-search-screen'
  set_url_matcher(/\/#patient-search-screen$/)

  section :skip_link_menu, SkipLinks, '.provider-centric-view'

  # *****************  All_Form_Elements  ******************* #
  element :a_flags_back_to_top, ".flags-body-container .scroll-to-top-container a"

  # *****************  All_Container_Elements  ******************* #
  element :ctn_fluid, "div[class='container-fluid']"

  # *****************  All_Logo_Elements  ******************* #
  element :img_patient, "#patient-image-container .patient-image"
  element :img_eight_patient, "#patient-image-container [src$='eRPUkf/2Q==']"

  # *****************  All_Field_Elements  ******************* #
  element :fld_patient_search, "input[id='patientSearchInput']"
  element :fld_patient_record, "a[class^='list-group-item']"
  element :fld_search_lastname, "input[id='globalSearchLastName']"
  element :fld_search_ssn, "input[id='globalSearchSsn']"
  element :fld_search_firstname, "#globalSearchFirstName"
  element :fld_search_dob, "#globalSearchDob"
  element :fld_patient_name, ".patientName"
  element :fld_global_Search_Last_N, "#globalSearchLastName"
  element :fld_global_Search_Ssn, "#globalSearchSsn"
  element :fld_global_Search_dob, "#globalSearchDob"
  element :fld_confirm_modal, '.patient-confirmation-modal'
  element :fld_confirm_header, "div.patient-confirmation-modal .patientName"
  element :fld_patient_search_confirmation_info, "div[class='fixedHeightZone']"
  element :fld_nav_bar, "#header-region .navbar"

  element :fld_sensitive_patient_ssn, "#patient-search-main .ssn"
  element :fld_sensitive_patient_dob, "#patient-search-main .dob"
  element :fld_clinic_start_date, "#filter-from-date-clinic"
  element :fld_clinic_to_date, "#filter-to-date-clinic"
  
  elements :fld_clinic_datetime, "div.user_info-ps-td-datetime"
  elements :fld_clinic_list_group, "#main-search-mySiteClinics .patient-search-results .list-group-item"
  elements :fld_patient_records, "a.row-layout"
  elements :fld_clinics_list_items, "#clinics-location-list-results span"
  element :chk_previous_workspace, "#previousWorkspace"
  element :fld_ward_filter, '#wards-location-list-filter-input input'
  elements :fld_ward_list, '#wards-location-list-results a'
  elements :fld_ward_list_displayname, '#wards-location-list-results .locationDisplayName'
  elements :fld_ward_patient_result_headers, '#main-search-mySiteWards .columnHeader .columnName'
  element :fld_ward_search_instructions, '#main-search-mySiteWards .dummy-text-wards .row div.col-xs-12'
  element :fld_empty_ward_results, '#main-search-mySiteWards .list-group .error-message'
  elements :ward_search_results, '#main-search-mySiteWards .list-group [role=option]'
  elements :ward_patient_results_patient_names, '#main-search-mySiteWards .list-group .patientDisplayName'
  elements :ward_patient_results_patient_names_sronly, '#main-search-mySiteWards .list-group .patientDisplayName .sr-only'
  element :fld_ward_filter_icon, '#wards-location-list-filter-input i.fa-filter'
  element :btn_clear_ward_filter, '.clear-ward-filter'

  element :fld_clinic_filter, '#clinics-location-list-filter-input input'
  element :fld_clinic_filter_icon, '#clinics-location-list-filter-input i.fa-filter'
  element :btn_clear_clinic_filter, '.clear-clinic-filter'
  elements :fld_clinic_list, '#clinics-location-list-results a'

  # *****************  All_Button_Elements  ******************* #
  element :btn_search, "#globalSearchButton"
  element :btn_allpatient, "#global"
  element :btn_confirmation, "button[id='confirmationButton']"
  element :btn_ack, "#ackButton"

  element :btn_confirm, "#confirmFlaggedPatinetButton"
  element :btn_nationwide, "li[id='global'] a"
  element :btn_global_Search, "#globalSearchButton"
  element :btn_confirmFlagged, "button[id='confirmFlaggedPatinetButton']"
  element :btn_patient_search, "#patientSearchButton"
  element :btn_my_workspace, "#current-staff-nav-header-tab"
  element :btn_my_notifications, "#myNotificationsButton"
  element :btn_my_site, "#mySite"
  element :btn_wards, '#wards'
  element :btn_wards_active, '[id=wards].active'
  element :btn_custom_range_apply, "#custom-range-apply"
  element :btn_clinics, '#clinics'
  element :btn_clinics_active, '[id=clinics].active'
  element :btn_restricted_record_ack, '#ackMsgTitleId button.collapsed'
  
   # *****************  All_Error_Text_Elements  ******************* #
  element :err_message1, "p[class='error-message padding']"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  element :tbl_patient_info, "div[class='patientInfo row']"

  # *****************  All_Dialogue_Elements  ******************* #
  element :dlg_ack_panel, "div[id='ackMessagePanel']"
  element :dlg_wand_panel, "div[id='ackMessagePanel_WANDERER']"

  # *****************  Local_Methods  *************#

  def screen_loaded?(print_messages = false)
    if print_messages
      p "is the patient search screen loaded?"
      p "  is there a Patient selection button? #{has_btn_patient_search?}"
      p "  is there a Staff View button? #{has_btn_my_workspace?}"
      p "  is there a Notifications button? #{has_btn_my_notifications?}"
      p "  is there a Patient Search input box? #{has_fld_patient_search?}"
      p "  is there a My Site button? #{has_btn_my_site?}"
      p "  is the My Site button active? " + (btn_my_site['class'].include? 'active').to_s
    end
    return false unless has_btn_patient_search?
    return false unless has_btn_my_workspace?
    return false unless has_btn_my_notifications?
    return false unless has_fld_patient_search?
    return false unless has_btn_my_site?
    return false unless btn_my_site['class'].include? 'active'
    true
  rescue => e
    p "Screen still loading: #{e}"
    return false
  end

  def ward_headers
    fld_ward_patient_result_headers.map { |text| text.text }
  end

  def ward_search_results_loaded?
    return true if has_fld_empty_ward_results?
    return true if ward_search_results.length > 0
    false
  end

  def ward_patient_names
    names_only = []
    sronly = ward_patient_results_patient_names_sronly[0].text
    ward_patient_results_patient_names.each do | name |
      names_only.push(name.text.sub(sronly, '').strip)
    end
    names_only
  end
end
