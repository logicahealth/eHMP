

Given(/^a quick-order for the user$/) do
  temp = RDKOrder.new
  path = temp.path + "quickorder"
  quickorder_json = File.read('./features/steps/data/quickorder.json')
  @response = HTTPartyRDK.post(path, quickorder_json, { 'Content-Type' => 'application/json' })
end

Given(/^an order-set for the user$/) do
  temp = RDKOrder.new
  path = temp.path + "orderset"
  orderset_json = File.read('./features/steps/data/orderset.json')
  @response = HTTPartyRDK.post(path, orderset_json, { 'Content-Type' => 'application/json' })
  puts @response.body
end

Given(/^an enterprise-orderable for the user$/) do
  query = RDKQuery.new("enterprise-orderable-create")
  enterprise_orderable_json = File.read('./features/steps/data/enterpriseorderable.json')
  @response = HTTPartyRDK.post(query.path, enterprise_orderable_json, { 'Content-Type' => 'application/json' })
end

When(/^the user requests orderables of type "(.*?)"$/) do |subtype|
  query = RDKQueryPicklist.new("write-pick-list-orderables")
  query.add_parameter("searchString", "Rheu")
  query.add_parameter("site", "C877")
  query.add_parameter("subtype", subtype)
  @response = HTTPartyRDK.get(query.path)
  puts @response
end

Then(/^there are (\d+) orderables in the results$/) do |num|
  response_json = JSON.parse(@response.body)
  response_size = response_json["totalItems"]
  expect(response_size).to eq(num.to_i)
  puts @response
end

Then(/^the results are sorted by name$/) do
  response_json = JSON.parse(@response.body)
  response_size = response_json["totalItems"]
  if response_size > 1
    sorted = true
    for i in 1...(response_size) do
      if response_json["data"][i]["name"] < response_json["data"][i-1]["name"]
        sorted = false
      end
    end
    expect(sorted).to eq(true)
  end
end

def json_array_contains(json_array, key, value)
  contains = false
  json_array.each do |json_object|
    if json_object[key] == value
      contains = true
    end
  end
  return contains
end

Then(/^the orderables results contain$/) do |table|
  result_array = JSON.parse(@response.body)["data"]
  table.rows.each do |row|
    contains = json_array_contains(result_array, row[0], row[1])
    expect(contains).to eq(true)
  end
end



