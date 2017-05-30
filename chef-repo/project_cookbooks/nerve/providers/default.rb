
action :execute do

  template "#{node['nerve']['nerve_conf_dir']}/#{new_resource.name}.json" do
    source	"nerve.erb"
    cookbook "nerve"
    owner	node['nerve']['user']
    group	node['nerve']['user']
    variables(
      host: new_resource.host,
      port: new_resource.port,
      reporter_type: new_resource.reporter_type,
      zk_hosts: new_resource.zk_hosts,
      zk_path: new_resource.zk_path,
      check_interval: new_resource.check_interval,
      checks: new_resource.checks
    )
    notifies :restart, "service[nerve]"
  end

end
