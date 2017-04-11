When(/^the client requests COMMUNITY HEALTH SUMMARIES for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('vlerdocument', pid)
  
  table.rows.each do |row|
    request.add_parameter(row[0], row[1])
  end
  p request.path
  path = request.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end
