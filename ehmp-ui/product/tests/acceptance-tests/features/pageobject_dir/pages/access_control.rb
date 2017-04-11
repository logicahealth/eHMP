class PobAccessControl < SitePrism::Page
  set_url '/#/admin/ehmp-administration'
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_access_control_applet, "#current-admin-nav-header-tab"
  element :fld_last_name, "#lastNameValue"
  element :fld_first_name, "#firstNameValue"
  element :fld_error_message, "#errorMessage"
  element :fld_ehmp_check_box, "#ehmpCheckboxValue"
  element :fld_panel_title_label, "h5.panel-title-label"
  element :fld_user_information_modal_window, "#mainModalDialog"
  element :fld_available_permission_filter, "#available-Permission-Sets-modifiers-filter-results"
  element :fld_popup_detail, "[id^='popover']"
  element :fld_total_selected_region, "#mainWorkflow .container-fluid > div .total-selected-region span"
  element :fld_additional_individual_permissions, ".container-fluid legend"
  element :fld_total_selected_additional_ind_permissions, ".container-fluid > fieldset .total-selected-region span"
  element :fld_available_region, ".available-region"
  element :fld_selected_region, ".selected-region"
  element :fld_edit_permission_modal_title, ".modal-title[id^='main-workflow-label-Select-Permissions-']"
  element :fld_detail_popover_window, ".modal-body .popover.in[id^=popover]"
  element :fld_error_message_additional_ind, ".container-fluid > fieldset .permissionsAlert"
  element :fld_error_message_available_perm, ".workflow-controller .permissionsSetAlert"

  elements :fld_access_control_modal_labels, ".form-group label"
  elements :fld_modal_body_rows, ".modal-body .row"
  element :fld_permission_set_row, :xpath, "//div[@id='modal-body']/descendant::div[contains(string(), 'Permission Sets')]/parent::div[contains(@class, 'row')]"
  elements :fld_permission_set_items, :xpath, "//div[@id='modal-body']/descendant::div[contains(string(), 'Permission Sets')]/parent::div[contains(@class, 'row')]/descendant::div[contains(@class, 'row')]"
  elements :fld_user_information_header, "#modal-body div .color-grey-darker"
  elements :fld_available_permission_sets_data_rows, ".container-fluid > div .available-region .table-row"
  elements :fld_selected_permission_sets_data_rows, ".container-fluid > div .selected-region .table-row"
  elements :fld_available_additional_permissions_data_rows, ".container-fluid > fieldset .available-region .table-row"
  elements :fld_all_permission_headers, ".col-md-6 div.header.table-row div:nth-child(1)"
  elements :fld_detail_popup_thead, "[id^=popover] thead th"
  elements :fld_detail_popup_tbody, "[id^=popover] tbody td"

  # *****************  All_Button_Elements  ******************* #
  element :btn_search, "#search-btn"
  element :btn_access_control_maximize, "[data-appletid='user_management'] .applet-maximize-button"
  element :btn_edit_role, ".modal-body button:nth-child(1)"
  element :btn_save, "#mainWorkflow .save > button"
  element :btn_user_info_modal_close, "#modal-close-button"
  element :btn_edit_perm_modal_close, "#mainWorkflow .col-xs-2 button > i"

  elements :btn_remove_selected_set, ".selected-region [title^='Press enter to remove']"
  elements :btn_available_permission_sets_add_remove, ".container-fluid > div .available-region .auto-overflow-y div:nth-child(3) > button"
  elements :btn_detail_available_permission_sets, ".container-fluid > div .available-region .auto-overflow-y > div i"
  elements :btn_detail_selected_permission_sets, ".container-fluid > div .selected-region .auto-overflow-y > div i"
  elements :btn_detail_available_additional_permission_sets, ".container-fluid > fieldset .available-region .auto-overflow-y i"
  elements :btn_selected_permission_sets_add_remove, ".container-fluid > div .selected-region .auto-overflow-y div:nth-child(3) > button"
  elements :btn_available_additional_permission_add_remove, ".container-fluid > fieldset .available-region .auto-overflow-y div:nth-child(3) > button"
  elements :btn_selected_additional_permission_add_remove, ".container-fluid > fieldset .selected-region .auto-overflow-y div:nth-child(3) > button"

  # *****************  All_table_Elements  ******************* #
  elements :tbl_access_control, "#data-grid-user_management tr"
    
  # element :tbl_row_keeley, "[data-row-instanceid='urn-va-user-9E7A-10000000273']"
  # element :tbl_row_khan, "[data-row-instanceid='urn-va-user-9E7A-10000000272']"
  element :tbl_1st_row_data, "#data-grid-user_management tbody tr:nth-child(1)"

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#

  def modal_displayed_roles
    fld_permission_set_items.map { | item | item.text }
  end

  def define_add_remove_role_buttons(role_name)
    self.class.element :btn_add_role, "[title='Press enter to add #{role_name}.']"
    self.class.element :btn_remove_role, ".selected-region [title='Press enter to remove #{role_name}.']"
  end
end
