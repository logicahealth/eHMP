name             'ehmp_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.156"

depends "machine", "2.233.22"

depends "jds", "2.233.36"
depends "vx_solr", "2.233.25"
depends "mocks", "2.233.17"
depends "vista", "2.233.18"
depends "vxsync", "2.233.60"
depends "crs", "2.233.8"
depends "asu", "2.233.20"
depends "zookeeper", "2.233.11"
depends "beanstalk", "2.233.6"
depends "vxsync_client", "2.233.14"
depends "vxsync_vista", "2.233.10"
depends "osync", "2.233.7"
depends "soap_handler", "2.233.5"
