Given(/^there are prefetch patients$/) do
  ehmp_patient = {
      'uid' => 'urn:va:appointment:SITE:3:3',
      'pid' => 'SITE;3',
      'patientIdentifier' => '3^PI^502^USVHA^P',
      'source' => 'appointment',
      'sourceDate' => '20170401100000',
      'isEhmpPatient' => true,
      'facility' => '502',
      'clinic' => 'AUDIOLOGY'
  }
  patient = {
      'uid' => 'urn:va:appointment:SITE:8:8',
      'pid' => 'SITE;8',
      'patientIdentifier' => '8^PI^501^USVHA^P',
      'source' => 'appointment',
      'sourceDate' => '20170401100000',
      'isEhmpPatient' => false,
      'facility' => '501',
      'clinic' => 'AUDIOLOGY'
  }

  path = String.new(DefaultLogin.pjds_url)
  @response = HTTPartyRDK.put(path + "/prefetch/" + ehmp_patient['uid'], ehmp_patient.to_json, { "Content-Type" => "application/json" })
  expect(@response.code).to eq(201), "response code was #{@response.code}: response body #{@response.body}"

  @response = HTTPartyRDK.put(path + "/prefetch/" + patient['uid'], patient.to_json, { "Content-Type" => "application/json" })
  expect(@response.code).to eq(201), "response code was #{@response.code}: response body #{@response.body}"
end

When(/^the client requests to view list of prefetch patients with strategy search criteria of "(.*?)"$/) do |strategy|
  query = RDKQuery.new('prefetch-patients-get')
  query.add_parameter('timeframeStart', '2017-04-01')
  query.add_parameter('timeframeEnd', '2017-04-02')
  query.add_parameter('strategy', strategy)

  path = query.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests to view list of prefetch patients with search criteria of "(.*?)", "(.*?)", "(.*?)"$/) do |strategy, facility, clinic|
  query = RDKQuery.new('prefetch-patients-get')
  query.add_parameter('timeframeStart', '2017-04-01')
  query.add_parameter('timeframeEnd', '2017-04-02')
  query.add_parameter('strategy', strategy)
  query.add_parameter('facility', facility)
  query.add_parameter('clinic', clinic)

  path = query.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the results contains the prefetch patient/) do |table|
  @patients = @response.parsed_response['data']['patient']
  @outbound_query = @response.parsed_response['data']['outboundQueryCriteria']

  table.hashes.each { |v| v['isEhmpPatient'] = v['isEhmpPatient'] == 'true' }

  @differences = table.hashes - @patients

  expect(@differences.size).to eq(0), "Data returned does not match expected data. Expected: #{table.hashes} Returned: #{@patients}."
  expect(@outbound_query).to_not be_nil, "OutboundQueryCriteria was not returned. Returned: #{@json_object}."
end
