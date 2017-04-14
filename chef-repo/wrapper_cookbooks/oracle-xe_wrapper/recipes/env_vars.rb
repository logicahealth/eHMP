#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: env_vars
#

# set env variables for the chef run, so sqlplus runs properly later in the run
ruby_block "oracle env variables" do
  block do
    ENV['ORACLE_HOME'] = "#{node['oracle-xe']['home']}"
    ENV['ORACLE_SID'] = "#{node['oracle-xe']['oracle_sid']}"
    ENV['NLS_LANG'] = `#{ENV['ORACLE_HOME']}/bin/nls_lang.sh`
    ENV['PATH'] = "#{ENV['ORACLE_HOME']}/bin:#{ENV['PATH']}"
  end
end
