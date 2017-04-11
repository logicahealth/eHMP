desc "Manage an AIDK slave | Ex: rake slave[converge,aidk_slave_name]"
task :slave, [:action, :name] do |t,args|
  system "INSTANCE_TYPE=m3.medium ACTION=#{args[:action]} SLAVE_NAME=#{args[:name]} MACHINE_NAME=slave DRIVER=aws chef-client -o chef-repo_provision --force-formatter --config ~/Projects/vistacore/.chef/knife.rb --log_level warn"
end
