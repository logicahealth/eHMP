When(/^the client requests labs by type for the patient "([^"]*)"$/) do |pid, table|
  # labsbytype
  request = QueryRDKDomain.new('labsbytype', pid)
  
  table.rows.each do |row|
    request.add_parameter(row[0], row[1])
  end
  p request.path
  path = request.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end

When(/^the client requests vitals type for the patient "([^"]*)"$/) do |pid, table|
  request = QueryRDKDomain.new('vital', pid)
  
  table.rows.each do |row|
    request.add_parameter('filter', "eq(typeName,#{row[0]})")
  end
  p request.path
  path = request.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end
