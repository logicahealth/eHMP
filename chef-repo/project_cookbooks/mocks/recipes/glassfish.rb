
# set timezone to EST; required for glassfish
execute "configure timezone, set to US/Eastern" do
  command "rm -f /etc/localtime;ln -s /usr/share/zoneinfo/US/Eastern /etc/localtime"
  action :run
end

gf_url = node[:mocks][:glassfish_url]
sqlserver_jar = node[:mocks][:sqlserver_jar_url]
gf_admin_username = node[:mocks][:admin_username]
gf_admin_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_admin_password", 'n25q2mp#h4')["password"]
gf_root_dir = node[:mocks][:root_dir]
gf_dir = node[:mocks][:dir]
gf_bash_script = "glassfish"

# fetch remote files

# glassfish4
remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(gf_url)}" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:glassfish_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create
  source gf_url
end

# sqlserver driver
remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(sqlserver_jar)}" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:sqlserver_jar_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create_if_missing
  source sqlserver_jar
end

# fetch cookbook (local) files
cookbook_file gf_bash_script do
  path "#{Chef::Config[:file_cache_path]}/#{gf_bash_script}"
  action :create_if_missing
end

execute "unzip glassfish" do
  not_if do
    File.directory?(gf_dir)
  end

  command "unzip #{Chef::Config[:file_cache_path]}/#{File.basename(gf_url)} -d #{gf_root_dir}"
  action :run
  notifies :create, "template[#{gf_dir}/glassfish/domains/domain1/config/domain.xml]", :immediately
end

execute "copy sqlserver-jar" do
  command "cp #{Chef::Config[:file_cache_path]}/#{File.basename(sqlserver_jar)} #{gf_dir}/glassfish/lib"
  action :run
end

derbypool_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_domain_derbypool_password", 'n25q2mp#h4')["password"]  
sqlserver_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_sqlserver_password", 'n25q2mp#h4')["password"]  
mssql_ip = data_bag_item('servers', 'mssql').to_hash["ip"]

template "#{gf_dir}/glassfish/domains/domain1/config/domain.xml" do
  action :nothing
  source "domain.xml.erb"
  variables(:derbypool_password => derbypool_password, :sqlserver_password => sqlserver_password, :mssql_ip => mssql_ip)
  notifies :run, "execute[initial start glassfish4]", :immediately
end

execute "initial start glassfish4" do
  command "sh #{gf_dir}/bin/asadmin restart-domain domain1"
  action :nothing
end

bash "create glassfish4 password" do
  user "root"
  code <<-EOF
    /usr/bin/expect -c 'spawn sh #{gf_dir}/bin/asadmin change-admin-password --domain_name domain1
    expect "Enter admin user name*>"
    send "#{gf_admin_username}\r"
    expect "Enter the admin password> "
    send "\r"
    expect "Enter the new admin password> "
    send "#{gf_admin_password}\r"
    expect "Enter the new admin password again> "
    send "#{gf_admin_password}\r"
    expect eof'
  EOF
end

bash "enable remote admin console login" do
  user "root"
  code <<-EOF
    /usr/bin/expect -c 'spawn sh #{gf_dir}/bin/asadmin enable-secure-admin
    expect "Enter admin user name>"
    send "#{gf_admin_username}\r"
    expect "Enter admin password for user "admin"> "
    send "#{gf_admin_password}\r"
    expect eof'
  EOF
end

execute "open up firewall ports 4848,80,443,3306" do
  command "iptables -I INPUT 5 -m state --state NEW -p tcp --dport 4848 -j ACCEPT;iptables -I INPUT 5 -m state --state NEW -p tcp --dport 80 -j ACCEPT;iptables -I INPUT 5 -m state --state NEW -p tcp --dport 443 -j ACCEPT;iptables -I INPUT 5 -m state --state NEW -p tcp --dport 3306 -j ACCEPT;/sbin/service iptables save"
  action :run
end

execute "copy glassfish bash script to init.d" do
  command "cd /etc/init.d;cp #{Chef::Config[:file_cache_path]}/#{gf_bash_script} .;chmod 755 glassfish"
  action :run
end

execute "add glassfish service" do
  command "cd /etc/init.d;chmod 755 glassfish;chkconfig --add glassfish;chkconfig --level 234 glassfish on"
  action :run
end
