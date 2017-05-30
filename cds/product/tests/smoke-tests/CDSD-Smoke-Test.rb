#!/opt/chef/embedded/bin/ruby
#
# CDSDashboard Smoke Test
#
# Team Europa
#
# This script checks that the server is up and delivering on port 8080 
# (tomcat....this server offers up no other URL to check)
# 
# Then it loads the list of node processes expected to be running on the server
# from the file run.sh in the source tree and compares this to a list of node
# processes seen running on the system.
#
require 'open-uri'

#
# PARAMETERS
#

# Test Specific Data
prod_name = "cdsdashboard"
server_url = "http://SERVERIP:8080"
server_file = "../../../infrastructure/vagrant/servers.json"

#
# SUBROUTINES
#

# Load the IP address of the server
#
def parse_server_address(slist, host)
  flag = false
  File.open(slist, "r") do |file_handle|
    file_handle.each_line do |line|
      line.chop!
      if (line =~ /#{host}/)
        flag = true
        next
      end
      if (! flag )
        next
      end
      line =~ /^\s*\"ip\": \"([\d\.]+)\"$/
      return "#$1"
    end
  end
  abort("CDSDI-Smoke-Test: error parsing eddress from servers.json file")
end

# Check on server
#
def server_up(url)
  options = { :read_timeout => 10 }
  begin
    print "server_up: Checking for Server: #{url}\n"
    true if open(url, options)
  rescue
    false
  end
end

#
# ELABORATION
#

# Grab the server address from disk
server_address =  parse_server_address(server_file, prod_name)

# parse this ip address into two resources
server_url.sub!(/SERVERIP/, server_address)

# Check if the server is up
if (server_up(server_url))
  print "The CDSDashboard server is up"
  exit(0)
else
  print "ERROR: The CDSDashboard server is DOWN!\n"
  exit(1)
end

__END__

timeout(10) do
  open "www.abc.com"
end

