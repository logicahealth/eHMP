name             'jenkins_wrapper'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures jenkins_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.3"

depends "jenkins", "4.1.2"
depends "java_wrapper", "2.1.1"
