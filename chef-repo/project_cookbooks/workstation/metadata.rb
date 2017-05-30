name						 "workstation"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Configures development workstation"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.1.30"

supports "mac_os_x"
supports "centos"

depends "common", "2.1.2"

#############################
# 3rd party
#############################
depends "git", "=4.1.0"
depends "homebrew", "=1.13.0"
depends "build-essential", "=2.2.2"
depends "chrome", "=1.0.12"
depends "awscli", "=1.1.1"
depends "jenkins", "=4.1.2"
depends "berks-api", "2.1.3"

#############################
# wrapper_cookbook
#############################
depends "virtualbox_wrapper", "2.1.2"
depends "vagrant_wrapper", "2.1.3"
depends "java_wrapper", "2.1.2"
depends "nodejs_wrapper", "2.1.0"
depends "chef-dk_wrapper", "2.1.1"
depends "gradle_wrapper", "2.1.0"
depends "phantomjs_wrapper", "2.1.0"
depends "nokogiri_wrapper", "2.1.0"
depends "xvfb_wrapper", "2.1.0"
depends "git_wrapper", "2.1.2"
depends "oracle_wrapper", "2.1.12"
depends "newrelic_wrapper", "2.1.0"
