require_relative 'parent_applet.rb'

class PobNumericLabApplet < PobParentApplet
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  elements :fld_numeric_lab_results_gist, ".gist-item-list .selectable"
  elements :fld_lab_names, "[data-appletid='lab_results_grid'] .problem-name [data-cell-instanceid]"
  elements :fld_lab_test_column_data, "#grid-panel-lab_results_grid .auto-overflow-y > div span:nth-child(3)"
  elements :fld_results, "[data-appletid='lab_results_grid'] [data-cell-instanceid^='time_since']"

  # *****************  All_Button_Elements  ******************* #
  element :btn_all_range, "#all-range-lab_results_grid"
  element :btn_2yr_range, "button[id='2yr-range-lab_results_grid']"
  element :btn_1yr_range, "button[id='1yr-range-lab_results_grid']"
  element :btn_3mo_range, "button[id='3mo-range-lab_results_grid']"
  
  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_coversheet_date_column, "#data-grid-lab_results_grid tr.selectable td:nth-child(1)"
  elements :summary_rows, "[data-appletid='lab_results_grid'] table tbody tr"

  element :gist_header_lab_test, "[data-appletid='lab_results_grid'] [data-header-instanceid='name-header']"

  element :fld_quickview_popover, "div.gist-popover"
  elements :quickview_tbl_headers, "div.gist-popover th"

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
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
    add_tile_sort_elements
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_numeric_lab_results_gist.length > 0
  rescue => exc
    p exc
    return false
  end

  def applet_summary_summary?
    return true if has_fld_empty_row?
    return summary_rows.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def wait_until_applet_gist_loaded
    wait_until(DefaultTiming.default_table_row_load_time) { applet_gist_loaded? }
  end

  def gist_numeric_lab_names_only
    fld_lab_names.map { | name_element | name_element.text  }
  end

  def wait_until_applet_summary_loaded
    wait_until { applet_summary_summary? }
  end

  def quickview_th_text_only_upper
    quickview_tbl_headers.map { | th_element | th_element.text.upcase  }
  end
end

