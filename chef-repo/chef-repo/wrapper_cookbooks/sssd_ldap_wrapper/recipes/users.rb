user node[:sssd_ldap_wrapper][:users][:cache][:name] do
  gid node[:sssd_ldap_wrapper][:users][:cache][:gid]
  home node[:sssd_ldap_wrapper][:users][:cache][:home]
  shell node[:sssd_ldap_wrapper][:users][:cache][:shell]
  action :create
end