name             'jenkins_wrapper'
maintainer       'Accenture Federal Services'
maintainer_email 'team-milkyway@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures jenkins_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.6"

depends "jenkins", "5.0.1"
depends "java_wrapper", "2.233.3"
