name						 "cdsinvocation"
maintainer       "Agilex"
maintainer_email "team-milkway@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures cdsinvocation"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.11"

supports "centos"

depends "common", "2.0.3"

#############################
# 3rd party
#############################
depends "apache2", "=3.0.1"
depends "build-essential", "=2.2.2"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.2"


#############################
# custom_cookbook
#############################
depends "tomcat", "2.0.2"
