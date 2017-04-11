When(/^the client requests problem list for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = RDKQuery.new('condition-getProblems')
  temp.add_parameter("subject.identifier", pid)
  temp.replace_path_var(":id", pid)
  temp.add_acknowledge("true")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests problem list for that sensitive patient "(.*?)"$/) do |pid|
  temp = RDKQuery.new('condition-getProblems')
  temp.add_parameter("subject.identifier", pid)
  temp.add_acknowledge("false")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client breaks glass and repeats a request for problem list for that patient "(.*?)"$/) do |pid|
  temp = RDKQuery.new('condition-getProblems')
  temp.add_parameter("subject.identifier", pid)
  temp.add_acknowledge("true")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests "(.*?)" problem list for the patient "(.*?)" in FHIR format$/) do |limit, pid|
  temp = RDKQuery.new('condition-getProblems')
  temp.add_parameter("subject.identifier", pid)
  temp.add_parameter("limit", limit)
  temp.add_acknowledge("true")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end
