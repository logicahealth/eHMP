When(/^the client requests to view all ehmp permissions$/) do 
  query = RDKQuery.new('permissions-list')
  query.add_parameter('testdata', 'true')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;vk1234", "vk1234!!")
end

Then(/^the permissions results contain more than (\d+) records$/) do |count|
  json = JSON.parse(@response.body)
  value = json["data"]   #results  in only one value
  expect(value.length).to be > count.to_i
end
