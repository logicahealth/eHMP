require_relative 'parent_applet.rb'

class PobPermissionSetApplet < PobParentApplet
  set_url '#/admin/permission-sets-full'
  set_url_matcher(/#\/admin\/permission-sets-full/)
  
  elements :tbl_permission_sets_rows, "#data-grid-permission_sets tbody tr.selectable"
  elements :tbl_permission_sets_headers, "#data-grid-permission_sets thead th"
  element :fld_permission_set_name, "input[name='setName']"
  element :fld_description, "textarea[name='description']"
  element :fld_category, "[data-detail='category']"
  element :btn_next, "#permissions-sets-button-next"
  element :btn_submit, "#permissions-sets-button-submit"
  element :btn_add_consult, "[aria-label='Add Add Consult Order']"
  elements :status_column_data, "#data-grid-permission_sets tbody tr.selectable td:nth-child(4)"
  elements :set_name_column_data, "#data-grid-permission_sets tbody tr.selectable td:nth-child(2)"
  element :btn_permission_set_edit, ".permission-set--edit"
  element :btn_permission_set_deprecate, ".permission-set--deprecate"
  element :btn_deprecate_accept, "#permissions-sets-deprecate-accept"
  element :fld_status_message, "#nameStatusRegion h5.text-uppercase"
  element :fld_available_perm_set, "[aria-label='Add Access Control Coordinator']"
  element :fld_feature_category, "[aria-label='Add Active Medications']"
  element :ddl_status, "[name='status']"
  element :fld_notes, "[name='note']"
  element :fld_examples, "[name='example']"
  element :fld_set_name, "[data-header-instanceid='permission_sets-label'] a"
  
  def initialize
    super
    appletid_css = "[data-appletid=permission_sets]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_expanded_applet_fields appletid_css    
    add_toolbar_buttons appletid_css
    add_text_filter appletid_css
    add_generic_error_message appletid_css
  end
  
  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_permission_sets_rows.length
  end 
  
  def declare_permission_category(category_name)
    po_id = ".select2-results li[id$='#{category_name}']"
    self.class.element :fld_permission_categories, "#{po_id}"
  end

  def scroll_right_side_into_view
    parent_scroll_maximize_button "[data-appletid=permission_sets]"
  end
end
