#
# Cookbook Name:: sssd_ldap_wrapper
# Recipe:: default
#

hostsfile_entry node['sssd_ldap_wrapper']['server_ip'] do
  hostname  node['sssd_ldap_wrapper']['server']
  unique    true
end

cookbook_file node['sssd_ldap_wrapper']['ssl_cacert_file'] do
  source   node['sssd_ldap_wrapper']['ssl_cert_source_path']
  cookbook node['sssd_ldap_wrapper']['ssl_cert_source_cookbook']
  mode     '0644'
  owner    'root'
  group    node['root_group']
end

include_recipe 'sssd_ldap'

resources(:template => '/etc/nsswitch.conf').cookbook 'sssd_ldap_wrapper'
resources(:template => '/etc/sssd/sssd.conf').cookbook 'sssd_ldap_wrapper'
