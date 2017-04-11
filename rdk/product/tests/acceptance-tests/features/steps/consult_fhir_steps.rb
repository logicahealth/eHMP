When(/^the client requests consult for the patient "(.*?)" in FHIR format$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/referralrequest?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests consult for that sensitive patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/referralrequest?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client breaks glass and repeats a request for consult for that patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/referralrequest?subject.identifier=#{pid}&_ack=true"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests "(.*?)" consult for the patient "(.*?)" in FHIR format$/) do |limit, pid|
  p limit
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/referralrequest?subject.identifier=#{pid}&_count=#{limit}&_ack=true"
  @response = HTTPartyRDK.get(path)
  json = JSON.parse(@response.body)
  i = 0
  resourcetype = []
  while i < json["entry"].size
    resourcetype [i]  = json["entry"][i]["resource"]["resourceType"]
    puts resourcetype [i]
    expect(resourcetype[i] <= "referralrequest").to eq(true)
    i += 1
  end
  puts i
  expect(i.to_s == limit).to eq(true)
end
