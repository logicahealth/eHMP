name             'cds_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures cds_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.55"

depends "machine", "2.233.22"

depends "cdsdb", "2.233.6"
depends "cdsinvocation", "2.233.28"
depends "cdsdashboard", "2.233.28"
depends "opencds", "2.233.16"
