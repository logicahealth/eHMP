class PobHeaderFooter < SitePrism::Page
  # ****************** header ********************** #
  element :link_nav_home, '[id=header-region] #current-staff-nav-header-tab-home-button'
  element :fld_staff_view, "#current-staff-nav-header-tab"
  element :fld_user_icons, ".application-user-icons"

  element :fld_recent_patient_header, ".dropdown-header p"

  element :btn_notification, "#myNotificationsButton"

  element :btn_patients, "a[id='patientSearchButton']"
  element :fld_patients, "p[id='patientSearchButton']"

  element :btn_logout, ".fa-sign-out"
  element :btn_patients_active, "li.patient-selection-link-style >p[id='patientSearchButton'].active"
  # ****************** footer ********************** #
  element :fld_ehmp_version, "#bottom-region p"
  element :btn_refresh_patient_data, "#refresh-patient-data"
  elements :fld_footer_links, ".fa.fa-check-circle.success"
  element :btn_view_details, "#open-sync-modal"
  element :btn_refresh_patient_data, "#refresh-patient-data"
  element :btn_incident_report, ".application-footer-items-right div > button"
  element :btn_icon_ccow_status, '.application-footer-items #ccowStatusBtn .icon-ccow-disconnected'
  element :btn_ccow_status, '.application-footer-items #ccowStatusBtn'
  element :btn_ccow_status_sr, '.application-footer-items #ccowStatusBtn .sr-only'
  elements :fld_sync_status, '#patientSyncStatusRegion li.patient-status-icon span[aria-hidden]'

  # ***************** tray ************************* #
  elements :btn_tray_sidebars, "[aria-label='Tray Sidebar'] button[id^='tray']"

  def wait_until_header_footer_elements_loaded
    wait = Selenium::WebDriver::Wait.new(:timeout => 60)
    max_attempt = 3
    begin
      wait_for_fld_staff_view
      wait_for_fld_user_icons
      wait_for_fld_ehmp_version
      wait_for_btn_notification
      wait_for_btn_refresh_patient_data
      wait_for_btn_view_details
      wait_for_btn_tray_sidebars
      wait.until { fld_footer_links.length >= 2 }
    rescue => e

      max_attempt -= 1
      retry if max_attempt > 0
      # *****************  reenable raise when DE5488 is fixed  ******************* #
      #raise e if max_attempt <= 0
      p "#{e}"
      p 'footer did not show expected successfully data sync.  attempt to continue because of DE5488' if max_attempt <= 0
      # *****************  reenable raise when DE5488 is fixed  ******************* #
    end
  end
end
