#
# Cookbook Name:: workstation
# Recipe:: correct_package_ownership
#

execute "correct ownership of .npm" do
  command "chown -R #{node[:workstation][:user]} #{node[:workstation][:user_home]}/.npm"
end

execute "correct ownership of gem home" do
  command "chown -R #{node[:workstation][:user]} #{node[:workstation][:osx_gem_dir]}"
end
