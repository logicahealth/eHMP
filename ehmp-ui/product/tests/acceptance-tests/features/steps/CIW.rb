class CIW < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Add New Workspace"), ClickAction.new, AccessHtmlElement.new(:css, ".addScreen"))

    add_action(CucumberLabel.new("Workspace-Name Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, ".workspaceTable .editor-title > input"))
    add_action(CucumberLabel.new("Workspace-Description Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, ".workspaceTable .editor-description > input"))
    add_verify(CucumberLabel.new("User Defined Workspace 1"), VerifyContainsText.new, AccessHtmlElement.new(:id, "user-defined-workspace-1"))
    add_verify(CucumberLabel.new("User Defined Workspace 2"), VerifyContainsText.new, AccessHtmlElement.new(:id, "user-defined-workspace-2"))
    add_action(CucumberLabel.new("Associate Problems Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:id, "association-trigger-user-defined-workspace-1"))
    add_action(CucumberLabel.new("Associate Problems Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:id, "association-trigger-user-defined-workspace-2"))
    add_action(CucumberLabel.new("More Options Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 .fa.fa-ellipsis-v"))
    add_action(CucumberLabel.new("More Options Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 .fa.fa-ellipsis-v"))
    add_action(CucumberLabel.new("Delete Workspace Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 .delete-worksheet"))
    add_action(CucumberLabel.new("Delete Workspace Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 .delete-worksheet"))
    add_action(CucumberLabel.new("Delete Workspace Confirm"), ClickAction.new, AccessHtmlElement.new(:css, "#workspace-delete"))
    add_action(CucumberLabel.new("Search Problem Text field"), SendKeysAction.new, AccessHtmlElement.new(:id, "screen-problem-search"))
    add_verify(CucumberLabel.new("Problem Result"), VerifyContainsText.new, AccessHtmlElement.new(:class, "problem-result"))
    add_action(CucumberLabel.new("Manic bipolar I disorder - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-68569003"))
    add_action(CucumberLabel.new("Recurrent manic episodes - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-191590005"))
    add_action(CucumberLabel.new("Essential hypertension - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-59621000"))
    add_verify(CucumberLabel.new("Associated Problems List"), VerifyContainsText.new, AccessHtmlElement.new(:class, "popover-content"))
    add_verify(CucumberLabel.new("No Results"), VerifyContainsText.new, AccessHtmlElement.new(:id, "noResultsText"))
    add_action(CucumberLabel.new("Manic bipolar I disorder - Remove Text"), ClickAction.new, AccessHtmlElement.new(:id, "remove-problem-68569003"))
    
    essential_hypertension_xpath = "//*[@id='event_name_urn_va_problem_SITE_236_650']"
    applet_toolbar_xpath = "preceding-sibling::div[@class='toolbar-container']"
    p "#{essential_hypertension_xpath}/#{applet_toolbar_xpath}/descendant::*[@button-type='submenu-button-toolbar']"
    active_toolbar_submenu = "//div[contains(@class, 'toolbarActive')]/descendant::*[@button-type='submenu-button-toolbar']"
    #add_action(CucumberLabel.new("Essential Hypertension CIW Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, active_toolbar_submenu))
    add_action(CucumberLabel.new("Essential Hypertension CIW Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[button-type=submenu-button-toolbar]"))
    add_action(CucumberLabel.new("Essential Hypertension CIW dropdown Icon"), ClickAction.new, AccessHtmlElement.new(:css, ".submenuButtonWrapper .applet-dropdown button"))

    add_verify(CucumberLabel.new("User Defined Workspace 1 - Link Text Verify"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(2)"))   #.dropdown-menu>li>a
    add_verify(CucumberLabel.new("User Defined Workspace 2 - Link Text Verify"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(3)"))
    add_action(CucumberLabel.new("User Defined Workspace 1 - Link Text"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(2)"))
    add_action(CucumberLabel.new("User Defined Workspace 2 - Link Text"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(3)"))
    add_verify(CucumberLabel.new("User Defined Workspace 1 - Screen Name"), VerifyText.new, AccessHtmlElement.new(:css, "#screenName"))

    add_action(CucumberLabel.new("My Workspace"), ClickAction.new, AccessHtmlElement.new(:id, 'provider-centric-view'))
    add_action(CucumberLabel.new("Copy My Workspace"), ClickAction.new, AccessHtmlElement.new(:css, '#provider-centric-view .duplicate-worksheet'))
  end
end #CIW

Given(/^user closes the user defined work space manager$/) do
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.btn_close_manager.click
  @ehmp.wait_until_fld_applet_invisible
  expect(@ehmp.has_no_fld_applet?).to eq(true)
end

Then(/^the workspace "(.*?)" is deleted$/) do |workspace_name|
  aa = CIW.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { !aa.am_i_visible?(workspace_name) }
end

Then(/^user selects the associated workspace CIW in Problems Gist$/) do 
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_fld_toolbar_visible
  ehmp.fld_toolbar_visible.click
  ehmp.wait_for_btn_associated_workspace
  expect(ehmp).to have_btn_associated_workspace
  ehmp.btn_associated_workspace.click
  ehmp.wait_until_btn_associated_workspace_invisible
end

Then(/^user selects the associated workspace icon in Problems Gist$/) do 
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_fld_toolbar_visible
  ehmp.fld_toolbar_visible.click
  ehmp.wait_for_btn_associated_workspace_multiple
  expect(ehmp).to have_btn_associated_workspace_multiple
  ehmp.btn_associated_workspace_multiple.click
end

Then(/^the user navigated to the user defined workspace "([^"]*)"$/) do |arg1|
  url = TestSupport.driver.current_url
  expect(url).to include "/##{arg1}"
end

Then(/^the following workspace options are displayed$/) do |table|
  applet = PobProblemsApplet.new
  applet.wait_for_fld_sub_menu_items
  expect(applet.fld_sub_menu_items.length).to be > 0
  sub_menu_text = applet.fld_sub_menu_items.map { |element| element.text.upcase }
  table.rows.each do |item|
    expect(sub_menu_text).to include item[0].upcase
  end 
end

When(/^the user selects workspace option SECONDCIW$/) do 
  applet = PobProblemsApplet.new
  applet.wait_for_fld_sub_menu_items
  expect(applet.fld_sub_menu_items.length).to be > 1
  applet.wait_for_btn_second_udw
  applet.btn_second_udw.click
  applet.wait_until_btn_second_udw_invisible
end

def show_values
  elements = TestSupport.driver.find_elements(:css, "div.user-defined input")
  p "Length: #{elements.length}"
  elements.each do | ele |
    p "#{ele.attribute('id')}: #{ele.attribute('value')}: #{ele.attribute('origvalue')}"
  end
end

def hover_hypertension_row
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_udw_pbm_essential_hypertension
  expect(ehmp).to have_udw_pbm_essential_hypertension
  expect(ehmp.udw_pbm_essential_hypertension.length).to be > 0
  ehmp.udw_pbm_essential_hypertension[0].hover
end

When(/^user hovers on summary row for "([^"]*)" in the Problems Applet$/) do |ignored|
  hover_hypertension_row
end

When(/^the user clicks on the expanded row for "([^"]*)" in the Problems Applet$/) do |arg1|
  hover_hypertension_row
end

When(/^the user clicks on the maximized row for "([^"]*)" in the Problems Applet$/) do |arg1|
  hover_hypertension_row
end

Then(/^a popover toolbar displays the CIW button$/) do
  ehmp = PobProblemsApplet.new
  ehmp.wait_for_fld_toolbar_visible
  ehmp.fld_toolbar_visible.click
  expect(ehmp.wait_for_btn_associated_workspace).to eq(true)
  expect(ehmp.btn_associated_workspace['aria-disabled']).to be_nil, "Expected button to be enabled"
end
