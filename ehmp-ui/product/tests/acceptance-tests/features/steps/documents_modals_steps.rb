class DocumentsAppletModalDetail < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Modal Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper h4:first-child"))
    add_verify(CucumberLabel.new("Modal"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper"))
  end
end

Given(/^there is at least one document of type "([^"]*)"$/) do |document_type|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.document_types).to include(document_type)
end

Given(/^there is at least one document from facility "([^"]*)"$/) do |document_facility|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_facility
  expect(@ehmp.document_facilities).to include(document_facility)
end

def index_of_first_instance(objects, text)
  objects.each_with_index do |item, index|
    if item.text.upcase.include? text.upcase
      return index
    end
  end
  -1
end

When(/^the user views the first Documents event "(.*?)" detail view$/) do |event_type|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.fld_document_rows_type.length).to be > 0
  expect(object_exists_in_list(@ehmp.fld_document_rows_type, event_type)).to eq(true), "#{event_type} was not found in the rows"
  index = index_of_first_instance(@ehmp.fld_document_rows_type, event_type)
  p "report issue #{@ehmp.fld_document_rows_type.length} != #{@ehmp.fld_document_rows_description.length}" if @ehmp.fld_document_rows_type.length != @ehmp.fld_document_rows_description.length
  expect(index).to be >= 0, "the index of a document of type #{event_type} was not found"
  expect(index).to be < @ehmp.fld_document_rows_description.length
  @expected_modal_title = @ehmp.fld_document_rows_description[index].text
  @ehmp.fld_document_rows_type[index].click
end

When(/^the user views the first Document detail view from facility "([^"]*)"$/) do |event_type|
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_facility
  expect(@ehmp.fld_document_rows_facility.length).to be > 0
  expect(object_exists_in_list(@ehmp.fld_document_rows_facility, event_type)).to eq(true), "#{event_type} was not found in the rows"
  index = index_of_first_instance(@ehmp.fld_document_rows_facility, event_type)
  p "report issue #{@ehmp.fld_document_rows_facility.length} != #{@ehmp.fld_document_rows_description.length}" if @ehmp.fld_document_rows_facility.length != @ehmp.fld_document_rows_description.length
  expect(index).to be >= 0, "the index of a document of type #{event_type} was not found"
  expect(index).to be < @ehmp.fld_document_rows_description.length
  @expected_modal_title = @ehmp.fld_document_rows_description[index].text
  @ehmp.fld_document_rows_facility[index].click
end

Then(/^the Documents event "(.*?)" Detail modal displays$/) do |event_type, table|
  @ehmp = DocumentDetail.new
  @ehmp.wait_for_fld_documents_row_headers
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_documents_row_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} is not visible on the modal"
  end
end

Then(/^a modal with the expected Document title is displayed$/) do
  expect(@expected_modal_title).to_not be_nil, 'Expected varaible @expected_modal_title to be set in a previous step'
  temp_title = @expected_modal_title.upcase
  @expected_modal_title = nil # set to nil so variable isn't accidently used in another scenario

  document_modal = DocumentDetail.new
  document_modal.wait_for_fld_modal_title
  document_modal.wait_for_fld_documents_row_headers
  exact_match = document_modal.fld_modal_title.text.upcase.eql?(temp_title)
  starts_with_match = document_modal.fld_modal_title.text.upcase.start_with? temp_title
  expect(exact_match || starts_with_match).to eq(true), "Modal title #{document_modal.fld_modal_title.text.upcase} does not equal or start with expected #{temp_title}"
end

Then(/^the Documents Detail modal displays$/) do |table|
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

Given(/^the user notes the first (\d+) documents$/) do |num_documents|
  @ehmp = PobDocumentsList.new
  @titles = @ehmp.fld_document_rows_description
  expect(@titles.length).to be > num_documents.to_i
  @titles = @titles[0..num_documents.to_i - 1]
end

Given(/^clicks the first result in the Documents Applet$/) do
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.fld_document_rows_type.length).to be > 0
  @ehmp.fld_document_rows_type[0].click
  wait_for_document_modal_to_load
end

Then(/^the user can step through the documents using the next button$/) do
  @ehmp = DocumentDetail.new
  @titles.each do |modal_title|
    begin
      wait_until { @ehmp.fld_modal_title.text.upcase.start_with? modal_title.text.upcase }
    rescue Exception => e
      p e
      expect(@ehmp.fld_modal_title.text.upcase).to start_with(modal_title.text.upcase)
    end
    expect(@ehmp).to have_btn_next
    @ehmp.btn_next.click
    expect(@ehmp.wait_for_btn_previous).to eq(true)
  end
end

Then(/^the user can step through the documents using the previous button$/) do
  @ehmp = DocumentDetail.new
  expect(@ehmp).to have_btn_previous
  expect(@ehmp).to_not have_btn_previous_disabled
  @ehmp.btn_previous.click
  @titles.reverse.each { |modal_title| 
    begin
      wait_until { @ehmp.fld_modal_title.text.upcase.start_with? modal_title.text.upcase }
    rescue Exception => e
      p e
      expect(@ehmp.fld_modal_title.text.upcase).to start_with(modal_title.text.upcase)
    end
    expect(@ehmp).to have_btn_previous
    @ehmp.btn_previous.click
    @ehmp.wait_for_btn_previous
  }
end

Then(/^the previous button is disabled$/) do
  document_modal = DocumentDetail.new
  expect(document_modal.wait_for_btn_previous_disabled).to eq(true), "Disabled Previous button not displayed"
end

def wait_for_document_modal_to_load
  @ehmp = DocumentDetail.new
  expect(@ehmp.wait_for_fld_documents_row_headers).to eq(true)
  expect(@ehmp.wait_for_fld_modal_title).to eq(true)
  expect(@ehmp).to have_fld_modal_title
  expect(@ehmp.wait_for_btn_next).to eq(true)
  expect(@ehmp.wait_for_btn_previous).to eq(true)
end

Given(/^clicks the last result in the Documents Applet$/) do
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_document_rows_type
  expect(@ehmp.fld_document_rows_type.length).to be > 0
  @ehmp.fld_document_rows_type.last.click

  wait_for_document_modal_to_load
end

Then(/^the next button is disabled$/) do
  document_modal = DocumentDetail.new
  expect(document_modal.wait_for_btn_next_disabled).to eq(true), "Disabled Next button not displayed"
end
