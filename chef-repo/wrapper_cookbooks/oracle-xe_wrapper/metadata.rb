name             'oracle-xe_wrapper'
maintainer       'Vistacore - Team Milky Way'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures oracle-xe_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.5"


depends "common", "2.1.2"
depends 'oracle-xe', "=0.1.0"
depends 'swap', "=0.3.8"
