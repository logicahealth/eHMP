
rdk_udaf_title = 'user-defined-filter'

When(/^the client saves a UDAF with test "(.*?)" filter "(.*?)" and instance "(.*?)" in a workspace$/) do |arg1, arg2, arg3|
  query = RDKQuery.new(rdk_udaf_title)
  query.add_parameter("id", arg1) 
  query.add_parameter("filter", arg2) 
  query.add_parameter("instanceId", arg3) 
  path = query.path
  @response = HTTPartyRDK.post(path)
end

When(/^the client requests to see udaf with same parameters "(.*?)" filter "(.*?)" and instanceId "(.*?)" in a workspace$/) do |arg1, arg2, arg3|
  query = RDKQuery.new(rdk_udaf_title)
  query.add_parameter("id", arg1) 
  query.add_parameter("filter", arg2) 
  query.add_parameter("instanceId", arg3) 
  path = query.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests to delete udaf with same parameters "(.*?)" filter "(.*?)" and instanceId "(.*?)" in a workspace$/) do |arg1, arg2, arg3|
  query = RDKQuery.new(rdk_udaf_title)
  query.add_parameter("id", arg1) 
  query.add_parameter("filter", arg2) 
  query.add_parameter("instanceId", arg3) 
  path = query.path
  @response = HTTPartyRDK.delete(path)
end

When(/^the client requests to delete all udafs for workspace "(.*?)" and appletId "(.*?)" for a user$/) do |arg1, arg2|
  query = RDKQuery.new('user-defined-filter-all')
  query.add_parameter("id", arg1) 
  query.add_parameter("instanceId", arg2) 
  path = query.path
  # path = RDKRemoveUdafs.new(arg1, arg2).path
  @response = HTTPartyRDK.delete(path)
end
