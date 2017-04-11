require_relative 'parent_applet.rb'

class PobNumericLabApplet < PobParentApplet
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  elements :fld_numeric_lab_results_gist, ".gist-item-list .selectable"
  elements :fld_lab_names, "[data-appletid='lab_results_grid'] .problem-name [data-cell-instanceid]"

  # *****************  All_Button_Elements  ******************* #
  element :btn_all_range, "#all-range-lab_results_grid"
  element :btn_2yr_range, "button[id='2yr-range-lab_results_grid']"
  element :btn_1yr_range, "button[id='1yr-range-lab_results_grid']"
  element :btn_3mo_range, "button[id='3mo-range-lab_results_grid']"
  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  element :tbl_empty_row, "#data-grid-lab_results_grid tr.empty"
  elements :tbl_coversheet_date_column, "#data-grid-lab_results_grid tr.selectable td:nth-child(1)"

  def range_is_active?(element)
    class_tags = element[:class].split(' ')
    p class_tags
    return class_tags.include? 'active-range'
  end
  
  def initialize
    super
    appletid_css = "[data-appletid=lab_results_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_numeric_lab_results_gist.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def wait_until_applet_gist_loaded
    wait_until { applet_gist_loaded? }
  end
end

