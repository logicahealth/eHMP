family = platform_family?('debian') ? 'debian' : 'rhel'

node['xvfb']['packages'][family].each do |pkg|
  package(pkg)
end
