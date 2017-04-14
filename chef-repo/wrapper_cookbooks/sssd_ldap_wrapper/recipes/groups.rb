# There is a bug in this resource type
# group node[:sssd_ldap_wrapper][:groups][:cache][:name] do
#   gid node[:sssd_ldap_wrapper][:groups][:cache][:gid]
#   non_unique true
#   action :create
# end
group node[:sssd_ldap_wrapper][:groups][:cache][:name] do
  action :create
end

execute 'cacheserver_group' do
	command "groupmod -g '#{node[:sssd_ldap_wrapper][:groups][:cache][:gid]}' -o #{node[:sssd_ldap_wrapper][:groups][:cache][:name]}"
end