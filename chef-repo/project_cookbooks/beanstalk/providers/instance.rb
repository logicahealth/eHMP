use_inline_resources

action :create do

  directory new_resource.home_dir do
    owner new_resource.user
    group new_resource.group
    mode '0755'
    action :create
  end

  beanstalk_name = "beanstalk_#{new_resource.vxsync_application}"
  vxsync_name = "vxsync_#{new_resource.vxsync_application}"

  directory new_resource.log_dir do
    owner new_resource.user
    group new_resource.group
    mode '0755'
    recursive true
    action :create
    notifies :run, "execute[#{new_resource.log_dir}_ownership_correction]", :immediately
  end

  execute "#{new_resource.log_dir}_ownership_correction" do
    command "chown -R #{new_resource.user}:#{new_resource.group} #{new_resource.log_dir}"
    action :nothing
    only_if { Dir.exist? new_resource.log_dir }
  end

  directory new_resource.bluepill_log_dir do
    owner  new_resource.user
    group  new_resource.group
    mode "0755"
    action :create
  end

  notifying_resources = []

  new_resource.beanstalk_processes.each{ |name, process_block|
    notifying_resources << (template "#{new_resource.home_dir}/#{name}.sh" do
      source process_block[:template]
      variables(
        :name => name,
        :options => process_block[:config],
        :process_log => "#{new_resource.log_dir}/#{name}.log"
      )
      owner new_resource.user
      group new_resource.group
      mode '0755'
    end)
  }

  directory "#{new_resource.home_dir}/scripts" do
    owner new_resource.user
    group new_resource.group
    mode '0755'
  end

  notifying_resources << (template "/etc/init/#{beanstalk_name}.conf" do
    variables(
      :name => beanstalk_name,
      :dependency => vxsync_name,
      :vxsync_application_home => new_resource.home_dir,
      :beanstalk_dir => new_resource.beanstalk_dir,
      :level => 2345
    )
    source 'upstart-bluepill-beanstalk.erb'
  end)

  notifying_resources << (template "/etc/bluepill/#{beanstalk_name}.pill" do
    source 'bluepill.pill.erb'
    variables(
      :name => beanstalk_name,
      :processes => new_resource.beanstalk_processes,
      :working_directory => new_resource.home_dir,
      :log_directory => new_resource.bluepill_log_dir,
      :uv_threadpool_size => node[:vxsync][:uv_threadpool_size],
      :user => new_resource.user,
      :group => new_resource.group
    )
    owner new_resource.user
    group new_resource.group
  end)

  service beanstalk_name do
    provider Chef::Provider::Service::Upstart
    restart_command "/sbin/stop #{beanstalk_name}; /sbin/start #{beanstalk_name}"
    action [:enable]
  end

  new_resource.updated_by_last_action(true) if notifying_resources.any? { |r| r.updated_by_last_action? }
end
