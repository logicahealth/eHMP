# Temp env for the chef script
gtm_environment = {
  'vista_home'=>"#{node[:vista][:gtm_vista_install_dir]}",
  'gtm_dist'=>"/usr/lib/fis-gtm/#{node[:vista][:gtm_version]}_#{node[:vista][:gtm_arch]}/",
  'gtmgbldir'=>"#{node[:vista][:gtm_vista_install_dir]}/g/mumps.gld",
  'gtmroutines'=>"$vista_home/o*($vista_home/r) $gtm_dist/libgtmutil.so",
  'gtm_sysid'=>"VISTA"
}

# Get FOIA VistA Source Code
remote_file "#{Chef::Config[:file_cache_path]}/vehu.zip" do
  source "https://github.com/OSEHRA-Sandbox/VistA-VEHU-M/archive/master.zip"
  mode "0755"
end

execute "Unzip VistA" do
  cwd     "#{Chef::Config[:file_cache_path]}"
  command "unzip -o -qq vehu.zip"
end

# main directory
directory node[:vista][:gtm_vista_install_dir] do
  action :create
  owner node[:vista][:gtm_user]
  group node[:vista][:gtm_user]
  mode "0774"
end

# Create database directories
%w[o r g j].each do |dir|
  directory "#{node[:vista][:gtm_vista_install_dir]}/#{dir}" do
    action :create
    owner node[:vista][:gtm_user]
    group node[:vista][:gtm_user]
    mode "0774"
  end
end

# Copy all routines over
execute "Copy VistA Routines" do
  command "find #{Chef::Config[:file_cache_path]}/VistA-VEHU-M-master -name '*.m' -exec cp {} #{node[:vista][:gtm_vista_install_dir]}/r/ \\;"
  user  node[:vista][:gtm_user]
  group node[:vista][:gtm_user]
end


# Get GT.M Support Files
remote_file "#{Chef::Config[:file_cache_path]}/virgin_install.zip" do
  source "https://github.com/shabiel/Kernel-GTM/releases/download/XU-8.0-10001/virgin_install.zip"
end

execute "Unzip GT.M Support Files" do
  cwd     Chef::Config[:file_cache_path]
  command "unzip -o virgin_install.zip -d #{node[:vista][:gtm_vista_install_dir]}/r/"
  user node[:vista][:gtm_user]
end

git "#{Chef::Config[:file_cache_path]}/random-vista-utilities" do
  repository 'git://github.com/shabiel/random-vista-utilities'
  reference 'master'
  action :sync
end

execute "Copy VistA Set-up Program" do
  cwd     Chef::Config[:file_cache_path]
  command "cp -v random-vista-utilities/KBANTCLN.m #{node[:vista][:gtm_vista_install_dir]}/r/"
  user node[:vista][:gtm_user]
end

# All routines are re-writable (for ^ZUSET ^ZTMGRSET etc)
execute "Make routines writable by user or group" do
  command "chmod -R 0660 #{node[:vista][:gtm_vista_install_dir]}/r/"
end

execute "Make r directory executable" do
  command "chmod 0770 #{node[:vista][:gtm_vista_install_dir]}/r"
end

execute "Make r owned by gtmuser:gtmuser" do
  command "chown -R gtmuser:gtmuser #{node[:vista][:gtm_vista_install_dir]}/r/"
end

execute "Compile VistA Routines" do
  cwd    "#{node[:vista][:gtm_vista_install_dir]}/o"
  user node[:vista][:gtm_user]
  environment gtm_environment
  command "for r in ../r/*.m; do $gtm_dist/mumps -nowarning $r; done"
end

template "#{node[:vista][:gtm_vista_install_dir]}/g/db.gde" do
  owner node[:vista][:gtm_user]
  group node[:vista][:gtm_user]
  mode "0644"
  source "db.gde.erb"
end

template "#{node[:vista][:gtm_vista_install_dir]}/env.vista" do
  owner node[:vista][:gtm_user]
  group node[:vista][:gtm_user]
  mode "0644"
  source "env.vista.erb"
end

execute "Define vista GT.M Database" do
  cwd     node[:vista][:gtm_vista_install_dir]
  user node[:vista][:gtm_user]
  command "$gtm_dist/mumps -r ^GDE < g/db.gde |& tee g/db.gde.out"
  environment gtm_environment
end

execute "Create vista GT.M Database" do
  cwd     node[:vista][:gtm_vista_install_dir]
  user node[:vista][:gtm_user]
  command "$gtm_dist/mupip create"
  environment gtm_environment
end

execute "Remove empty ZWR files" do
  command <<-EOF
  IFS=$'\n'; \
  for file in $(find #{Chef::Config[:file_cache_path]}/VistA-VEHU-M-master -name '*.zwr' -exec wc -l {} \\; | grep "^2 " | cut -d" " -f2-99); \
    do rm -v "$file"; 
  done
  EOF
end

# 2018 Jan 24 - Not needed anymore. Our export is already formatted correctly.
#execute "Normalize ZWR headers for GT.M V6.3" do
#  command <<-EOF
#    find #{Chef::Config[:file_cache_path]}/VistA-VEHU-M-master -name '*.zwr' \
#    -print \
#    -exec sh -c 'echo "OSEHRA GLOBAL ZWR EXPORT" > "{}2"' \\; \
#    -exec sh -c 'tail -n +2 "{}" >> "{}2"' \\; \
#    -exec sh -c 'mv "{}2" "{}"' \\;
#    EOF
#end

execute "Load Globals" do
  cwd  node[:vista][:gtm_vista_install_dir]
  user node[:vista][:gtm_user]
  command %Q[find #{Chef::Config[:file_cache_path]}/VistA-VEHU-M-master -name '*.zwr' -print -exec $gtm_dist/mupip load \\"{}\\" \\;]
  environment gtm_environment
end

execute "Turn on Journaling" do
  cwd  node[:vista][:gtm_vista_install_dir]
  user node[:vista][:gtm_user]
  command ". ./env.vista"
end

execute "Initialize VistA" do
  cwd  node[:vista][:gtm_vista_install_dir]
  user node[:vista][:gtm_user]
  environment gtm_environment
  command %Q[$gtm_dist/mumps -run ^%XCMD 'D START^KBANTCLN("ROU","PANORAMA",500,"VEHU MASTER")']
end

execute "dos2unix all KIDS patches" do
  cwd Chef::Config[:file_cache_path]
  command "dos2unix *.kid; dos2unix *.KID"
end

device_entry = {
  "$I" => ["HFS", "/vagrant/HFS.TXT"]
}

vista_fileman "update $I for DEVICE file" do
  action          :update
  file            "3.5"
  field_values    device_entry
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

# Add the XCODEL ZBLXEC RPC for modifying test data
# and Add the FILE Z RPC DIE and UPDATE Z RPC DIE RPCs for modifying test data
#Load site-specific station numbers
vista_station = data_bag_item('vista_sites','vista_station_number').to_hash

vista_install_distribution "cache_patches" do
  patch_list "cache_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  run_checksums node[:vista][:run_checksums]
end

if node[:vista].attribute?(:site_id)
  vista_mumps_block "update_hmpsystemname:#{node[:vista][:site_id]}" do
    namespace "VISTA"
    command [
      "D PUT^XPAR(\"SYS\",\"HMP SYSTEM NAME\",1,\"#{node[:vista][:site_id]}\")"
    ]
    log node[:vista][:chef_log]
    not_if { node[:vista][:no_reset] }
  end
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

vista_mumps_block "Update Panorama Institution to point to correct domain" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    'K FDA,IENA,ERR',
    'S FDA(4,"?1,",.01)="CAMP MASTER"',
    'S FDA(4,"?1,",60)=$$FIND1^DIC(4.2,,"X","PANORAMA.VISTACORE.US")',
    'D UPDATE^DIE(,"FDA",,"ERR")',
    'W $S($D(ERR):"Error updating Institution",1:"Panorama Institution Updated")'
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Add New Kodak Institution" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  command [
    'S XUMF=1',
    'K FDA,IENA,ERR',
    'S FDA(4,"+1,",.01)="CAMP BEE"',
    'S FDA(4,"+1,",60)=$$FIND1^DIC(4.2,,"X","KODAK.VISTACORE.US")',
    "S FDA(4,\"+1,\",99)=#{vista_station['kodak']}",
    'S FDA(4.014,"+3,+1,",.01)=1',
    'S FDA(4.014,"+3,+1,",1)=17010',
    "S IENA(1)=#{vista_station['kodak']}",
    'D UPDATE^DIE(,"FDA","IENA","ERR")',
    'ZWRITE IENA,ERR',
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
    'S FDA(4,"+1,",60)=455',
    "S FDA(4,\"+1,\",99)=\"#{vista_station['vhic']}\"",
    'S FDA(4.014,"+3,+1,",.01)=1',
    'S FDA(4.014,"+3,+1,",1)=17010',
    "S IENA(1)=+#{vista_station['vhic']}",
    'D UPDATE^DIE(,"FDA","IENA","ERR")',
    'ZWRITE IENA,ERR',
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
    'ZWRITE FDA',
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
    'ZWRITE IENA,ERR',
    'W $S($D(ERR):"Error creating new Institution",1:"New Institutions Created")'
  ]
  log node[:vista][:chef_log]
end

VISTA_USERS = [
  ['XIU,MARGARET',      'MX1234',   'MX1234!!'],
  ['TDNURSE,ONE',       '1TDNURSE', 'TDNURSE1'],
  ['DAY,MICHAEL',       'MD1234',   'MD1234!!'],
  ['KEELEY,TRACY',      'TK1234',   'TK1234!!'],
  ['PCMM,FOUR',         'PUT1234',  'PUT1234!!'],
  ['PROVIDER,EIGHT',    'PR12345',  'PR12345!!'],
  ['PROXY,EHMP',        'EP1234',   'EP1234!!'],
  ['USER,PANORAMA',     'PU1234',   'PU1234!!'],
  ['VEHU,TEN',          '10VEHU',   'VEHU10'],
  ['USER,FMQL',         'QLFM1234', 'QLFM1234!!'],
  ['KHAN,VIHAAN',       'VK1234',   'VK1234!!'],
  ['PHARMACIST,EIGHT',  'PHA1234',  'PHA1234!!']
]

VISTA_USERS.each do |user|
  name = user[0]
  ac   = user[1]
  vc   = user[2]
  vista_mumps_block "Fix existing users" do
    duz       1
    programmer_mode true
    namespace "VISTA"
    command [
      %Q|K USER,ACHASH,VCHASH,FDA|,
      %Q|S USER=$$FIND1^DIC(200,,"QX","#{name}","B")|,
      %Q|S ACHASH=$$EN^XUSHSH("#{ac}")|,
      %Q|S VCHASH=$$EN^XUSHSH("#{vc}")|,
      %Q|S FDA(200,USER_",",2)=ACHASH|,
      %Q|S FDA(200,USER_",",11)=VCHASH|,
      %Q|D FILE^DIE(,$NA(FDA))|
    ]
    log node[:vista][:chef_log]
  end
end

vista_christen "mailman setup" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  log node[:vista][:chef_log]
end

# initd script next.
template "/etc/init.d/#{node[:vista][:gtm_service]}" do
  source 'gtm_initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
end

# Use initd script to start the listeners
service node[:vista][:gtm_service] do
  supports :restart => true
  action :restart
end

