class DocumentsAppletModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Modal Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper h4:first-child"))
    add_verify(CucumberLabel.new("Modal"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper"))
    #add_verify(CucumberLabel.new("Modal"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".documentDetail"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=facility]"))
    add_verify(CucumberLabel.new("Author"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=author]"))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=status]"))
    add_verify(CucumberLabel.new("Attending"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=attending]"))
    add_verify(CucumberLabel.new("Date/Time"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=date-time]"))
    add_verify(CucumberLabel.new("Expected Cosigner"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=cosigner]"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=type]"))
    add_verify(CucumberLabel.new("Providers"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=providers]"))
    # Documents Rows
    rows = AccessHtmlElement.new(:css, '#data-grid-documents tbody tr.selectable')
    add_verify(CucumberLabel.new('Documents Rows'), VerifyXpathCount.new(rows), rows)
    add_action(CucumberLabel.new('First Discharge Summary Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-100012-3947'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Progress Note Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-100012-2989'] td:nth-child(2)"))
    #  add_action(CucumberLabel.new('First Procedure Row'), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-instanceid='documents']/descendant::*[@id='urn-va-procedure-ABCD-10199V865898-50-MCAR(699,']/td[2]"))
    add_action(CucumberLabel.new('First Procedure Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-procedure-2939-110-50-MCAR(699,'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Surgery Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-surgery-9E7A-100012-10106'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Consult Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-consult-9E7A-100012-563'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Advance Directive Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-100012-3944'] td:nth-child(2)"))
    #  add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] #urn-va-image-ABCD-10199V865898-7029773-8699-1 td:nth-child(2)"))
    add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-image-2939-110-7029773-8699-1'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Crisis Note Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-231-1693'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Lab Report Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-17-MI-7029773-859869'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Administrative Note Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-DOD-0000000014-1000004201'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Progress Note DoD* Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-DOD-0000000011-1000003813'] td:nth-child(2)"))
  end
end

When(/^the user views the first Documents event "(.*?)" detail view$/) do |event_type|
  documents_applet = DocumentsAppletModalDetail.instance
  expect(documents_applet.wait_until_xpath_count_greater_than('Documents Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  first_event_row = "First " + event_type + " Row"
  expect(documents_applet.perform_action(first_event_row)).to eq(true)
end

Then(/^the Documents event "(.*?)" Detail modal displays$/) do |event_type, table|
#  case event_type
#  when 'Visit' , 'Admission' , 'Discharge' , 'Appointment' , 'Encounter'
#    modal = TimelineAppletModalDetail.instance
#  when 'Surgery' , 'Procedure'
#    modal = TimelineAppletSurgeryProcedureModalDetail.instance
#  when 'Immunization'
#    modal = TimelineAppletImmunizationModalDetail.instance
#  when 'Lab'
#    modal = TimelineAppletLabModalDetail.instance
#  end
  modal = DocumentsAppletModalDetail.instance
  table.rows.each do | row |
    expect(modal.am_i_visible?(row[0])).to eq(true)
  end
end

Then(/^the modal title says "(.*?)"$/) do |modal_title|
  aa = DocumentsAppletModalDetail.instance
  expect(aa.wait_until_action_element_visible("Modal Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Modal Title", modal_title)).to be_true
end

Then(/^the inframe modal details is displayed$/) do
  aa = DocumentsAppletModalDetail.instance
  expect(aa.wait_until_action_element_visible("Modal", DefaultLogin.wait_time)).to be_true
end
