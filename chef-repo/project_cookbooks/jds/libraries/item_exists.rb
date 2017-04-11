require 'net/http'
require 'uri'

def item_exists?(url, check_for_key)
  uri = URI.parse(url)
  response = Net::HTTP.get_response(uri)
  resp_body = JSON.parse(response.body)
  resp_body.has_key?(check_for_key)
end