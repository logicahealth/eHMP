require_relative 'parent_applet.rb'

class PobVitalsApplet < PobParentApplet
  
  set_url '#/patient/vitals-full'
  set_url_matcher(/#\/patient\/vitals-full/)
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_vitals_gist_item, "[data-cell-instanceid='problem_name_BPS']"
  elements :fld_vitals_gist, "[data-appletid=vitals] .grid-container .gist-item-list .table-row"

  elements :fld_vital_type_column_data, "[data-appletid=vitals] div.problem-name [data-cell-instanceid]"

  elements :fld_vital_names, "[data-appletid=vitals] .gist-item-list .problem-name [data-cell-instanceid]"

  # *****************  All_Button_Elements  ******************* #
  element :btn_expanded_all_range, "#all-range-vitals"
  element :btn_expanded_all_range_active, "#all-range-vitals.active-range"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_vitals_grid, "table[id='data-grid-vitals'] tr.selectable "

  # *****************  Quickview  ******************* #
  element :fld_vital_quickview_popover, "div.gist-popover"
  elements :quickview_tbl_headers, "div.gist-popover th"
  element :quickview_tbl_th_date, "div.gist-popover th:nth-child(1)"
  element :quickview_tbl_th_result, "div.gist-popover th:nth-child(2)"
  element :quickview_tbl_th_refrange, "div.gist-popover th:nth-child(3)"
  element :quickview_tbl_th_facility, "div.gist-popover th:nth-child(4)"
  
  def initialize
    super
    appletid_css = "[data-appletid=vitals]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
    add_tile_sort_elements
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return tbl_vitals_grid.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_vitals_gist.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end
  
  def wait_until_applet_gist_loaded
    wait_until(DefaultTiming.default_table_row_load_time) { applet_gist_loaded? }
  end  

  def gist_vital_names_only
    fld_vital_names.map { | name_element | name_element.text  }
  end
end
