default['jboss-eap']['package_url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/jboss/jboss-eap/6.4.0/jboss-eap-6.4.0.zip"
default['jboss-eap']['checksum'] = '27a6fd62a8bc4f660970ab282a4bc013934275e47a850a974db6c7d2c62cc50e'
default['jboss-eap']['version'] = "6.4.0"
default['jboss-eap']['start_on_boot'] = true 
default['jboss-eap']['admin_user'] = "admin" 
default['jboss-eap']['admin_passwd'] = "Secure@dmin1" 
default['jboss-eap']['home_dir'] = "/home/jboss"
