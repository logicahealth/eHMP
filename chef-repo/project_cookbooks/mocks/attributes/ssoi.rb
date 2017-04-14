#
# Cookbook Name:: mocks
# Attributes:: ssoi
#

default[:mocks][:ssoi][:servlet_source] = nil
default[:mocks][:ssoi][:servlet_name] = "mockssoi"
default[:mocks][:ssoi][:tokengenerator_source] = nil
default[:mocks][:ssoi][:tokengenerator_name] = "mockssoitokengenerator"
default[:mocks][:ssoi][:users_source] = nil
default[:mocks][:ssoi][:users_file] = "mockssoi-users.json"
default[:mocks][:ssoi][:users_url] = "http://127.0.0.1/#{node[:mocks][:ssoi][:users_file]}"
default[:mocks][:ssoi][:end_point] = "http://127.0.0.1/mockssoi/login.jsp"
default[:mocks][:ssoi][:artifacts] = {
  node[:mocks][:ssoi][:servlet_name] => node[:mocks][:ssoi][:servlet_source],
  node[:mocks][:ssoi][:tokengenerator_name] => node[:mocks][:ssoi][:tokengenerator_source]
}