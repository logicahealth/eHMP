name             'tomcat'
maintainer       'team-milkyway'
maintainer_email 'team-milkyway.vistacore.us'
license          'All rights reserved'
description      'Installs/Configures tomcat_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.3"

#############################
# 3rd party
#############################
depends "ark", "=0.9.0"
depends "logrotate", "=1.9.1"