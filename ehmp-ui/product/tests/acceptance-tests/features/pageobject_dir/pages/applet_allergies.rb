require_relative 'parent_applet.rb'

class PobAllergiesApplet < PobParentApplet 
  
  set_url '#/patient/allergy-grid-full'
  set_url_matcher(/#\/patient\/allergy-grid-full/)
  
  # ******************* applet *************************** #

  # ******************* gist/trend view specific ******************** #
  elements :fld_allergy_gist_pills, "[data-appletid=allergy_grid] .grid-container [data-infobutton-class=info-button-pill]"
  elements :fld_allergy_gist_all_pills, "[data-appletid=allergy_grid] .grid-container li p"

  # ******************* expanded view specific *********************** #
  elements :expanded_rows, "[data-appletid='allergy_grid'] table tbody tr.selectable"
  elements :expanded_allegy_names, "[data-appletid='allergy_grid'] table tbody tr.selectable td:nth-child(2)"
  elements :expanded_allergy_column_allergen_names, "#data-grid-allergy_grid tbody tr.selectable td:nth-child(2)"
  elements :expanded_allergy_column_s_allergen, "#data-grid-allergy_grid tr > td.string-cell.flex-width-1_5.sortable"

  element :expanded_header_standardized_allergen, "[data-header-instanceid='allergy_grid-standardizedName'] a"
  element :expanded_header_allergen_name, "[data-header-instanceid='allergy_grid-summary'] a"
  #elements :tbl_allergy_grid, "table[id='data-grid-allergy_grid'] tr.selectable"

  # ******************* add allergy specific ************************* #
  element :fld_modal_title, "[id^='main-workflow-label-']"
  element :fld_allergen_drop_down, "[x-is-labelledby='select2-allergen-container']"

  element :fld_reaction_date_input, "#reaction-date"
  element :fld_reaction_time_input, "#reaction-time"
  element :fld_severity_drop_down, "#severity"
  element :fld_nature_of_reaction_drop_down, "#nature-of-reaction"
  element :fld_available_signs_input, "#available-Signs-Symptoms-modifiers-filter-results"
  element :fld_comments_input, "#moreInfo"
  
  elements :fld_selected_symptom, "[title='Press enter to remove ANXIETY.']"    
  element :btn_add_allergy_cancel, ".allergiesConfirmCancel button[data-original-title='Warning']"
  element :btn_confirm_add_allergy, "div.addBtn  [type='submit']"

  element :btn_anxiety, "[title = 'Press enter to add ANXIETY.']"
  element :fld_historical_check_box, "#allergyType-h"
  element :fld_observed_check_box, "#allergyType-o"
  element :fld_selected_second_symptom, "#patientDemographic-newObservation .allergies-writeback-add .selected-region button"

  def allergy_pill(data_infobutton)
    self.class.element(:fld_allergy_pill, "[data-infobutton='#{data_infobutton}']")
  end

  def first_pill_text
    # assumption, there is at least 1 pill displayed
    title = fld_allergy_gist_pills[0].text
    # only pull screenreader text for first pill
    self.class.elements :fld_first_pill_screenreader_text, :xpath, "//*[@data-appletid='allergy_grid']/descendant::*[@data-infobutton-class='info-button-pill'][1]/descendant::span[contains(@class, 'sr-only')]"
    fld_first_pill_screenreader_text.each do | span |
      # remove screen reader text from title
      title = title.sub(span.text, '')
    end
    # remove leading/trailing white space
    title.strip
  end
    
  def initialize
    super
    appletid_css = "[data-appletid=allergy_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
    add_modal_elements
  end
  
  def applet_loaded?
    return true if has_fld_empty_row?
    return expanded_rows.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_allergy_gist_pills.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end
  
  def wait_until_applet_gist_loaded
    wait_until { applet_gist_loaded? }
  end

  def expanded_allergy_names
    names_screenreader_text = expanded_allegy_names
    names_only = []
    names_screenreader_text.each_with_index do | td_element, index |
      name = td_element.text
      names_only.push(name.strip)
    end
    names_only
  end

  def appletid
    'allergy_grid'
  end
end
