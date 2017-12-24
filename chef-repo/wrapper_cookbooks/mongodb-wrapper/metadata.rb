name             'mongodb-wrapper'
maintainer       'accenture federal services'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures mongodb-wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.2"

depends 'runit_wrapper', "= 2.233.2"
depends 'mongodb', "= 0.16.3"