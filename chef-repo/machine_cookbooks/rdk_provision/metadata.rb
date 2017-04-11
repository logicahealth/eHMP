name             'rdk_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures rdk_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.51"

depends "machine", "2.0.13"

depends "rdk", "2.0.21"
depends "jbpm", "2.0.20"
depends "oracle-xe_wrapper", "2.0.1"
depends "oracle_wrapper", "2.0.3"
