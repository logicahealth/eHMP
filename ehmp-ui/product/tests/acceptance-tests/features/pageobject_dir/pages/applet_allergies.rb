class PobAllergiesApplet < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_allergen_name, "th[id='allergy_grid-summary'] a"
  element :fld_modal_title, "[id^='main-workflow-label-']"
  element :fld_allergen_drop_down, "[x-is-labelledby='select2-allergen-container']"
  element :fld_allergen_search, ".select2-search__field"
  element :fld_allergen_select, "li:contains('CHOCOLATE LAXATIVE')"
  element :fld_historical_check_box, "#allergyType-h"
  element :fld_observed_check_box, "#allergyType-o"
  element :fld_reaction_date_input, "#reaction-date"
  element :fld_reaction_time_input, "#reaction-time"
  element :fld_severity_drop_down, "#severity"
  element :fld_nature_of_reaction_drop_down, "#nature-of-reaction"
  element :fld_available_signs_input, "#available-Signs-Symptoms-modifiers-filter-results"
  element :fld_add_anxiety_sign_symptom, "[title='Press enter to add ANXIETY.']"
  element :fld_comments_input, "#moreInfo"
    
  elements :fld_modal_titles, ".modal-body .row"
  elements :fld_modal_table_rows, ".modal-body .table-row"
    
  
  # *****************  All_Button_Elements  ******************* #
  element :btn_add_allergy, "[data-appletid=allergy_grid] .applet-add-button"
  element :btn_add_allergy_cancel, "#form-cancel-btn"
  element :btn_confirm_add_allergy, "div.addBtn  [type='submit']"
  
  # *****************  All_Drop_down_Elements  ******************* #
  
  # *****************  All_Table_Elements  ******************* #
  element :tbl_allergy_grid, "table[id='data-grid-allergy_grid']"
end
