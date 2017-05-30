name             'cds_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures cds_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.25"

depends "machine", "2.1.9"

depends "cdsdb", "2.1.3"
depends "cdsinvocation", "2.1.11"
depends "cdsdashboard", "2.1.12"
depends "opencds", "2.1.7"
