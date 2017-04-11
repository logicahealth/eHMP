name             "adk"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures adk"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.8"

supports "windows"
supports "mac_os_x"
supports "centos"

#############################
# 3rd party
#############################
depends "apache2", "=3.0.1"

#############################
# wrapper_cookbook
#############################
depends "apache2_wrapper", "=2.0.5"
