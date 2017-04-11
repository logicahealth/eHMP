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
    #  add_action(CucumberLabel.new('First Procedure Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-procedure-2939-110-50-MCAR(699,'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Procedure Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-procedure-ABCD-10199V865898-50-MCAR(699,'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Surgery Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-surgery-9E7A-100012-10106'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Consult Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-consult-9E7A-100012-563'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Advance Directive Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-100012-3944'] td:nth-child(2)"))
    #  add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] #urn-va-image-ABCD-10199V865898-7029773-8699-1 td:nth-child(2)"))
    #  add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-image-2939-110-7029773-8699-1'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-image-ABCD-10199V865898-7029773-8699-1'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Crisis Note Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-231-1693'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Lab Report Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-9E7A-17-MI-7029773-859869'] td:nth-child(2)"))
    add_action(CucumberLabel.new('First Administrative Note Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-documents [data-row-instanceid='urn-va-document-DOD-0000000014-1000004201'] td.handlebars-cell.flex-width-2.sortable"))
    add_action(CucumberLabel.new('First Progress Note DoD* Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='documents'] [data-row-instanceid='urn-va-document-DOD-0000000011-1000003813'] td:nth-child(2)"))
    
    add_verify(CucumberLabel.new('Documents Rows'), VerifyXpathCount.new(rows), rows)
    add_action(CucumberLabel.new('First Imaging Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-documents [data-row-instanceid='urn-va-image-ABCD-10199V865898-7029773-8699-1'] > td.sortable.renderable > i"))
    add_action(CucumberLabel.new('First Thumbnail'), ClickAction.new, AccessHtmlElement.new(:css, "[id='urn:va:image:9E7A:3:6849870.8462-10'] img")) 
  end
end

Given(/^there is at least one document of type "([^"]*)"$/) do |document_type|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.document_types).to include(document_type)
end

When(/^the user views the first Documents event "(.*?)" detail view$/) do |event_type|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.fld_document_rows_type.length).to be > 0
  expect(object_exists_in_list(@ehmp.fld_document_rows_type, event_type)).to eq(true), "#{event_type} was not found in the rows"
  click_an_object_from_list(@ehmp.fld_document_rows_type, event_type)
end

Then(/^the Documents event "(.*?)" Detail modal displays$/) do |event_type, table|
  @ehmp = DocumentDetail.new
  @ehmp.wait_for_fld_documents_row_headers
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_documents_row_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} is not visible on the modal"
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
