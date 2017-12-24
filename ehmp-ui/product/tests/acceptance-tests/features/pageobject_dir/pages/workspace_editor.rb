class WorkspaceEditor < SitePrism::Page
  # ******* SHOULD NOT BE DEFINED ON THIS PAGE
  element :btn_workspace_editor, '.workspace-editor-trigger-button'

  # ***************** WINDOW AND HEADER ***************** #
  element :editor_window, ".workspace-editor-container"
  element :window_title, ".workspace-editor-container .panel-heading h2"
  element :btn_info, '.help-icon-button-container .help-icon-link'
  element :btn_filter, '#editorFilterBtn'
  element :fld_search_applets , '#searchApplets'
  element :btn_goto_workspacemanager, 'button.open-manager'
  element :btn_done, '#exitEditing'

  # ***************** APPLET CAROUSEL ***************** #

  element :fld_applet_carousel, '.applet-carousel'
  elements :fld_applets_in_carousel, ".applet-items-container [data-appletid]"
  elements :fld_applet_titles_in_carousel, ".applet-items-container [data-appletid] .applet-thumbnail-title"
  element :fld_applet_carousel_next, '.next-carousel-page-button'
  element :fld_applet_carousel_prev, '.previous-carousel-page-button'

  # element :fld_applet_carousel, 'div.applet-carousel'
  # elements :fld_applets_in_carousel, "div.applet-items-container [data-appletid]"
  # elements :fld_applet_titles_in_carousel, "div.applet-items-container [data-appletid] .applet-thumbnail-title"
  # element :fld_applet_carousel_next, 'button.next-carousel-page-button'
  # element :fld_applet_carousel_prev, 'button.previous-carousel-page-button'

  element :btn_filter_carousel, '#editorFilterBtn'

  # ***************** CURRENT SCREEN VIEW ***************** #
  element :fld_screen_title, "#screen-title"
  element :btn_add_expanded_view, "#gridster2 .options-list [data-viewtype=expanded]"
  element :btn_add_gist_view, "#gridster2 .options-list [data-viewtype=gist]"
  element :btn_add_summary_view, "#gridster2 .options-list [data-viewtype=summary]"
  elements :btn_view_types, "#gridster2 .options-list [data-viewtype]"
  elements :li_applets_in_gridster, "#gridster2 li"
  element :fld_visual_boundary, ".boundary-indicator"
  elements :fld_applets_in_current_view, "#mainOverlayRegion [data-instanceid]"
  element :fld_view_switchboard, ".view-switchboard"
  elements :fld_view_options, ".viewType-optionsBox p"
  element :fld_applet_switchboard, ".applet-title-switchboard"

  # ****************** FOOTER ****************** #
  element :btn_delete, ".panel-footer .delete-workspace"
  element :btn_goto_workspace_manager, ".panel-footer .open-manager"
  element :btn_accept, ".panel-footer .exitEditing"
  element :btn_done, '.exitEditing'

  def applets_with_id(appletid)
    self.class.elements :fld_applets_in_carousel_with_id, ".applet-items-container [data-appletid=#{appletid}]"
    # self.class.elements :fld_applets_in_carousel_with_id, "div.applet-items-container [data-appletid=#{appletid}]"
    # p "applets_with_id: #{fld_applets_in_carousel_with_id.length}"
    fld_applets_in_carousel_with_id
  end

  def applet_in_gridster(id)
    self.class.element :fld_applet_in_gridster, "#gridster2 [data-instanceid=applet-#{id}]"
  end

  def edit_applet_element(id)
    self.class.element :edit_applet, "[data-instanceid=applet-#{id}] .edit-applet"
  end

  def remove_applet_element(id)
    self.class.element :remove_applet, "[data-instanceid=applet-#{id}] .remove-applet-option"
  end

  def view_options_text
    fld_view_options.map { | option | option.text }
  end
end
