require_relative 'parent_applet.rb'

class PobNumericLabApplet < PobParentApplet
  elements :fld_gist_rows, "[data-appletid='lab_results_grid'] .gist-item-list [role=row]"
  #elements :fld_numeric_lab_results_gist, "[data-appletid='lab_results_grid'] .gist-item-list .selectable"
  elements :fld_numeric_lab_results_gist, "[data-appletid='lab_results_grid'] .gist-item"
  elements :fld_lab_names, "[data-appletid='lab_results_grid'] div.border-vertical span:not(.sr-only)"
  elements :fld_lab_test_column_data, "[data-appletid='lab_results_grid'] [data-cell-instanceid^='problem_name']"
  elements :fld_results, "[data-appletid='lab_results_grid'] [data-cell-instanceid^='time_since']"
  element :gist_header_lab_test, "[data-appletid='lab_results_grid'] [data-header-instanceid='name-header']"

  
  elements :tbl_coversheet_date_column, "[data-appletid=lab_results_grid] tr.selectable td:nth-child(2)"
  elements :summary_rows, "[data-appletid='lab_results_grid'] table tbody tr"
  elements :summary_nonpanel_rows, "[data-appletid='lab_results_grid'] table tbody tr[data-code]"
  elements :summary_panel_rows, "[data-appletid='lab_results_grid'] table tbody tr:not([data-code])"
  elements :summary_panel_expanded_rows, "[data-appletid='lab_results_grid'] table tbody td tbody tr"
  #data-code

  # ********************** EXPANDED VIEW ELEMENTS *********************** #
  section :date_range_filter, ExpandedDateFilter, "#grid-filter-lab_results_grid"
  elements :expanded_rows, "[data-appletid='lab_results_grid'] table tbody tr"
  elements :expanded_nonpanel_rows, "[data-appletid='lab_results_grid'] table tbody tr[data-code]"
  elements :expanded_tbl_headers, "[data-appletid='lab_results_grid'] thead th"

  element :fld_quickview_popover, "div.gist-popover"
  elements :quickview_tbl_headers, "div.gist-popover th"

  elements :tbl_lab_detail_header, "#modal-body .table-responsive th"

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
    add_toolbar_buttons appletid_css
    add_tile_sort_elements
    add_quick_view_popover appletid_css
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

