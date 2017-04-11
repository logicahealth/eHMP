name             'solr_wrapper'
maintainer       'Vistacore - Team Milky Way'
maintainer_email 'team-milkyway@vistacore.us'
license          'MIT'
description      'Installs the solr search engine.'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.2"

depends "java_wrapper", "2.0.2"
depends 'solr', "=0.5.0"
