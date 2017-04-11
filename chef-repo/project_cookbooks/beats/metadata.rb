name             'beats'
maintainer       'vistacore'
maintainer_email 'devops-support@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures beats'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '2.0.3'

#############################
# 3rd party
#############################

#############################
# wrapper_cookbook
#############################
depends 'filebeat_wrapper', '=2.0.3'
depends 'topbeat_wrapper', '=2.0.2'
