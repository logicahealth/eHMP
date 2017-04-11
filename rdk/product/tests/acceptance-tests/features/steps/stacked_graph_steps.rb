When(/^the client requests labs by type for the patient "([^"]*)"$/) do |pid, table|
  # labsbytype
  request = QueryRDKDomain.new('searchbytype-lab', pid)
  
  table.rows.each do |row|
    request.add_parameter(row[0], row[1])
  end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests vitals type for the patient "([^"]*)"$/) do |pid, table|
  request = QueryRDKDomain.new('vital', pid)
  
  table.rows.each do |row|
    request.add_parameter('filter', "eq(typeName,#{row[0]})")
  end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end
