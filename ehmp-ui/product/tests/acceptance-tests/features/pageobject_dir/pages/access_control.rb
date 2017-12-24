require_relative 'common_modal_elements'
class PermissionSetDetails < SitePrism::Section
  element :detail_title, ".popover-title"
  elements :table_headers, ".popover-content thead th"
  elements :table_rows, ".popover-content tbody td"
end

class SelectPermissionsWindow < ModalElements
  element :noncommon_title, "[id^=main-workflow-label-view]"
  element :available_sets_label, "fieldset:nth-of-type(1) .available-region div.header"
  element :available_sets_filter, '#available-Permission-Sets-modifiers-filter-results'
  elements :available_sets_rows, "fieldset:nth-of-type(1) .available-region [role='listbox'] .table-row"
  elements :available_sets_names, "fieldset:nth-of-type(1) .available-region [role='listbox'] div.table-cell:nth-of-type(1)"
  elements :available_sets_details, "fieldset:nth-of-type(1) .available-region [role='listbox'] div.table-cell:nth-of-type(2) button"
  elements :available_sets_actions, "fieldset:nth-of-type(1) .available-region [role='listbox'] div.table-cell:nth-of-type(3) button"
  
  element :selected_sets_label, "fieldset:nth-of-type(1) .selected-region div.header"
  elements :selected_sets_rows, "fieldset:nth-of-type(1) .selected-region .body .table-row:not(.all-border-no)"
  elements :selected_sets_names, "fieldset:nth-of-type(1) .selected-region .body div.table-cell:nth-of-type(1)"
  elements :selected_sets_details, "fieldset:nth-of-type(1) .selected-region .body div.table-cell:nth-of-type(2) button"
  elements :selected_sets_actions, "fieldset:nth-of-type(1) .selected-region .body div.table-cell:nth-of-type(3) button"
  element :total_selected_sets, "fieldset:nth-of-type(1) .total-selected-region span"

  element :available_indperm_label, "fieldset:nth-of-type(2) .available-region div.header"
  element :available_indperm_filter, '#available-Additional-Individual-Permissions-modifiers-filter-results'
  elements :available_indperm_rows, "fieldset:nth-of-type(2) .available-region [role='listbox'] .table-row"
  elements :available_indperm_names, "fieldset:nth-of-type(2) .available-region [role='listbox'] div.table-cell:nth-of-type(1)"
  elements :available_indperm_details, "fieldset:nth-of-type(2) .available-region [role='listbox'] div.table-cell:nth-of-type(2) button"
  elements :available_indperm_actions, "fieldset:nth-of-type(2) .available-region [role='listbox'] div.table-cell:nth-of-type(3) button"

  element :selected_indperm_label, "fieldset:nth-of-type(2) .selected-region div.header"
  element :selected_inderm_empty_message, "fieldset:nth-of-type(2) .selected-region .body .table-row.all-border-no"
  elements :selected_indperm_rows, "fieldset:nth-of-type(2) .selected-region .body .table-row:not(.all-border-no)"
  elements :selected_indperm_names, "fieldset:nth-of-type(2) .selected-region .body div.table-cell:nth-of-type(1)"
  elements :selected_indperm_details, "fieldset:nth-of-type(2) .selected-region .body div.table-cell:nth-of-type(2) button"
  elements :selected_indperm_actions, "fieldset:nth-of-type(2) .selected-region .body div.table-cell:nth-of-type(3) button"
  element :total_selected_indperm, "fieldset:nth-of-type(2) .total-selected-region span"

  element :btn_cancel, '.cancel button'
  element :btn_save, '.save button'

  element :alert_message, '.permissionsSetAlertMessage .alert-content'
  section :permission_details, PermissionSetDetails, ".popover.fade.in"

  def define_add_remove_role_buttons(role_name)
    self.class.element :btn_add_role, "[aria-label='Add #{role_name}']"
    self.class.element :btn_remove_role, ".selected-region [aria-label='Remove #{role_name}']"
    self.class.element :btn_remove_role_available, ".selected-region [aria-label='Remove #{role_name}']"
  end
end

class UserInformationDetailWindow < ModalElements
  element :full_name, :xpath, "//div[@id='modal-body']/descendant::div[@class='row'][1]/descendant::div[@class='col-xs-6']"
  element :vista_status, :xpath, "//div[@id='modal-body']/descendant::div[@class='row'][1]/descendant::div[@class='row'][1]"
  element :ehmp_status, :xpath, "//div[@id='modal-body']/descendant::div[@class='row'][1]/descendant::div[@class='row'][2]"  

  element :first_name_label, :xpath, "//div[@class='row']/div[(string()='First name')]"
  element :first_name_value, :xpath, "//div[@class='row']/div[(string()='First name')]/following-sibling::div"
  
  element :btn_edit_permission_set, ".edit-permission-sets-btn"

  element :alert, ".alert-content"

  def allowable_status
    %w{ ACTIVE INACTIVE }
  end

  def build_info_elements(label)
    self.class.element :label, :xpath, "//div[@class='row']/div[(string()='#{label}')]"
    self.class.element :value, :xpath, "//div[@class='row']/div[(string()='#{label}')]/following-sibling::div"
  end

  def build_info_groups(label)
    self.class.element :label, :xpath, "//div[@class='row']/div[(string()='#{label}')]"
    self.class.elements :values, :xpath, "//div[@class='row']/div[(string()='#{label}')]/following-sibling::div/div[contains(@class,'row')]"
  end
end

class PobAccessControl < SitePrism::Page
  set_url '/#/admin/ehmp-administration'
  element :fld_access_control_applet, "#current-admin-nav-header-tab"
  element :fld_last_name, "[name='lastNameValue']"
  element :fld_first_name, "[name='firstNameValue']"
  element :fld_error_message, "#errorMessage"
  element :fld_ehmp_check_box, "[name='ehmpCheckboxValue']"
  element :fld_panel_title_label, "[data-appletid='user_management'] h5.panel-title-label"

  elements :fld_access_control_modal_labels, ".form-group label"
  element :btn_search, "#search-btn"
  element :btn_access_control_maximize, "[data-appletid='user_management'] .applet-maximize-button"
  element :btn_edit_permission_set, ".edit-permission-sets-btn"
  element :btn_save, "#mainWorkflow .save > button"

  elements :tbl_access_control, "#data-grid-user_management tr"
  element :tbl_1st_row_data, "#data-grid-user_management tbody tr:nth-child(1)"
end
