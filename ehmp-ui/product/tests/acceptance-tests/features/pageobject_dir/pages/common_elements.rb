class PobCommonElements < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_growl_alert, ".notify-message"
  element :fld_modal_body, ".modal-body"
  element :fld_modal_header, "#modal-header h4"
  element :fld_modal_title, "h5.panel-title-label"
  elements :fld_clear_udf_tags, ".clear-udaf-tag"
  element :fld_online_help_status_bar, "#linkHelp-status_bar i"
  element :fld_new_window, ".MsoNormal>b>span"
  element :fld_pick_list_input, "input[class='select2-search__field']"
  element :fld_action_tray_panel, ".accordion-container"

  # *****************  All_Button_Elements  ******************* #
  element :btn_action_tray, "#patientDemographic-action [title='Press enter to activate menu']"
  element :btn_add_new_action, "#patientDemographic-action [title='Press enter to add New Action']"
  element :btn_remove_all_filter, ".udaf-remove-btn button"
  element :btn_workspace_manager, '#workspaceManagerButton'
  element :btn_growl_close, "[data-notify='dismiss']"
  element :btn_modal_close, "#modal-close-button"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  
end

class PobUDAF < SitePrism::Page
  elements :fld_udaf_tags, '.udaf-tag button'
  element :btn_add_filter, 'button.filter-add'

  def to_filter_applet_grid(id)
    self.class.element :fld_filter, "#input-filter-search-applet-#{id}"
    self.class.elements :fld_grid_rows, "#data-grid-applet-#{id} tbody tr.selectable"
    self.class.element :btn_remove_all, "#applet-#{id} .remove-all"
    self.class.element :fld_edit_filter_title, ".filter-title-input"
    self.class.element :fld_filter_title, "#applet-#{id} .applet-filter-title"
  end

  def udaf_tag_text
    fld_udaf_tags.map { |tag| tag.text }
  end

  def remove_udaf_tag(term)
    self.class.element :btn_remove_udaf_tag, :xpath, "//button[contains(@class, 'clear-udaf-tag') and string() = '#{term}']"
  end

  def filtered_applet(appletid)
    p "[data-appletid='#{appletid}'] .panel-heading-filtered"
    self.class.element :filtered_applet, "[data-appletid='#{appletid}'] .panel-heading-filtered"
    filtered_applet
  end
end


