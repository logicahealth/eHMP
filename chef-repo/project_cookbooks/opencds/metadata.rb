name						 "opencds"
maintainer       "Agilex"
maintainer_email "team-milkyway@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures opencds"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.7"

supports "centos"

#############################
# 3rd party
#############################
depends "apache2", "=3.0.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.2"

#############################
# custom_cookbook
#############################
depends "tomcat", "2.0.2"
depends "common", "2.0.3"
