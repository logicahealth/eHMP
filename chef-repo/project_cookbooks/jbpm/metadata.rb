name             "jbpm"
maintainer       "Rachel Cindric"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures JBPM"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.103"

# Vistacore cookbooks
depends "common", "2.233.5"
depends "ehmp_synapse", "2.233.9"
depends "ehmp_oracle", "2.233.44"

#############################
# 3rd party
#############################
depends "logrotate", "=2.2.0"

#############################
# wrapper_cookbook
#############################
depends "jboss-eap_wrapper", "2.233.6"
depends "nerve_wrapper", "2.233.3"
