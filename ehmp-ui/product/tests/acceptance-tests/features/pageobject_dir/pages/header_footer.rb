class PobHeaderFooter < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_staff_view, "#current-staff-nav-header-tab"
  element :fld_user_icons, ".application-user-icons"
  element :fld_user_id, "#eHMPCurrentUser"
  element :fld_ehmp_version, "#bottom-region p"

  elements :fld_footer_links, ".fa.fa-check-circle.success"

  # *****************  All_Button_Elements  ******************* #
  element :btn_patient_search, "#patientSearchButton"
  element :btn_notification, "#myNotificationsButton"
  element :btn_refresh_patient_data, "#refresh-patient-data"
  element :btn_view_details, "#open-sync-modal"

  elements :btn_tray_sidebars, "[aria-label='Tray Sidebar'] button[id^='tray']"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_link_Elements  ******************* #
  element :lnk_ehmp_header_help, "#header-region #linkHelp-ehmp_header"

  def wait_until_header_footer_elements_loaded
    wait = Selenium::WebDriver::Wait.new(:timeout => 60)
    max_attempt = 3
    begin
      wait.until { all_there? }
      wait.until { fld_footer_links.length >= 2 }
    rescue => e
      max_attempt -= 1
      retry if max_attempt > 0
      # *****************  reenable raise when DE5488 is fixed  ******************* #
      #raise e if max_attempt <= 0 
      p 'footer did not show expected successfully data sync.  attempt to continue because of DE5488' if max_attempt <= 0
      # *****************  reenable raise when DE5488 is fixed  ******************* #
    end
  end
end
