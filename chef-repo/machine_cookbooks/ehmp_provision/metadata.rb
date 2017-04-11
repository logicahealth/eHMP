name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.269"

depends "machine", "2.0.40"

depends "jds", "2.0.45"
depends "vx_solr", "2.0.30"
depends "mocks", "2.0.43"
depends "vista", "2.0.73"
depends "vxsync", "2.0.105"
depends "crs", "2.0.5"
depends "asu", "2.0.11"
