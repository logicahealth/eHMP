use_inline_resources

action :execute do 

    Dir.glob("#{node[:jbpm][:m2_home]}/repository/**/*.jar").each do |jar_path|

        jar_info = jar_path.split("/")
        group_id = jar_info[-4]
        artifact_id = jar_info[-3]
        version = jar_info[-2]

        unless jar_deployed?(artifact_id,version,new_resource.user,new_resource.password)

            log "Deleting undeployed legacy jar:  #{jar_info[-1]}"
            
            directory "#{node[:jbpm][:m2_home]}/repository/#{group_id}/#{artifact_id}/#{version}" do
                action :delete
                recursive true
            end

            new_resource.updated_by_last_action(true)

        end

    end

end
