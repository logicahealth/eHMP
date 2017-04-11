#
# Cookbook Name:: cdsdashboard
# Recipe:: configure_war
#

directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
end

template("#{node[:tomcat][:home]}/shared/classes/cds-dashboard.properties") do
  source "cds-dashboard.properties.erb"
  variables(
    lazy {
      {
        :rdks => find_multiple_nodes_by_role("resource_server", node[:stack])
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end
