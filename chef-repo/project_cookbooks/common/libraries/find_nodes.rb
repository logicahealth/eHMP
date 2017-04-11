def find_stack(stack)
  puts "getting all nodes in the current stack"
  nodes = search(:node, "stack:#{stack} AND NOT name:#{node.name}")
  nodes << node
  puts "adding data bag nodes..."
  nodes << data_bag_search(stack.sub(".", "-")) unless node[:development]
  nodes.flatten!
  return nodes
end

# Use this definition if the server has to exist in the stack
def find_node_by_role(role, stack, alternate=nil)
  @nodes ||= find_stack(stack)
  matching_nodes = []
  @nodes.each { |stack_node|
    if stack_node[:roles] && stack_node[:roles].include?(role)
      matching_nodes << stack_node 
    end
  }
  if matching_nodes.size == 0 && alternate
    Chef::Log.debug "Unable to locate node or data_bag with role: '#{role}' in the '#{stack}' stack."
    Chef::Log.debug "Searching for alternate role: #{alternate}..."
    @nodes.each { |stack_node|
      if stack_node[:roles] && stack_node[:roles].include?(alternate)
        matching_nodes << stack_node 
      end
    }
  end
  # Fail if no node has been found in the stack
  raise "The #{role} machine is either missing or corrupt in the #{stack} environment.  Please deploy/redeploy the #{role} machine." if matching_nodes.size == 0
  # Fail if mutiple nodes have been found in the stack
  raise "Multiple #{role} machines were found in the #{stack} environment... This is not allowed.  Cleanup of nodes may be necessary." if matching_nodes.size > 1
  return matching_nodes[0]
end

# Use this definition if the server is optional in the stack
def find_optional_node_by_role(role, stack)
  @nodes ||= find_stack(stack)
  matching_nodes = []
  @nodes.each { |stack_node|
    if stack_node[:roles] && stack_node[:roles].include?(role)
      matching_nodes << stack_node 
    end
  }
  # Warn if no node has been found in the stack
  Chef::Log.debug "The #{role} machine is either missing or corrupt in the #{stack} environment.  This is okay, if the #{role} machine is not required." if matching_nodes.size == 0
  # Fail if mutiple nodes have been found in the stack
  raise "Multiple #{role} machines were found in the #{stack} environment... This is not allowed.  Cleanup of nodes may be necessary." if matching_nodes.size > 1
  return matching_nodes[0]
end

# Use this definition if the multiple copies of the server are allowed in the stack
def find_multiple_nodes_by_role(role, stack, alternate=nil)
  @nodes ||= find_stack(stack)
  matching_nodes = []
  @nodes.each { |stack_node|
    if stack_node[:roles] && stack_node[:roles].select{ |r| r[/#{role}/] }.size > 0
      matching_nodes << stack_node 
    end
  }
  if matching_nodes.size == 0 && alternate
    Chef::Log.debug "Unable to locate a #{role} machine in the '#{stack}' environment. Searching for alternate #{alternate} machine..."
    @nodes.each { |stack_node|
      if stack_node[:roles] && stack_node[:roles].select{ |r| r[/#{alternate}/] }.size > 0
        matching_nodes << stack_node 
      end
    }
  end
  # Fail if no node has been found in the stack
  raise "The #{role} machine is either missing or corrupt in the #{stack} environment.  This is okay, if the #{role} machine is not required." if matching_nodes.size == 0
  return matching_nodes
end

def data_bag_search(stack)
  hash_nodes = []
  chef_nodes = []
  begin
    data_bag(stack).each {|item|
      hash_nodes << data_bag_item(stack, item).to_hash
    }
  rescue Net::HTTPServerException
    # Ignore 404 error when attempting to located the data bag
  end
  hash_nodes.each { |hash_node|
    chef_nodes.push(convert_hash_to_chef_node(hash_node, stack))
  }
  return chef_nodes
end

def convert_hash_to_chef_node(hash_node, stack)
  chef_node = Chef::Node.new()
  chef_node.name("#{hash_node["id"]}-#{stack}")
  chef_node.normal_attrs = (hash_node["normal"])
  chef_node.override_attrs = (hash_node["override"])
  chef_node.automatic_attrs = (hash_node["automatic"])
  return chef_node
end
