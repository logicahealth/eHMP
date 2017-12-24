class ScrnManager < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Screen Manager Header part 1"), ClickAction.new, AccessHtmlElement.new(:css, "#workspaceManager > div > div.col-xs-7 > div"))
    add_action(CucumberLabel.new("Screen Manager Header part 2"), ClickAction.new, AccessHtmlElement.new(:css, "#workspaceManager > div > div.col-xs-5 > div"))
    add_action(CucumberLabel.new("Coversheet launch button"), ClickAction.new, AccessHtmlElement.new(:css, "#cover-sheet > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("add new screen button"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div:nth-child(3) > div.col-xs-offset-6.col-xs-4 > button.btn.addScreen"))
    add_action(CucumberLabel.new("Coversheet launch button"), ClickAction.new, AccessHtmlElement.new(:css, "#cover-sheet > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("workspace1 launch"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("Screen editor applets"), ClickAction.new, AccessHtmlElement.new(:css, "#applets-carousel > div:nth-child(2) > div.carousel-inner > div.item.active > div:nth-child(1)"))
    add_action(CucumberLabel.new("Delete workspace1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-5 > div:nth-child(4) > div"))
    add_action(CucumberLabel.new("Delete workspace2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.col-xs-5 > div:nth-child(4) > div"))
    add_action(CucumberLabel.new("workspace1 title field"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-7 > div.col-xs-5.editor-title > input"))
    add_action(CucumberLabel.new("workspace1 description field"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-7 > div.col-xs-6 > input"))
    add_verify(CucumberLabel.new("workspace1 title"), VerifyText.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-7 > div.col-xs-5.editor-title > input"))
    add_verify(CucumberLabel.new("workspace1 description"), VerifyText.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-7 > div.col-xs-6 > input"))
    add_verify(CucumberLabel.new("workspace1 Author"), VerifyText.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-5 > div.col-xs-5"))
    add_action(CucumberLabel.new("Overview Menu"), ClickAction.new, AccessHtmlElement.new(:css, "#navigation-navbar > ul > li.btn-group > button.btn.btn-default.dropdown-toggle"))
    add_action(CucumberLabel.new("workspace2 flyout"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.col-xs-5 > div.col-xs-1 > i"))
    add_action(CucumberLabel.new("workspace1 copy flyout"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.col-xs-5 > div.col-xs-1 > i"))
    add_action(CucumberLabel.new("Screen Editor Exit"), ClickAction.new, AccessHtmlElement.new(:id, "exitEditing"))
    add_action(CucumberLabel.new("Confirm Delete"), ClickAction.new, AccessHtmlElement.new(:css, "#workspace-delete"))
    add_action(CucumberLabel.new("Coversheet Duplicate"), ClickAction.new, AccessHtmlElement.new(:css, "#cover-sheet > div > div.manageOptions.manager-open > ul > li.duplicate-worksheet"))
    add_action(CucumberLabel.new("Coversheet Copy Launch"), ClickAction.new, AccessHtmlElement.new(:css, "#coversheet-copy > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("Coversheet Copy Delete"), ClickAction.new, AccessHtmlElement.new(:css, "#coversheet-copy > div > div.manageOptions.manager-open > ul > li.delete-worksheet"))
    add_verify(CucumberLabel.new("workspace 2 title"), VerifyText.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.col-xs-7 > div.col-xs-5.editor-title > input"))
    add_action(CucumberLabel.new("Workspace1 Duplicate"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.manageOptions.manager-open > ul > li.duplicate-worksheet"))
    add_action(CucumberLabel.new("workspace2 launch"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("workspace1 copy launch"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.manageOptions.manager-open > ul > li.launch-worksheet"))
    add_action(CucumberLabel.new("workspace1 copy delete"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.manageOptions.manager-open > ul > li.delete-worksheet"))
    add_action(CucumberLabel.new("Dropdown Menu"), ClickAction.new, AccessHtmlElement.new(:css, "#nav-workspaceSelect button.btn.btn-default.dropdown-toggle"))
  end
end

When(/^the user clicks "(.*?)" on the workspace manager$/) do |html_action_element|
  navigation = ScrnManager.instance
  navigation.wait_until_action_element_visible(html_action_element, 40)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end
