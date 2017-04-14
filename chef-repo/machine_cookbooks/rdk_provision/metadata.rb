name             'rdk_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures rdk_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.29"

depends "machine", "2.1.8"

depends "rdk", "2.1.16"
depends "jbpm", "2.1.11"
depends "ehmp_oracle", "2.1.4"
