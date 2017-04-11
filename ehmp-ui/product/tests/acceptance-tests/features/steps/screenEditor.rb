class ScreenEditor < AccessBrowserV2
  include Singleton
  def initialize
    super
    # still used
    add_action(CucumberLabel.new("Plus Button"), ClickAction.new, AccessHtmlElement.new(:css, ".workspace-editor-trigger-button"))
    add_action(CucumberLabel.new("Workspace Manager"), ClickAction.new, AccessHtmlElement.new(:id, "workspace-manager-button"))
    add_action(CucumberLabel.new("Applet Swtchboard"), ClickAction.new, AccessHtmlElement.new(:css, ".applet-title-switchboard"))
    add_action(CucumberLabel.new("Done"), ClickAction.new, AccessHtmlElement.new(:id, "exitEditing"))

    # unsure if still used

    add_action(CucumberLabel.new("Add New Worksheet"), ClickAction.new, AccessHtmlElement.new(:id, "addScreen"))
    add_action(CucumberLabel.new("Add New Workspace"), ClickAction.new, AccessHtmlElement.new(:css, "i.fa-plus"))
    add_action(CucumberLabel.new("Title Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "screen-title"))  
    add_action(CucumberLabel.new("Description Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "screen-description")) 
    add_action(CucumberLabel.new("Add and Load"), ClickAction.new, AccessHtmlElement.new(:css, ".btn.btn-primary.addLoadButton"))
    add_action(CucumberLabel.new("Launch"), ClickAction.new, AccessHtmlElement.new(:css, "li.launch-worksheet:nth-child(5)")) 
    add_action(CucumberLabel.new("Delete Workspace"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.manageOptions.manager-open > ul > li.delete-worksheet > i")) 
    add_action(CucumberLabel.new("Open Menu"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-5 > div.col-xs-1 > i.fa-ellipsis-v")) 
    add_action(CucumberLabel.new("workspace1"), ClickAction.new, AccessHtmlElement.new(:css, "#screens-carousel > div:nth-child(2) > div.carousel-inner > div > div:nth-child(6)")) 
    add_action(CucumberLabel.new("Workspace Manager Delete Button"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.addEditFormRegion > div > div > div:nth-child(4) > div.col-md-2 > button")) 
    # add_action(CucumberLabel.new("Confirm Delete"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.deleteActiveRegion > div > div > div:nth-child(2) > div.col-md-40.text-right > button.btn.btn-danger.deleteActiveScreen")) 
    add_action(CucumberLabel.new("Confirm Delete"), ClickAction.new, AccessHtmlElement.new(:id, "workspace-delete")) 
    #add_action(CucumberLabel.new("Allergies Gist View"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.applet-gridster > div.gridsterContainer > div > ul > li > div > div > ul > li > div ")) 
    #add_action(CucumberLabel.new("Allergies Gist View"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion .gridsterContainer .options-panel .options-box.gist")) 
    add_action(CucumberLabel.new("Allergies Gist View"), ClickAction.new, AccessHtmlElement.new(:css, "#applet-1 > div > div.options-list > ul > li:nth-child(1) > div.options-box.gist"))
    add_action(CucumberLabel.new("Appointments Summary View"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.applet-gridster > div.gridsterContainer > div > ul(2) > li > div > div > ul > li > div ")) 
    add_action(CucumberLabel.new("Appointments Summary applet"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.applet-gridster > div.gridsterContainer > div > ul(2) > li > div > div > ul > li > div ")) 
    add_action(CucumberLabel.new("Numeric Lab Results Expanded View"), ClickAction.new, AccessHtmlElement.new(:css, ".expanded")) 
    add_action(CucumberLabel.new("Vitals Summery View"), ClickAction.new, AccessHtmlElement.new(:css, "#vitals > div > div.options-list > ul > li:nth-child(2) > div.options-box.summary")) 
    add_action(CucumberLabel.new("Orders Summery View"), ClickAction.new, AccessHtmlElement.new(:css, "div.summary")) 
    add_action(CucumberLabel.new("Condition Expanded View"), ClickAction.new, AccessHtmlElement.new(:css, ".expanded")) 
    add_action(CucumberLabel.new("Workspace Test"), ClickAction.new, AccessHtmlElement.new(:id, "user-defined-workspace-1"))
    add_action(CucumberLabel.new("Stacked Graph expanded view"), ClickAction.new, AccessHtmlElement.new(:css, "#gridster2 [data-appletid=stackedGraph] [data-viewtype=expanded]")) 
  
    add_action(CucumberLabel.new("Expanded View"), ClickAction.new, AccessHtmlElement.new(:css, "#gridster2 .options-list [data-viewtype=expanded]"))
    add_action(CucumberLabel.new("Trend View"), ClickAction.new, AccessHtmlElement.new(:css, "#gridster2 .options-list [data-viewtype=gist]"))
    add_action(CucumberLabel.new("Summary View"), ClickAction.new, AccessHtmlElement.new(:css, "#gridster2 .options-list [data-viewtype=summary]"))
  end
  
  def click_on_workspace(workspace_name)
    workspace_xpath = "//p[contains(string(),'#{workspace_name}')]"
    p workspace_xpath
    add_action(CucumberLabel.new("My Workspace Name"), ClickAction.new, AccessHtmlElement.new(:xpath, workspace_xpath))
    # deliberate use of wait time other then the DefaultLogin.wait_time
    return false unless wait_until_element_present("My Workspace Name", 60)
    return perform_action("My Workspace Name")
  end 
end #ScreenEditor
