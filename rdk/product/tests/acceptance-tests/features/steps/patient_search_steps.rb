Then(/^the results contain wildcard variations on "([^"]*)"$/) do |expected_name|
  @json_object = JSON.parse(@response.body)

  result_array = @json_object["data"]["items"]
  expect(result_array.length).to be > 0, "No results returned, test needs at least 1 result to verify functionality"
  found_wildcard = false
  reg = /#{Regexp.quote(expected_name.upcase)}\w+/
  result_array.each do | result_hash |
    upcase_family_name = result_hash['familyName'].upcase
    found_wildcard = !(reg.match(result_hash['familyName'].upcase).nil?)
    break if found_wildcard
  end
  expect(found_wildcard).to eql(true), "Did not find a wild card variation in results"
end

Then(/^the results only contain exact last name match results for "([^"]*)"$/) do |expected_name|
  @json_object = JSON.parse(@response.body)

  result_array = @json_object["data"]["items"]
  found_wildcard = false
  result_array.each do | result_hash |
    expect(result_hash['familyName'].upcase).to eq(expected_name.upcase)
  end
end

When(/^the client "([^"]*)" requests CPRS list patient search results$/) do |client|
  query = RDKQuery.new('search-default-search')
  path = query.path
  @response = HTTPartyRDK.get_as_user(path, client, TestClients.password_for(client))
end

When(/^the client "([^"]*)" requests Recent Patient patient search results$/) do |client|
  query = RDKQuery.new('get-recent-patients')
  path = query.path
  @response = HTTPartyRDK.get_as_user(path, client, TestClients.password_for(client))
end

When(/^the client requests Clinics patient search results for a clinic without patients$/) do
  query = RDKQueryPicklist.new("write-pick-list-clinics-fetch-list")
  query.add_parameter('site', 'SITE')
  @response = HTTPartyRDK.get(query.path)
  expect(@response.code).to eq(200)
  @json_object = JSON.parse(@response.body)
  expect(@json_object['data'].length).to be > 0

  p 'searching for clinic without patients'
  @json_object['data'].each do | clinic_location |
    p "..checking clinic #{clinic_location['displayName']}"
    query = RDKQuery.new('locations-clinics-search')
    query.add_parameter('uid', clinic_location['uid'])
    query.add_parameter('date.start', '19001201')
    query.add_parameter('date.end', '19001201')
    path = query.path
    @response = HTTPartyRDK.get(path)
    @json_object = JSON.parse(@response.body)
    break unless @json_object['message'].nil?
  end
  expect(@json_object['message']).to_not be_nil, "Did not find a clinic without patients"
end

When(/^the client requests Wards patient search results for a ward without patients$/) do
  query = RDKQueryPicklist.new("write-pick-list-wards-fetch-list")
  query.add_parameter('site', 'SITE')
  @response = HTTPartyRDK.get(query.path)
  expect(@response.code).to eq(200)
  @json_object = JSON.parse(@response.body)
  expect(@json_object['data'].length).to be > 0

  p 'searching for ward without patients'
  @json_object['data'].each do | ward_location |
    p "..checking ward #{ward_location['displayName']}"
    query = RDKQuery.new('locations-wards-search')
    query.add_parameter('uid', ward_location['uid'])
    path = query.path
    @response = HTTPartyRDK.get(path)
    @json_object = JSON.parse(@response.body)
    break unless @json_object['message'].nil?
  end
  expect(@json_object['message']).to_not be_nil, "Did not find a ward without patients"
end

Then(/^the nationwide search results displayName are mixed case$/) do
  @json_object = JSON.parse(@response.body)
  output_string = ''

  fieldsource = 'data.items.displayName'
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, @json_object, output_string, source_allvalues)
  source_allvalues.each do | display_name |
    p display_name
    result = display_name.match(/[A-Z]{1}[a-z]+,\s*[A-Z]{1}[a-z]+/)
    expect(result).to_not be_nil, "#{display_name} did not match expected format (Ex. Doe, John)"
  end
end
