When(/^the client requests patient meta data \(basic military history\) for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('patient-meta-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client updates patient meta data \( basic military history\) for patient "([^"]*)"$/) do |pid, table|
  request = RDKQuery.new('patient-meta-edit')
  request.add_parameter('pid', pid)
  path = request.path

  row = {}
  table.rows.each do |key, value|
    row[key]= value
  end
  @metadata_description = "test #{Time.now}"
  row['description'] = @metadata_description
  content = [row]
  @response = HTTPartyRDK.put(path, content.to_json, { "Content-Type" => "application/json" })
end

Then(/^the successful response contains updated response$/) do |extra_parameters|
  expect(@response.code).to eq(200)
  expect(@metadata_description).to_not be_nil, "Expected variable @metadata_description to be set by previous step"
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  table = []

  table.push(['val.description', @metadata_description])
  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry    
  end
  expect(result_array.length).to eq(1), "Expected a single extry that matches table elements #{table}"
  p result_array
end
