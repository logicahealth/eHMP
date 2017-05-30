name             "jbpm"
maintainer       "Rachel Cindric"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures JBPM"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.33"

# Vistacore cookbooks
depends "common", "2.1.2"
depends "ehmp_synapse", "2.1.1"

#############################
# 3rd party
#############################
depends "logrotate", "=1.9.1"

#############################
# wrapper_cookbook
#############################
depends "jboss-eap_wrapper", "2.1.4"
depends "oracle_wrapper", "2.1.12"
depends "oracle-xe_wrapper", "2.1.5"
