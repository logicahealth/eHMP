require 'net/http'
require 'uri'

def data_store_exists?(data_store_url)
  begin
    return Net::HTTP.get_response(URI.parse(data_store_url)).code == "200"
  rescue
    return false
  end
end
