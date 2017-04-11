When(/^user sends GET request for conformance results in FHIR metadata format/) do 
  temp = QueryRDKFhirMetadata.new
  path = temp.path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  puts @response.body
end
