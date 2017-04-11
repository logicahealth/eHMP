name             'role_cookbook'
maintainer       'Agilex'
maintainer_email 'mike.dial@agilex.com'
license          'All rights reserved'
description      'Installs/Configures role_cookbook cookbooks against a vm'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.5"

depends "ohai", "2.0.4"
depends "ntp", "=1.8.6"
depends "timezone-ii", "=0.2.0"
depends "sssd_ldap_wrapper", "2.0.2"

