#
# Cookbook Name:: oracle_wrapper
# Recipe:: configure_tls
#
# This recipe will need to be updated to also include the allowTLSOnly=true attribute once 
# we upgrade to Oracle v12.  The limitation to allow only strong cipher suites should still be 
# included in that update.
#

ssl_cipher_prop = "#SSLCipherSuites=\n"
emd_file_loc = "#{node[:oracle][:rdbms][:ora_home]}/#{node[:machinename]}_#{node[:oracle_wrapper][:dbs][0]}/sysman/config/emd.properties"

execute "oracle emd configuration" do
  command "su - oracle -c \"sed -i 's/#SSLCipherSuites=/SSLCipherSuites=#{node[:oracle_wrapper][:cipher_suites]}/g' " + emd_file_loc + "\""
  notifies :restart, 'service[restart oracle emconfig]', :immediately
  only_if do 
  	Chef::Resource::RubyBlock.send(:include, Chef::Mixin::ShellOut)
	grep_command_out = shell_out("grep -F \"" + ssl_cipher_prop + "\" " + emd_file_loc)
	if (node[:oracle_wrapper][:cipher_suites] != nil) && (grep_command_out.stdout == ssl_cipher_prop)
		true
	else
		false
	end		
  end
end

service 'restart oracle emconfig' do
	service_name 'oracle'
	action :nothing
end