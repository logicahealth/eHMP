name						 "asu"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures ASU"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.11"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.12"

#############################
# 3rd party
#############################

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.6"
depends "bluepill_wrapper", "2.0.5"
