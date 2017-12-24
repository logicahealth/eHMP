Then(/^the user deletes all user defined workspaces$/) do
  manager = PobWorkspaceManager.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { manager.fld_all_screens.length > 0 }

  attempt_count = 0
  begin
    num_udws = manager.fld_userdefined_screens.length
    for i in 0..num_udws-1
      before_delete_num = manager.fld_userdefined_screens.length
      expect(WorkspaceActions.delete_first_udw).to eq(true)
      wait.until { manager.fld_userdefined_screens.length < before_delete_num }
    end
  rescue Exception => e
    p 'issue...lets see what we can about it'
    if (attempt_count < 3) && manager.has_error_message?
      attempt_count += 1
      p "error deleting, try again"
      manager.acknowledge_error_message
      sleep 2
      retry
    end
    raise 'unable to delete'
  end
end

Then(/^the "([^"]*)" preview option is disabled$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  expect(@ehmp.has_btn_udw_preview?).to eq(true)

  expect(@ehmp.btn_udw_preview['disabled']).to eq('true')
end

Then(/^the "([^"]*)" preview option is enabled$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  @ehmp.wait_for_btn_udw_preview
  expect(@ehmp.has_btn_udw_preview?).to eq(true)

  wait_time = Time.now + 10 # sec
  begin
    expect(@ehmp.btn_udw_preview['class']).to include('previewWorkspace')
    expect(@ehmp.btn_udw_preview['disabled']).to be_nil
  rescue => e
    retry if Time.now < wait_time
    raise e
  end
end

When(/^user closes the Workspace Manager$/) do
  ehmp = PobWorkspaceManager.new
  ehmp.wait_for_btn_close_manager
  expect(ehmp).to have_btn_close_manager
  ehmp.btn_close_manager.click
end
