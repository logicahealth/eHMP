name             "communications_cli"
maintainer       "AFS"
maintainer_email "need.email.group.for.chef@vistacore.us"
license          "APLv2"
description      "Installs communications_cli scripts"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.233.15"

supports "centos"

depends "common", "2.233.5"

#############################
# wrapper_cookbook
#############################
depends "nodejs_wrapper", "2.233.2"
