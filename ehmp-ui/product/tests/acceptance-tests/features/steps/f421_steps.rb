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
    #add_verify(CucumberLabel.new("Load Carousel"), VerifyContainsText.new, AccessHtmlElement.new(:id, "applets-carousel"))
    #add_action(CucumberLabel.new('Next Workspace'), ClickAction.new, AccessHtmlElement.new(:css, "[data-target='#applets-carousel']"))

    todo_list = AccessHtmlElement.new(:css, '#data-grid-todo_list tbody tr.selectable')
    add_verify(CucumberLabel.new('todo list rows'), VerifyXpathCount.new(todo_list), todo_list)
    add_action(CucumberLabel.new('First Row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-todo_list tbody tr.selectable:nth-child(1)'))
  end

  def applet_panel_title(dataapplet_id)
    panel_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .panel-title")
    return panel_title_accesser
  end
end

When(/^the user selects Staff View from the navigation bar$/) do
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to have_btn_my_workspace
  @ehmp.btn_my_workspace.click  
end

Then(/^Provider Centric View is active$/) do
  ehmp = PobStaffView.new
  expect(ehmp).to be_displayed
end

Then(/^the applets are displayed on the provider centric view$/) do |table|
  applets = MyWorkspace.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    applets.wait_until_element_present(single_cell)
    expect(applets.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end

When(/^the user navigates to "([^"]*)"$/) do |arg1|
  navigate_in_ehmp arg1
end

When(/^the user selects Staff View from navigation bar$/) do
  header = PobHeaderFooter.new
  expect(header.wait_for_fld_staff_view).to eq(true)
  header.fld_staff_view.click
  wait_for_staff_view_loaded_ignore_errors
end

Given(/^My Tasks applet displays at least (\d+) tasks$/) do |arg1|
  browser_access = MyWorkspace.instance
  expect(browser_access.wait_until_xpath_count_greater_than('todo list rows', arg1.to_i)).to eq(true)
end

When(/^the user selects a task$/) do
  browser_access = MyWorkspace.instance
  expect(browser_access.perform_action('First Row')).to eq(true)
end
