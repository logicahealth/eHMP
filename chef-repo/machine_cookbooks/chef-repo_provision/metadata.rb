name             'chef-repo_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures chef-repo_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.81"

depends "machine", "2.0.40"

depends "workstation", "2.0.54"
depends "jenkins_wrapper", "2.0.7"
