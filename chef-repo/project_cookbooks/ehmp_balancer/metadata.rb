name             "ehmp_balancer"
maintainer       "Agilex"
maintainer_email "shan.jiang@agilex.com"
license          "All rights reserved"
description      "Installs/Configures ehmp proxy balancer"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.6"

depends "common", "2.0.3"

supports "windows"
supports "mac_os_x"
supports "centos"

depends "apache2", "=3.0.1"
depends "apache2_wrapper", "2.0.2"
