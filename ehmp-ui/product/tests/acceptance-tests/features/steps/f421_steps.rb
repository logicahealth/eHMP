path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class MyWorkspace < AllApplets
  include Singleton
  def initialize
    super
    #add_action(CucumberLabel.new('My Workspace Navigation'), ClickAction.new, AccessHtmlElement.new(:id, 'provider-centric-view-nav-header-tab'))
    add_action(CucumberLabel.new('My Workspace Navigation'), ClickAction.new, AccessHtmlElement.new(:id, 'current--nav-header-tab'))
    add_action(CucumberLabel.new('Staff View Navigation'), ClickAction.new, AccessHtmlElement.new(:id, 'current-staff-nav-header-tab'))

    # applets
    add_verify(CucumberLabel.new("TASKS"), VerifyContainsText.new, applet_panel_title("todo_list"))
    add_verify(CucumberLabel.new("Load Carousel"), VerifyContainsText.new, AccessHtmlElement.new(:id, "applets-carousel"))
    add_action(CucumberLabel.new('Next Workspace'), ClickAction.new, AccessHtmlElement.new(:css, "[data-target='#applets-carousel']"))

    todo_list = AccessHtmlElement.new(:css, '#data-grid-todo_list tbody tr.selectable')
    add_verify(CucumberLabel.new('todo list rows'), VerifyXpathCount.new(todo_list), todo_list)
    add_action(CucumberLabel.new('First Row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-todo_list tbody tr.selectable:nth-child(1)'))
  end

  def applet_panel_title(dataapplet_id)
    panel_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .panel-title")
    return panel_title_accesser
  end
end

def verify_on_myworkspace
  browser_access = MyWorkspace.instance
  expect(browser_access.perform_verification("Screenname", "My Workspace")).to be_true
end

Then(/^Staff View Navigation is displayed$/) do
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to have_btn_my_workspace
end

When(/^the user selects Staff View from the navigation bar$/) do
  # expect(MyWorkspace.instance.perform_action('My Workspace Navigation')).to eq(true)
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to have_btn_my_workspace
  @ehmp.btn_my_workspace.click  
end

Then(/^Provider Centric View is active$/) do
  browser_access = MyWorkspace.instance
  # expect(browser_access.perform_verification("Screenname", "My Workspace")).to be_true
end

Then(/^the applets are displayed on the provider centric view$/) do |table|
  applets = MyWorkspace.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    applets.wait_until_element_present(single_cell)
    expect(applets.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end

Then(/^the workspace editor button is not displayed$/) do
  editor = ScreenEditor.instance
  expect(editor.wait_until_element_present('Plus Button', 3)).to eq(false)
end

When(/^the user navigates to "([^"]*)"$/) do |arg1|
  navigate_in_ehmp arg1
end

Then(/^the workspace editor button is displayed$/) do
  editor = ScreenEditor.instance
  expect(editor.wait_until_element_present('Plus Button')).to eq(true)
end

When(/^the user selects Patient Selection from navigation bar$/) do
  expect(PatientSearch.instance.perform_action('patientSearch')).to eq(true)
end

When(/^the user selects current patient link$/) do
  expect(PatientSearch2.instance.perform_action('Patient Search Overview Navigation')).to eq(true)
  expect(PatientSearch2.instance.perform_action('Confirm')).to eq(true)
  expect(PatientSearch2.instance.perform_action('Confirm Flag')).to eq(true)
end

When(/^the user copies My Workspace workspace$/) do
  elements = CIW.instance
  elements.add_verify(CucumberLabel.new('My Workspace Copy'), VerifyText.new, AccessHtmlElement.new(:id, 'my-workspace-copy'))
  elements.add_action(CucumberLabel.new('My Workspace Copy Customize'), ClickAction.new, AccessHtmlElement.new(:css, '#my-workspace-copy .customize-screen'))
  expect(elements.perform_action('Copy My Workspace')).to eq(true)
  expect(elements.wait_until_element_present('My Workspace Copy')).to eq(true)
end

class CustomizationPage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new('Search Applets'), SendKeysAction.new, AccessHtmlElement.new(:id, 'searchApplets'))
  end
end

def verify_on_customization_page
  page = CustomizationPage.instance
  expect(page.wait_until_element_present('Search Applets')).to eq(true)
end

When(/^the user chooses to customize the My Workspace copy$/) do
  elements = CIW.instance
  expect(elements.perform_action('My Workspace Copy Customize')).to eq(true)
  verify_on_customization_page
end

Then(/^the default workspace applet is also listed in the applet selection catalog\/bucket\.$/) do
  elements = CIW.instance
  elements.add_verify(CucumberLabel.new('Gridster - ToDo List'), VerifyText.new, AccessHtmlElement.new(:css, '.applet-gridster [data-appletid=todo_list]'))
  elements.add_verify(CucumberLabel.new('Applet Carousel - ToDo List'), VerifyText.new, AccessHtmlElement.new(:css, '#applets-carousel [data-appletid=todo_list]'))
  expect(elements.am_i_visible? 'Gridster - ToDo List').to eq(true)
  expect(MyWorkspace.instance.wait_until_action_element_visible("Load Carousel", 30)).to be_true
  expect(MyWorkspace.instance.perform_action('Next Workspace')).to eq(true)
  expect(elements.wait_until_action_element_visible("Applet Carousel - ToDo List", 30)).to be_true
  expect(elements.am_i_visible? 'Applet Carousel - ToDo List').to eq(true)
end

Given(/^My Tasks applet displays at least (\d+) tasks$/) do |arg1|
  browser_access = MyWorkspace.instance
  expect(browser_access.wait_until_xpath_count_greater_than('todo list rows', arg1.to_i)).to eq(true)
end

When(/^the user selects a task$/) do
  browser_access = MyWorkspace.instance
  expect(browser_access.perform_action('First Row')).to eq(true)
end

Then(/^a detail view is displayed$/) do
  @uc.wait_until_action_element_visible("Modal", 15)
end
