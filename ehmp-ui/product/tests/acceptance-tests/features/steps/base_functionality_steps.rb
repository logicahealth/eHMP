def verify_applet_view_type(type, applet_id)
  driver = TestSupport.driver
  applets = driver.find_elements(:css, "[data-view-type=#{type}] [data-appletid=#{applet_id}]")

  expect(applets.size).to be_eql(1), "The number of found applets matching that id and type was #{applets.size}. type=#{type}, appletid=#{applet_id}"
end

Then(/^the Active Medications Summary applet is displayed$/) do
  active_medications = ActiveMedications.instance

  verify_applet_exists(active_medications.appletid)
  verify_applet_view_type('summary', active_medications.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { active_medications.applet_loaded? }
end

Then(/^the Allergies Trend applet is displayed$/) do
  verify_applet_exists(@ag.appletid)
  verify_applet_view_type('gist', @ag.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @ag.applet_loaded? }
end

Then(/^the Appt and Visits Summary applet is displayed$/) do
  appointments = AppointmentsCoverSheet.instance
  verify_applet_exists(appointments.appletid)
  verify_applet_view_type('summary', appointments.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { appointments.applet_loaded? }
end

Then(/^the Immunization Summary applet is displayed$/) do
  imm = ImmunizationsCoverSheet.instance
  verify_applet_exists(imm.appletid)
  verify_applet_view_type('summary', imm.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm.applet_loaded? }
end

Then(/^the Numeric Lab Results Summary applet is displayed$/) do
  # @numeric_lab_results
  verify_applet_exists(@numeric_lab_results.appletid)
  verify_applet_view_type('summary', @numeric_lab_results.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @numeric_lab_results.applet_loaded? }
end

Then(/^the Orders Summary applet is displayed$/) do
  verify_applet_exists(@oc.appletid)
  verify_applet_view_type('summary', @oc.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @oc.applet_loaded }
end

Then(/^the Problems Summary applet is displayed$/) do
  # @active_problems
  verify_applet_exists(@active_problems.appletid)
  verify_applet_view_type('summary', @active_problems.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @active_problems.applet_grid_loaded }
end

Then(/^the Vitals Summary applet is displayed$/) do
  vitals_applet = VitalsCoversheet.instance
  verify_applet_exists(vitals_applet.appletid)
  verify_applet_view_type('summary', vitals_applet.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { vitals_applet.applet_loaded }
end

Then(/^the Community Health Summaries applet Summary is displayed$/) do
  health_summaries = CommunityHealthSummariesCoverSheet.instance
  verify_applet_exists(health_summaries.appletid)
  verify_applet_view_type('summary', health_summaries.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { health_summaries.applet_loaded? }
end

def verify_no_error_messages
  driver = TestSupport.driver
  applets = driver.find_elements(:css, "i:not([class='sidebar']) .fa-exclamation-circle")
  expect(applets.size).to eq(0), "There should not be any error message, there is #{applets.size}"
end

Then(/^'An error has occured' is not displayed in any of the coversheet applets$/) do
  verify_no_error_messages
end

Then(/^'An error has occured' is not displayed in any of the overview applets$/) do
  verify_no_error_messages
end

Then(/^the Numeric Lab Results Trend applet is displayed$/) do
  numeric_lab_results_gist = LabResultsGist.instance
  verify_applet_exists(numeric_lab_results_gist.appletid)
  verify_applet_view_type('gist', numeric_lab_results_gist.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { numeric_lab_results_gist.applet_grid_loaded }
end

Then(/^the Vitals Trend applet is displayed$/) do
  vitals = VitalsGist.instance
  verify_applet_exists(vitals.appletid)
  verify_applet_view_type('gist', vitals.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { vitals.applet_loaded? }
end

Then(/^the Immunization Trend applet is displayed$/) do
  imm = ImmunizationGist.instance
  verify_applet_exists(imm.appletid)
  verify_applet_view_type('gist', imm.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm.applet_loaded? }
end

Then(/^the Active Medications Trend applet is displayed$/) do
  # @mg = MedicationGistContainer.instance
  verify_applet_exists(@mg.appletid)
  verify_applet_view_type('gist', @mg.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @mg.applet_loaded? }
end

Then(/^the Problems Trend applet is displayed$/) do
  verify_applet_exists(@cg.appletid)
  verify_applet_view_type('gist', @cg.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @cg.applet_loaded? }
end

Then(/^the Encounters Trend applet is displayed$/) do
  encounters = EncountersGist.instance
  verify_applet_exists(encounters.appletid)
  verify_applet_view_type('gist', encounters.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { encounters.applet_loaded? }
end

Then(/^the Documents Expanded applet is displayed$/) do
  docs = Documents.instance
  verify_applet_exists(docs.appletid)
  verify_applet_view_type('expanded', docs.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { docs.applet_grid_loaded }
end

Then(/^the Reports Summary applet is displayed$/) do
  reports = ReportsGistContainer.instance
  verify_applet_exists(reports.appletid)
  verify_applet_view_type('summary', reports.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { reports.applet_grid_loaded }
end

Then(/^the Clinical Reminders Summary applet is displayed$/) do
  clinical_reminders = ClinicalReminders.instance
  verify_applet_exists(clinical_reminders.appletid)
  verify_applet_view_type('summary', clinical_reminders.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { clinical_reminders.applet_loaded? }
end

Then(/^the Timeline Summary applet is displayed$/) do
  # newsfeed/timeline is special because there are 2 applets on the screen with data-appletid=newsfeed, so tests need a different way 
  # to check 
  timeline = NewsFeedApplet.instance

  # verify applet exists
  driver = TestSupport.driver
  applets = driver.find_elements(:css, "[data-instanceid='newsfeed']")
  expect(applets.size).to be_eql(1), "The number of found applets matching that id was #{applets.size}."

  # verify applet type
  applets = driver.find_elements(:css, "[data-view-type=summary] [data-instanceid='newsfeed']")
  expect(applets.size).to be_eql(1), "The number of found applets matching that id and type was #{applets.size}"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { timeline.applet_loaded? }
end

Then(/^the Med Review applet is displayed$/) do
  med_review = MedReviewApplet.instance
  verify_applet_exists(med_review.appletid)
  verify_applet_view_type('expanded', med_review.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { med_review.applet_loaded }
end

Then(/^the Immunizations Trend applet is displayed$/) do
  immunizations = ImmunizationGist.instance
  verify_applet_exists(immunizations.appletid)
  verify_applet_view_type('gist', immunizations.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { immunizations.applet_loaded? }
end

Then(/^the Stacked Graph Expanded applet is displayed$/) do
  stacked_graph = StackedGraph.instance
  verify_applet_exists(stacked_graph.appletid)
  verify_applet_view_type('expanded', stacked_graph.appletid)
end
