When(/^the user requests facilities of site "(.*?)" and division "(.*?)"$/) do |site, division|
  query = RDKQueryPicklist.new("write-pick-list-facilities")
  query.add_parameter("site", site)
  query.add_parameter("division", division)
  @response = HTTPartyRDK.get(query.path)
  puts @response
end

When(/^the user requests facilities of site "([^"]*)" and no division$/) do |site|
  query = RDKQueryPicklist.new("write-pick-list-facilities")
  query.add_parameter("site", site)
  # GET /resource/write-pick-list/facilities?site=SITE
  @response = HTTPartyRDK.get(query.path)
  puts @response
end

Then(/^there are (\d+) facilities in the response$/) do |num|
  response_json = JSON.parse(@response.body)
  response_size = response_json["data"].size
  expect(response_size).to eq(num.to_i)
end

Then(/^the facilities results contain$/) do |table|
  result_array = JSON.parse(@response.body)["data"]
  table.rows.each do |row|
    contains = json_array_contains(result_array, row[0], row[1])
    expect(contains).to eq(true)
  end
end
