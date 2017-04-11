When(/^the client requests to view all teams$/) do 
  query = RDKQuery.new('teams-list')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;vk1234", "vk1234!!")
end

Then(/^the teams results contain more than (\d+) records$/) do |count|
  json = JSON.parse(@response.body)
  value = json["data"]   #results  in only one value
  expect(value.length).to be > count.to_i
end
