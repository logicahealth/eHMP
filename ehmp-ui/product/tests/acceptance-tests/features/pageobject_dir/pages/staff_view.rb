class PobStaffView < SitePrism::Page
  set_url '#/staff/provider-centric-view'

  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_staff_view, "#current-staff-nav-header-tab"
  element :fld_active_staff_view, "#current-staff-nav-header-tab.active"
  elements :fld_recent_patient_list, "ul.recent-patients-items"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
end
