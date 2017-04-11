Then(/^the left side bar does not contain the patient name "([^"]*)"$/) do |name|
  ehmp = PobDemographicsElements.new
  expect(ehmp.wait_for_fld_patient_info_block).to eq(true)
  expect(ehmp.fld_patient_info_block.text.upcase).to_not include(name.upcase)
end

Then(/^the Type of care info moved to bottom of patient info$/) do
  ehmp = PobDemographicsElements.new
  last_label = ''
  last_data = ''
  type_of_case_options = %w{OUTPATIENT INPATIENT}
  max_attempt = 2
  begin
    expect(ehmp.wait_for_fld_patient_info_block).to eq(true)
    expect(ehmp.fld_patient_info_options.length).to be >=2

    last_label = ehmp.fld_patient_info_options.last(2)[0].text.upcase
    last_data = ehmp.fld_patient_info_options.last(2)[1].text.upcase
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  expect(last_label).to eq('TYPE OF CARE:')
  expect(type_of_case_options).to include last_data
end

Then(/^the Global Header displays the user name "([^"]*)"$/) do |name|
  ehmp = PobCoverSheet.new
  expect(ehmp.global_header.wait_for_fld_patient_name).to eq(true)
  # remove spaces so they don't have to be exact and take case out of the equation
  expect(ehmp.global_header.fld_patient_name.text.gsub(' ', '').upcase).to eq(name.gsub(' ', '').upcase)
end
