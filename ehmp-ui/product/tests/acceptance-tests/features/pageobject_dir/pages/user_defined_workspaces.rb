class UserDefinedWorkspace < SitePrism::Page
  element :fld_options_panel, ".optionsPanelStyle"
  section :menu, MenuSection, ".workspace-selector"
  def applet_built_from(id, data_appletid)
    div_id = "#applet-#{id}"
    self.class.element(:temp_applet_div, div_id)
    self.class.element(:temp_applet, "#{div_id} [data-appletid=#{data_appletid}]")
    self.class.element(:btn_options, "#{div_id} .applet-options-button")
  end

  def build_applet_grid_elements(id_num)
    table_id = "data-grid-applet-#{id_num}"
    self.class.element(:empty_row, "##{table_id} tbody tr.empty")
    self.class.elements(:rows, "##{table_id} tbody tr")
  end

  def applet_grid_loaded?
    return true if has_empty_row?
    return rows.length > 0
  rescue => grid_error
    p "retrying because of #{grid_error}"
    false
  end

  def wait_until_applet_grid_loaded
    help = HelperMethods.new
    help.wait_until { applet_grid_loaded? }
  end
end
