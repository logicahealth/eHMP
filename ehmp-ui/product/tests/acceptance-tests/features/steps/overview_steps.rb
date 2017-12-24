path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'clinical_reminders.rb'

class Overview < GlobalDateFilter
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_action(CucumberLabel.new("Overview"), ClickAction.new, AccessHtmlElement.new(:link_text, "Overview"))
    add_verify(CucumberLabel.new("Overview Screen"), VerifyText.new, AccessHtmlElement.new(:css, "#screenName"))

    @@applet_count = AccessHtmlElement.new(:xpath, "//*[@data-appletid]")
    add_verify(CucumberLabel.new("Number of Applets"), VerifyXpathCount.new(@@applet_count), @@applet_count)
    
  end

  def overview_applets_loaded?(print_checks = false)
      # | CLINICAL REMINDERS          |
      # | ENCOUNTERS                  |
      # | REPORTS                     |
      # | CONDITIONS                  |
      # | ALLERGIES                   |
      # | VITALS                      |
      # | IMMUNIZATIONS               |
      # | NUMERIC LAB RESULTS         |
      # | Active & Recent MEDICATIONS |
    clinical_reminders_applet = ClinicalReminders.instance
    encounters_gist_applet = EncountersGist.instance 
    reports_gist_applet = PobReportsApplet.new
    conditions_applet = ConditionsGist.instance
    allergy_gist_applet = PobAllergiesApplet.new
    vitals_applet = VitalsGist.instance
    immunizations_applet = ImmunizationGist.instance
    numeric_results_applet = LabResultsGist.instance
    active_meds_applet = PobActiveRecentMedApplet.new
    return false unless print_applet_loading_outcome("Clinical Reminders", clinical_reminders_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Encounters", encounters_gist_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Reports", reports_gist_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Problems", conditions_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Allergy", allergy_gist_applet.applet_gist_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Vitals", vitals_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Immunizations", immunizations_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Numeric Lab Results", numeric_results_applet.applet_grid_loaded, print_checks)
    return false unless print_applet_loading_outcome("Active Meds", active_meds_applet.applet_gist_loaded?, print_checks)

    return true
  end

  def print_applet_loading_outcome(applet, result, print_checks)
    p "#{applet} loaded? #{result}" if print_checks
    result
  end
end # 

def verify_on_overview
  start_verification = Time.now
  browser_access = Overview.instance
  expect(browser_access.wait_until_element_present("Overview Screen", DefaultLogin.wait_time)).to be_true
  expect(browser_access.perform_verification("Overview Screen", "Overview")).to be_true
  # p "DE3055, DE3063: Default screenname is incorrect"

  max_attempt = 2
  begin
    expect(browser_access.wait_until_xpath_count("Number of Applets", 9, 60)).to be_true
  rescue => e
    TestSupport.driver.navigate.refresh
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  applets_screen = sprintf "%.2f", (Time.now - start_verification)
  timeout = 90
  wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
  begin
    wait.until { browser_access.overview_applets_loaded? }
  rescue
    expect(browser_access.overview_applets_loaded? true).to eq(true), "applets did not load after #{timeout} sec"
  end
  applets_loaded = sprintf "%.2f", (Time.now - start_verification)

  @ehmp = PobHeaderFooter.new
  @ehmp.wait_until_header_footer_elements_loaded
end

Then(/^Default Screen is active$/) do
  #Default screen is currently Summary
  verify_on_summaryview
end

Then(/^Overview is active$/) do
  browser_access = Overview.instance
  #sleep 2
  # at the time of this comment, overview was expected to be default screen
  # if for some reason default screen changes, don't break scenarios that don't care what default screen is
  # they only care that the next step needs  to be on overview
  navigate_in_ehmp '#/patient/overview'
  verify_on_overview
  @ehmp_for_reload = PobOverView.new
end

Then(/^Overview is active by default$/) do
  verify_on_overview
end
