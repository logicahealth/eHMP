name             "adk"
maintainer       "Agilex"
maintainer_email "jay.flowers@agilex.com"
license          "All rights reserved"
description      "Installs/Configures adk"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.2"

supports "windows"
supports "mac_os_x"
supports "centos"

depends "apache2", "=3.0.1"
