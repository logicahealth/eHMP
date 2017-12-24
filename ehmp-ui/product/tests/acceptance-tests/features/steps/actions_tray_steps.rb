When(/^the user opens the Actions Tray$/) do
  ehmp = PobCommonElements.new
  ehmp.wait_until_btn_action_tray_visible
  expect(ehmp).to have_btn_action_tray
  ehmp.btn_action_tray.click
  ehmp.wait_for_btn_add_new_action
  ehmp.action_tray.wait_for_tray_title

  expect(ehmp.action_tray).to have_tray_title
  expect(ehmp.action_tray.tray_title.text.upcase).to eq('Actions'.upcase)
  expect(ehmp).to have_btn_add_new_action
end

Then(/^the Actions Tray displays a My Tasks section$/) do
  tray = PobCommonElements.new
  expect(tray).to have_action_tray
  tray.action_tray.wait_for_fld_my_task_header(30)
  tray.action_tray.wait_for_fld_my_tasks_list
  expect(tray.action_tray).to have_fld_my_task_header
  expect(tray.action_tray).to have_fld_my_tasks_list
  # I'm not sure when the requiement changed from 'my current tasks' to 'my tasks'
  expect(tray.action_tray.fld_my_task_header.text.upcase).to match(/MY TASKS \(\d+\)/)
end

Then(/^the Actions Tray displays a My Drafts section$/) do
  tray = PobCommonElements.new
  expect(tray).to have_action_tray
  expect(tray.action_tray).to have_fld_my_drafts_header
  expect(tray.action_tray).to have_fld_my_drafts_list
  expect(tray.action_tray.fld_my_drafts_header.text.upcase).to match(/MY DRAFTS \(\d+\)/)
end

When(/^the My Tasks section is uncollapsed by default$/) do
  tray = PobCommonElements.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { tray.action_tray.fld_my_tasks_list.length > 0 }
  expect(tray.action_tray.btn_my_task['aria-expanded']).to eq("true")
  expect(tray.action_tray.fld_my_tasks_list_group['class']).to include('in')
end

When(/^the user clicks the My Tasks header$/) do
  tray = PobCommonElements.new
  expect(tray.action_tray).to have_fld_my_task_header
  expect(tray.action_tray).to have_btn_my_task
  tray.action_tray.btn_my_task.click
end

Then(/^the My Tasks section collapses$/) do
  tray = PobCommonElements.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)

  begin
    wait.until { tray.action_tray.btn_my_task['aria-expanded'].eql?('false') }
  rescue 
    p 'ignore for now'
  end

  expect(tray.action_tray.btn_my_task['aria-expanded']).to eq("false"), "Expected aria-expanded to eql false"
  #expect(tray.action_tray).to_not have_fld_my_tasks_list_group

  tray.action_tray.wait_until_fld_my_drafts_list_visible
end
