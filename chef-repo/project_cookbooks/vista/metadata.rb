name             "vista"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Installs/Configures VistA"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.56"

supports "centos"
supports "windows"

depends "common", "2.0.10"

depends "selinux", "=0.9.0"
depends "apache2", "=3.0.1"
depends "simple_iptables", "=0.7.1"
depends "windows", "=1.37.0"
