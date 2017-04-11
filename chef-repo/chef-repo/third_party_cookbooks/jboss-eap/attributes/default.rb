
default['jboss-eap']['version'] = "6.2.0"
default['jboss-eap']['install_path'] = '/opt'
default['jboss-eap']['symlink'] = 'jboss'
default['jboss-eap']['jboss_home'] = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}"
default['jboss-eap']['config_dir'] = '/etc/jboss-as'
default['jboss-eap']['package_url'] = 'http://example.com/jboss-eap-6.2.0.zip'
default['jboss-eap']['checksum'] = '627773f1798623eb599bbf7d39567f60941a706dc971c17f5232ffad028bc6f4'
default['jboss-eap']['log_dir'] = '/var/log/jboss'
default['jboss-eap']['jboss_user'] = 'jboss'
default['jboss-eap']['jboss_group'] = 'jboss'
default['jboss-eap']['admin_user'] = nil
default['jboss-eap']['admin_passwd'] = nil # Note the password has to be >= 8 characters, one numeric, one special
default['jboss-eap']['start_on_boot'] = false
