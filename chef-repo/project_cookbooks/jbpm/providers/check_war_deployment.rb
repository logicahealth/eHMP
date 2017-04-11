action :execute do
  service "start jboss before checking deploy" do
    service_name "jboss"
    action :start
  end

  ruby_block "check_for_successful_deploy:#{new_resource.name}" do
    block do
      raise "#{new_resource.name} is not deployed after #{new_resource.attempts} attempts!" unless check_deploy(new_resource.name, 1, new_resource.attempts)
    end
  end
end

def check_deploy(war, attempt, max_attempts)
  return false if attempt > max_attempts
  begin
    unless ::File.exists?("#{node[:jbpm][:home]}/deployments/#{war}.war.deployed")
      sleep(5)
      return check_deploy(war, attempt + 1, max_attempts)
    end
    true
  end
end
