name						 "cdsinvocation"
maintainer       "Agilex"
maintainer_email "team-milkway@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures cdsinvocation"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.25"

supports "centos"

depends "common", "2.0.10"

#############################
# 3rd party
#############################
depends "apache2", "=3.0.1"
depends "build-essential", "=2.2.2"

#############################
# wrapper_cookbook
#############################
depends "java_wrapper", "2.0.5"


#############################
# custom_cookbook
#############################
depends "tomcat", "2.0.4"
