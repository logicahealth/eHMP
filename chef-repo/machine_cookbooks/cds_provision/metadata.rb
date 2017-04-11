name             'cds_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures cds_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.57"

depends "machine", "2.0.29"

depends "cdsdb", "2.0.5"
depends "cdsinvocation", "2.0.25"
depends "cdsdashboard", "2.0.17"
depends "opencds", "2.0.20"
