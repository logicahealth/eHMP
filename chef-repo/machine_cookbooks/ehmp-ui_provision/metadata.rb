name             'ehmp-ui_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp-ui_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.75"

depends "machine", "2.0.40"

depends "ehmp-ui", "2.0.17"
depends "ehmp_balancer", "2.0.33"
