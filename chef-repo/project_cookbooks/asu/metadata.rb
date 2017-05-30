name						 "asu"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures ASU"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.8"

supports "mac_os_x"
supports "centos"

depends "common", "2.1.2"

#############################
# 3rd party
#############################

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.1.2"
depends "bluepill_wrapper", "2.1.0"
