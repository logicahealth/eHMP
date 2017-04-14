desc "Manage an Docker Host | Ex: rake dockerhost[converge,docker_host_name]"
task :dockerhost, [:action, :name] do |t,args|
  system "ACTION=#{args[:action]} SLAVE_NAME=#{args[:name]} MACHINE_NAME=dockerhost DRIVER=aws chef-client -o chef-repo_provision --force-formatter --config #{$knife_rb} --log_level info"
end
