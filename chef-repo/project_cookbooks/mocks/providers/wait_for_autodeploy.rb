action :execute do
  unless ::File.exists?("#{new_resource.name}_deployed")
    start = Time.now
    until ::File.exist?("#{new_resource.name}_deployed")
      raise "The autodeploy of #{::File.basename(new_resource.name)} failed!" if ::File.exist?("#{new_resource.name}_deployFailed")
      raise "The autodeploy timed out while waiting for #{::File.basename(new_resource.name)}_deployed to be created" if Time.now >= start + new_resource.timeout
    end
  end
  new_resource.updated_by_last_action(true)
end
