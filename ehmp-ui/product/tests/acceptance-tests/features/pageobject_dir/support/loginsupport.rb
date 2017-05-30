Given(/^POB user is logged into EHMP\-UI with facility as  "(.*?)" accesscode as  "(.*?)" verifycode as  "(.*?)"/) \
do |facility, user, pwd|
  @ehmp = PobLoginPage.new
  @ehmp.load unless @ehmp.has_ddl_facility?
  @ehmp.wait_for_ddl_facility(120)
  expect(@ehmp).to have_ddl_facility
  choose_facility(facility)
  @ehmp.login_with(user, pwd)
end

def wait_for_login_complete
  @ehmp = PobPatientSearch.new
  max_attempt = 2
  begin
    @ehmp.wait_for_fld_nav_bar(30)
    expect(@ehmp).to have_fld_nav_bar
    p "User Successfully has Logged in!"
    DefaultLogin.logged_in = true
  rescue => e
    p "Still in login step: #{e}"
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  wait_for_staff_view_loaded_ignore_errors
end

Then(/^POB log me out$/) do
  begin
    @ehmp = PobStaffView.new
    @ehmp.load
    log_out_steps
    p 'POB Logging out ---'
  rescue
    page.execute_script('sessionStorage.clear()')
    Capybara.reset_session!
    p "Couldn't log out. So resetting Capybara Browser Session!"
    DefaultLogin.logged_in = false
  end
end

Given(/^Navigate to Staff View screen ignore errors$/) do
  ehmp = PobStaffView.new
  ehmp.load
  wait_for_staff_view_loaded_ignore_errors
end

def log_out_steps
  @ehmp = PobStaffView.new
  @ehmp.global_header.wait_for_btn_logout
  expect(@ehmp.global_header).to have_btn_logout
  @ehmp.global_header.btn_logout.click
  @ehmp = ModalElements.new
  @ehmp.wait_for_btn_yes
  expect(@ehmp).to have_btn_yes
  @ehmp.btn_yes.click
  @ehmp = PobLoginPage.new
  @ehmp.wait_for_ddl_facility
  expect(@ehmp).to have_ddl_facility
  DefaultLogin.logged_in = false 
rescue Exception => e
  p "error logging out: #{e}"
  raise e
end

Then(/^user logs out$/) do
  log_out_steps
  p 'user logs out ---'
end

Given(/^user attempts logout$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.global_header.wait_for_btn_logout
  expect(@ehmp.global_header).to have_btn_logout
  @ehmp.global_header.btn_logout.click
end

Then(/^user presented with modal dialog$/) do
  @ehmp = ModalElements.new
  @ehmp.wait_for_fld_alert_modal_title
  expect(@ehmp.fld_alert_modal_title.text.upcase).to have_text("Sign Out Confirmation".upcase)
  @ehmp.wait_for_fld_modal_body
  expect(@ehmp.fld_modal_body.text.upcase).to have_text("Are you sure you want to sign out?".upcase)
end

Given(/^user decides to cancel logout$/) do
  @ehmp = ModalElements.new
  @ehmp.wait_for_btn_no
  expect(@ehmp).to have_btn_no
  @ehmp.btn_no.click
  @ehmp.wait_until_btn_no_invisible
end

Then(/^logout is cancelled$/) do
  @ehmp = ModalElements.new
  expect(@ehmp).to have_no_btn_no
end

Given(/^browser size is "([^"]*)" by "([^"]*)"$/) do |arg1, arg2|
  Capybara.page.driver.browser.manage.window.resize_to(1280, 800)
end

