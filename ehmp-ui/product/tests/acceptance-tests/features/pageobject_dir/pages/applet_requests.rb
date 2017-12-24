require_relative 'parent_applet.rb'
require_relative 'tray_sidebar_section.rb'

class PobRequestApplet < PobParentApplet
  
  set_url '#/patient/requests-patient-full'
  set_url_matcher(/#\/patient\/requests-patient-full/)

  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
    
  element :fld_request_details, ".requestDetails textarea"
  element :fld_request_title, ".title input"
  element :fld_request_header, "[data-header-instanceid='requests-INSTANCENAME'] a"
  element :fld_request_created_on, "[data-header-instanceid='requests-createdOn'] a"
  element :fld_request_comment, ".comment textarea"
  element :fld_request_required, ".request textarea"
  element :fld_alert_message, ".alert-content"
  element :fld_action, ".action-options [name='action']"
  element :fld_mark_as_complete, "[name='action'] option[value='complete']"
  element :fld_response_header, "[id^='main-workflow-label-view']"

  elements :fld_modal_detail_fields, "#domainDetailsContentRegion .row"
  elements :fld_request_column_data, "[data-appletid=requests] tr.selectable td:nth-child(4)"
  elements :fld_state_column_data, "[data-appletid=requests] tr.selectable td:nth-child(5)"
  elements :fld_request_patient_column_data, "[data-appletid=requests] tr.selectable td:nth-child(3)"
  elements :fld_request_assignement_options, "div[data-appletid='requests'] .primarySelection select option"
  elements :fld_request_steffview_headers, "[data-appletid=requests] thead tr th"
  elements :fld_list_action_options, "[name='action'] option"
 
  element :ddL_display_only, ".mode select"
  element :ddl_request_assignment, "div[data-appletid='requests'] .primarySelection select"
    
  # *****************  All_Button_Elements  ******************* #
  element :btn_calendar_earliest, ".calendar-container [type='text'][name='earliest']"
  element :btn_request_accept, "[id='requestAcceptButton']"
  element :btn_discontinue, "[id='activityDetailDiscontinue']"
  element :btn_submit_accept, "[id='submit-accept']"
  element :btn_request_modal_close, "#activityDetailClose"
  elements :btn_add_request, "#collapse-items-activities li a"
  element :btn_response_accept, "#responseAcceptButton:not([disabled])"
  element :btn_modal_detail_actions, ".request-activity-footer .dropdown-toggle"
  element :btn_modal_detail_edit_request, ".request-activity-footer [data-signal='EDIT']"
  element :btn_activity_details , "#activityDetails"
  element :btn_cancel, "[id^='responseConfirmCancelButton']"
  element :btn_confirm_cancel, "[id^='confirm-cancel-button']"
  # *****************  All_Drop_down_Elements  ******************* #
  element :chk_flag, '.onlyShowFlaggedRequests input[type="checkbox"]'
  # *****************  All_Table_Elements  ******************* #
  elements :tbl_request_rows, "[data-appletid=requests] tr.selectable"

  def initialize
    super
    appletid_css = "[data-appletid=requests]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
    add_text_filter_elements appletid_css
  end

  def applet_loaded?(allow_errors = DefaultLogin.local_testrun)
    return true if has_fld_error_msg? && allow_errors # this is here because locally this is allowed
    return true if has_fld_empty_row?
    return true if tbl_request_rows.length > 0
    false
  end

  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_request_rows.length
  end
  
  def action_options(action_name)   
    po_id = "[name='action'] option[value='#{action_name}']" 
    self.class.element :fld_action_option_array, "#{po_id}"
  end  
end

