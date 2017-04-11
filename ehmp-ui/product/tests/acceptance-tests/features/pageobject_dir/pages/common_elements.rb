class PobCommonElements < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_growl_alert, ".notify-message"
  element :fld_modal_body, ".modal-body"
  element :fld_modal_header, "#modal-header h4"
  element :fld_modal_title, "h5.panel-title-label"

  # *****************  All_Button_Elements  ******************* #
  element :btn_action_tray, "#patientDemographic-action [title='Press enter to activate menu']"
  element :btn_add_new_action, "#patientDemographic-action [title='Press enter to add New Action']"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
end
