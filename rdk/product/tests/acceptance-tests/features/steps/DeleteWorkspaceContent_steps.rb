When(/^the client requests to create a workspace for patient id "(.*?)" with content "(.*?)"$/) do |pid, content|
  temp = RDKQuery.new('user-defined-screens')
  temp.add_parameter('pid', pid)
  path = temp.path
  p path
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

When(/^the client requests to add an applet for patient id "(.*?)" with content "(.*?)"$/) do |pid, content|
  temp = RDKQuery.new('user-defined-screens')
  temp.add_parameter('pid', pid)
  path = temp.path
  p path
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

When(/^the client requests to add a filter "(.*?)" to an applet in workspace "(.*?)" with instanceId "(.*?)"$/) do |filter, id, instanceId|
  query = RDKQuery.new('user-defined-filter')
  query.add_parameter("id", id) unless id.nil?
  query.add_parameter("instanceId", instanceId)
  query.add_parameter("filter", filter)
  path = query.path
  @response = HTTPartyRDK.post(path)
end

When(/^the client deletes a workspace for patient id "(.*?)" and with content "(.*?)"$/) do |pid, content|
  temp = RDKQuery.new('user-defined-screens')
  temp.add_parameter('pid', pid)
  path = temp.path
  p path
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

When(/^the client requests to view an applet from workspace "(.*?)" with instanceId "(.*?)"$/) do |id, instanceId|
  query = RDKQuery.new('user-defined-filter')
  query.add_parameter("id", id) unless id.nil?
  query.add_parameter("instanceId", instanceId)
  path = query.path
  @response = HTTPartyRDK.get(path)
end
