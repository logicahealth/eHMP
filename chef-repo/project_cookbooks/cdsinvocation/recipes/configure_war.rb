#
# Cookbook Name:: cdsinvocation
# Recipe:: configure_war
#

directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
end

begin
    crs = find_optional_node_by_role("crs", node[:stack]) || data_bag_item('servers', 'crs').to_hash
rescue
  Chef::Log.warn "No CRS machine found.  This is not required, so we will continue deployment without connecting to CRS."
  crs = nil
end

template("#{node[:tomcat][:home]}/shared/classes/cds-results-service.properties") do
  source "cds-results-service.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation => node,
        :cdsdb => find_node_by_role("cdsdb", node[:stack]),
        :rdks => find_multiple_nodes_by_role("resource_server", node[:stack]),
        :crs => crs
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
        :cdsinvocation => find_node_by_role("cdsinvocation", node[:stack]),
        :cdsdb => find_node_by_role("cdsdb", node[:stack])
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cds-metrics-service.war]", :delayed
end