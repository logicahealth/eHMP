class IncidentReportWindow < SitePrism::Page
  element :fld_title, '#main-workflow-label-Report-a-problem'
  element :btn_header_close, '.worflow-header-close-button-container'
  element :btn_cancel, ".error-reporter-cancel button.cancel-button"
  element :btn_enabled_send_report, ""
  element :btn_disabled_send_report, ""
  element :btn_send_report, ".error-reporter-sign button"
  element :fld_report_message, ".modal-body p"
  element :fld_incident_comment, ".modal-body textarea[id^='comment-view']"

  element :fld_confirmation_message, ""
  element :fld_incident_number, ""

  def submit_report_elements_all_there?
    return false unless has_fld_title?
    return false unless has_btn_header_close?
    return false unless has_btn_cancel?
    return false unless has_btn_send_report?
    return false unless has_fld_report_message?
    return false unless has_fld_incident_comment?
    true
  end
end
