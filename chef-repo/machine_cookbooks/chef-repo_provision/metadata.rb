name             'chef-repo_provision'
maintainer       'Vistacore'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures chef-repo_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.21"

depends "machine", "2.0.13"

depends "workstation", "2.0.15"
depends "packages", "2.0.2"
depends "role_cookbook", "2.0.4"
