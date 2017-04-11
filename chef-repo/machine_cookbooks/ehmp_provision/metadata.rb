name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.71"

depends "machine", "2.0.13"

depends "jds", "2.0.11"
depends "vx_solr", "2.0.8"
depends "mocks", "2.0.11"
depends "vista", "2.0.23"
depends "vxsync", "2.0.19"
