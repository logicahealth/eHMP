name			 "beanstalk"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures beanstalk"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.6"

supports "mac_os_x"
supports "centos"

depends "common", "2.233.5"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.233.3"
depends "bluepill_wrapper", "2.233.0"
