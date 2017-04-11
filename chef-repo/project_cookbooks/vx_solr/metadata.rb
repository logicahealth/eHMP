name             'vx_solr'
maintainer       'Vistacore - Team Milky Way'
maintainer_email 'team-milkyway@vistacore.us'
license          'MIT'
description      'Installs the solr search engine.'
long_description 'See README.md'
version          "2.0.23"

supports 'redhat'
supports 'centos'

depends "common", "2.0.10"

#############################
# 3rd party
#############################

#############################
# wrapper_cookbook
#############################
depends "solr_wrapper", "2.0.5"
depends "zookeeper-cluster_wrapper", "2.0.2"
