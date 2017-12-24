#
# Cookbook:: ehmp_oracle
# Resource:: sqlplus
#

action :execute do
  execute "sqlplus command block" do
    user 'oracle'
    environment(node['oracle_wrapper']['oracle_env'])
    command "sqlplus -s /nolog <<-EOF>> #{new_resource.log_file}
    SET FEEDBACK ON SERVEROUTPUT ON
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect #{new_resource.connect_string}
    PROMPT #{new_resource.install_file}
    @#{new_resource.install_file}
    exit;
    EOF"
    sensitive true
  end

  file "#{new_resource.install_file}.success"
end
