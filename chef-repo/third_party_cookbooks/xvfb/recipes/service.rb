family = platform_family?('debian') ? 'debian' : 'rhel'

template '/etc/init.d/xvfb' do
  source "#{family}.erb"
  mode '0755'
  variables(
    display: node['xvfb']['display'],
    screennum: node['xvfb']['screennum'],
    dimensions: node['xvfb']['dimensions'],
    args: node['xvfb']['args']
  )
  notifies(:restart, 'service[xvfb]')
end

service 'xvfb' do
  action [:enable, :start]
end
