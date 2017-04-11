class PobAccessControl < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_access_control_applet, "#ehmp-administration-nav-header-tab"
  element :fld_last_name, "#lastNameValue"
  element :fld_first_name, "#firstNameValue"
  element :fld_error_message, "#errorMessage"
  element :fld_ehmp_check_box, "#ehmpCheckboxValue"
     
  elements :fld_access_control_modal_labels, ".form-group label"
  elements :fld_modal_body_rows, ".modal-body .row"
  # *****************  All_Button_Elements  ******************* #
  element :btn_search, "#search-btn"
  element :btn_access_control_maximize, "[data-appletid='user_management'] .applet-maximize-button"
  element :btn_add_std_doc, "[title='Press enter to add Standard Doctor.']"
  element :btn_edit_role, ".modal-body button:nth-child(1)"
  element :btn_save, "[title='Save']"
  element :btn_add_pharmacist, "[title='Press enter to add Pharmacist.']"
  element :btn_add_read_access, "[title='Press enter to add Read Access.']"
 
  elements :btn_remove_read_access, "[title='Press enter to remove Read Access.']"
  elements :btn_remove_pharmacist, "[title='Press enter to remove Pharmacist.']"
  elements :btn_remove_std_doc, "[title='Press enter to remove Standard Doctor.']"
  
  # *****************  All_table_Elements  ******************* #
  elements :tbl_access_control, "#data-grid-user_management tr"
    
  element :tbl_row_keeley, "[data-row-instanceid='urn-va-user-9E7A-10000000273']"
  element :tbl_row_khan, "[data-row-instanceid='urn-va-user-9E7A-10000000272']"
  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
end
