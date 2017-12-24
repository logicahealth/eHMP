require_relative 'tray_sidebar_section.rb'

class ToolTips < SitePrism::Page
  elements :fld_tooltips, ".tooltip-inner"
  def clear_all_tool_tips
    zombie_tooltips = fld_tooltips.length
    return true if zombie_tooltips.zero?
    # p "visible tooltips: #{zombie_tooltips}"
    (0..zombie_tooltips).each do | index |
      # p "clear tooltip #{index}"
      TestSupport.driver.execute_script("$('[data-toggle=tooltip], [tooltip-data-key]').tooltip('hide');")
      sleep(1)
    end
    return fld_tooltips.length.zero?
  end
end

class PobCommonElements < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  
  section :action_tray, ActionTraySection, "#patientDemographic-action"
    
  element :fld_growl_alert, ".notify-message"
  element :fld_modal_body, ".modal-body"
  element :fld_modal_header, "#modal-header h4"
  element :fld_modal_title, "h5.panel-title-label"
  element :fld_detail_modal_content, ".detail-modal-content"
  elements :fld_clear_udf_tags, ".clear-udaf-tag"
  element :fld_online_help_status_bar, "footer .help-icon-button-container .help-icon-link"
  element :fld_new_window, ".MsoNormal>b>span"
  element :fld_pick_list_input, "input[class='select2-search__field']"
  element :fld_action_tray_panel, ".accordion-container"
  element :fld_tray_loader_message, ".tray-loader-message"

  # *****************  All_Button_Elements  ******************* #
  element :btn_action_tray, "#patientDemographic-action button"
  element :btn_add_new_action, "#patientDemographic-action .action-list-child-container button"
  element :btn_remove_all_filter, ".udaf-remove-btn button"
  element :btn_workspace_options, ".workspace-selector .dropdown--options button.dropdown-toggle"
  element :workspace_options_menu, ".workspace-selector .dropdown--options .dropdown-menu"
  element :btn_workspace_manager_option, ".workspace-manager-option"
  element :btn_growl_close, "[data-notify='dismiss']"
  element :btn_modal_close, "#modal-close-button"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  
end

class PobUDAF < SitePrism::Page
  elements :fld_udaf_tags, '.udaf-tag button'
  element :btn_add_filter, 'button.filter-add'

  def to_filter_applet_grid(id)
    self.class.element :btn_open_filter_section, "[data-instanceid=applet-#{id}] .applet-filter-button"
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

  def create_filtered_applet_element(appletid)
    p "creating filtered_applet: [data-appletid='#{appletid}'] .panel-heading-filtered"
    self.class.element :filtered_applet, "[data-appletid='#{appletid}'] .panel-heading-filtered"
    filtered_applet
  end
end


