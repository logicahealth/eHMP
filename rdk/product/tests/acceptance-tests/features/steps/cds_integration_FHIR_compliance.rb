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
  expect(@response.code).to eq(arg1.to_i)
end

When(/^the client send a requests resource "([^"]*)" for patient "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg2}/#{arg1}"
  @response = HTTPartyRDK.get(path)
end

@id = ""
@resourcetype = ""
@title = ""
Then(/^the returned json data include id element for resource "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  schema1= {
  "descriptions," => "This json schema are applying for resources: diagnosticorder, observation, condition, procedure, allergyintolerance, composition, DiagnosticReport, immunization, medicationadministration, medicationdispense, medicationprescription, medicationstatement, order, procedure, ReferralRequest ",
  "$schema" => "http://json-schema.org/draft-04/schema#",
  "type" => "object",
  "properties" => {
    "entry" => {
      "type" => "array",
      "items" => {
        "type" => "object",
        "properties" => {
          "resource" => {
            "type" => "object",
            "properties" => {
              "resourceType" => {
                "type" => "string"
              },
              "id" => {
                "type" => "string"
              }
            },
            "required" => %w(
              resourceType
              id
            )
          }
        },
        "required" => %w(
          resource
        )
      }
    }
  }
}
  schema2 = {
  "descriptions," => "This json schema are applying for resources: adversereaction,  ",
  "$schema" => "http://json-schema.org/draft-04/schema#",
  "type" => "object",
  "properties" => {
    "entry" => {
      "type" => "array",
      "items" => {
        "type" => "object",
        "properties" => {
          "title" => {
            "type" => "string"
          },
          "id" => {
            "type" => "string"
          }
        },
        "required" => %w(
          title
          id
        )
      }
    }
  },
  "required" => %w(
    entry
  )
}
  schema3 = {
  "descriptions" => "This json schema are applying for resources: patient  ",      
  "$schema" => "http://json-schema.org/draft-04/schema#",
  "type" => "object",
  "properties" => {
    "resourceType" => {
      "type" => "string"
    },
    "id" => {
      "type" => "string"
    }
  },
  "required" => %w(
    resourceType
    id
  )
}    
  if arg1 == "diagnosticorder"  || arg1 == "observation" || arg1 == "allergyintolerance" || arg1 == "composition" || arg1 == "condition" || arg1 == "DiagnosticReport" || arg1 == "immunization" || arg1 == "medicationadministration" || arg1 == "medicationdispense" || arg1 == "medicationprescription" || arg1 == "medicationstatement" || arg1 == "order" || arg1 == "procedure" || arg1 == "ReferralRequest"
    json["entry"].each do |item| 
      @id = item["resource"]["id"]
      @resourcetype = item["resource"]["resourceType"]  
      puts @id 
      puts @resourcetype
    end   
    expect(JSON::Validator.validate!(schema1, json)).to eq(true)
  elsif arg1 == "adversereaction"
    json["entry"].each do |item| 
      @id = item["id"]
      @title = item["title"]  
      puts @id 
      puts @title
    end   
    expect(JSON::Validator.validate!(schema2, json)).to eq(true) 
  elsif arg1 == "patient"
    @id = json["id"]
    @resourcetype = json["resourceType"]  
    puts @id 
    puts @resourcetype  
    expect(JSON::Validator.validate!(schema3, json)).to eq(true) 
  end
end

When(/^the client requests resource "([^"]*)" for patient "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/#{arg1}?subject.identifier=#{arg2}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client send a requests resource "([^"]*)" for patient "([^"]*)" in domain lab$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg2}/#{arg1}?domain=lab"
  @response = HTTPartyRDK.get(path)
end

When(/^the client send a requests resource "([^"]*)" for patient "([^"]*)" with filter$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg2}/#{arg1}?_count=3&_sort=identifier"
  @response = HTTPartyRDK.get(path)
end

When(/^the client send a requests for patient "([^"]*)"$/) do |arg1|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg1}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client issues a request with an unsupported _tag value "([^"]*)" for patient "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg2}/procedure?_tag=#{arg1}"
  @response = HTTPartyRDK.get(path)
end

