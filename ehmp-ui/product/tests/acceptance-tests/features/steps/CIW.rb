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
    
    essential_hypertension_xpath = "//*[@id='event_name_urn_va_problem_9E7A_236_650']"
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

Then(/^user selects the "(.*?)" CIW icon in Problems Gist$/) do |arg1|
  aa = CIW.instance
  label = "#{arg1} CIW Icon"
  expect(aa.perform_action(label)).to be_true
end

Then(/^user selects the "(.*?)" CIW dowpdown icon in Problems Gist$/) do |arg1|
  aa = CIW.instance
  label = "#{arg1} CIW dropdown Icon"
  expect(aa.perform_action(label)).to be_true
end

Then(/^the user navigated to the user defined workspace "([^"]*)"$/) do |arg1|
  url = TestSupport.driver.current_url
  expect(url).to include "/##{arg1}"
end

Then(/^the following workspace options are displayed$/) do |table|
  ciw = CIW.instance
  table.rows.each do | row |
    ciw.add_action(CucumberLabel.new("#{row[0]} associated workspace"), ClickAction.new, AccessHtmlElement.new(:css, ".applet-dropdown-menu [href='##{row[0].downcase}']"))
    expect(ciw.wait_until_action_element_visible("#{row[0]} associated workspace")).to eq(true)
  end
end

When(/^the user selects workspace option "([^"]*)"$/) do |arg1|
  ciw = CIW.instance
  expect(ciw.perform_action("#{arg1} associated workspace")).to eq(true)
end

def show_values
  elements = TestSupport.driver.find_elements(:css, "div.user-defined input")
  p "Length: #{elements.length}"
  elements.each do | ele |
    p "#{ele.attribute('id')}: #{ele.attribute('value')}: #{ele.attribute('origvalue')}"
  end
end

When(/^user clicks on summary row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

When(/^the user clicks on the expanded row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

When(/^the user clicks on the maximized row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

Then(/^a popover toolbar displays the CIW button$/) do
  ciw = CIW.instance
  ciw.wait_until_action_element_visible('Essential Hypertension CIW Icon')
  expect(ciw.am_i_visible? 'Essential Hypertension CIW Icon').to eq(true)
end
