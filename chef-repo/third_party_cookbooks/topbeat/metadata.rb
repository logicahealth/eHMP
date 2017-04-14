name 'topbeat'
maintainer 'Virender Khatri'
maintainer_email 'vir.khatri@gmail.com'
license 'Apache 2.0'
description 'Installs/Configures topbeat'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version '0.1.2'

source_url 'https://github.com/vkhatri/chef-topbeat' if respond_to?(:source_url)
issues_url 'https://github.com/vkhatri/chef-topbeat/issues' if respond_to?(:issues_url)

depends 'yum'
depends 'apt'

%w(ubuntu centos amazon redhat fedora).each do |os|
  supports os
end
