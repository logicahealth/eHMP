use_inline_resources

action :create do

  vxsync_name = "vxsync_#{new_resource.application}"
  home_dir = "/opt/#{vxsync_name}"

  vista_sites = new_resource.vista_sites

  if find_optional_nodes_by_criteria(node['stack'], "role:jds_app_server").empty?
    raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[vxsync_name]['jds_app_server_assignment'].nil?
    jds = find_node_by_role("jds", node['stack'])
  else
    raise "JDS App Servers have been found in this environment, but a jds_app_server_assignment was not set." if node[vxsync_name]['jds_app_server_assignment'].nil?
    jds = find_optional_node_by_criteria(node['stack'], "role:jds_app_server AND jds_app_server_ident:#{node[vxsync_name]['jds_app_server_assignment']}")
    raise "JDS App Server #{node[vxsync_name]['jds_app_server_assignment']} not found in stack." if jds.nil?
  end

  pjds = find_node_by_role("pjds", node[:stack], "jds")
  # get zookeeper information from first zookeeper node found (node[:zookeeper][:zookeeper_connection] should be the same for all zookeeper nodes)
  zookeeper = find_multiple_nodes_by_role("zookeeper", node[:stack])[0]
  jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")
  hdr_sites = find_multiple_nodes_by_role("hdr", node[:stack], "mocks")
  das = find_node_by_role("das", node[:stack], "mocks")
  vxsync = node

  if node[:vxsync][:enable_app_dynamics]
    app_dynamics = find_node_by_role("app_dynamics", node[:stack])
  end

  # Get the Caché password from the databag
  databag_password = Chef::EncryptedDataBagItem.load("credentials", "cache_#{node[:vxsync][:pjds][:username]}_password", node[:data_bag_string])
  password = databag_password["password"]
  osync1_username = Base64.encode64(node[:vxsync][:pjds][:username]).chomp!
  osync1_password = Base64.encode64(password).chomp!


  beanstalk_processes = node['beanstalk'][new_resource.application]['beanstalk_processes']
  processes = new_resource.processes

  notifying_resources = []

  notifying_resources << (template "#{home_dir}/worker-config.json" do
    source 'worker-config.json.erb'
    cookbook 'vxsync'
    variables(
      :vista_sites => vista_sites,
      :vxsync => vxsync,
      :vxsync_environments => new_resource.vxsync_environments,
      :environment_name => "#{node['machinename']}_#{new_resource.application}",
      :osync1_username => osync1_username,
      :osync1_password => osync1_password,
      :jds => jds,
      :pjds => pjds,
      :zookeeper => zookeeper,
      :soap_handler => node['soap_handler'],
      :hdr_sites => hdr_sites,
      :jmeadows => jmeadows,
      :das => das,
      :hdr_enabled => node['vxsync']['hdr_enabled'],
      :jmeadows_enabled => node['vxsync']['jmeadows_enabled'],
      :vler_enabled => node['vxsync']['vler_enabled'],
      :vlerdas_enabled => node['vxsync']['vlerdas_enabled'],
      :activity_filter_sites => node['vxsync']['activity_filter_sites'],
      :hdr_blacklist_sites => node['vxsync']['hdr_blacklist_sites'],
      :log_pattern => node[vxsync_name]['log_pattern'],
      :beanstalk_port => beanstalk_processes["jobrepo_#{new_resource.application}"]['config']['port'],
      :vxsync_sync_port => node[:synapse][:services][:vxsync_sync][:haproxy][:port],
      :app_dynamics => app_dynamics
    )
    owner node['vxsync']['user']
    group node['vxsync']['grop']
    mode '0755'
  end)

  notifying_resources << (template "#{home_dir}/scripts/shutdownVxSync.sh" do
    source 'shutdown-vxsync.sh.erb'
    cookbook 'vxsync'
    variables(
      :shutdown_all_timeout_seconds => node['vxsync']['shutdown_timeout']['all_timeout_seconds']
    )
    owner node['vxsync']['user']
    group node['vxsync']['grop']
    mode '0755'
  end)

  directory node[vxsync_name]['log_directory'] do
    owner node['vxsync']['user']
    group node['vxsync']['grop']
    mode '0755'
    recursive true
    action :create
    notifies :run, "execute[#{node[vxsync_name]['log_directory']}_ownership_correction]", :immediately
  end

  execute "#{node[vxsync_name]['log_directory']}_ownership_correction" do
    command "chown -R #{node['vxsync']['user']}:#{node['vxsync']['group']} #{node[vxsync_name]['log_directory']}"
    action :nothing
    only_if { Dir.exist? node[vxsync_name]['log_directory'] }
  end

  directory node[vxsync_name]['persistence_dir'] do
    owner node['vxsync']['user']
    group node['vxsync']['grop']
    mode '0755'
    action :create
  end

  directory node[vxsync_name]['data_dir'] do
    owner node['vxsync']['user']
    group node['vxsync']['grop']
    mode '0755'
    action :create
  end

  processes.each do |name,process_block|
    1.upto( process_block[:number_of_copies] || 1 ) do |index|
      if index == 1 then suffix = "" else suffix = "_#{index}" end
      notifying_resources << (template "#{home_dir}/#{name}#{suffix}.sh" do
        cookbook 'vxsync'
        source process_block[:template]
        variables(
          :name => "#{name}#{suffix}",
          :options => process_block[:config],
          :process_log => "#{node[vxsync_name]['log_directory']}/#{name}#{suffix}.log",
          :beanstalk_port => beanstalk_processes["jobrepo_#{new_resource.application}"]['config']['port'],
          :apm_deploy => node[:vxsync][:enable_apm],
          :app_dynamics_deploy => node[:vxsync][:enable_app_dynamics]
        )
        owner node['vxsync']['user']
        group node['vxsync']['grop']
        mode '0755'
      end)
    end
  end

  notifying_resources << (template "/etc/init/#{vxsync_name}.conf" do
    cookbook 'vxsync'
    variables(
      :name => vxsync_name,
      :depends_on => "beanstalk_#{new_resource.application}",
      :level => 2345,
      :shutdown_script => "#{home_dir}/scripts/shutdownVxSync.sh"
    )
    source 'upstart-bluepill-vxsync.erb'
  end)

  notifying_resources << (template "/etc/bluepill/#{vxsync_name}.pill" do
    cookbook 'vxsync'
    source 'bluepill.pill.erb'
    variables(
      :name => vxsync_name,
      :processes => processes,
      :working_directory => home_dir,
      :log_directory => node[vxsync_name]['bluepill_log_dir'],
      :uv_threadpool_size => node[:vxsync][:uv_threadpool_size],
      :user => node[:vxsync][:user],
      :group => node[:vxsync][:group]
    )
    owner node['vxsync']['user']
    group node['vxsync']['grop']
  end)

  service vxsync_name do
    provider Chef::Provider::Service::Upstart
    restart_command "/sbin/stop #{vxsync_name}; /sbin/start #{vxsync_name}"
    action [:enable]
  end

  new_resource.updated_by_last_action(true) if notifying_resources.any? { |r| r.updated_by_last_action? }

end
