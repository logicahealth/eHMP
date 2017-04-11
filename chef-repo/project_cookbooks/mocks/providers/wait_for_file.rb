
action :execute do
  ruby_block "wait_for_file:execute" do
    block do
      begin
        Chef::Log.info("wait for #{new_resource.file_path}/#{new_resource.file_name}.#{new_resource.file_type} to be found")
        while ::File.exists?("#{new_resource.file_path}/#{new_resource.file_name}.#{new_resource.file_type}") == false
          sleep(5)
        end
      rescue RuntimeError => e
        Chef::Log.error("wait_for_file aborted due to unexpected output.")
        Chef::Log.error(e.message)
      end
    end
  end
end
