name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.199"

depends "machine", "2.0.29"

depends "jds", "2.0.28"
depends "vx_solr", "2.0.23"
depends "mocks", "2.0.35"
depends "vista", "2.0.56"
depends "vxsync", "2.0.82"
depends "crs", "2.0.4"
depends "asu", "2.0.7"
