name             'rdk_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures rdk_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.205"

depends "machine", "2.233.22"

depends "fetch_server", "2.233.26"
depends "pick_list", "2.233.24"
depends "write_back", "2.233.24"
depends "activity_handler", "2.233.19"
depends "jbpm", "2.233.103"
depends "ehmp_oracle", "2.233.44"
depends "postfix_wrapper", "2.233.2"
