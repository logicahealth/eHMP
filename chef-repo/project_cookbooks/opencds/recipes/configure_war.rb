#
# Cookbook Name:: opencds
# Recipe:: configure_war
#

common_directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
  owner node['tomcat']['user']
  group node[:tomcat][:group]
  mode "0755"
end

template("#{node[:tomcat][:home]}/shared/classes/cds-engine-agent.properties") do
  source "cds-engine-agent.properties.erb"
  variables(
    lazy {
      {
        :cdsinvocation_host => "localhost:#{node[:synapse][:services][:cdsinvocation][:haproxy][:port]}",
        :opencds => node
      }
    }
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end


template "#{node['tomcat']['home']}/shared/classes/cds-engine-agent-log4j2.xml" do
  source "cds-engine-agent-log4j2.xml.erb"
  owner node['tomcat']['user']
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end
