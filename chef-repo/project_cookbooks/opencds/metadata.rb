name						 "opencds"
maintainer       "Agilex"
maintainer_email "team-milkyway@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures opencds"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.16"

supports "centos"

#############################
# 3rd party
#############################
depends "apache2", "=3.0.1"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.233.3"

#############################
# custom_cookbook
#############################
depends "tomcat", "2.233.7"
depends "common", "2.233.5"
depends "ehmp_synapse", "2.233.9"
