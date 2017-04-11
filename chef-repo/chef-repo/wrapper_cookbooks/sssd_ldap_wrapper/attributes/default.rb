default['sssd_ldap_wrapper']['server'] = "ldap.vistacore.us"
default['sssd_ldap_wrapper']['server_ip'] = '52.5.69.102'
default['sssd_ldap_wrapper']['basedn'] = "dc=vistacore,dc=us"
default['sssd_ldap_wrapper']['server_uri'] = "ldaps://#{sssd_ldap_wrapper['server']}:636/"

default['sssd_ldap_wrapper']['ssl_cacert_dir'] = '/etc/ssl/certs'
default['sssd_ldap_wrapper']['ssl_cacert_file'] = "#{sssd_ldap['ldap_tls_cacertdir']}/#{sssd_ldap_wrapper['server']}.pem"
default['sssd_ldap_wrapper']['ssl_cert_source_path'] = "ssl/#{node['sssd_ldap_wrapper']['server']}.pem"
default['sssd_ldap_wrapper']['ssl_cert_source_cookbook'] = 'sssd_ldap_wrapper'

default['sssd_ldap']['ldap_schema'] = 'rfc2307'
default['sssd_ldap']['ldap_uri'] = sssd_ldap_wrapper['server_uri']
default['sssd_ldap']['ldap_search_base'] = sssd_ldap_wrapper['basedn']
default['sssd_ldap']['ldap_user_search_base'] = "ou=people,#{sssd_ldap_wrapper['basedn']}"
default['sssd_ldap']['ldap_group_search_base'] = "ou=group,#{sssd_ldap_wrapper['basedn']}"

default['sssd_ldap']['ldap_id_use_start_tls'] = 'false'
default['sssd_ldap']['ldap_tls_reqcert'] = 'never'
default['sssd_ldap']['ldap_tls_cacertdir'] = sssd_ldap_wrapper['ssl_cacert_dir']

default['sssd_ldap']['ldap_default_bind_dn'] = "cn=sssd,#{sssd_ldap_wrapper['basedn']}"
default['sssd_ldap']['ldap_default_authtok'] = 'cs,koUiBbfH68)g'

default['sssd_ldap']['authconfig_params'] = '--enablesssd --enablesssdauth --enablelocauthorize --enablemkhomedir --update'

# set to nil by default, uses these for memberOf
default['sssd_ldap']['access_provider'] = 'ldap'
default['sssd_ldap']['ldap_access_order'] = 'filter'
# ehmp needs to be set to whatever membership group this node is part of and allows access to
default['sssd_ldap']['ldap_access_filter'] = "memberOf=cn=ehmp,ou=group,#{sssd_ldap_wrapper['basedn']}" # Can use simple LDAP filter such as 'uid=abc123' or more expressive LDAP filters like '(&(objectClass=employee)(department=ITSupport))'

default['sssd_ldap']['min_id'] = '1'
default['sssd_ldap']['max_id'] = '0'
default['sssd_ldap']['ldap_sudo'] = 'true'
