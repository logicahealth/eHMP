#
# Rakefile for deploying VMs
# 
# Author:: Team Milky Way (<team-milkyway@vistacore.us>)

require 'rubygems'
require 'json'
require 'open-uri'
require 'nokogiri'


####################
####################
### DEPLOY TASKS ###
####################
####################

desc "Deploy the entire EHMP Stack"
task :deployBackend, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"all-machines", "ehmp_provision")
end


desc "Deploy JDS Machine"
task :deployJds, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"jds","ehmp_provision")
end

desc "Deploy Kodak Machine"
task :deployKodak, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"vista-kodak","ehmp_provision")
end

desc "Deploy Panorama Machine"
task :deployPanorama, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"vista-panorama","ehmp_provision")
end

desc "Deploy Mocks Machine"
task :deployMocks, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"mocks","ehmp_provision")
end

desc "Deploy VXSync Machine"
task :deployVxSync, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"vxsync","ehmp_provision")
end

desc "Deploy RDK Machine"
task :deployRdk, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("rdk", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"rdk","rdk_provision")
end

desc "Deploy CDS Machine"
task :deployCds, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("rdk", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"cds","cds_provision")
end

desc "Deploy JBPM Machine"
task :deployJbpm, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("rdk", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"jbpm","rdk_provision")
end

desc "Deploy Ehmp-UI Machine"
task :deployUi, [:branch, :action] do |t, args|
  action = get_action(args[:action])
  params = get_params("ehmp-ui", args[:branch])
  set_env_vars(params)
  execute_chef_client(action,"ehmp-ui","ehmp-ui_provision")
end

def get_params(repo, branch)
  return {}
  # Build URL
  protocol = "https://"
  server = "build.vistacore.us"
  port = ""
  job_name = "#{repo}-acceptance-test-build-#{branch}"
  restEndPoint = "#{protocol}#{server}#{port}/job/#{job_name}/lastStableBuild/api/xml"
  
  # Get XML Document from Jenkins
  xml_doc = Nokogiri::XML(open(restEndPoint).read)

  # Get environment variable names and values
  names = xml_doc.xpath('//action/parameter/name').collect{|node|
    node.text
  }
  values = xml_doc.xpath('//action/parameter/value').collect{|node|
    node.text
  }
  # Add environment variables to hash
  params = {}
  names.each_with_index do |name, i|
    params[name] = values[i]
  end
  return params
end

def set_env_vars(env_vars)
  env_vars.each { |name, value|
    ENV[name] = value
  }
end

def get_action(action)
  if action != "destroy"
    return "converge"
  else
    return "destroy"
  end
end

def execute_chef_client(action, machine, provision)
  system("MACHINE_NAME=#{machine} DRIVER=vagrant ACTION=#{action} chef-client -o #{provision}@$#{provision.upcase.tr('-','_')} -c ~/Projects/vistacore/.chef/knife.rb", out: $stdout, err: :out)
end