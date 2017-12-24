name			 "osync"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures osync"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.7"

supports "mac_os_x"
supports "centos"

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
