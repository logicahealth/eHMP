name             'ehmp_oracle'
maintainer       "vistacore"
maintainer_email "vistacore@vistacore.us"
license          'All rights reserved'
description      'Installs/Configures oracle-xe_wrapper or oracle_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))

version          "2.1.6"

depends "oracle_wrapper", "2.1.12"
depends "oracle-xe_wrapper", "2.1.5"

