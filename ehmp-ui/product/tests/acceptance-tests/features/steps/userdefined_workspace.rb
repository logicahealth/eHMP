class WorkspaceManager < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Alert title'), VerifyText.new, AccessHtmlElement.new(:css, '#alert-region .modal-title'))
    add_action(CucumberLabel.new('Alert Confirm Delete'), ClickAction.new, AccessHtmlElement.new(:css, '#alert-region .btn-danger'))
    add_action(CucumberLabel.new('Alert Confirm Cancel'), ClickAction.new, AccessHtmlElement.new(:css, '#alert-region .btn-default'))

    workspaces = AccessHtmlElement.new(:css, 'div.workspaceTable div.table-row')
    add_verify(CucumberLabel.new('workspace count'), VerifyXpathCount.new(workspaces), workspaces)
    user_defined_workspaces = AccessHtmlElement.new(:css, 'div.user-defined')
    add_verify(CucumberLabel.new('ud workspace count'), VerifyXpathCount.new(user_defined_workspaces), user_defined_workspaces)
    add_verify(CucumberLabel.new('Workspace Manager applet'), VerifyText.new, AccessHtmlElement.new(:css, 'div.workspaceManager-applet'))
  end
end

def delete_workspace(element_id)
  elements = WorkspaceManager.instance
  p "delete workspace #{element_id}"
  elements.add_action(CucumberLabel.new('Delete workspace'), ClickAction.new, AccessHtmlElement.new(:css, "##{element_id} button.delete-worksheet"))
  return false unless elements.perform_action('Delete workspace')
  elements.perform_action('Alert Confirm Delete')
  elements.wait_until_action_element_invisible('Alert Confirm Delete')
end

Then(/^the user deletes all user defined workspaces$/) do
  elements = WorkspaceManager.instance
  expect(elements.wait_until_xpath_count_greater_than('workspace count', 0)).to eq(true)
  delete_buttons = TestSupport.driver.find_elements(:css, 'div.user-defined')
  if delete_buttons.length > 0
    for i in 0..delete_buttons.length - 1
      first_udw = TestSupport.driver.find_element(:css, 'div.user-defined')
      id = first_udw.attribute('id')
      expect(TestSupport.driver.find_elements(:id, id).length).to eq(1)
      delete_workspace(id)
      expect(TestSupport.driver.find_elements(:id, id).length).to eq(0), "User Defined workspace was not deleted"
    end
  end
end
