#
# Cookbook Name:: cdsinvocation
# Recipe:: configure_war
#

directory "#{node[:tomcat][:home]}/shared/classes/certs" do
  recursive true
end

directory "#{node[:tomcat][:home]}/shared/lib" do
  recursive true
end

begin
    crs = find_optional_node_by_role("crs", node[:stack]) || data_bag_item('servers', 'crs').to_hash
rescue
  Chef::Log.warn "No CRS machine found.  This is not required, so we will continue deployment without connecting to CRS."
  crs = nil
end

mongodb_creds = Chef::EncryptedDataBagItem.load("credentials", "mongodb", node[:data_bag_string])
cdsdb = find_optional_node_by_role("cdsdb", node[:stack])


template("#{node[:tomcat][:home]}/shared/classes/cds-results-service.properties") do
  source "cds-results-service.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation => node,
        :cdsdb => cdsdb,
        :rdks => find_multiple_nodes_by_role("resource_server", node[:stack]),
        :crs => crs,
        :mongodb_creds => mongodb_creds,
        :dev_cdsi => node[:cdsinvocation][:deploy_intents]
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cds-results-service.war]", :delayed
end

template("#{node[:tomcat][:home]}/shared/classes/cds-metrics-service.properties") do
  source "cds-metrics-service.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation => node,
        :cdsdb => cdsdb,
        :mongodb_creds => mongodb_creds
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cds-metrics-service.war]", :delayed
end

template "#{node['tomcat']['home']}/shared/classes/cds-results-log4j2.xml" do
  source "cds-results-log4j2.xml.erb"
  owner node['tomcat']['user']
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cds-results-service.war]", :delayed
end

template "#{node['tomcat']['home']}/shared/classes/cds-metrics-log4j2.xml" do
  source "cds-metrics-log4j2.xml.erb"
  owner node['tomcat']['user']
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cds-results-service.war]", :delayed
end
