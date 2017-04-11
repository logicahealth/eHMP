
def wait_for_facility_or_noresponse(login_page)
  return true if login_page.has_ddl_facility?
  return true if login_page.has_fld_rdk_no_response?
  return false
end

Given(/^user is logged into eHMP\-UI$/) do
  @ehmp = PobLoginPage.new

  @ehmp.load
  
  p 'waiting for facility dropdown'
  wait = Selenium::WebDriver::Wait.new(:timeout => 120)
  wait.until { wait_for_facility_or_noresponse @ehmp }

  error_message = @ehmp.check_rdk_response unless @ehmp.has_ddl_facility?
  expect(@ehmp).to have_ddl_facility, "Facility Dropdown is not visible #{error_message}"
  
  choose_facility(DefaultLogin.default_facility_name)
  @ehmp.login_with(DefaultLogin.accesscode, DefaultLogin.verifycode)

  wait_for_login_complete
end

When(/^default facility is dislayed as "(.*?)"$/) do |default_facility|
  @ehmp = PobLoginPage.new
  @ehmp.wait_until_ddl_selected_facility_visible
  expect(@ehmp.ddl_selected_facility.text.upcase).to have_text(default_facility.upcase), "Currently default facility is displayed as: #{@ehmp.ddl_selected_facility.text}"
end

When(/^user launches eHMP\-UI$/) do
  @ehmp = PobLoginPage.new
  @ehmp.load
  @ehmp.wait_for_ddl_facility(120)
  expect(@ehmp).to have_ddl_facility
end

When(/^user closes eHMP\-UI$/) do
  expire_cookies
  DefaultLogin.logged_in = false
end

Then(/^the facility field's label is "([^"]*)"$/) do |label_text|
  ehmp = PobLoginPage.new
  ehmp.wait_until_fld_facility_label_visible
  expect(@ehmp).to have_fld_facility_label
  expect(@ehmp.fld_facility_label.text).to eq(label_text)
end

When(/^user searches for a facility with term "([^"]*)"$/) do |facility_term|
  search_facility(facility_term)
end

Then(/^the facility list only diplays facilities including text "([^"]*)"$/) do |input_text|
  @ehmp = PobLoginPage.new
  @ehmp.wait_until_ddl_facility_result_list_visible
  expect(only_text_exists_in_list(@ehmp.ddl_facility_result_list, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^the facility "([^"]*)" is highlighted$/) do |input|
  ehmp = PobLoginPage.new
  ehmp.wait_until_ddl_facility_results_visible
  expect(ehmp.ddl_facility_result_list.length).to be > 0
  expect(ehmp.ddl_facility_result_list[0].text.upcase).to have_text(input.upcase)
  expect(ehmp.ddl_facility_result_list[0][:class]).to include 'select2-results__option--highlighted'
end

When(/^user selects the above facility$/) do 
  cmele = PobCommonElements.new
  cmele.wait_for_fld_pick_list_input
  cmele.fld_pick_list_input.native.send_keys(:enter)
end

Then(/^then search result displays message "([^"]*)"$/) do |message|
  @ehmp = PobLoginPage.new
  @ehmp.wait_until_ddl_facility_results_visible
  expect(@ehmp.ddl_facility_results.text).to eq(message)
end

def search_facility(facility_keyword)
  ehmp = PobLoginPage.new
  ehmp.wait_until_ddl_facility_visible
  expect(@ehmp).to have_ddl_facility
  ehmp.ddl_facility.click
  cmele = PobCommonElements.new
  cmele.wait_until_fld_pick_list_input_visible
  cmele.fld_pick_list_input.set facility_keyword
  ehmp.wait_until_ddl_facility_results_visible
end

def choose_facility(facility_name)
  ehmp = PobLoginPage.new
  ehmp.wait_until_ddl_facility_visible
  expect(@ehmp).to have_ddl_facility
  ehmp.ddl_facility.click
  cmele = PobCommonElements.new
  cmele.wait_until_fld_pick_list_input_visible
  cmele.fld_pick_list_input.set facility_name
  ehmp.wait_until_ddl_facility_results_visible
  response = false
  if !ehmp.ddl_facility_results.text.upcase.include? "No results found".upcase
    cmele.fld_pick_list_input.native.send_keys(:enter)
    response = true
    #take_screenshot("facility_selected_screenshot")
  else
    response = false
  end
  expect(response).to eq(true), "Facility entered is not in the list of options"
end

def wait_for_staff_view_loaded_ignore_errors
  wait_for_staff_view_loaded true
end

def wait_for_staff_view_loaded(allow_errors = DefaultLogin.local_testrun)
  @ehmp = PobStaffView.new
  tasks = PobTasksApplet.new
  # activities = PobActivitesApplet.new
  consults = PobConsultApplet.new
  requests = PobRequestApplet.new

  wait = Selenium::WebDriver::Wait.new(:timeout => 90)

  max_attempt = 2
  begin
    expect(@ehmp.wait_for_all_applets_to_load(10)).to eq(true)
  rescue => e
    p "Exception waiting for staff view to load: #{e}"

    max_attempt -= 1
    raise e if max_attempt <= 0
    @ehmp.load
    retry if max_attempt > 0    
  end
  p "loading tasks"
  wait.until { tasks.applet_loaded? allow_errors }
  # p "loading activities"
  # wait.until { activities.applet_loaded? allow_errors }
  p "loading consults"
  wait.until { consults.applet_loaded? allow_errors }
  p "loading requests"
  wait.until { requests.applet_loaded? allow_errors }
  p "on right tab?"
  @ehmp.wait_until_fld_active_staff_view_visible
  expect(@ehmp).to have_fld_active_staff_view
end
