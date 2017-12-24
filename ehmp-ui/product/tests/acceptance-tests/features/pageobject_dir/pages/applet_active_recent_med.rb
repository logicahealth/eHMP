require_relative 'parent_applet.rb'

class PobActiveRecentMedApplet < PobParentApplet
  # *****************  GIST/TREND VIEW  ******************* #
  elements :fld_active_meds_gist_item, "[data-cell-instanceid^='name_desc_urn:va:med']"
  elements :fld_active_meds_gist, "[data-appletid=activeMeds] .gist-item-list .gist-item"
  elements :fld_gist_med_names, "[data-cell-instanceid^='name_desc'] strong"
  elements :gist_name_cells, "[data-appletid=activeMeds] div.gist-item-list div.table-row [role=presentation]:nth-child(1)"

  element :fld_active_meds_name_header, "[data-appletid=activeMeds] [data-header-instanceid='name-header']"
  elements :gist_headers, "[data-appletid=activeMeds] a[data-header-instanceid]"
  
  # Quicklook
  element :fld_quickview_popover, "div.popover--gist-popover"
  elements :quickview_tbl_headers, "div.popover--gist-popover th"
  elements :quickview_tbl_rows, "div.popover--gist-popover tbody tr"

  # *****************  SUMMARY VIEW  ******************* #
  elements :tbl_active_meds_grid, "[data-appletid=activeMeds] .data-grid table tr.selectable"
  elements :tbl_summary_headers, "[data-appletid=activeMeds] thead [data-header-instanceid] a"

  def initialize
    super
    appletid_css = "[data-appletid=activeMeds]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
    add_quick_view_popover appletid_css
    add_text_filter appletid_css
  end
  
  def summary_applet_loaded?
    return true if has_fld_empty_row?
    return tbl_active_meds_grid.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_active_meds_gist.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_summary_applet_loaded
    wait_until { summary_applet_loaded? }
  end
  
  def wait_until_applet_gist_loaded
    wait_until { applet_gist_loaded? }
  end

  def summary_headers_text
    with_screenreader_text = tbl_summary_headers.map { |element| element.text }
    # ex. Medication Sortable Column Press enter to sort
    # regex will strip out the 'Sortable Column Press enter to sort'
    without_screenreader_text = with_screenreader_text.map { |header_text| header_text.sub('Sortable Column', '').strip }
    without_screenreader_text
  end

  def gist_headers_text
    with_screenreader_text = gist_headers.map { |element| element.text }
    without_screenreader_text = with_screenreader_text.map { |header_text| header_text.split('(')[0].strip }
    without_screenreader_text
  end

  def gist_rows_with_text(input_text)
    upper = input_text.upcase
    lower = input_text.downcase
    text_check = "descendant::div[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"
    path = "//div[@data-appletid='activeMeds']/#{text_check}/ancestor::div[contains(@class, 'table-row-toolbar')]"
    self.class.elements :rows_with_text, :xpath, path
    rows_with_text
  end
  
  def appletid
    'activeMeds'
  end
end
