name             'jboss-eap_wrapper'
maintainer       'Rachel Cindric'
maintainer_email 'rachel.cindric@agilex.com'
license          'All rights reserved'
description      'Installs/Configures jboss-eap_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.2"

depends "java_wrapper", "2.0.2"
depends 'jboss-eap', "=2.1.1"
