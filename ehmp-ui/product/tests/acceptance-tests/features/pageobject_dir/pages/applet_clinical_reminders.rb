require_relative 'parent_applet.rb'

class PobClinicalRemindersApplet < PobParentApplet
  
  set_url '#/patient/cds-advice-full'
  set_url_matcher(/#\/patient\/cds-advice-full/)
  
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_cds_modal_content, ".detail-modal-content pre"
  element :fld_title, "[data-header-instanceid='cds_advice-title'] a"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_cds_rows, "#data-grid-cds_advice tr.selectable"
  elements :tbl_cds_headers, "#data-grid-cds_advice th"
  elements :tbl_cds_rows_title, "#data-grid-cds_advice tr.selectable td:nth-child(2)"
   
  def initialize
    super
    appletid_css = "[data-appletid='cds_advice']"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_text_filter appletid_css
    add_generic_error_message appletid_css
    add_empty_table_row appletid_css
    add_expanded_applet_fields appletid_css
  end
  
  def applet_grid_loaded
    return true if has_fld_empty_row?
    return tbl_cds_rows.length > 0
  rescue => exc
    p exc
    return false
  end  
  
  def wait_until_applet_loaded
    wait_until { applet_grid_loaded }
  end
   
end
