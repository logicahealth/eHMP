#
# Cookbook Name:: mocks
# Recipe:: glassfish
#
# Installs and configures glassfish
#

directory node[:mocks][:glassfish][:home] do
  owner node[:mocks][:glassfish][:user]
  group node[:mocks][:glassfish][:group]
  mode '0755'
  recursive true
  action :create
end

template '/etc/init.d/glassfish' do
  source 'glassfish.initd.erb'
  mode '0755'
  action :create
end

service 'glassfish' do
  action :enable
end

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:mocks][:glassfish][:source])}" do
  use_conditional_get true
  action :create
  source node[:mocks][:glassfish][:source]
  notifies :run, "execute[unzip glassfish]", :immediately
end

execute "unzip glassfish" do
  command "unzip #{Chef::Config[:file_cache_path]}/#{File.basename(node[:mocks][:glassfish][:source])} -d /usr/local"
  user node[:mocks][:glassfish][:user]
  group node[:mocks][:glassfish][:group]
  notifies :create, "template[#{node[:mocks][:glassfish][:home]}/glassfish/domains/domain1/config/domain.xml]", :immediately
  action :run
  only_if { (Dir.entries(node[:mocks][:glassfish][:home]) - %w{ . .. }).empty? }
end

sql_server_jar = File.basename(node[:mocks][:glassfish][:sql_jdbc_url])

# sqlserver driver
remote_file "#{Chef::Config[:file_cache_path]}/#{sql_server_jar}" do
  use_conditional_get true
  source node[:mocks][:glassfish][:sql_jdbc_url]
  action :create
end

file "#{node[:mocks][:glassfish][:home]}/glassfish/lib/#{sql_server_jar}" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/#{sql_server_jar}") }
  user node[:mocks][:glassfish][:user]
  action :create
end

glassfish_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_admin_password", node[:data_bag_string])["password"]
derbypool_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_domain_derbypool_password", node[:data_bag_string])["password"]
sqlserver_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_sqlserver_password", node[:data_bag_string])["password"]
mssql_ip = data_bag_item('servers', 'mssql').to_hash["ip"]

template "#{node[:mocks][:glassfish][:home]}/glassfish/domains/domain1/config/domain.xml" do
  source "domain.xml.erb"
  user node[:mocks][:glassfish][:user]
  group node[:mocks][:glassfish][:group]
  variables(
    :derbypool_password => derbypool_password, 
    :sqlserver_password => sqlserver_password, 
    :mssql_ip => mssql_ip
  )
  notifies :start, "service[glassfish]", :immediately
  action :nothing
end

bash "create glassfish4 password" do
  user node[:mocks][:glassfish][:user]
  code <<-EOF
    /usr/bin/expect -c 'spawn sh #{node[:mocks][:glassfish][:home]}/bin/asadmin change-admin-password --domain_name domain1
    expect "Enter admin user name*>"
    send "#{node[:mocks][:glassfish][:server_admin]}\r"
    expect "Enter the admin password> "
    send "\r"
    expect "Enter the new admin password> "
    send "#{glassfish_password}\r"
    expect "Enter the new admin password again> "
    send "#{glassfish_password}\r"
    expect eof'
  EOF
end

bash "enable remote admin console login" do
  user node[:mocks][:glassfish][:user]
  code <<-EOF
    /usr/bin/expect -c 'spawn sh #{node[:mocks][:glassfish][:home]}/bin/asadmin enable-secure-admin
    expect "Enter admin user name>"
    send "#{node[:mocks][:glassfish][:server_admin]}\r"
    expect "Enter admin password for user "admin"> "
    send "#{glassfish_password}\r"
    expect eof'
  EOF
end
