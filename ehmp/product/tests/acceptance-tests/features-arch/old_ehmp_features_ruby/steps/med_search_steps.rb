path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'VerifyJsonRuntimeValue.rb'

When(/^the user searches medication for the patient "(.*?)" with the "(.*?)" in VPR format$/) do |pid, text|
# https://IP      /vpr/SITE;737/search/MED?text=ANALGESICS
  path = QueryVPR.new("search/MED", pid).add_parameter("text", text)
  p path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end
