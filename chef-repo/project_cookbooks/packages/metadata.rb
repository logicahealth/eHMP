name             'packages'
maintainer       'Agilex'
maintainer_email 'mike.dial@agilex.com'
license          'All rights reserved'
description      'disables yum and rubygems defaults'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.4"

depends "yum_wrapper", "2.0.3"
depends "rubygems_wrapper", "2.0.3"
