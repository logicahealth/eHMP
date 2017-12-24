require_relative 'parent_applet.rb'

class PobIndividualPermissionApplet < PobParentApplet
  set_url '#/admin/individual-permissions-full'
  set_url_matcher(/#\/admin\/individual-permissions-full/)
  
  elements :tbl_individual_permission_rows, "#data-grid-individual_permissions tbody tr.selectable"
  elements :tbl_individual_permission_headers, "#data-grid-individual_permissions thead th.sortable"
  elements :fld_individual_permission_names, "#data-grid-individual_permissions tbody td.flex-width-2"
  elements :fld_individual_permission_nat_access, "#data-grid-individual_permissions tbody td:nth-child(6)"
  element :fld_name, "[data-header-instanceid='individual_permissions-label'] a"
  elements :tbl_name_data, "#data-grid-individual_permissions tbody tr.selectable td:nth-child(2)"
  
  def initialize
    super
    appletid_css = "[data-appletid=individual_permissions]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_expanded_applet_fields appletid_css    
    add_toolbar_buttons appletid_css
    add_text_filter appletid_css
    add_generic_error_message appletid_css
  end
end

