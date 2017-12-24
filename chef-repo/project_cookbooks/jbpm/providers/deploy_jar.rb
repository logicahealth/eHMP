use_inline_resources

action :execute do

  auth_string = "#{new_resource.user}:#{new_resource.password}"

  if !jar_deployed?(new_resource.artifact_id, new_resource.version, new_resource.user, new_resource.password)

    common_directory "#{node[:jbpm][:m2_home]}/repository/#{new_resource.group_id}/#{new_resource.artifact_id}/#{new_resource.version}" do
      owner new_resource.owner
      group new_resource.group
      mode  new_resource.mode
      recursive true
      action :create
    end

    remote_file "#{node[:jbpm][:m2_home]}/repository/#{new_resource.group_id}/#{new_resource.artifact_id}/#{new_resource.version}/#{new_resource.artifact_id}-#{new_resource.version}.jar" do
      owner new_resource.owner
      group new_resource.group
      mode new_resource.mode
      source new_resource.jar_source
    end

    http_request "deploy_the_#{new_resource.artifact_id}-#{new_resource.version}_jar" do
      url "http://#{node[:ipaddress]}:8080/business-central/rest/deployment/#{new_resource.group_id}:#{new_resource.artifact_id}:#{new_resource.version}/deploy"
      message {}
      headers({'AUTHORIZATION' => "Basic #{
        Base64.encode64(auth_string)}",
        'Content-Type' => 'application/xml'
      })
      action :post
    end

    ruby_block "ensure_#{new_resource.artifact_id}-#{new_resource.version}_deployed" do
      block do
        wait_for_jar(new_resource.artifact_id, new_resource.version, new_resource.user, new_resource.password, 1, new_resource.max_attempts)
      end
    end

    new_resource.updated_by_last_action(true)

  else

    http_request "activate_the_#{new_resource.artifact_id}-#{new_resource.version}_jar" do
      url "http://#{node[:ipaddress]}:8080/business-central/rest/deployment/#{new_resource.group_id}:#{new_resource.artifact_id}:#{new_resource.version}/activate"
      message {}
      headers({'AUTHORIZATION' => "Basic #{
        Base64.encode64(auth_string)}",
        'Content-Type' => 'application/xml'
      })
      action :post
    end

  end

  deployed_jars(new_resource.user, new_resource.password).each do |jar|
    # "deployment-unit" is defined in jBPM v6.3, but not in jBPM v6.1
    if (jar.key?("deployment-unit"))
      group_id = jar["deployment-unit"]["groupId"]
      artifact_id = jar["deployment-unit"]["artifactId"]
      version = jar["deployment-unit"]["version"]
    else
      group_id = jar["groupId"]
      artifact_id = jar["artifactId"]
      version = jar["version"]
    end

    if artifact_id == new_resource.artifact_id && version != new_resource.version

      ruby_block "deactivate_#{artifact_id}-#{version}" do
        block do
          deactivate_jar(group_id, artifact_id, version, new_resource.user, new_resource.password, 1, new_resource.max_deactivation_attempts)
        end
        only_if { new_resource.remove_legacy_jars }
      end

      http_request "request_undeploy_#{artifact_id}-#{version}" do
        url "http://#{node[:ipaddress]}:8080/business-central/rest/deployment/#{group_id}:#{artifact_id}:#{version}/undeploy"
        message {}
        headers({'AUTHORIZATION' => "Basic #{
          Base64.encode64(auth_string)}",
          'Content-Type' => 'application/xml'
        })
        action :post
        only_if { new_resource.remove_legacy_jars }
      end

      new_resource.updated_by_last_action(true)

    end

  end

end
