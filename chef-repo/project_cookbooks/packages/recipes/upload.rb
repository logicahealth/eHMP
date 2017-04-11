#
# Cookbook Name:: no_internet
# Recipe:: default
#

yum_server = data_bag_item('servers', 'yum-managed').to_hash

packages_upload_yum_repo "upload_yum_cache_to_nexus" do
	upload_url yum_server['fqdn']
end
