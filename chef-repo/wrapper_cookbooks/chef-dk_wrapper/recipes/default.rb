#
# Cookbook Name:: chef-dk_wrapper
# Recipe:: default
#

include_recipe "chef-dk"

link "/usr/bin/ruby" do
  to "/opt/chefdk/embedded/bin/ruby"
  action :nothing
end

link "/usr/bin/rake" do
  to "/opt/chefdk/embedded/bin/rake"
  action :nothing
end

link "/usr/bin/gem" do
  to "/opt/chefdk/embedded/bin/gem"
  action :nothing
end

link "/usr/bin/bundle" do
  to "/opt/chefdk/embedded/bin/bundle"
  action :nothing
end

link "/usr/bin/chef-client" do
  to "/opt/chefdk/bin/chef-client"
end

execute "set_embedded_links" do
	command "ls"
	notifies :create, "link[/usr/bin/ruby]", :delayed
	notifies :create, "link[/usr/bin/rake]", :delayed
	notifies :create, "link[/usr/bin/gem]", :delayed
	notifies :create, "link[/usr/bin/bundle]", :delayed
end
