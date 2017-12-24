#
# Cookbook Name:: vxsync
# Recipe:: default
#

include_recipe 'beanstalk::base_line'

node['vxsync']['vxsync_applications'].each do |vxsync_app|
  beanstalk_instance vxsync_app do
    home_dir node['beanstalk']["#{vxsync_app}"]['home_dir']
    beanstalk_processes node['beanstalk']["#{vxsync_app}"]['beanstalk_processes']
    beanstalk_dir node['beanstalk']["#{vxsync_app}"]['beanstalk_dir']
    log_dir node['beanstalk']["#{vxsync_app}"]['log_dir']
    bluepill_log_dir node['beanstalk']["#{vxsync_app}"]['bluepill_log_dir']
    user node['beanstalk']['user']
    group node['beanstalk']['group']
  end
end
