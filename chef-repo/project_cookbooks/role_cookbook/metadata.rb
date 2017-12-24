name             'role_cookbook'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures role_cookbook cookbooks against a vm'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.10"

depends "beats", "=2.233.0"

#############################
# 3rd party
#############################
depends "ntp", "=1.8.6"
depends "timezone-ii", "=0.2.0"
depends "hostnames", "0.3.6"
depends "swap", "=0.3.8"

#############################
# wrapper_cookbook
#############################
depends "sssd_ldap_wrapper", "2.233.1"
depends "ohai", "2.233.0"
depends "yum_wrapper", "2.233.1"
