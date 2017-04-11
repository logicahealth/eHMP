name             "jbpm"
maintainer       "Rachel Cindric"
maintainer_email "rachel.cindric@agilex.com"
license          "All rights reserved"
description      "Installs/Configures JBPM"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.20"

depends 'mysql'
depends "jboss-eap_wrapper", "2.0.2"
depends "common", "2.0.3"
