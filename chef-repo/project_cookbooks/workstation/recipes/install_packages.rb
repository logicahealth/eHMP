#
# Cookbook Name:: workstation
# Recipe:: install_packages
#

node[:workstation][:install_packages][:npm_packages].each do |pkg_name, pkg_version|
  execute "install npm package #{pkg_name}@#{pkg_version}" do
    command "npm install -global #{pkg_name}@#{pkg_version}"
    not_if "npm -g ls 2> /dev/null | grep #{pkg_name}@#{pkg_version}"
  end
end

node[:workstation][:install_packages][:yum_packages].each do |pkg_name|
  yum_package pkg_name
end

node[:workstation][:install_packages][:gem_packages].each do |pkg_name, pkg_versions|
  Chef::Log.debug('Installing gems...')
  pkg_versions.each do |vers|
    Chef::Log.debug("Installing #{pkg_name} - #{vers}")
    execute "install gem #{pkg_name}" do
      command "gem install #{pkg_name} -v #{vers} --no-user-install --install-dir #{node[:workstation][:rhel_gem_dir]}"
      not_if "gem list #{pkg_name} -i -v #{vers}"
    end
  end
end
