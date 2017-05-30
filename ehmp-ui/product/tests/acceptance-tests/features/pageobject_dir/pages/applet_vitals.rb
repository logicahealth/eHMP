require_relative 'parent_applet.rb'

class PobVitalsApplet < PobParentApplet
  
  set_url '#/patient/vitals-full'
  set_url_matcher(/#\/patient\/vitals-full/)
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_vitals_gist_item, "[data-cell-instanceid='problem_name_BPS']"
  elements :fld_vitals_gist, "[data-appletid=vitals] .grid-container .gist-item-list .table-row"

  elements :fld_vital_type_column_data, "[data-appletid=vitals] [dialog-toggle] span:not(.sr-only)"

  elements :fld_vital_names, "[data-appletid=vitals] .border-vertical span:not(.sr-only)"

  # *****************  All_Button_Elements  ******************* #
  element :btn_expanded_all_range, "#all-range-vitals"
  element :btn_expanded_all_range_active, "#all-range-vitals.active-range"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_vitals_grid, "table[id='data-grid-vitals'] tr.selectable "

  # *****************  Quickview  ******************* #
  element :fld_vital_quickview_popover, "div.popover--gist-popover"
  elements :quickview_tbl_headers, "div.popover--gist-popover th"
  element :quickview_tbl_th_date, "div.popover--gist-popover th:nth-child(1)"
  element :quickview_tbl_th_result, "div.popover--gist-popover th:nth-child(2)"
  element :quickview_tbl_th_refrange, "div.popover--gist-popover th:nth-child(3)"
  element :quickview_tbl_th_facility, "div.popover--gist-popover th:nth-child(4)"
  elements :fld_expanded_headers, '#data-grid-vitals th a'
  
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

  def expanded_headers_text_only
    all_headers_css_selector = "#data-grid-vitals th a"
    num_headers = fld_expanded_headers.length
    html_index = 0
    header_array = []
    num_headers.times do
      html_index += 1
      css_selector = "#data-grid-vitals th:nth-child(#{html_index}) a"
      full_script = "return $('#{css_selector}').contents().filter(function(){return this.nodeType == Node.TEXT_NODE}).text();"
      header_array.push(page.execute_script(full_script).upcase)
    end
    header_array
  end
end
