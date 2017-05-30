name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.50"

depends "machine", "2.1.9"

depends "jds", "2.1.10"
depends "vx_solr", "2.1.11"
depends "mocks", "2.1.7"
depends "vista", "2.1.8"
depends "vxsync", "2.1.21"
depends "crs", "2.1.2"
depends "asu", "2.1.8"
depends "zookeeper", "2.1.4"