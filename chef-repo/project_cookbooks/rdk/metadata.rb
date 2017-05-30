name             "rdk"
maintainer       "Agilex"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures rdk"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.46"

supports "mac_os_x"
supports "centos"

depends "common", "2.1.2"
depends "ehmp_synapse", "2.1.1"
depends "communications_cli", "2.1.9"

#############################
# 3rd party
#############################
depends "logrotate", "=1.9.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.1.2"
depends "nodejs_wrapper", "2.1.0"
depends "bluepill_wrapper", "2.1.0"
depends "oracle_wrapper", "2.1.12"
depends "nerve_wrapper", "2.1.1"