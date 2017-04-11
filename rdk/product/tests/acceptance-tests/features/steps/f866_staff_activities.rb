When(/^the user "([^"]*)" requests open activities for the staff context$/) do |user, table|
  request_activities_instances_available user, table
  expect(@response.code).to eq(200), "Received #{@response.code}, #{@response.body}"
end

Then(/^the activities instances list contains$/) do |extra_parameters|
  expect(@processinstanceid).to_not be_nil
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  
  table = []

  table.push(['PROCESSID', @processinstanceid.to_s])
  unless extra_parameters.nil?
    extra_parameters.rows.each do | parameter, value |
      table.push([parameter, value])
    end
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry
    # p result_array
    expect(result_array.length).to be >= 1, "Cannot find expected value for #{fieldpath}"    
  end
  expect(result_array.length).to eq(1)

  expect(result_array[0]['INSTANCENAME']).to_not be_nil
  expect(result_array[0]['CREATEDONFORMATTED']).to_not be_nil
  
  expect(result_array[0]['DEPLOYMENTID']).to_not be_nil
  expect(result_array[0]['ISACTIVITYHEALTHY']).to_not be_nil
  # expect(result_array[0]['ACTIVITYHEALTHDESCRIPTION']).to_not be_nil
  expect(result_array[0]['PATIENTSSNLASTFOUR']).to_not be_nil
  expect(result_array[0]['ISSENSITIVEPATIENT']).to_not be_nil
end
