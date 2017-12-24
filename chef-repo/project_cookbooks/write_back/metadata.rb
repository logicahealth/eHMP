name             "write_back"
maintainer       "Agilex"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures write_back"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.24"

supports "mac_os_x"
supports "centos"

depends "common", "2.233.5"
depends "ehmp_synapse", "2.233.9"
depends "apm", "2.233.1"
depends "vista_aso_rejector", "2.233.7"
depends "solr_client", "2.233.3"
depends "app_dynamics", "2.233.2"

#############################
# 3rd party
#############################
depends "logrotate", "=2.2.0"

#############################
# wrapper_cookbook
#############################
depends "nodejs_wrapper", "2.233.2"
depends "bluepill_wrapper", "2.233.0"
depends "oracle_wrapper", "2.233.22"
depends "nerve_wrapper", "2.233.3"
