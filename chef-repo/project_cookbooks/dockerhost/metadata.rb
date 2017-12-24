name             'dockerhost'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures dockerhost'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '2.233.2'

depends "docker", "2.9.8"
depends "awscli", "=1.1.1"
