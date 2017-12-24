Then(/^user closes the actions tray$/) do
  @ehmp = PobCommonElements.new
  begin    
    @ehmp.wait_for_btn_action_tray
    @ehmp.wait_until_btn_action_tray_visible
    expect(@ehmp).to have_btn_action_tray
    @ehmp.btn_action_tray.click
    @ehmp.wait_until_btn_add_new_action_invisible
  rescue
    p "entered the rescue block, will try again to click on the actions tray"
    retry
  end  
end

def wait_for_growl_alert_to_disappear
  @ehmp = PobCommonElements.new
  begin    
    @ehmp.wait_until_fld_growl_alert_invisible(30)
  rescue
    retry
  end
end

def verify_and_close_growl_alert_pop_up(message)
  ehmp = PobCommonElements.new
  ehmp.wait_until_fld_growl_alert_visible 60, :text => message
  expect(ehmp.fld_growl_alert.text.upcase).to have_text(message.upcase)
  expect(ehmp).to have_btn_growl_close
  ehmp.btn_growl_close.click
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { element_is_not_present?(:css, "[data-notify='dismiss']") }
  expect(ehmp).to have_no_btn_growl_close
end

Then(/^user is navigated to the help page$/) do
  @ehmp = PobCommonElements.new
  driver = TestSupport.driver
  sleep(5)
  driver.switch_to.window(driver.window_handles.last)
  @ehmp.wait_until_fld_new_window_visible
  expect(@ehmp).to have_fld_new_window
  page.driver.browser.close
end

Then(/^POB user closes the modal window$/) do
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_btn_modal_close_visible
  expect(@ehmp).to have_btn_modal_close
  @ehmp.btn_modal_close.click
  @ehmp.wait_until_btn_modal_close_invisible
end

Then(/^the detail modal is displayed$/) do
  @ehmp = PobCommonElements.new
  max_attempt = 2
  begin
    @ehmp.wait_until_fld_modal_body_visible
    expect(@ehmp).to have_fld_modal_body
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_element
    max_attempt -= 1
    raise stale_element if max_attempt < 0
    p "StaleElementReferenceError, retry"
    retry
  end
end

Then(/^the detail modal title is set$/) do
  @ehmp = ModalElements.new
  @ehmp.wait_for_fld_modal_title
  expect(@ehmp).to have_fld_modal_title
  expect(@ehmp.fld_modal_title.text.length).to be > 0, "Expected modal title to have a length > 0, title = '#{@ehmp.fld_modal_title.text}'"
end

Then(/^the modal dialog contains data labels$/) do
  @ehmp = ModalElements.new
  @ehmp.wait_until_fld_modal_detail_labels_visible
  expect(@ehmp).to have_fld_modal_detail_labels
end

Then(/^the modal dialog contains data$/) do
  ehmp = ModalElements.new
  ehmp.wait_until_modal_body_visible
  expect(ehmp).to have_modal_body
end

Then(/^user waits for Action tray to be updated with My Tasks$/) do
  ehmp = PobCommonElements.new  
  time_to_wait = 60 # same as our default time for applets/tables to load
  expect(ehmp.action_tray.wait_for_fld_my_task_header(time_to_wait)).to eq(true)
  expect(ehmp.action_tray.wait_for_fld_my_tasks_list(time_to_wait)).to eq(true)
  wait_until { ehmp.action_tray.fld_my_tasks_list.length > 0 }
end


