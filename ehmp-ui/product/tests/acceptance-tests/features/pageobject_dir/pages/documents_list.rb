require_relative 'parent_applet.rb'
class PobDocumentsList < PobParentApplet
  set_url '/#documents-list'
  set_url_matcher(/\/#documents-list/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_documents_heading, "div[data-appletid='documents'] .grid-applet-heading"
  elements :fld_date_headers, "[data-appletid=documents] td.group-by-header"

  elements :fld_document_rows_description, "#data-grid-documents tr > td.handlebars-cell.flex-width-2.sortable.renderable"
  elements :fld_document_rows_type, "#data-grid-documents > tbody > tr > td:nth-child(3)"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  *************************** #
  
  def initialize
    super
    appletid_css = "[data-appletid=documents]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return true if fld_date_headers.length > 0
    false
  end

  def document_types
    fld_document_rows_type.map { |td| td.text }
  end
end
