name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.32"

depends "machine", "2.1.8"

depends "jds", "2.1.7"
depends "vx_solr", "2.1.7"
depends "mocks", "2.1.5"
depends "vista", "2.1.6"
depends "vxsync", "2.1.11"
depends "crs", "2.1.1"
depends "asu", "2.1.3"
depends "zookeeper", "2.1.0"