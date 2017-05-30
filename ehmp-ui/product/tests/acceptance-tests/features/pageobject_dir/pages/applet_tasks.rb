require_relative 'parent_applet.rb'

class PobTasksApplet < PobParentApplet 
  
  set_url '#/patient/todo-list-full'
  set_url_matcher(/#\/patient\/todo-list-full/)
  
  elements :tbl_task_headers, "#data-grid-todo_list [data-header-instanceid]"
  elements :tbl_task_rows, "[data-appletid='todo_list'] table tbody tr.selectable"
  elements :fld_col_status_data, "#data-grid-todo_list tr.selectable td:nth-child(10)"
  elements :fld_col_task_name_data, "#data-grid-todo_list tr.selectable td:nth-child(7)"
  elements :fld_display_options, "#todo_list-status-options option"
  elements :fld_assigned_to_options, "#todo_list-assigned-to-options option"
  elements :fld_col_assigned_to_data, "#data-grid-todo_list tr.selectable td:nth-child(9)"
  elements :fld_created_on_dates_patient_view, "#data-grid-todo_list tbody tr.selectable td:nth-child(12)"
  elements :fld_created_on_dates_provider_view, "#data-grid-todo_list tbody tr.selectable td:nth-child(13)"
  
  element :fld_task_name_header, "[data-header-instanceid='todo_list-TASKNAMEFORMATTED'] a"
  element :ddl_assigned_to, "#todo_list-assigned-to-options"
  element :ddl_display_options, "#todo_list-status-options"
  element :ddl_action, ".action select"
  element :fld_task_filter_button, "#input-filter-search-todo_list"
  element :task_applet_gdf, "#grid-filter-todo_list .grid-filter-daterange"
      
  element :btn_unlock, "#unlockBtn"
  element :btn_activity_details, "#activDetailBtn"
  element :btn_close, "#closeBtn"
  element :btn_accept, "#responseAcceptButton"
    
  
  def initialize
    super
    appletid_css = "[data-appletid=todo_list]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_expanded_applet_fields appletid_css
  end

  def applet_loaded?(allow_errors = DefaultLogin.local_testrun)
    return true if has_fld_error_msg? && allow_errors # this is here because locally this is allowed
    return true if has_fld_empty_row?
    return true if tbl_task_rows.length > 0
    false
  end
  
  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_task_rows.length
  end
  
end
