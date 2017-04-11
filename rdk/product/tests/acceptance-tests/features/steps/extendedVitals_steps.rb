When(/^the "(.*?)" is requested for patient "(.*?)"$/) do |domain, uid|
  temp = QueryRDKFhir.new(uid, domain)
  #p temp.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(temp.path)
end

When(/^the "(.*?)" is requested with parameter "(.*?)" value "(.*?)" for patient "(.*?)"$/) do |domain, param, value, uid|
  temp = QueryRDKFhir.new(uid, domain)
  temp.add_parameter(param, value)
  #p temp.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(temp.path)
end

When(/^the "(.*?)" is requested with all parameters for patient "(.*?)"$/) do |domain, uid|
  temp = QueryRDKFhir.new(uid, domain)
  temp.add_parameter("date", ">2015-01-26T01:20:00Z")
  temp.add_parameter("code", "http://loinc.org|8310-5")
  temp.add_parameter("_count", "1")
  #p temp.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(temp.path)
end

And(/^total returned resources are "(.*?)"$/) do |count|
  json = JSON.parse(@response.body)
  obj = json["entry"].count
  expect(obj.to_s).to eq(count)
end

When(/^the observation is requested for the patient "(.*?)"$/) do |pid|
  temp = RDKQuery.new('observation-observation')
  temp.add_parameter("subject.identifier", pid)
  p temp.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(temp.path)
end
