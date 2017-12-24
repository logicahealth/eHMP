
yum_vistacore = data_bag_item('servers', 'yum-vistacore').to_hash
node.default['yum_wrapper']['vistacore']['baseurl'] = yum_vistacore['fqdn']


yum_repository "#{node['yum_wrapper']['vistacore']['name']}-Base" do
  description "#{node['yum_wrapper']['vistacore']['name']} Base"
  baseurl "#{node['yum_wrapper']['vistacore']['baseurl']}/#{node['yum_wrapper']['vistacore']['reponame']}/$releasever/os/$basearch/"
  gpgkey "#{node['yum_wrapper']['vistacore']['gpgkey']}"
  enabled true
  action :create
end

yum_repository "#{node['yum_wrapper']['vistacore']['name']}-Updates" do
  description "#{node['yum_wrapper']['vistacore']['name']} Updates"
  baseurl "#{node['yum_wrapper']['vistacore']['baseurl']}/#{node['yum_wrapper']['vistacore']['reponame']}/$releasever/updates/$basearch/"
  gpgkey "#{node['yum_wrapper']['vistacore']['gpgkey']}"
  enabled true
  action :create
end

yum_repository "#{node['yum_wrapper']['vistacore']['name']}-Extras" do
  description "#{node['yum_wrapper']['vistacore']['name']} Extras"
  baseurl "#{node['yum_wrapper']['vistacore']['baseurl']}/#{node['yum_wrapper']['vistacore']['reponame']}/$releasever/extras/$basearch/"
  gpgkey "#{node['yum_wrapper']['vistacore']['gpgkey']}"
  enabled true
  action :create
end

execute "execute_yum_update_to_update_packages" do
  command 'yum update -y'
end
