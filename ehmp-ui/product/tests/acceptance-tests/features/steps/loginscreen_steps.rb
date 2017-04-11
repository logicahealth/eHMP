path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

# Then(/^the main page displays$/) do
#   con= PatientDetailsHTMLElements.instance
#   TestSupport.wait_for_page_loaded
#   con.add_verify(CucumberLabel.new("Panel Title"), VerifyContainsText.new, AccessHtmlElement.new(:class, "navbar"))
#   #sleep 10
#   expect(con.static_dom_element_exists?("Panel Title")).to eq(true)
#   TestSupport.successfully_loggedin=true
# end

Then(/^the patient search screen is displayed$/) do
  elements = PatientSearch.instance
  patient_search = PatientSearch2.instance

  need_refresh_de2106(elements)
  
  expect(elements.wait_until_element_present("mySite")).to be_true
  expect(elements.wait_until_element_present("global")).to be_true

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { !patient_search.am_i_visible?("Active MyCPRSList") }
end

Then(/^the user attempts signout$/) do
  login_html_elements = LoginHTMLElements.instance
  TestSupport.successfully_loggedin=true
  wait_until_present_and_perform_action(login_html_elements, 'currentuser')
  wait_until_present_and_perform_action(login_html_elements, 'Signout')
  expect(login_html_elements.wait_until_element_present("SignIn")).to be_true
  TestSupport.successful_logout=true
end

Then(/^the page displays "(.*?)"$/) do |errorMessage|
  con= LoginHTMLElements.instance
  
  expect(con.perform_verification("Login Error Message", errorMessage, 60)).to eq(true)
end

def wait_until_dom_has_signin_or_signout
  login_html_elements= LoginHTMLElements.instance
  wait_until = DefaultLogin.wait_time * 2
  has_refreshed = false
  completed = false
  counter = 0
  loop do
    counter += 1
    if counter > DefaultLogin.wait_time && !has_refreshed
      TestSupport.driver.navigate.refresh
      has_refreshed = true
      p "attempted refresh of page"
    end
    if login_html_elements.static_dom_element_exists?("Signout")
      p "Signout button found"
      completed = true
      break
    end
    if login_html_elements.am_i_visible?("SignIn")
      p "Signin button found"
      completed = true
      break
    end
    sleep 1
    break if counter > wait_until
  end #loop
  return completed
end

def select_default_facility
  login_elements = LoginHTMLElements.instance
  successful = false
  max_attempts = 2
  attempts = 1
  loop do
    if login_elements.static_dom_element_exists?("Facility")
      successful = login_elements.perform_action("Facility", DefaultLogin.default_facility_name)
    end
    break if successful || attempts >= max_attempts
    p "Issue with facility list - performing refresh of page"
    TestSupport.driver.navigate.refresh
    wait_until_dom_has_signin_or_signout
    attempts += 1
  end
  return successful
end

Given(/^user views the login screen$/) do
  navigate_to_logon_screen
end

Given(/^user Login to ehmpui_url$/) do
  con= LoginHTMLElements.instance
  TestSupport.navigate_to_url(DefaultLogin.ehmpui_url+'/#logon-screen')
  TestSupport.driver.manage.window.maximize
  expect(wait_until_dom_has_signin_or_signout).to be_true
  if con.static_dom_element_exists?("Signout")
    con.perform_action('currentuser')
    #sleep(10)
    con.perform_action('Signout')
  end
end

When(/^user logs in with credentials$/) do |table|
  login_elements = LoginHTMLElements.instance
  table.rows.each do |field, value|
    begin
      expect(login_elements.wait_until_element_present(field)).to be_true 
      # con.wait_until_element_present(field, 60)
      expect(login_elements.perform_action(field, value)).to be_true
    rescue Exception => e
      p "exception while waiting for #{field}: #{e}"
      raise e
      # p TestSupport.driver.page_source
    end
  end
  expect(login_elements.wait_until_element_present('Signout', 60)).to eq(true), 'Signout button was not displayed.  Still on login page?'
  TestSupport.driver.execute_script("$.fx.off = true;")
end

Given(/^user attempts login$/) do |table|
  con = LoginHTMLElements.instance
  table.rows.each do |field, value|
    begin
      expect(con.wait_until_element_present(field)).to be_true 
      # con.wait_until_element_present(field, 60)
      expect(con.perform_action(field, value)).to be_true
    rescue Exception => e
      p "exception while waiting for #{field}: #{e}"
      raise e
      # p TestSupport.driver.page_source
    end
  end
end

Then(/^the user is logged in$/) do
  login_html_elements= LoginHTMLElements.instance
  expect(con.perform_action('currentuser')).to be_true
  con.wait_until_element_present("Signout", 60)
  # expect(elements.wait_until_element_present("Signout")).to be_true 
  TestSupport.successfully_loggedin = true
end

Given(/^user attempt to go directly to the applet without login$/) do
  base_url= DefaultLogin.ehmpui_url
  path = "#{base_url}/#allergy-list"
  TestSupport.navigate_to_url(path)
  TestSupport.wait_for_page_loaded
  TestSupport.driver.manage.window.maximize
end

Given(/^user attempt to go directly to applet with incorrect subpage$/) do
  con= LoginHTMLElements.instance
  base_url= DefaultLogin.ehmpui_url
  TestSupport.wait_for_page_loaded
  path = "#{base_url}/#aaaaaccc"
  TestSupport.navigate_to_url(path)
  TestSupport.wait_for_page_loaded
  TestSupport.driver.manage.window.maximize
  #sleep 10
end

Then(/^user is redirected to SignIn page$/) do
  con= LoginHTMLElements.instance
  # TestSupport.wait_for_page_loaded
  expect(con.wait_until_element_present("SignIn")).to be_true 
  expect(con.static_dom_element_exists?("SignIn")).to eq(true)
end

