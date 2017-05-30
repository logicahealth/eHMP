
action :execute do

  nerve new_resource.name do
    host new_resource.host
    port new_resource.port
    checks new_resource.checks
    zk_hosts node['nerve_wrapper']['hosts']
    zk_path "#{node['nerve_wrapper']['remote_services_dir']}/#{new_resource.service_type}/services"
    reporter_type "zookeeper"
    check_interval new_resource.check_interval
  end

end
