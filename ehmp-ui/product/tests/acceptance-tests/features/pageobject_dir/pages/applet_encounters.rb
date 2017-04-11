class PobEncountersApplet < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_visit_set, "#patientDemographic-visitInfo"
  element :fld_tab_new_visit, "[aria-controls^='New-Visit-tab-panel']"
  element :fld_new_encounter_location_drop_down, "[x-is-labelledby='select2-selectNewEncounterLocation-container']"
  element :fld_encounter_location_search_box, "input[class='select2-search__field']"
  
  # *****************  All_Button_Elements  ******************* #
  element :btn_set_encounter, "#patientDemographic-visitInfo [type=button]"
  element :btn_confirm_encounter, "#viewEncounters-btn"
  
  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
end
