class TimelineAppletModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=dateTime]"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=typeDisplayName]"))
    add_verify(CucumberLabel.new("Category"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=categoryName]"))
    add_verify(CucumberLabel.new("Patient Class"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=patientClassName]"))
    add_verify(CucumberLabel.new("Location"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=locationDisplayName]"))
    add_verify(CucumberLabel.new("Stop Code"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=stopCodeName]"))
    add_verify(CucumberLabel.new("Appointment Status"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=appointmentStatus]"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=facilityName]"))
    add_verify(CucumberLabel.new("Movements"), VerifyText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=movementSection]"))
    add_verify(CucumberLabel.new("Reason"), VerifyText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=reasonSection]"))
    add_verify(CucumberLabel.new("Providers"), VerifyText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=providerSection]"))
    add_verify(CucumberLabel.new('Discharge Diagnoses'), VerifyText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=diagnosisSection]"))
    # Newsfeed Rows
    rows = AccessHtmlElement.new(:css, '[data-appletid=newsfeed] [id^=data-grid-applet-] tbody tr.selectable')
    add_verify(CucumberLabel.new('Timeline Rows'), VerifyXpathCount.new(rows), rows)
  end
end

class TimelineAppletSurgeryProcedureModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Facility"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=facility] strong"))
    add_verify(CucumberLabel.new("Type"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=type] strong"))
    add_verify(CucumberLabel.new("Status"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=status] strong"))
    add_verify(CucumberLabel.new("Date/Time"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=date-time] strong"))
    add_verify(CucumberLabel.new("Providers"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail-label=providers] strong"))
  end
end

class TimelineAppletLabModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(1)"))
    add_verify(CucumberLabel.new("Lab Test"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(2)"))
    add_verify(CucumberLabel.new("Flag"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(3)"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(4)"))
    add_verify(CucumberLabel.new("Unit"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(5)"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(6)"))
    add_verify(CucumberLabel.new("Ref Range"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive th:nth-child(7)"))
  end
end

When(/^the user views the first Timeline event "(.*?)" detail view$/) do |event_type|
  timeline_applet = TimelineAppletModalDetail.instance
  expect(timeline_applet.wait_until_xpath_count_greater_than('Timeline Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=newsfeed] [id^=data-grid-applet-] tbody") }

  timeline = PobTimeline.new
  timeline.all_types event_type
  expect(timeline.type_rows.length).to be > 0
  timeline.type_rows[0].click
end

When(/^the user views the the details of the first row with an Activity of "([^"]*)" and Type "([^"]*)"$/) do |activity, type|
  timeline_applet = TimelineAppletModalDetail.instance
  expect(timeline_applet.wait_until_xpath_count_greater_than('Timeline Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=newsfeed] [id^=data-grid-applet-] tbody") }
  
  timeline = PobTimeline.new
  timeline.all_activity_types activity, type
  expect(timeline.type_rows.length).to be > 0
  timeline.type_rows[0].click
end

When(/^the user views the first Timeline event Discharged Admission detail view$/) do
  timeline_applet = TimelineAppletModalDetail.instance
  expect(timeline_applet.wait_until_xpath_count_greater_than('Timeline Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=newsfeed] [id^=data-grid-applet-] tbody") }

  timeline = PobTimeline.new
  expect(timeline.discharged_admission_rows.length).to be > 0, "Expected at least 1 row of type Discharged Admission"
  timeline.discharged_admission_rows[0].click
end

Then(/^the Timeline event "(.*?)" Detail modal displays$/) do |event_type, table|
  case event_type
  when 'Visit' , 'Admission' , 'Discharge' , 'Appointment' , 'Encounter'
    modal = TimelineAppletModalDetail.instance
  when 'Procedure'
    modal = TimelineAppletSurgeryProcedureModalDetail.instance
  when 'Lab'
    modal = TimelineAppletLabModalDetail.instance
  end
  
  table.rows.each do | row |
    expect(modal.wait_until_action_element_visible("#{row[0]}", 30)).to eq(true), "#{row[0]} is not visible after waiting"
    expect(modal.am_i_visible?(row[0])).to eq(true), "#{row[0]} was not visible"
  end
end

Then(/^the Timeline event Immunization Detail modal displays$/) do |table|
  modal = ImmunizationDetail.new
  modal.wait_for_fld_modal_title

  table.rows.each do | row |
    modal.add_field_label_element(row[0])
    modal.wait_for_header_label
    expect(modal).to have_header_label, "Modal does not display header #{row[0]}"
    expect(modal.header_label.text).to start_with("#{row[0]}"), "Case Sensitivity Requirement.  '#{modal.header_label.text}' should start with '#{row[0]}'"
  end
end

When(/^the selects the detail view button from Quick Menu Icon of the first timeline row$/) do
  ehmp = PobTimeline.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Then(/^the Timeline event Surgery Detail modal displays$/) do |table|
  modal = SurgeryDetailModal.new
  modal.wait_for_fld_details_section
  expect(modal).to be_all_there
  all_header_text = modal.fld_headers.map { |element| element.text.upcase }
  table.rows.each do |element|
    expect(all_header_text).to include "#{element[0].upcase}:"
  end
end
