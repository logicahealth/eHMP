
execute "remove vagrant home" do
  command "rm -rf #{node[:vagrant_wrapper][:home]}"
  action :run
  only_if {Dir.exists?(node[:vagrant_wrapper][:home])}
end

#Forget vagrant id for upgrade
execute 'forget vagrant id' do
  command "sudo pkgutil --forget 'com.vagrant.vagrant'"
  action :run
end