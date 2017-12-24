#
# Cookbook:: ehmp_balancer
# Provider:: import_certs
#

use_inline_resources

action :execute do

	data_bag_item('certs', new_resource.data_bag_item, node[:data_bag_string])['certs'].each do |name, config|

		content = config['content']
		trustargs = config['trustargs']

		file "#{node[:ehmp_balancer][:ssl_dir]}/#{name}.crt" do
			mode 644
			owner node[:apache][:user]
			group node[:apache][:group]
			content content.join("\n")
		end

		execute "add_#{name}.crt_to_trust_store" do
		  command "certutil -A -d #{node[:ehmp_balancer][:ssl_dir]} -n '#{name}' -t '#{trustargs}' -a -i #{node[:ehmp_balancer][:ssl_dir]}/#{name}.crt -f #{new_resource.password_file}"
		  action :run
		end

	end

end
