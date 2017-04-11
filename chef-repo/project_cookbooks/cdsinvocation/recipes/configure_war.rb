#
# Cookbook Name:: cdsinvocation
# Recipe:: configure_war
#

directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
end

template("#{node[:tomcat][:home]}/shared/classes/cds-results-service.properties") do
  source "cds-results-service.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation => node,
        :cdsdb => find_node_by_role("cdsdb", node[:stack]),
        :rdks => find_multiple_nodes_by_role("resource_server", node[:stack])
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
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
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end
