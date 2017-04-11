name             'ehmp-ui_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp-ui_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.14"

depends "machine", "2.1.8"

depends "ehmp-ui", "2.1.2"
depends "ehmp_balancer", "2.1.4"
