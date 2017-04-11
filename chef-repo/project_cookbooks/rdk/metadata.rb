name             "rdk"
maintainer       "Agilex"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures rdk"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.67"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.10"

depends "logrotate", "=1.9.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.5"
depends "nodejs_wrapper", "2.0.3"
depends "bluepill_wrapper", "2.0.4"
depends "logstash-forwarder_wrapper", "2.0.2"
depends "oracle_wrapper", "2.0.10"
