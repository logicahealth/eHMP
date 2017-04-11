require 'json-schema'

When(/^the client requests both education and procedure for patient "([^"]*)"$/) do |patient|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{patient}/procedure"
  @response = HTTPartyRDK.get(path)
end

Then(/^the returned json data include both education and procedure objects$/) do
  json = JSON.parse(@response.body)
  json["entry"].each do |item|
    value   = item["resource"]["identifier"][0]["value"]
    expect((value.include? "education") || (value.include? "procedure")).to eq(true)
  end
end

Then(/^required elements "([^"]*)", "([^"]*)" and "([^"]*)" returned$/) do |arg1, arg2, arg3|
  json = JSON.parse(@response.body)
  status =""
  type = ""
  patient =""
  schema = {
    "$schema" => "http://json-schema.org/draft-04/schema#",
    "type" => "object",
    "required" => %w(status patient type),
    "properties" => { 
    "status" => { "type" => "string" },
    "patient" => { "type" => "object" },
    "type" => { "type" => "object" }
    }
    }
  json["entry"].each do |item| 
    status  = item["resource"]["status"]
    patient = item["resource"]["patient"]
    type =    item["resource"]["type"]  
  end
  data = {
    "status" => status,
    "type" => type,
    "patient" => patient
    }
  expect(JSON::Validator.validate!(schema, data, :strict => true)).to eq(true)
end

When(/^the client requests only "([^"]*)" for patient "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg2}/procedure?_tag=#{arg1}"
  @response = HTTPartyRDK.get(path)
end

Then(/^the returned json data include only "([^"]*)" objects$/) do |arg1|
  json = JSON.parse(@response.body)
  json["entry"].each do |item|
    value   = item["resource"]["identifier"][0]["value"]
    expect(value.include? arg1).to eq(true)  
  end
end

When(/^the client requests Educations standalone resource for patient "([^"]*)"$/) do |arg1|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/educations?subject.identifier=#{arg1}"
  @response = HTTPartyRDK.get(path)
  puts @response
end

Then(/^a "([^"]*)" code response is returned$/) do |arg1|
  expect(@response.code).to eq(404)
end


