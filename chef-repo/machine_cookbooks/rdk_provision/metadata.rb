name             'rdk_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures rdk_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.79"

depends "machine", "2.1.9"

depends "rdk", "2.1.46"
depends "jbpm", "2.1.33"
depends "ehmp_oracle", "2.1.6"
depends "postfix_wrapper", "2.1.2"