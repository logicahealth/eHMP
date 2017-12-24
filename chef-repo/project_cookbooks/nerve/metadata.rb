name 'nerve'
maintainer 'Vistacore'
maintainer_email 'vistacore@vistacore.us'
license 'all_rights'
description 'Installs/Configures nerve'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version '2.233.3'

supports 'centos'
supports 'redhat'

depends 'build-essential', '=2.2.2'
depends 'logrotate',       '=2.2.0'
