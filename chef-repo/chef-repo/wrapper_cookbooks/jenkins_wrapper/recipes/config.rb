## Install plugins
node[:jenkins_wrapper][:config][:plugins].each { |name, source|
	jenkins_plugin "#{name}" do
		source "#{source}"
	end
}

#### Add jobs ####
node[:jenkins_wrapper][:config][:jobs].each { |job_source| 
	# This is necessary to put the file onto the guest so jenkins_job can consume
	cookbook_file "/tmp/#{job_source}" do
  	  source "#{job_source}"
	end
	jenkins_job "#{job_source.chomp('.xml')}" do
 	  config "/tmp/#{job_source}"
	end
}

## Create user
jenkins_user "#{node[:jenkins_wrapper][:config][:account][:username]}" do
	id "#{node[:jenkins_wrapper][:config][:account][:id]}"
	password "#{node[:jenkins_wrapper][:config][:account][:id]}"
	full_name "#{node[:jenkins_wrapper][:config][:account][:full_name]}"
	email "#{node[:jenkins_wrapper][:config][:account][:email]}"
end

# Enable security
jenkins_script 'activate global security' do
  command <<-EOH.gsub(/^ {4}/, '')
      import jenkins.model.*
      import hudson.security.*
      def instance = Jenkins.getInstance()

      //Enable Security 
      def hudsonRealm = new HudsonPrivateSecurityRealm(false)
      instance.setSecurityRealm(hudsonRealm)

      //Enable Matrix security and add default user to matrix authentication
      def strategy = new GlobalMatrixAuthorizationStrategy()
      strategy.add(Jenkins.ADMINISTER, "#{node[:jenkins_wrapper][:config][:account][:username]}")
      instance.setAuthorizationStrategy(strategy)
      
      instance.save()
  EOH
end