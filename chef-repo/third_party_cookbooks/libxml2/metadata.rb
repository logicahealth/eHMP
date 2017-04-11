name             'libxml2'
maintainer       'Greg Hellings'
maintainer_email 'greg@thesub.net'
license          'Apache V2'
description      'Installs/Configures libxml2'
long_description 'Installs/Configures libxml2'
version          '0.1.1'

depends          'yum'
depends          'apt'

%w{ amazon redhat ubuntu centos}.each do |distro|
	supports distro
end
