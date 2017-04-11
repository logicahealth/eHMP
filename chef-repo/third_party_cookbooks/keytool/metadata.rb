name             'keytool'
maintainer       'Jean-Francois Theroux'
maintainer_email 'me@failshell.io'
license          'Apache 2.0'
description      'Installs/Configures keytool'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '0.7.0'

%w(
  redhat
  centos
  debian
  ubuntu
  suse
).each do |os|
  supports os
end
