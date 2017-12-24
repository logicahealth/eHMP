name			 "vxsync"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures vxsync"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.60"

supports "mac_os_x"
supports "centos"

depends "common", "2.233.5"
depends "apm", "2.233.1"
depends "osync", "2.233.7"
depends "app_dynamics", "2.233.2"
depends "solr_client", "2.233.3"
depends "ehmp_synapse", "2.233.9"

#############################
# 3rd party
#############################
depends "build-essential", "= 2.2.2"
depends "yum", "=3.5.4"
depends "logrotate", "=2.2.0"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.233.3"
depends "nodejs_wrapper", "2.233.2"
depends "bluepill_wrapper", "2.233.0"
