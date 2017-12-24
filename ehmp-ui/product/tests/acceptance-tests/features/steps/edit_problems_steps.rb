When(/^the user views a local problem for Facility "([^"]*)"$/) do |facility|
  page = PobProblemsApplet.new
  expect(page.tbl_problems.length).to be > 0
  expect(page.fld_expanded_facilities.length).to be > 0
  facility_names = page.fld_expanded_facilities.map { |element| element.text.upcase }
  expect(facility_names).to include facility.upcase
  page.rows_for_facility facility
  expect(page.fld_facility_rows.length).to be > 0
  @data_row_instanceid = page.fld_facility_rows[0]['data-row-instanceid']
  p @data_row_instanceid
  page.fld_facility_rows[0].click
end

Then(/^the problem detail displays an edit button$/) do
  page = PobProblemsApplet.new
  details = ModalElements.new
  details.wait_until_fld_modal_detail_labels_visible
  expect(details.fld_modal_detail_labels.length).to be > 0
  expect(page).to have_btn_edit_problem
end

When(/^the user selects the problem detail edit button$/) do
  page = PobProblemsApplet.new
  expect(page.wait_for_btn_edit_problem).to eq(true), "expected an edit buton"
  page.btn_edit_problem.click
end

Then(/^the Edit Problem displays$/) do
  page = EditProblem.new
  expect(page.wait_for_fld_tray_title).to eq(true), "Expected a tray title"
  expect(page.fld_tray_title.text.upcase).to eq('Edit Problem'.upcase)

  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { 
    begin
      # all_there? We have some elements that are patient dependent so can't use built in function
      page.all_common_there?
    rescue Selenium::WebDriver::Error::StaleElementReferenceError
      retry
    end
  }
  expect(page.all_common_there?).to eq(true)
end

Then(/^there is at least (\d+) problem for local facility "([^"]*)"$/) do |num, facility|
  page = PobProblemsApplet.new
  page.rows_for_facility facility
  unless page.fld_facility_rows.length >= num.to_i
    p 'no problems from this facility. add one'
    steps %{
      When user attempts to add a problem from problem applet header
      And user searches and selects a unique new problem
      And Add Problem modal is displayed
      And user selects a unique Responsible Provider
      And user accepts the new problem
      Then a problem is added to the applet
    }
  end
end

When(/^the user updates the problem acuity$/) do
  expect(@data_row_instanceid).to_not be_nil
  applet_page = PobProblemsApplet.new
  tray = EditProblem.new

  applet_page.expanded_row_elements @data_row_instanceid
  expect(applet_page).to have_td_acuity
  expect(tray).to have_rbn_acuity_unknown
  expect(tray).to have_rbn_acuity_chronic
  @current_acuity_text = applet_page.td_acuity.text.upcase
  @updated_acuity = nil
  if @current_acuity_text.eql? 'UNKNOWN'
    tray.rbn_acuity_chronic.click
    @updated_acuity = 'CHRONIC' 
  else
    tray.rbn_acuity_unknown.click 
    @updated_acuity = 'UNKNOWN'
  end
end

When(/^the user saves the edited problem$/) do
  tray = EditProblem.new
  expect(tray).to have_btn_save
  tray.btn_save.click
  tray.wait_until_btn_save_invisible

  applet_page = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_page.applet_loaded? }
end

Then(/^the edited problem displays the updated acuity$/) do
  expect(@data_row_instanceid).to_not be_nil
  applet_page = PobProblemsApplet.new
  tray = EditProblem.new

  applet_page.expanded_row_elements @data_row_instanceid
  applet_page.wait_for_td_acuity
  expect(applet_page).to have_td_acuity

  expect(@updated_acuity).to_not eq(@current_acuity_text)

  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { 
    begin
      applet_page.td_acuity.text.upcase.eql? @updated_acuity
    rescue Selenium::WebDriver::Error::StaleElementReferenceError
      retry
    end
  }

  expect(applet_page.td_acuity.text.upcase).to eq(@updated_acuity)
  p "#{@current_acuity_text} #{@updated_acuity}"
end
