name             'chef-repo_provision'
maintainer       'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures chef-repo_provision'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.68"

depends "machine", "2.233.22"

depends "workstation", "2.233.51"
depends "jenkins_wrapper", "2.233.6"
