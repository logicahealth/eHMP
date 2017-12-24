require_relative 'parent_applet.rb'
class PobReportsApplet < PobParentApplet
  data_appletid_css = '[data-appletid=reports]'
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  elements :fld_reports_row_details_header, "#modal-body .document-detail strong"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  Summary View  ******************* #
  elements :summary_tbl_headers, "#{data_appletid_css} th a"
  elements :tbl_reports, "[data-appletid=reports] .data-grid table tr.selectable"
  elements :tbl_group_headers, "#{data_appletid_css} tbody tr.group-by-header"
  
  def initialize
    super
    appletid_css = "[data-appletid=reports]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_text_filter appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return tbl_reports.length > 0
  rescue => exc
    p exc
    return false
  end

  def column_text(col_index)
    self.class.elements :col, "[data-appletid=reports] tbody td:nth-of-type(#{col_index})"
    text_only = col.map { |element| element.text.upcase }
    text_only
  end

  def type_elements(type)
    self.class.elements :report_summary_type_rows, :xpath, "//*[@data-appletid='reports']//table/descendant::tr[contains(@class, 'selectable')]/descendant::td[2 and contains(string(), '#{type}')]"
  end

  def tbl_group_visible_headers
    strip_sr_only_text tbl_group_headers
  end

  def strip_sr_only_text(headers_with_extra)
    header_text = []
    headers_with_extra.each do | header_element |
      sr_only_elements = header_element.native.find_elements(:css, '.sr-only')
      start_text = header_element.text
      sr_only_elements.each do | sr_text_element |
        start_text = start_text.gsub(sr_text_element.text, '')
      end
      header_text.push(start_text.strip.upcase)
    end
    header_text
  end

  def appletid
    'reports'
  end
end
