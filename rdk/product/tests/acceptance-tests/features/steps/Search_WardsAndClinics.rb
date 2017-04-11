
Then(/^the client receives at least (\d+) location$/) do |num|
  response_json = JSON.parse(@response.body)
  response_size = @response["data"].length
  expect(response_size).to be >= (num.to_i)
end

When(/^the client requests for patients in (ward|clinic) location uid "(.*?)"\
(?: with)?\
(?: start date of "(.*?)")?\
(?: and end date of "(.*?)")?\
(?: filtered by \'(.*?)\')?/) do |type, uid, startdate, enddate, filter|
  type = type == 'ward' ? 'wards' : type
  type = type == 'clinic' ? 'clinics' : type
  search_ward = RDKQuery.new("locations-#{type}-search")
  search_ward.add_parameter('uid', uid)
  search_ward.add_parameter('date.start', startdate)  unless startdate.nil?
  search_ward.add_parameter('date.end', enddate)  unless enddate.nil?
  search_ward.add_parameter('filter', filter) unless filter.nil?
  path = search_ward.path
  @response = HTTPartyRDK.get(path)
end
