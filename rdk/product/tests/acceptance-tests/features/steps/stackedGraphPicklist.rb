When(/^the client requests to see the vitals picklist for (\d+) records$/) do |n|
  query = RDKQuery.new('operational-data-type-vital')
  query.add_parameter("limit", n)
  path = query.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests to see the labs picklist for (\d+) records$/) do |n|
  query = RDKQuery.new('operational-data-type-laboratory')
  query.add_parameter("limit", n)
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests to see the meds picklist for (\d+) records$/) do |n|
  query = RDKQuery.new('operational-data-type-medication')
  query.add_parameter("limit", n)
  path = query.path
  @response = HTTPartyRDK.get(path)
end
