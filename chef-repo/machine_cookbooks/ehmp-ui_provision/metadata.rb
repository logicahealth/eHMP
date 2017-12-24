name             'ehmp-ui_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp-ui_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.47"

depends "machine", "2.233.22"

depends "ehmp-ui", "2.233.7"
depends "ehmp_balancer", "2.233.19"
