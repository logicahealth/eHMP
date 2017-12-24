name             "vista"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures VistA"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.18"

supports "centos"
supports "windows"

depends "common", "2.233.5"

#############################
# 3rd party
#############################
depends "selinux", "=0.9.0"
depends "apache2", "=3.0.1"
depends "windows", "=1.37.0"

#############################
# wrapper_cookbook
#############################
