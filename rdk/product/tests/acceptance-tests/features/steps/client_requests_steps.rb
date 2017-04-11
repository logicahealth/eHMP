path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
#require 'VerifyJsonRuntimeValue.rb'

#-------------------------------------------------VPR
When(/^the client requests appointments for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("appointment", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests cpt for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("cpt", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests educations for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("education", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests documents for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("document", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests exams for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("exam", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests factors for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("factor", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests images for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("image", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests mentalhealth for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("mh", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests pointofvisits for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("pov", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests procedures for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("procedure", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests skin for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("skin", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests surgery for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("surgery", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests visit for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("visit", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests treatment for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("treatment", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests observations for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("obs", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests ptf for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("ptf", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests newsfeed for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("newsfeed", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests timeline for the patient "(.*?)" in RDK format$/) do |pid|
  query_timeline = RDKQuery.new('patient-record-timeline')
  query_timeline.add_parameter("pid", pid)
  path = query_timeline.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests medication for the patient "(.*?)" in RDK format$/) do |pid|
  path = QueryRDKDomain.new("med", pid).path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests labs for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/diagnosticreport?domain=lab"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests "(.*?)" labs for the patient "(.*?)" in FHIR format$/) do |limit, pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/diagnosticreport?domain=lab&_count=#{limit}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests radiology report results for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/diagnosticreport?domain=rad"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests "(.*?)" radiology report results for the patient "(.*?)" in FHIR format$/) do |limit, pid|
  temp = RDKQuery.new('diagnosticreport-diagnosticreport')
  temp.add_parameter("subject.identifier", pid)
  temp.add_parameter("domain", "rad")
  temp.add_parameter("_count", limit)
  temp.add_acknowledge("true")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests radiology report results for the patient "(.*?)" in FHIR format with no domain param$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/diagnosticreport?domain=lab"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests out-patient medication results for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationdispense?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests in-patient medication results for the patient "(.*?)" in FHIR format$/)  do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationadministration?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests out-patient medication statement for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationstatement?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests "(.*?)" out-patient medication results for the patient "(.*?)" in FHIR format$/) do |limit, pid|
  temp = RDKQuery.new('medicationdispense-getMedicationDispense')
  temp.add_parameter("subject.identifier", pid)
  temp.add_acknowledge("true")
  temp.add_parameter("limit", limit)
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests "(.*?)" in-patient medication results for the patient "(.*?)" in FHIR format$/)  do |limit, pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationadministration?subject.identifier=" + "#{pid}" + "&_count=" + "#{limit}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    @medicationadministration = json["entry"][i]["resource"]["resourceType"]
    expect(@medicationadministration.include? "MedicationAdministration").to eq(true)
    p @medicationadministration
    i += 1
  end
  p i
  expect(i).to eq(limit.to_i)
end
