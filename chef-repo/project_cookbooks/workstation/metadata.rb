name						 "workstation"
maintainer       "Vistacore"
maintainer_email "vistacore@vistacore.us"
license          "All rights reserved"
description      "Configures development workstation"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.42"

supports "mac_os_x"
supports "centos"

depends "common", "2.0.10"

#############################
# 3rd party
#############################
depends "git", "=4.1.0"
depends "homebrew", "=1.13.0"
depends "build-essential", "=2.2.2"
depends "chrome", "=1.0.12"
depends "awscli", "=1.1.1"
depends "jenkins", "=2.4.1"

#############################
# wrapper_cookbook
#############################
depends "virtualbox_wrapper", "2.0.4"
depends "vagrant_wrapper", "2.0.4"
depends "java_wrapper", "2.0.5"
depends "nodejs_wrapper", "2.0.3"
depends "chef-dk_wrapper", "2.0.4"
depends "gradle_wrapper", "2.0.4"
depends "phantomjs_wrapper", "2.0.4"
depends "nokogiri_wrapper", "2.0.4"
depends "xvfb_wrapper", "2.0.3"
depends "git_wrapper", "2.0.3"
depends "oracle_wrapper", "2.0.10"
depends "newrelic_wrapper", "2.0.2"
