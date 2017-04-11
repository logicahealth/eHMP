#
# Cookbook Name:: vista
# Recipe:: cache
#

yum_package node[:vista][:cache_package] do
  version node[:vista][:cache_version]
  arch node[:vista][:cache_arch]
  source "/opt/private_licenses/cache_server/" + node[:vista][:cache_package] + "-" + node[:vista][:cache_version] + "." + node[:vista][:cache_arch] + ".rpm"
  not_if { node[:vista][:no_reset] }
end

service "cache" do
  action [:enable, :start]
  not_if { node[:vista][:no_reset] }
end

directory node[:vista][:vista_dir] do
  owner node[:vista][:cache_user]
  group node[:vista][:cache_user]
  mode "0750"
  action :create
  not_if { node[:vista][:no_reset] }
end

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:cache][:source])}" do
  owner node[:vista][:cache_user]
  group node[:vista][:cache_user]
  mode "0640"
  source node[:vista][:cache][:source]
  use_conditional_get true
  not_if { node[:vista][:no_reset] }
end

#Load site-specific station numbers
vista_station = data_bag_item('vista_sites','vista_station_number').to_hash

template "#{Chef::Config[:file_cache_path]}/zstu.ro" do
  owner "root"
  group "root"
  mode "0750"
  source "zstu.ro.erb"
  notifies :execute, 'vista_ro_install[zstu.ro]', :immediately
  not_if { node[:vista][:no_reset] }
end

execute "unzip_vista" do
  cwd node[:vista][:vista_dir]
  command "unzip -o -q #{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:cache][:source])} -d #{node[:vista][:vista_dir]}/"
  action :run
  not_if { node[:vista][:no_reset] }
end

service "cache" do
  action :stop
end

cookbook_file "cache.cpf" do
  path "/usr/cachesys/cache.cpf"
  action :create
end

cookbook_file "cache.key" do
  path "/usr/cachesys/mgr/cache.key"
  action :create
end

# make ownership cacheserver
execute "correct_ownership_of_cache_home" do
  command "chown -R #{node[:vista][:cache_user]}:#{node[:vista][:cache_user]} #{node[:vista][:cache_dir]}/*"
  action :run
end

service "cache" do
  action :start
end






# Add the XCODEL ZBLXEC RPC for modifying test data
# and Add the FILE Z RPC DIE and UPDATE Z RPC DIE RPCs for modifying test data
vista_install_distribution "cache_patches" do
  patch_list "cache_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
end

service "cache" do
  action :stop
end

service "cache" do
  action :start
end

if node[:vista].attribute?(:domain_name)
  vista_mumps_block "update_site_id:#{node[:vista][:domain_name]}" do
    namespace "VISTA"
    command [
      "S $P(^DIC(4.2,400,0),\"^\",1)=\"#{node[:vista][:domain_name]}\"",
      "S $P(^DIC(4.2,400,0),\"^\",13)=\"#{node[:vista][:station_number]}\""
    ]
    log node[:vista][:chef_log]
    not_if { node[:vista][:no_reset] }
  end

  vista_reindex_file "reindex_domain_file" do
    file "4.2"
    log node[:vista][:chef_log]
    not_if { node[:vista][:no_reset] }
  end
end

vista_mumps_block "Update Primary HFS directory" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S DR="320/////tmp",DIE="^XTV(8989.3,",DA=1',
    'D ^DIE'
  ]
end

vista_mumps_block "Add New Kodak Institution" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    'K FDA,IENA,ERR',
    'S FDA(4,"+1,",.01)="CAMP BEE"',
    "S FDA(4,\"+1,\",.99)=#{vista_station['kodak']}",
    'S FDA(4,"+1,",60)=455',
    "S FDA(4,\"+1,\",99)=#{vista_station['kodak']}",
    'S FDA(4.014,"+3,+1,",.01)=1',
    'S FDA(4.014,"+3,+1,",1)=17010',
    "S IENA(1)=#{vista_station['kodak']}",
    'D UPDATE^DIE(,"FDA","IENA","ERR")',
    'ZW IENA,ERR',
    'W $S($D(ERR):"Error creating new Institution",1:"New Kodak Institution Created")'
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Add New VHIC Institution" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    'K FDA,IENA,ERR',
    'S FDA(4,"+1,",.01)="VHIC"',
    #"S FDA(4,\"+1,\",.99)=\"#{vista_station['vhic']}\"",
    'S FDA(4,"+1,",60)=455',
    "S FDA(4,\"+1,\",99)=\"#{vista_station['vhic']}\"",
    'S FDA(4.014,"+3,+1,",.01)=1',
    'S FDA(4.014,"+3,+1,",1)=17010',
    "S IENA(1)=+#{vista_station['vhic']}",
    'D UPDATE^DIE(,"FDA","IENA","ERR")',
    'ZW IENA,ERR',
    'W $S($D(ERR):"Error creating new Institution",1:"New VHIC Institution Created")'
  ]
  log node[:vista][:chef_log]
end

if node[:vista].attribute?(:station_number) and node[:vista][:station_number] != "500"
  vista_mumps_block "Update Station Number:#{node[:vista][:station_number]}" do
    duz       1
    programmer_mode true
    namespace "VISTA"
    command [
      'S XUMF=1',
      'K FDA',
      "S FDA(1,4,\"#{node[:vista][:station_number]},\",99)=\"#{node[:vista][:station_number]}\"",
      "S FDA(1,389.9,\"1,\",.04)=\"#{node[:vista][:station_number]}\"",
      "S FDA(1,40.8,\"1,\",.07)=\"#{node[:vista][:station_number]}\"",
      "S FDA(1,40.8,\"1,\",1)=\"#{node[:vista][:station_number]}A\"",
      'D FILE^DIE(,"FDA(1)")',
      'K FDA',
      'W $$SITE^VASITE',
      "S $P(^XTV(8989.3,1,\"XUS\"),U,17)=#{node[:vista][:station_number]}",
      "S I=0 F  S I=$O(^SC(I)) Q:'+I  S:$P(^SC(I,0),U,4)=500 $P(^SC(I,0),U,4)=#{node[:vista][:station_number]}",
      "S I=0 F  S I=$O(^AUPNPROB(I)) Q:'+I  S:$P(^AUPNPROB(I,0),U,6)=500 $P(^AUPNPROB(I,0),U,6)=#{node[:vista][:station_number]}",
      "S (I,J)=0 F  S I=$O(^LR(I)) Q:'+I  S J=0 F  S J=$O(^LR(I,\"CH\",J)) Q:'+J  S:$P(^LR(I,\"CH\",J,0),U,14)=500 $P(^LR(I,\"CH\",J,0),U,14)=#{node[:vista][:station_number]}",
      "S (I,J)=0 F  S I=$O(^LR(I)) Q:'+I  S J=0 F  S J=$O(^LR(I,\"MI\",J)) Q:'+J  S:$P(^LR(I,\"MI\",J,0),U,14)=500 $P(^LR(I,\"MI\",J,0),U,14)=#{node[:vista][:station_number]}"
      #Instiutions are being added with same IEN as their station numbers
    ]
    log node[:vista][:chef_log]
  end
end

vista_mumps_block "Update vm domains" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    "S STN(#{vista_station['panorama']})=\"PANORAMA\",STN(#{vista_station['kodak']})=\"KODAK\"",
    "S STN=\"\" F  S STN=$O(STN(STN)) Q:STN=\"\"  S NAME=\"ZZZ\"_STN(STN)_\".VISTACORE.US\",IEN=$$FIND1^DIC(4.2,,\"X\",NAME) I +IEN K FDA S FDA(4.2,IEN_\",\",.01)=$S(STN=#{node[:vista][:station_number]}:\"@\",1:$E(NAME,4,30)),FDA(4.2,IEN_\",\",5.5)=STN D FILE^DIE(,\"FDA\")"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Add new HDR domains" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    'K FDA,DMNIENA,ERR',
    # Add Chantilly (alphanumeric)
    'S FDA(4.2,"+1,",.01)="CHANTILLY.VISTACORE.US"',
    "S FDA(4.2,\"+1,\",5.5)=\"#{vista_station['chantilly']}\"",
    'S FDA(4.2,"+1,",1)="S"',
    'S FDA(4.2,"+1,",1.7)="N"',
    # Add San Diego (alphanumeric)
    'S FDA(4.2,"+2,",.01)="SANDIEGO.VISTACORE.US"',
    "S FDA(4.2,\"+2,\",5.5)=\"#{vista_station['sandiego']}\"",
    'S FDA(4.2,"+2,",1)="S"',
    'S FDA(4.2,"+2,",1.7)="N"',
    # Add Tampa (fully numeric)
    'S FDA(4.2,"+3,",.01)="TAMPA.VISTACORE.US"',
    "S FDA(4.2,\"+3,\",5.5)=\"#{vista_station['tampa']}\"",
    'S FDA(4.2,"+3,",1)="S"',
    'S FDA(4.2,"+3,",1.7)="N"',
    'ZW FDA',
    'D UPDATE^DIE(,"FDA","DMNIENA","ERR")',
    'W !,"New domains created for Chantilly ("_$G(DMNIENA(1))_"), San Diego ("_$G(DMNIENA(2))_"), and Tampa ("_$G(DMNIENA(3))_") or error "_$D(ERR)',
    'K FDA,IENA',
    # Add Chantilly (alphanumeric)
    'S FDA(4,"+1,",.01)="CHANTILLY"',
    #"S FDA(4,\"+1,\",.99)=#{vista_station['chantilly']}",
    'S FDA(4,"+1,",60)=$G(DMNIENA(1))',
    "S FDA(4,\"+1,\",99)=#{vista_station['chantilly']}",
    'S FDA(4.014,"+4,+1,",.01)=1',
    'S FDA(4.014,"+4,+1,",1)=17010',
    "S IENA(1)=#{vista_station['chantilly']}",
    # Add San Diego (alphanumeric)
    'S FDA(4,"+2,",.01)="SANDIEGO"',
    #"S FDA(4,\"+1,\",.99)=#{vista_station['sandiego']}",
    'S FDA(4,"+2,",60)=$G(DMNIENA(2))',
    "S FDA(4,\"+2,\",99)=#{vista_station['sandiego']}",
    'S FDA(4.014,"+5,+2,",.01)=1',
    'S FDA(4.014,"+5,+2,",1)=17010',
    "S IENA(2)=#{vista_station['sandiego']}",
    # Add Tampa (fully numeric)
    'S FDA(4,"+3,",.01)="TAMPA"',
    #"S FDA(4,\"+2,\",.99)=#{vista_station['tampa']}",
    'S FDA(4,"+3,",60)=$G(DMNIENA(3))',
    "S FDA(4,\"+3,\",99)=#{vista_station['tampa']}",
    'S FDA(4.014,"+6,+3,",.01)=1',
    'S FDA(4.014,"+6,+3,",1)=17010',
    "S IENA(3)=#{vista_station['tampa']}",
    'D UPDATE^DIE(,"FDA","IENA","ERR")',
    'ZW IENA,ERR',
    'W $S($D(ERR):"Error creating new Institution",1:"New Institutions Created")'
  ]
  log node[:vista][:chef_log]
end

#add system startup function to cache system
vista_ro_install "zstu.ro" do
  action :nothing
  namespace "%SYS"
  source "#{Chef::Config[:file_cache_path]}/zstu.ro"
  log node[:vista][:chef_log]
  notifies :restart, 'service[cache]', :immediately  
end

