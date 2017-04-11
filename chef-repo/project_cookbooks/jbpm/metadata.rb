name             "jbpm"
maintainer       "Rachel Cindric"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures JBPM"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.85"

# Vistacore cookbooks
depends "common", "2.0.10"

# Wrapper cookbooks
depends "jboss-eap_wrapper", "2.0.5"
depends "oracle_wrapper", "2.0.10"
depends "oracle-xe_wrapper", "2.0.7"

# Third party cookbooks
depends "logrotate", "=1.9.1"
