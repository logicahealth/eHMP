#
# Cookbook Name:: opencds
# Recipe:: configure_war
#

directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
end

template("#{node[:tomcat][:home]}/shared/classes/cds-engine-agent.properties") do
  source "cds-engine-agent.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation => find_node_by_role("cdsinvocation", node[:stack]),
        :opencds => node
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end
