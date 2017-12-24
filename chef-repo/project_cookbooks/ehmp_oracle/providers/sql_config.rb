use_inline_resources

action :execute do

  sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]
  sql_order = JSON.parse(IO.read("#{new_resource.config_dir}/sql_order.json"))["sql_order"]

  execute "Clear SQL output log for appending" do
    cwd "#{new_resource.config_dir}"
    command "date > #{node['ehmp_oracle']['oracle_config']['log_file']}"
  end

  sql_order.each do |file|
    execute "Run #{file}" do
      user 'oracle'
      environment(node['oracle_wrapper']['oracle_env'])
      cwd "#{new_resource.config_dir}"
      command "sqlplus -s /nolog <<EOF>> #{node['ehmp_oracle']['oracle_config']['log_file']}
      SET FEEDBACK ON SERVEROUTPUT ON
      WHENEVER OSERROR EXIT 9;
      WHENEVER SQLERROR EXIT SQL.SQLCODE;
      connect sys/#{sys_password} as sysdba
      PROMPT #{file};
      @#{file}
      EXIT
      EOF"
      sensitive true
    end
  end
end
