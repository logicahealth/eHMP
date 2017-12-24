#
# Cookbook Name:: yum_wrapper
# Recipe:: default
#

include_recipe "yum"

yum_server = data_bag_item('servers', 'yum-application').to_hash
node.default['yum_wrapper']['localrepo']['baseurl'] = yum_server['fqdn']

yum_repository node['yum_wrapper']['localrepo']['name'] do
  description "#{node['yum_wrapper']['localrepo']['name']} Yum Repo"
  baseurl "#{node['yum_wrapper']['localrepo']['baseurl']}"
  gpgcheck false
  action :create
end

rpm_package "yum-plugin-priorities" do
  ignore_failure true
  only_if 'rpm -qa | grep yum-plugin-priorities'
  action :remove
end.run_action(:remove)
