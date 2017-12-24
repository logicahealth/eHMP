name             'sssd_ldap_wrapper'
maintainer       'Vistacore'
maintainer_email 'devops@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures LDAP on RHEL/Ubuntu using SSSD'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.1"

depends 'sssd_ldap', '=1.0.2'
depends 'hostsfile', '=2.4.5'

%w( redhat centos ).each do |os|
  supports os
end
