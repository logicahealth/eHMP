#
# Rakefile for no-internet deploys
#

task :write_prod_settings, :stack do |t, args|
	stack = args[:stack]
	db_path = "/tmp/#{stack}.json"
	File.open(db_path, "w+"){ |f| 
		f.write(JSON.pretty_generate(prod_settings(stack)))
	}
	knife_data_bag_from_file(db_path)
end

def knife_data_bag_from_file(db_path)
	`/opt/chefdk/bin/knife data bag from file production_settings #{db_path}`
end

def prod_settings(stack)
	{
	  "id" => stack,
	  "ssh_username" => "ec2-user",
	  "ssh_key" => "#{ENV['HOME']}/Projects/vistacore/.chef/keys/vagrantaws_c82a142d5205",
	  "jds" => {
	    "ip_address" => knife_search_for_ip("jds", stack, "aws")
	  },
	  "solr" => {
	    "ip_address" => knife_search_for_ip("solr", stack, "aws")
	  },
	  "mocks" => {
	    "ip_address" => knife_search_for_ip("mocks", stack, "aws")
	  },
	  "vista-panorama" => {
	    "ip_address" => knife_search_for_ip("vista-panorama", stack, "aws")
	  },
	  "vista-kodak" => {
	    "ip_address" => knife_search_for_ip("vista-kodak", stack, "aws")
	  },
	  "vxsync" => {
	    "ip_address" => knife_search_for_ip("vxsync", stack, "aws")
	  },
	  "pjds" => {
	    "ip_address" => knife_search_for_ip("pjds", stack, "aws")
	  },
	  "rdk" => {
	    "ip_address" => knife_search_for_ip("rdk", stack, "aws")
	  },
	  "jbpm" => {
	    "ip_address" => knife_search_for_ip("jbpm", stack, "aws")
	  },
	  "cdsdb" => {
	    "ip_address" => knife_search_for_ip("cdsdb", stack, "aws")
	  },
	  "cdsdashboard" => {
	    "ip_address" => knife_search_for_ip("cdsdashboard", stack, "aws")
	  },
	  "opencds" => {
	    "ip_address" => knife_search_for_ip("opencds", stack, "aws")
	  },
	  "cdsinvocation" => {
	    "ip_address" => knife_search_for_ip("cdsinvocation", stack, "aws")
	  },
	  "ehmp-ui" => {
	    "ip_address" => knife_search_for_ip("ehmp-ui", stack, "aws")
	  },
	  "ehmp-balancer" => {
	    "ip_address" => knife_search_for_ip("ehmp-balancer", stack, "aws")
	  },
	  "cdsdashboard" => {
	    "ip_address" => knife_search_for_ip("cdsdashboard", stack, "aws")
	  },
	  "cdsdb" => {
	    "ip_address" => knife_search_for_ip("cdsdb", stack, "aws")
	  },
	  "cdsinvocation" => {
	    "ip_address" => knife_search_for_ip("cdsinvocation", stack, "aws")
	  },
	  "opencds" => {
	    "ip_address" => knife_search_for_ip("opencds", stack, "aws")
	  }
	}
end
