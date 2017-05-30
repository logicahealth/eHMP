#!/opt/chef/embedded/bin/ruby
#
# OpenCDS Smoke Test
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
require 'timeout'

#
# PARAMETERS
#

# Test Specific Data
prod_name = "opencds"
server_url = "http://SERVERIP:8080/opencds-decision-support-service"
#server_string = "opencds-decision-support-service"
server_string = "Available RESTful services:"
server_file = "../../../infrastructure/vagrant/servers.json"
$exit_code = 0 # we start off successful

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
  abort("OpenCDS-Smoke-Test: error parsing eddress from servers.json file")
end

# Check on server
#
def server_up(url, ustring)
  success = false
  begin
  timeout(3) do
    webpage = open(url)
    webpage.each_line do |line| 
      if (line =~ /#{ustring}/)      
        success = true
        print "\nRequired Data (#{ustring}) Seen on web-page\n"
      end
    end
  end
  rescue OpenURI::HTTPError => httperror
    print "Sorry we received an HTTP ERROR #{httperror} trying to load that page\n"
  rescue
    errstr = $!
    if (errstr !~ /execution expired/)
      print "Attempt was cut off...server is non-responsive...\n"
      # and the error is chucked....we lean strongly toward failure.
    else
      print "Sorry we received a miscellaneous error #{$!}\n"
      raise
    end
  end
  return success
end

#
# ELABORATION
#

# Grab the server address from disk
server_address =  parse_server_address(server_file, prod_name)

# parse this ip address into two resources

server_url.sub!(/SERVERIP/, server_address)

# Check if the server is up
if (server_up(server_url,server_string))
  print "\nThe OpenCDS server is up\n"
  exit(0)
else
  print "\nERROR: The OpenCDS server is DOWN!\n"
  exit(1)
end

__END__
