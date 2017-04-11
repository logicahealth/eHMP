name						 "workstation"
maintainer       "Agilex"
maintainer_email "mike.dial@agilex.com"
license          "All rights reserved"
description      "Configures development workstation"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.15"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.3"

#############################
# 3rd party
#############################
depends "git", "=4.1.0"
depends "homebrew", "=1.13.0"
depends "build-essential", "=2.2.2"
depends "chrome", "=1.0.12"
depends "awscli", "=1.1.1"
depends "jenkins", "=2.3.1"

#############################
# wrapper_cookbook
#############################
depends "virtualbox_wrapper", "2.0.3"
depends "vagrant_wrapper", "2.0.3"
depends "java_wrapper", "2.0.2"
depends "nodejs_wrapper", "2.0.2"
depends "chef-dk_wrapper", "2.0.2"
depends "gradle_wrapper", "2.0.3"
depends "phantomjs_wrapper", "2.0.3"
depends "nokogiri_wrapper", "2.0.2"
depends "xvfb_wrapper", "2.0.2"
depends "firefox_wrapper", "2.0.2"
depends "git_wrapper", "2.0.2"
depends "oracle_wrapper", "2.0.3"
