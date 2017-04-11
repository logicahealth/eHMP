
# Key/Value hash for plugins to source
node.default[:jenkins_wrapper][:config][:plugins][:base_source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/hudson/plugins"

node.default[:jenkins_wrapper][:config][:plugins] = {
	"parameterized-trigger.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/parameterized-trigger/2.4/parameterized-trigger-2.4.hpi",
	"preSCMbuildstep.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/prescmbuildstep/0.3/prescmbuildstep-0.3.hpi",
	"envinject.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/envinject/1.92.1/envinject-1.92.1.hpi",
	"git.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/git/2.4.3/git-2.4.3.hpi",
	"git-client.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/git-client/1.19.6/git-client-1.19.6.hpi",
	"greenballs.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/greenballs/1.15/greenballs-1.15.hpi",
	"promoted-builds.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/promoted-builds/2.25/promoted-builds-2.25.hpi",
	"scm-api.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/scm-api/1.0/scm-api-1.0.hpi",
	"token-macro.hpi" => "#{node[:jenkins_wrapper][:config][:plugins][:base_source]}/token-macro/1.12.1/token-macro-1.12.1.hpi"
}


node.default[:jenkins_wrapper][:config][:jobs] = [
	"deploy_internal_template.xml",
	"deploy_external_template.xml",
	"upload_all_data_bags.xml",
	"upload_environment_file.xml",
	"upload_package.xml",
	"upload_single_data_bag.xml"
]

node.default[:jenkins_wrapper][:config][:account][:username] = "deploy"
node.default[:jenkins_wrapper][:config][:account][:id] = "deploy"
node.default[:jenkins_wrapper][:config][:account][:password] = "deploy"
node.default[:jenkins_wrapper][:config][:account][:email] = "deploy@deploy.deploy"
node.default[:jenkins_wrapper][:config][:account][:full_name] = "Deploy User"