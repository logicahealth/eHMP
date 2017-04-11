#
# Cookbook Name:: mongodb-wrapper
# Recipe:: default
#

unless node[:mongodb][:install_method] == "internal_yum" || node[:mongodb][:package_version].split(".")[0].to_i < 3
  case node['platform_family']
  when 'rhel', 'fedora'
    yum_repository 'mongodb-3' do
      description 'mongodb 3.0 RPM Repository'
      baseurl "https://repo.mongodb.org/yum/redhat/6/mongodb-org/3.0/#{node['kernel']['machine']  =~ /x86_64/ ? 'x86_64' : 'i686'}"
      action :create
      gpgcheck false
      enabled true
    end
  end

  node.normal[:mongodb][:install_method] = "mongodb-3"
end
