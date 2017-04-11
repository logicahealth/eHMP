name             "mocks"
maintainer       "Agilex"
maintainer_email "jay.flowers@agilex.com"
license          "All rights reserved"
description      "Installs/Configures ehmp"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.11"

supports "mac_os_x"
supports "centos"

#############################
# 3rd party
#############################
depends "build-essential", "= 2.2.2"
depends "yum", "=3.5.4"
depends "apache2", "=3.0.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.2"
depends "nodejs_wrapper", "2.0.2"
depends "bluepill_wrapper", "2.0.2"
depends "apache2_wrapper", "2.0.2"
