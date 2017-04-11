path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

Given(/^"(.*?)" attempts to establish an "(.*?)" session with the resource server$/) do |system_name, system_type|
  auth_details = {}
  auth_details[:name] = system_name
  auth_details[:type] = system_type
  @response = HTTPartyRDKTrustedSystems.acquire_tokens(auth_details)
end

Given(/^"(.*?)" attempts to refresh an "(.*?)" session with the resource server$/) do |system_name, system_type|
  path = RDKQuery.new("authentication-#{system_type}-systems-refresh-session").path
  @response = HTTPartyRDKTrustedSystems.get_as_user(path, system_name, system_type)
end

Given(/^"(.*?)" attempts to destroy an "(.*?)" session with the resource server$/) do |system_name, system_type|
  path = RDKQuery.new("authentication-#{system_type}-systems-refresh-session").path
  @response = HTTPartyRDKTrustedSystems.delete_as_user(path, system_name, system_type)
end
