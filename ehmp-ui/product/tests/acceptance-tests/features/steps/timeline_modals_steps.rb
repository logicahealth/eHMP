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
    rows = AccessHtmlElement.new(:css, '#data-grid-newsfeed tbody tr.selectable')
    add_verify(CucumberLabel.new('Timeline Rows'), VerifyXpathCount.new(rows), rows)
    # First Visit Row
    add_action(CucumberLabel.new('First Visit Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-visit-9E7A-164-677'] td:nth-child(2)"))
    # First Admission Row
    add_action(CucumberLabel.new('First Admission Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-visit-9E7A-164-H2303'] td:nth-child(2)"))
    # First Admission Row
    add_action(CucumberLabel.new('First Discharge Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-visit-9E7A-164-H918'] td:nth-child(2)"))
    # First Immunization Row
    add_action(CucumberLabel.new('First Immunization Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-immunization-9E7A-287-45'] td:nth-child(2)"))
    # First Surgery Row
    add_action(CucumberLabel.new('First Surgery Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-surgery-9E7A-65-28'] td:nth-child(2)"))
    # First Procedure Row
    add_action(CucumberLabel.new('First Procedure Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-procedure-9E7A-100599-8-MDD(702,'] td:nth-child(2)"))
    # First DoD Appointment Row
    add_action(CucumberLabel.new('First Appointment Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-appointment-DOD-0000000011-1000000717'] td:nth-child(2)"))
    # First DoD Encounter Row
    add_action(CucumberLabel.new('First Encounter Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-visit-DOD-0000000011-1000000721'] td:nth-child(2)"))
    # First Lab Row
    add_action(CucumberLabel.new('First Lab Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='newsfeed'] [data-row-instanceid='urn-va-lab-9E7A-17-CH-7018878-8366-2'] td:nth-child(2)"))
  end
end

class TimelineAppletImmunizationModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=name]"))
    add_verify(CucumberLabel.new("Reaction"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=series]"))
    add_verify(CucumberLabel.new("Series"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=result]"))
    add_verify(CucumberLabel.new("Repeat Contraindicated"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=contraDisplay]"))
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=administeredDate]"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=facilityCode]"))
    add_verify(CucumberLabel.new("Site"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=siteCode]"))
  end
end

class TimelineAppletSurgeryProcedureModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:id, "docDetailFacilityLabel"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:id, "docDetailTypeLabel"))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:id, "docDetailStatusLabel"))
    add_verify(CucumberLabel.new("Date/Time"), VerifyText.new, AccessHtmlElement.new(:id, "docDetailDateTimeLabel"))
    add_verify(CucumberLabel.new("Providers"), VerifyText.new, AccessHtmlElement.new(:id, "docDetailProviderLabel"))
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
  first_event_row = "First " + event_type + " Row"
  expect(timeline_applet.perform_action(first_event_row)).to eq(true)
end

Then(/^the Timeline event "(.*?)" Detail modal displays$/) do |event_type, table|
  case event_type
  when 'Visit' , 'Admission' , 'Discharge' , 'Appointment' , 'Encounter'
    modal = TimelineAppletModalDetail.instance
  when 'Surgery' , 'Procedure'
    modal = TimelineAppletSurgeryProcedureModalDetail.instance
  when 'Immunization'
    modal = TimelineAppletImmunizationModalDetail.instance
  when 'Lab'
    modal = TimelineAppletLabModalDetail.instance
  end
  
  table.rows.each do | row |
    expect(modal.am_i_visible?(row[0])).to eq(true), "#{row[0]} was not visible"
  end
end
