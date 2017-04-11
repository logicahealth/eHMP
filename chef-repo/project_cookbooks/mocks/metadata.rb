name             "mocks"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures ehmp"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.43"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.12"

#############################
# 3rd party
#############################
depends "build-essential", "= 2.2.2"
depends "yum", "=3.5.4"
depends "apache2", "=3.0.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.6"
depends "nodejs_wrapper", "2.0.4"
depends "bluepill_wrapper", "2.0.5"
depends "apache2_wrapper", "2.0.5"
