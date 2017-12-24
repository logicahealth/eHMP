name             'solr_wrapper'
maintainer       'Vistacore - Team Milky Way'
maintainer_email 'vistacore@vistacore.us'
license          'MIT'
description      'Installs the solr search engine.'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.5"

depends "java_wrapper", "2.233.3"
depends 'solr', "=0.5.0"
