class CustomizeWorkspace < SitePrism::Page
  element :fld_search_applets , '#searchApplets'
  element :btn_done, '#exitEditing'
  element :fld_applet_carousel, '#applets-carousel'
  elements :fld_applets_in_carousel, "div.carousel-inner div.active [data-appletid]"
  elements :fld_applet_titles_in_carousel, "div.carousel-inner div.active [data-appletid] .applet-thumbnail-title"
  element :fld_applet_carousel_next, '[data-slide=next]'
  element :fld_applet_carousel_prev, '[data-slide=prev]'
  element :btn_filter_carousel, '#editorFilterBtn'
  element :btn_add_expanded_view, "#gridster2 .options-list [data-viewtype=expanded]"
  element :btn_add_gist_view, "#gridster2 .options-list [data-viewtype=gist]"
  element :btn_add_summary_view, "#gridster2 .options-list [data-viewtype=summary]"
  elements :li_applets_in_gridster, "#gridster2 li"
  element :fld_visual_boundary, ".boundary-indicator"
  elements :fld_applets_in_current_view, "#mainOverlayRegion [data-instanceid]"
  element :fld_view_switchboard, ".view-switchboard"
  elements :fld_view_options, ".viewType-optionsBox p"

  def applets_with_id(appletid)
    self.class.elements :fld_applets_in_carousel_with_id, "div.carousel-inner div.active [data-appletid=#{appletid}]"
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
