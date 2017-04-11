name             'cds_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures cds_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.21"

depends "machine", "2.0.13"

depends "cdsdb", "2.0.2"
depends "cdsinvocation", "2.0.11"
depends "cdsdashboard", "2.0.5"
depends "opencds", "2.0.7"
