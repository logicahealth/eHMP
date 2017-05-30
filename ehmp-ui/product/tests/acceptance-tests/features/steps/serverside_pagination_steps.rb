Given(/^the user notes number of rows displayed in the Documents Applet$/) do
  ehmp = PobDocumentsList.new
  wait_until { ehmp.applet_loaded? }
  expect(ehmp).to_not have_fld_empty_row, "This test requires data rows, applet is currently empty"
  @num_document_rows = ehmp.fld_document_rows.length
  expect(@num_document_rows).to be > 0, "This test requires more then 0 data rows"
  p "Number of rows loaded in the documents applet: #{@num_document_rows}"
end

When(/^the user scrolls the Documents Applet$/) do
  ehmp = PobDocumentsList.new

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  max_retry_attempt = 1
  begin
    ehmp.scroll
    # sometimes the applet header is scrolled out of view, this is causing the documents applet to be 
    # missing rows because the scroll doesn't work.  This appears to only be happening in phantomjs
    # so check for header and if its not there refresh the browser and try again
    expect(ehmp.wait_for_fld_documents_heading).to eq(true)
    expect(ehmp.wait_for_fld_applet_title).to eq(true)
  rescue Exception => e
    p "documents applet did not load: #{e}"
    max_retry_attempt -= 1
    TestSupport.driver.navigate.refresh
    wait.until { ehmp.applet_loaded? }
    retry if max_retry_attempt >= 0
    raise e if max_retry_attempt < 0
  end
end

Then(/^rows are added to the Documents Applet$/) do
  ehmp = PobDocumentsList.new
  expect(@num_document_rows).to_not be_nil, "Expected variable @num_document_rows to have been set by a previous step"
  max_attempt = 1
  begin
    expect(ehmp.fld_document_rows.length).to be > @num_document_rows
    p "Number of rows loaded in the documents applet: #{ehmp.fld_document_rows.length}"
  rescue Exception => e
    p "Exception - retry: #{e}"
    max_attempt -= 1
    retry unless max_attempt < 0
    raise e
  end
end
