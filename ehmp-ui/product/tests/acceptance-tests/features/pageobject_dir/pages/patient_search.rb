class PobPatientSearch < SitePrism::Page
  set_url '/#patient-search-screen'
  set_url_matcher(/\/#patient-search-screen$/)

  # *****************  All_Form_Elements  ******************* #

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
  element :fld_confirm_header, "div[id='confirmSection'] .patientName"
  element :fld_patient_search_confirmation_info, "div[class='fixedHeightZone']"
  element :fld_nav_bar, "#header-region .navbar"

  element :fld_sensitive_patient_ssn, "#patient-search-main .ssn"
  element :fld_sensitive_patient_dob, "#patient-search-main .dob"

  elements :fld_patient_records, "a.row-layout"
  elements :fld_clinics_list_items, "#clinics-location-list-results span"
  element :chk_previous_workspace, "#previousWorkspace"

  # *****************  All_Button_Elements  ******************* #
  element :btn_search, "#globalSearchButton"
  element :btn_allpatient, "#global"
  element :btn_confirmation, "button[id='confirmationButton']"
  element :btn_ack, "#ackButton"
  element :btn_logout, "a[id='logoutButton']"
  element :btn_confirm, "#confirmFlaggedPatinetButton"
  element :btn_nationwide, "li[id='global'] a"
  element :btn_global_Search, "#globalSearchButton"
  element :btn_confirmFlagged, "button[id='confirmFlaggedPatinetButton']"
  element :btn_patient_search, "#patientSearchButton"
  element :btn_my_workspace, "#current-staff-nav-header-tab"
  element :btn_my_notifications, "#myNotificationsButton"
  element :btn_my_site, "#mySite"
  
   # *****************  All_Error_Text_Elements  ******************* #
  element :err_message1, "p[class='error-message padding']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_ehmp_current_user, "#eHMPCurrentUser"

  # *****************  All_Table_Elements  ******************* #
  element :tbl_patient_info, "div[class='patientInfo row']"

  # *****************  All_Dialogue_Elements  ******************* #
  element :dlg_ack_panel, "div[id='ackMessagePanel']"
  element :dlg_wand_panel, "div[id='ackMessagePanel_WANDERER']"

  # *****************  Local_Methods  *************#

  def screen_loaded?
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
end
