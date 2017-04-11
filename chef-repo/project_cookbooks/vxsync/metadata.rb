name						 "vxsync"
maintainer       "Agilex"
maintainer_email "mike.dial@agilex.com"
license          "All rights reserved"
description      "Installs/Configures vxsync"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.19"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.3"

#############################
# 3rd party
#############################
depends "build-essential", "= 2.2.2"
depends "yum", "=3.5.4"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.2"
depends "nodejs_wrapper", "2.0.2"
depends "bluepill_wrapper", "2.0.2"
