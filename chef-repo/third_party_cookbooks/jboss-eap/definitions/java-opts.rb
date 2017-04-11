# Adds JAVA_OPTS parameter to standalone.conf
define :jboss_java_option do
	option = params[:option]
	raise "jboss_java_option option parameter is nil!" if ! option
	path = node['jboss-eap']['jboss_home'] + "/bin/standalone.conf"

	execute "add standalone.conf java_opt" do
		command "echo 'JAVA_OPTS=\"$JAVA_OPTS #{option}\"' >> #{path}"
		not_if "grep \"^JAVA_OPTS\" #{path} | grep '\\#{option}'"
	end
end
