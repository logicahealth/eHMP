#!/opt/chef/embedded/bin/ruby
#
# CDSInvocation Smoke Test
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
prod_name = "cdsinvocation"
key = "../../../../.vagrant.d/insecure_private_key"
node_command_line = "ssh -o StrictHostKeyChecking=no -i #{key} vagrant@SERVERIP -t sudo -i 'ps -ef | grep node' 2>/dev/null"
server_url = "http://SERVERIP:8080"
server_file = "../../../infrastructure/vagrant/servers.json"
run_list = "../../production/#{prod_name}/src/cds-data/run.sh"
#server_addess = ""
$exit_code = 0 # we start off successful

#
# SUBROUTINES
#

# Load the nodes to be expected
#
def load_node_names(server_listing_file)
  retvals = Array.new
  File.open(server_listing_file, "r") do |f|
    f.each_line do |line|
      line.chop!
      line =~ /^node (\w+\.js) /
      if ($1)
        retvals.push($1)
      end
    end
  end
  puts "load_node_names: no nodes found in the run.sh!" if (retvals.empty?)
  return retvals
end

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
  options = { :read_timeout => 1 }
  print "server_up: Checking for Server: #{url}\n"
  begin
    true if open(url, options)
  rescue
    false
  end
end

#
# Load list of running nodes seen
#
def load_nodes_seen(command_line)
  retvals = Hash.new
  nodes_list = %x(#{command_line}).split("\n")
  nodes_list.each do |process| 
    process.chomp!
    process =~ /node (\w+\.js)$/ 
    if ($1) 
      retvals[$1] = 1
    end
  end
  return retvals
end

#
# ELABORATION
#

# Grab the server address from disk
server_address =  parse_server_address(server_file, prod_name)

# parse this ip address into two resources
node_command_line.sub!(/SERVERIP/, server_address)
server_url.sub!(/SERVERIP/, server_address)

# Check if the server is up
if (server_up(server_url))
  print "The CDSInvocation server is up, checking for node processes...\n"

  # Load the node services expected
  nodes_expected = load_node_names(run_list)
  print "\nWe are expecting this list of running node processes:\n======================\n"
  nodes_expected.each do |process|
    print "  #{process}\n"
  end
  print "======================\n"

  # Load the hash of node processes seen on the Node
  nodes_seen = load_nodes_seen(node_command_line)
  print "\nWe are seeing this list of running node processes:\n======================\n"
  nodes_seen.keys.each do |process|
    print "  #{process}\n"
  end
  print "======================\n"

  # Now we wrap it up by compiling a list of nodes expected but not seen
  print "\nWe now compare the lists...\n";
  nodes_expected.each do |process|
    puts "We are checking #{process}"
    if (nodes_seen[process] != 1)
      print "ERROR: this Node Process (#{process}) was NOT SEEN running\n"
      $exit_code = 1
      break
    end
  end
else
  print "ERROR: The CDSInvocation server is DOWN!\n"
end

if ($exit_code != 0)
  print "\nTEST FAILED\n"
else
  print "\nTEST SUCCEEDED\n"
end

exit($exit_code)

__END__

timeout(10) do
  open "www.abc.com"
end

