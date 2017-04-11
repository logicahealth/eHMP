action :execute do 

  #Make directory
  common_directory "#{node[:jbpm][:m2_home]}/repository/#{new_resource.group_id}/#{new_resource.artifact_id}/#{new_resource.version}" do
    owner new_resource.owner
    group new_resource.group
    mode  new_resource.mode
    recursive true
    action :create
  end

  #Download artifact
  remote_file "#{node[:jbpm][:m2_home]}/repository/#{new_resource.group_id}/#{new_resource.artifact_id}/#{new_resource.version}/#{new_resource.artifact_id}-#{new_resource.version}.jar" do
    owner new_resource.owner
    group new_resource.group
    mode new_resource.mode
    source new_resource.jar_source
  end

  auth_string = "#{new_resource.user}:#{new_resource.password}"

  http_request "deploy_the_tasks_jar" do
    url "http://#{node[:ipaddress]}:8080/business-central/rest/deployment/#{new_resource.group_id}:#{new_resource.artifact_id}:#{new_resource.version}/deploy"
    message {}
    headers({'AUTHORIZATION' => "Basic #{
      Base64.encode64(auth_string)}",
      'Content-Type' => 'application/xml'
    })
    action :post
  end

  ruby_block "ensure_jar_deployed" do
    block do
      wait_for_jar(new_resource.artifact_id, new_resource.version, new_resource.user, new_resource.password, 1, new_resource.max_attempts)
    end
  end

end

def wait_for_jar(artifactId, version, user, password, attempt, max_attempts)
  raise "#{artifactId} did not deploy correctly" if attempt > max_attempts
  begin
    unless jar_deployed?(artifactId, version, user, password)
      puts "waiting"
      sleep(2)
      return wait_for_jar(artifactId, version, user, password, attempt + 1, max_attempts)
    end
    true
  end
end

