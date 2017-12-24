file "#{node[:fetch_server][:home_dir]}/config/vvs_ssl_client_crt_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", 'vvs_ssl_client_crt_db', node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end

file "#{node[:fetch_server][:home_dir]}/config/vvs_ssl_client_key_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", 'vvs_ssl_client_key_db', node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end

file "#{node[:fetch_server][:home_dir]}/config/vvs_ssl_client_cer_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", "vvs_ssl_client_cer_db", node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end

file "#{node[:fetch_server][:home_dir]}/config/pps_ssl_client_crt_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", 'pps_ssl_client_crt_db', node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end

file "#{node[:fetch_server][:home_dir]}/config/pps_ssl_client_key_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", 'pps_ssl_client_key_db', node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end

file "#{node[:fetch_server][:home_dir]}/config/pps_ssl_client_cer_db" do
  action :create
  content lazy {
    Chef::EncryptedDataBagItem.load("video_visits", 'pps_ssl_client_cer_db', node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end
