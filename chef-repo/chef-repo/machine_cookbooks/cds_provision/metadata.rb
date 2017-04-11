name             'cds_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures cds_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.19"

depends "machine", "2.1.8"

depends "cdsdb", "2.1.2"
depends "cdsinvocation", "2.1.6"
depends "cdsdashboard", "2.1.8"
depends "opencds", "2.1.4"
