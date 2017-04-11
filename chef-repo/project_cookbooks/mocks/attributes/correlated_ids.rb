default[:mocks][:correlated_ids][:artifact_name] = "correlatedIds.json"
default[:mocks][:correlated_ids][:dir] = "/opt/mocks_data"
default[:mocks][:correlated_ids][:json] = "#{node[:mocks][:correlated_ids][:dir]}/#{node[:mocks][:correlated_ids][:artifact_name]}"
