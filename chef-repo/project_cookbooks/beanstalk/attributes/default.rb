#
# Cookbook Name:: beanstalk
# Recipe:: default
#

default['beanstalk']['user'] = 'node'
default['beanstalk']['group'] = 'node'
default['beanstalk']['max_file_size'] = 20000000
default['beanstalk']['beanstalk_version'] = "1.10-2.el6"

default['beanstalk']['tube_name'] = 'vx-sync'
default['beanstalk']['tube_prefix'] = 'vxs-'
default['beanstalk']['job_type'] = 'true'

default['beanstalk']['client']['home_dir'] = '/opt/vxsync_client'
default['beanstalk']['client']['beanstalk_processes'] = {
  'jobrepo_client' => {
    'template' => "job_repo.sh.erb",
    'config' => {
      'tube_name' => node['beanstalk']['tube_name'],
      'tube_prefix' => node['beanstalk']['tube_prefix'],
      'job_type' => node['beanstalk']['job_type'],
      'port' => 5000,
      'max_file_size' => node['beanstalk']['max_file_size']
    }
  }
}
default['beanstalk']['client']['beanstalk_dir'] = '/var/vxsync/beanstalk_client'
default['beanstalk']['client']['log_dir'] = '/var/log/vxsync'
default['beanstalk']['client']['bluepill_log_dir'] = "#{node['beanstalk']['client']['log_dir']}/bluepill"

default['beanstalk']['vista']['home_dir'] = '/opt/vxsync_vista'
default['beanstalk']['vista']['beanstalk_processes'] = {
  'jobrepo_vista' => {
    'template' => 'job_repo.sh.erb',
    'config' => {
      'tube_name' => node['beanstalk']['tube_name'],
      'tube_prefix' => node['beanstalk']['tube_prefix'],
      'job_type' => node['beanstalk']['job_type'],
      'port' => 5002,
      'max_file_size' => node['beanstalk']['max_file_size']
    }
  }
}
default['beanstalk']['vista']['beanstalk_dir'] = '/var/vxsync/beanstalk_vista'
default['beanstalk']['vista']['log_dir'] = '/var/log/vxsync'
default['beanstalk']['vista']['bluepill_log_dir'] = "#{node['beanstalk']['vista']['log_dir']}/bluepill"
