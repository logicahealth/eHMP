require_relative 'parent_applet.rb'
class PobCommunityHealthApplet < PobParentApplet
  set_url '#/patient/ccd-list-full'
  set_url_matcher(/#\/patient\/ccd-list-full/)
  attr_reader :appletid
  #section :menu, MenuSection, ".workspace-selector"
  elements :tbl_data_rows, "[data-appletid='ccd_grid'] table tbody tr"
  elements :tbl_headers, "[data-appletid='ccd_grid'] th[data-header-instanceid] a"
  element :tbl_header_data, "[data-appletid='ccd_grid'] th[data-header-instanceid='ccd_grid-referenceDateTimeDisplay'] a"
  element :tbl_header_description, "[data-appletid='ccd_grid'] th[data-header-instanceid='ccd_grid-summary'] a"
  element :tbl_header_authoringinstitution, "[data-appletid='ccd_grid'] th[data-header-instanceid='ccd_grid-authorDisplayName'] a"

  elements :tbl_date_column, "[data-appletid='ccd_grid'] table tbody tr td:nth-of-type(2)"
  elements :tbl_date_column_sr, "[data-appletid='ccd_grid'] table tbody tr td:nth-of-type(2) .sr-only"
  elements :tbl_expanded_description, "[data-appletid='ccd_grid'] table tbody tr td:nth-of-type(3)"
  elements :tbl_expanded_authoring_column, "[data-appletid='ccd_grid'] table tbody tr td:nth-of-type(4)"

  elements :tbl_summary_authoring_column, "[data-appletid='ccd_grid'] table tbody tr td:nth-of-type(3)"

  # ------- DETAIL VIEW ------- #
  element :btn_next, '#ccdNext'
  element :btn_previous, '#ccdPrevious'
  element :fld_patient_identifier, '#modal-body h5'
  element :fld_details, ".ccd-modal"
  element :fld_content, ".ccd-content"

  def initialize
    super
    @appletid = 'ccd_grid'
    appletid_css = "[data-appletid=ccd_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
    add_text_filter appletid_css
  end

  def date_column_text
    dates_only = []
    tbl_date_column.each_with_index do | td_element, index |
      text = td_element.text
      #text = text.sub(tbl_date_column_sr[index].text, '')
      dates_only.push(text.strip)
    end
    dates_only
  end

  def tbl_expanded_authoring_column_text
    tbl_expanded_authoring_column.map { |td| td.text }
  end

  def tbl_summary_authoring_column_text
    tbl_summary_authoring_column.map { |td| td.text }
  end

  def ccd_content_body
    array = TestSupport.driver.execute_script("return $('.ccd-content').contents().find('body')")
    return array.length > 0 ? array[0] : nil
  end
end
