When(/^the client send a get request to the CRS server$/) do
  temp = AccessCRS.new
  path = temp.path 
  type = { "Content-Type" => "application/json" }
  @response = HTTParty.get(URI.encode(path))
  puts @response
end

Then(/^the CRS server returned a title "([^"]*)"$/) do |arg1|
  expect(@response.include? "#{arg1}").to eq(true)
end

When(/^sending a post request with query data "([^"]*)"$/) do |query|
  temp = AccessCRS.new
  path = temp.path + "/ehmp/query" 
  body = URI.encode_www_form("query" => "#{query}")
  options = {}
  options[:body] = body
  type = { "Content-Type" => "application/json" }
  @response = HTTParty.post(path, options)
  puts @response
end

Then(/^successful message returned with code "([^"]*)"$/) do |arg1|
  expect(@response.include? "g").to eq(true)    
  expect(@response.code).to eq(200)
end
