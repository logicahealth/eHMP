Given(/^the user has selected View Details button from the footer$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails
  expect(@ehmp).to have_btn_viewdetails
  @ehmp.btn_viewdetails.click
end

Then(/^EHMP Data Source model is displayed with following header$/) do |table|
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails_mysite
  @ehmp.wait_for_btn_viewdetails_allva
  @ehmp.wait_for_btn_viewdetails_dod
  @ehmp.wait_for_btn_viewdetails_communities
  @ehmp.wait_for_btn_viewdetails_communities
  expect(@ehmp).to have_btn_viewdetails_mysite
  expect(@ehmp).to have_btn_viewdetails_allva
  expect(@ehmp).to have_btn_viewdetails_dod
  expect(@ehmp).to have_btn_viewdetails_communities
  expect(@ehmp).to have_btn_viewdetails_close
  @ehmp.wait_for_hdr_heading_source
  max_attempt = 4
  begin
    table.rows.each do |headers|
      expect(object_exists_in_list(@ehmp.hdr_ehmpdata_source, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found "
    end  
  rescue => e
    p e
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0  
 
  end  

end

Then(/^user Selects mysite from EHMP Data Source model$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails_mysite
  expect(@ehmp).to have_btn_viewdetails_mysite
  @ehmp.btn_viewdetails_mysite.click
  @ehmp.wait_until_hdr_heading_source_visible
  expect(@ehmp.hdr_heading_source.text.upcase).to have_text("My Site".upcase)
end

Then(/^the my site table contain headers$/) do |table|
  @ehmp = PobViewDetails.new
  @ehmp.wait_until_hdr_viewdetail_table_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.hdr_viewdetail_table, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found"
  end

end  

Then(/^user Selects All VA  from EHMP Data Source model$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails_allva
  expect(@ehmp).to have_btn_viewdetails_allva
  @ehmp.btn_viewdetails_allva.click
  @ehmp.wait_until_hdr_heading_source_visible  
  expect(@ehmp.hdr_heading_source.text.upcase).to have_text("All VA".upcase)
end

Then(/^the All VA table contain headers$/) do |table|
  @ehmp = PobViewDetails.new
  @ehmp.wait_until_hdr_viewdetail_table_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.hdr_viewdetail_table, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found"
  end

end

Then(/^user Selects DOD from EHMP Data Source model$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails_dod
  expect(@ehmp).to have_btn_viewdetails_dod
  @ehmp.btn_viewdetails_dod.click
  @ehmp.wait_until_hdr_heading_source_visible 
  expect(@ehmp.hdr_heading_source.text.upcase).to have_text("DoD".upcase)
end

Then(/^the DOD table contain headers$/) do |table|
  @ehmp = PobViewDetails.new
  @ehmp.wait_until_hdr_viewdetail_table_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.hdr_viewdetail_table, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found"
  end

end

Then(/^user Selects Communities from EHMP Data Source model$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_for_btn_viewdetails_communities
  expect(@ehmp).to have_btn_viewdetails_communities
  @ehmp.btn_viewdetails_communities.click
  @ehmp.wait_until_hdr_heading_source_visible 
  expect(@ehmp.hdr_heading_source.text.upcase).to have_text("Communities".upcase)
end

Then(/^the Communities table contain headers$/) do |table|
  @ehmp = PobViewDetails.new
  @ehmp.wait_until_hdr_viewdetail_table_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.hdr_viewdetail_table, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found"
  end

end

Then(/^user selects close button to close the modal$/) do
  @ehmp = PobViewDetails.new
  expect(@ehmp).to have_btn_viewdetails_close  
  @ehmp.btn_viewdetails_close.click 
  @ehmp.wait_for_btn_viewdetails_close
  expect(@ehmp).to have_no_hdr_viewdetail
end

Then(/^user selects x button to close the modal$/) do
  @ehmp = PobViewDetails.new
  expect(@ehmp).to have_btn_viewdetails_X
  @ehmp.btn_viewdetails_X.click 
  @ehmp.wait_for_btn_viewdetails_X
  expect(@ehmp).to have_no_hdr_viewdetail
end

When(/^user makes sure there is data in results row$/) do
  @ehmp = PobViewDetails.new
  @ehmp.wait_until_tbl_viewdetail_table_row_visible
  expect(@ehmp.tbl_viewdetail_table_row.length > 0).to eq(true)
end


