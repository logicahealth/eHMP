When(/^the client requests medicationstatement for the patient "([^"]*)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationstatement?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests medicationprescription for the patient "([^"]*)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/medicationprescription"
  @response = HTTPartyRDK.get(path)
end

When(/^requesting "([^"]*)" FHIR resources compartmentalized by patient "([^"]*)" with search parameter "([^"]*)" as "([^"]*)"$/) do |resource, pid, searchParameter, searchValue|
  searchParameter.nil? ? searchValue.nil? : false
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/#{resource}?_#{searchParameter}=#{searchValue}"
  @response = HTTPartyRDK.get(path)
end       

When(/^the client requests medicationdispense for the patient "([^"]*)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationdispense?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests medicationadministration for the patient "([^"]*)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationadministration?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests condition for the patient "([^"]*)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/condition"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests allergyintolerance for the patient "([^"]*)"$/) do |patient| 
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/allergyintolerance?subject.identifier=#{patient}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests "(.*)" for the patient "(.*?)"$/) do |domain, pid|
  temp = RDKQuery.new(domain)
  temp.add_parameter("subject.identifier", pid)
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the diagnosticreport is requested for the patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/diagnosticreport"
  @response = HTTPartyRDK.get(path)
end

When(/^the educations is requested for the patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/educations"
  @response = HTTPartyRDK.get(path)
end

When(/^the condition is requested for the patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/condition"
  @response = HTTPartyRDK.get(temp.path)
end
