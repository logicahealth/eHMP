require_relative 'parent_applet.rb'
require_relative 'tray_sidebar_section.rb'

class PobActionRequest< SitePrism::Page 
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  element :lgo_Action_me_radio, "label[for$='opt-me']"
  element :lgo_Action_person_radio, "label[for$='opt-person']"
  element :lgo_Action_myteam_radio, "label[for$='opt-myteams']"
  element :lgo_Action_patientteams_radio, "label[for$='opt-patientteams']"
  element :lgo_Action_anyteam_radio, "label[for$='opt-anyteam']"
  element :lgo_Request_facility, "label[for^='assignment-facility-view']"
  element :lgo_Request_person, "label[for^='assignment-person-view']"
  element :lgo_Request_myteam, "label[for^='assignment-team-view']"
  element :lgo_Request_roles, "label[for^='assignment-roles-view']"
  element :lgo_error_tems, "[id^='form-control-error-view']"
  
 # *****************  All_Field_Elements  ******************* #
  element :fld_Request_facility, "[id^='select2-assignment-facility-view']"
  elements :fld_Request_control_person, "#patientDemographic-action .select-control person"
  elements :fld_Request_control_team, "#patientDemographic-action .select-control team"
  elements :fld_Request_control_roles, "#patientDemographic-action .roles "
 # *****************  All_Button_Elements  ******************* #
  element :btn_Action_me_radio, "[id$='-opt-me']"
  element :btn_Action_person_radio, "[id$='-opt-person']"
  element :btn_Action_myteam_radio, "[id$='-opt-myteams']"
  element :btn_Action_patientteams_radio, "[id$='-opt-patientteams']"
  element :btn_Action_anyteam_radio, "[id$='-opt-anyteam']"
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_Request_facility, "#patientDemographic-action .select-control.assignment-facility .select2-selection__arrow"
  element :ddl_Request_team, "[x-is-labelledby^='select2-assignment-team-view'] .select2-selection__arrow"
  elements :ddl_list_titles, "[id^='select2-assignment-team-view']  li strong"
  element :ddl_Request_team_1_select, "[id^='select2-assignment-team-view'] li:nth-of-type(1) ul [id^='select2-assignment-team-view']:nth-child(1)"

 # *****************  All_Table_Elements  ******************* #
  def facility_option(facility)
    self.class.element :ddl_facility_option, :xpath, "//ul[contains(@id, 'select2-assignment-facility-view')]/li[string() = '#{facility}']"
  end
end
