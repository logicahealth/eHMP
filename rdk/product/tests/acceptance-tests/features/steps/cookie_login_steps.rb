require 'QueryRDK.rb'

class BuildQueryWithTitle < BuildQuery
  def initialize(title)
    super()
    domain_path = RDClass.resourcedirectory_fetch.get_url(title)
    p "domain path: #{domain_path}"
    @path.concat(domain_path)
    @number_parameters = 0
  end
end

When(/^client requests the authentication list without authentication$/) do
  path = RDClass.resourcedirectory_fetch.get_url('authentication-list')
  p path
  @response = HTTParty.get(path)
end

Then(/^the authentication list response contains fields$/) do |table|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new
  result_array = @json_object["data"]["items"]
  search_json(result_array, table)
end

Given(/^the client has logged in with a cookie$/) do
  # The code used in this function was pulled from an example 
  # https://github.com/jnunemaker/httparty/blob/master/examples/tripit_sign_in.rb
  p "Client session started"
  @response = HTTPartyRDK.acquire_tokens
end

def request_restricted_resource
  # the 'restricted resource' choosen was patient-search-pid because it was 
  # identified as a low cost request
  # pid = 10108V420871, was choosen because it is a common patient used in testing

  pid = "10108V420871"
  title = "patient-search-pid"
  query = BuildQueryWithTitle.new(title)
  query.add_parameter('pid', pid)
  path = query.path
  return HTTPartyRDK.wrap_httparty('get', path)
end

Given(/^the client has requested a restricted resource$/) do
  @response = request_restricted_resource
end

When(/^the client refreshes the session$/) do
  path = RDClass.resourcedirectory_fetch.get_url('authentication-refreshToken')
  p "Client session refreshed at #{path}"
  @response = HTTPartyRDK.wrap_httparty('get', path)
end

Given(/^the client has verified it can access a restricted resource$/) do
  @response = request_restricted_resource
  expect(@response.code).to eq(200), "response code was #{@response.code}: response body #{@response.body}"
end

When(/^the client destroys the sesion$/) do
  path = RDClass.resourcedirectory_fetch.get_url('authentication-destroySession')
  p "Client session destroyed at #{path}"
  @response = HTTPartyRDK.wrap_httparty('delete', path)
end
