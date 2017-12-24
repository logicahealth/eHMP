name             'zookeeper'
maintainer       'Vistacore - Team Milky Way'
maintainer_email 'team-milkyway@vistacore.us'
license          'MIT'
description      'Installs the solr search engine.'
long_description 'See README.md'
version          "2.233.11"

supports 'redhat'
supports 'centos'

depends "common", "2.233.5"

#############################
# wrapper_cookbook
#############################
depends "zookeeper-cluster_wrapper", "2.233.4"
