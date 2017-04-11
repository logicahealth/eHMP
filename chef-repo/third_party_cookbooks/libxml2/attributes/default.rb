case node['platform_family']
when 'rhel'
	default['libxml2']['packages'] = %w{ libxml2 }
	default['libxml2']['devel_packages'] = %w{ libxml2-devel }
	default['libxml2']['package_manager'] = 'yum'
when 'debian'
	default['libxml2']['packages'] = %w{ libxml2 }
	default['libxml2']['devel_packages'] = %w{ libxml2-dev }
	default['libxml2']['package_manager'] = 'apt'
else
	default['libxml2']['packages'] = %w{ libxml2 }
	default['libxml2']['devel_packages'] = %w{ libxml2-devel }
	default['libxml2']['package_manager'] = 'yum'
end

default['libxml2']['install_devel'] = true
default['libxml2']['compile_time'] = false
