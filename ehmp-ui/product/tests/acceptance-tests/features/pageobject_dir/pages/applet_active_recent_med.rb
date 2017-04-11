require_relative 'parent_applet.rb'

class PobActiveRecentMedApplet < PobParentApplet
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  elements :fld_active_meds_gist_item, "[data-cell-instanceid^='name_desc_urn:va:med']"
  elements :fld_active_meds_gist, "[data-appletid=activeMeds] .gist-item-list .gist-item"
  elements :fld_meds_review_rows, ".medication-item-list-region.panel-group .meds-item"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_active_meds_grid, "table[id='data-grid-activeMeds'] tr.selectable"
   
  def initialize
    super
    appletid_css = "[data-appletid=activeMeds]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
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
end
