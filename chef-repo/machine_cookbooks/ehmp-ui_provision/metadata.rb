name             'ehmp-ui_provision'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures ehmp-ui_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.58"

depends "machine", "2.0.29"

########################################################################
# This section is adding all provision cookbooks as dependencies in
# order to get the list of all artifacts and their versions for the
# manifest json file
########################################################################
depends "ehmp_provision", "~>2.0.0"
depends "rdk_provision", "~>2.0.0"
depends "cds_provision", "~>2.0.0"
########################################################################

depends "ehmp-ui", "2.0.15"
depends "ehmp_balancer", "2.0.28"
