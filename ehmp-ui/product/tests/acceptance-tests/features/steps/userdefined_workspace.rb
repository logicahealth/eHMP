class WorkspaceManager < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Alert title'), VerifyText.new, AccessHtmlElement.new(:css, '#alert-region .modal-title'))
    add_action(CucumberLabel.new('Alert Confirm Delete'), ClickAction.new, AccessHtmlElement.new(:css, '#alert-region .btn-danger'))
    add_action(CucumberLabel.new('Alert Confirm Cancel'), ClickAction.new, AccessHtmlElement.new(:css, '#alert-region .btn-default'))
    add_action(CucumberLabel.new('Close Workspace Manager'), ClickAction.new, AccessHtmlElement.new(:css, '#doneEditing'))

    workspaces = AccessHtmlElement.new(:css, 'div.workspace-table div.table-row')
    add_verify(CucumberLabel.new('workspace count'), VerifyXpathCount.new(workspaces), workspaces)
    user_defined_workspaces = AccessHtmlElement.new(:css, 'div.user-defined')
    add_verify(CucumberLabel.new('ud workspace count'), VerifyXpathCount.new(user_defined_workspaces), user_defined_workspaces)
    add_verify(CucumberLabel.new('Workspace Manager applet'), VerifyText.new, AccessHtmlElement.new(:css, 'div.workspaceManager-applet'))
  end
end

def perform_udw_delete
  elements = WorkspaceManager.instance
  return false unless elements.perform_action('Delete workspace')
  elements.perform_action('Alert Confirm Delete')
  elements.wait_until_action_element_invisible('Alert Confirm Delete')
  true
end

def delete_workspace(element_id)
  elements = WorkspaceManager.instance
  p "delete workspace #{element_id}"
  elements.add_action(CucumberLabel.new('Delete workspace'), ClickAction.new, AccessHtmlElement.new(:css, "##{element_id} button.delete-worksheet"))
  return perform_udw_delete
end

def delete_first_udw
  elements = WorkspaceManager.instance
  p "delete workspace without id"
  elements.add_action(CucumberLabel.new('Delete workspace'), ClickAction.new, AccessHtmlElement.new(:css, "div.user-defined button.delete-worksheet"))
  return perform_udw_delete
end

Then(/^the user deletes all user defined workspaces$/) do
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  expect(elements.wait_until_xpath_count_greater_than('workspace count', 0)).to eq(true)
  delete_buttons = TestSupport.driver.find_elements(:css, 'div.user-defined')
  if delete_buttons.length > 0
    for i in 0..delete_buttons.length - 1
      first_udw = TestSupport.driver.find_element(:css, 'div.user-defined')
      id = first_udw.attribute('id')
      if id.length == 0
        p "this udw did not have an id"
        num_udw_delete_buttons = TestSupport.driver.find_elements(:css, 'div.user-defined').length
        delete_first_udw
        wait.until { TestSupport.driver.find_elements(:css, 'div.user-defined').length < num_udw_delete_buttons }
      else
        # p "delete udw #{id}"
        expect(TestSupport.driver.find_elements(:id, id).length).to eq(1)
        delete_workspace(id)
        expect(TestSupport.driver.find_elements(:id, id).length).to eq(0), "User Defined workspace was not deleted"
      end

    end
  end
end

Then(/^the "([^"]*)" preview option is disabled$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  expect(@ehmp.has_btn_udw_preview?).to eq(true)

  expect(@ehmp.btn_udw_preview['class']).to_not include('previewWorkspace')
  expect(@ehmp.btn_udw_preview['disabled']).to eq('true')
end

Then(/^the "([^"]*)" preview option is enabled$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  expect(@ehmp.has_btn_udw_preview?).to eq(true)

  expect(@ehmp.btn_udw_preview['class']).to include('previewWorkspace')
  expect(@ehmp.btn_udw_preview['disabled']).to be_nil
end

When(/^user closes the Workspace Manager$/) do
  workspace_manager = WorkspaceManager.instance
  expect(workspace_manager.perform_action("Close Workspace Manager")).to eq(true)
end
