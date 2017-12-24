#
# Cookbook Name:: role_cookbook
# Recipe:: default
#

include_recipe "yum_wrapper::vistacore_yum"
include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"
include_recipe "sssd_ldap_wrapper"
include_recipe "beats" if node[:beats][:logging]
include_recipe "beats::disable" unless node[:beats][:logging]

if node[:chef_provisioning][:driver_url] == "aws"
  node.default[:set_fqdn] = "#{node[:stack].gsub('.','-').gsub('build-','')}.vistacore.us"
else
  node.default[:set_fqdn] = "#{node[:chef_provisioning][:reference][:target_name].gsub('.','-').gsub('build-','')}.vistacore.us"
end
include_recipe "hostnames"

# temporarily enable ssh access with password
execute 'Update sshd configuration' do
  command 'sed -i -e \'s/\\(^PasswordAuthentication \\).*$/\\1yes/\' /etc/ssh/sshd_config; service sshd restart;'
  not_if 'grep \'^PasswordAuthentication yes\' /etc/ssh/sshd_config'
end

# override aws specific solr attributes here
node.default[:vx_solr][:bin_solr][:memory] = "1g"

# service users
group 'node' do
  gid 1000
end

user 'node' do
  uid 1000
  gid 1000
  system true
  shell '/sbin/nologin'
end

group 'solr' do
  gid 1001
end

user 'solr' do
  uid 1001
  gid 1001
  system true
  shell '/sbin/nologin'
end

group 'zookeeper' do
  gid 1002
end

user 'zookeeper' do
  uid 1002
  gid 1002
  system true
  shell '/sbin/nologin'
end

group 'dropwizard' do
  gid 1003
end

user 'dropwizard' do
  uid 1003
  gid 1003
  system true
  shell '/sbin/nologin'
end

group 'asu' do
  gid 1004
end

user 'asu' do
  uid 1004
  gid 1004
  system true
  shell '/sbin/nologin'
end

group 'jena' do
  gid 1005
end

user 'jena' do
  uid 1005
  gid 1005
  system true
  shell '/sbin/nologin'
end
