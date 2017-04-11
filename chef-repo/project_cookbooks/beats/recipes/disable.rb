service 'topbeat' do
  ignore_failure true
  action [:disable, :stop]
end

service 'filebeat' do
  ignore_failure true
  action [:disable, :stop]
end