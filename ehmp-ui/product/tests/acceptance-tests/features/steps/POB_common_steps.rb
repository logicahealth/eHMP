Then(/^POB user clicks the actions tray$/) do
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
