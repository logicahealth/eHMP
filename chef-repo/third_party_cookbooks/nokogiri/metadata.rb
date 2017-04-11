name             'nokogiri'
maintainer       'Greg Hellings'
maintainer_email 'greg@thesub.net'
license          'Apache V2'
description      'Installs/Configures nokogiri'
long_description 'Installs/Configures nokogiri'
version          '0.1.4'

depends          'build-essential'
depends          'libxml2'
depends          'ruby_install'
     
%w{ amazon redhat ubuntu centos}.each do |distro|
	supports distro
end


