#
# Cookbook Name:: java_wrapper
# Recipe:: remove_older_jdks
#

bash 'remove_older_jdks' do
	code <<-EOH
	ls -d /usr/lib/jvm/jdk*[0-9_]/ | grep -v #{node['java']['jdk']['version']['to']['keep']} | xargs rm -rf 0
	EOH
	only_if "ls -d /usr/lib/jvm/jdk*[0-9_]/ | grep -vq #{node[:java][:jdk][:version][:to][:keep]}"
end