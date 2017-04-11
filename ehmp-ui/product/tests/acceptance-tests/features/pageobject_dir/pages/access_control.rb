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
     
  elements :fld_access_control_modal_labels, ".form-group label"
  elements :fld_modal_body_rows, ".modal-body .row"
  element :fld_permission_set_row, :xpath, "//div[@id='modal-body']/descendant::div[contains(string(), 'Permission Sets')]/parent::div[contains(@class, 'row')]"
  elements :fld_permission_set_items, :xpath, "//div[@id='modal-body']/descendant::div[contains(string(), 'Permission Sets')]/parent::div[contains(@class, 'row')]/descendant::div[contains(@class, 'row')]"
  # *****************  All_Button_Elements  ******************* #
  element :btn_search, "#search-btn"
  element :btn_access_control_maximize, "[data-appletid='user_management'] .applet-maximize-button"
  element :btn_edit_role, ".modal-body button:nth-child(1)"
  element :btn_save, "[title='Save']"
  element :btn_modal_close, "#modal-close-button"
  elements :btn_remove_selected_set, ".selected-region [title^='Press enter to remove']"
  element :fld_available_region, ".available-region"
  element :fld_selected_region, ".selected-region"
  
  # *****************  All_table_Elements  ******************* #
  elements :tbl_access_control, "#data-grid-user_management tr"
    
  element :tbl_row_keeley, "[data-row-instanceid='urn-va-user-9E7A-10000000273']"
  element :tbl_row_khan, "[data-row-instanceid='urn-va-user-9E7A-10000000272']"
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
