#
# Cookbook:: ehmp_oracle
# Resource:: oracle_patch
#

action :execute do

  sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]

  execute "check opatch compatibility" do
    cwd "#{new_resource.patch_path}/#{new_resource.patch_number}"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "#{node['oracle']['home']}/OPatch/opatch prereq CheckConflictAgainstOHWithDetail -ph ./"
  end

  execute "stop lsnrctl" do
    cwd "#{new_resource.patch_path}/#{new_resource.patch_number}"
    user 'oracle'
    environment(node['oracle_wrapper']['oracle_env'])
    command "lsnrctl stop"
  end

  execute "sqlplus shutdown" do
    cwd "#{new_resource.patch_path}/#{new_resource.patch_number}"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "sqlplus -s /nolog <<-EOF>> #{new_resource.log_file}
    SET FEEDBACK ON SERVEROUTPUT ON
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect sys/#{sys_password} as sysdba
    shutdown immediate
    exit;
    EOF"
  end

  execute "apply patch" do
    cwd "#{new_resource.patch_path}/#{new_resource.patch_number}"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "#{node['oracle']['home']}/OPatch/opatch apply -silent"
  end

  if new_resource.patch_type == "database"
    execute "start sqlplus for datapatch" do
      cwd "#{node['oracle']['home']}/rdbms/admin"
      user node[:oracle_wrapper][:user]
      environment(node['oracle_wrapper']['oracle_env'])
      command "sqlplus -s /nolog <<-EOF>> #{new_resource.log_file}
      SET FEEDBACK ON SERVEROUTPUT ON
      WHENEVER OSERROR EXIT 9;
      WHENEVER SQLERROR EXIT SQL.SQLCODE;
      connect sys/#{sys_password} as sysdba
      startup
      exit;
      EOF"
    end
  else
     execute "start upgrade" do
      user node[:oracle_wrapper][:user]
      environment(node['oracle_wrapper']['oracle_env'])
      command "sqlplus -s /nolog <<-EOF>> #{new_resource.log_file}
      SET FEEDBACK ON SERVEROUTPUT ON
      WHENEVER OSERROR EXIT 9;
      WHENEVER SQLERROR EXIT SQL.SQLCODE;
      connect sys/#{sys_password} as sysdba
      startup upgrade
      exit;
      EOF"
    end
  end

  execute "datapatch" do
    cwd "#{node['oracle']['home']}/OPatch"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "./datapatch"
  end

  execute "utlrp script" do
    cwd "#{node['oracle']['home']}/rdbms/admin"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "sqlplus -s /nolog <<-EOF>> #{new_resource.log_file}
    SET FEEDBACK ON SERVEROUTPUT ON
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect sys/#{sys_password} as sysdba
    shutdown
    startup
    @utlrp.sql
    exit;
    EOF"
  end

  execute "start lsnrctl" do
    cwd "#{new_resource.patch_path}/#{new_resource.patch_number}"
    user node[:oracle_wrapper][:user]
    environment(node['oracle_wrapper']['oracle_env'])
    command "lsnrctl start"
  end

end
