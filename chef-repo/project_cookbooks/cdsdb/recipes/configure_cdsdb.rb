#
# Cookbook Name:: cdsdb
# Recipe:: configure_cdsdb
#

cookbook_file "/etc/mongodb.conf" do
	source "mongod.conf"
	notifies :run, "execute[restart mongod]", :immediately
end

execute "restart mongod" do
	command "service mongod restart"
end
