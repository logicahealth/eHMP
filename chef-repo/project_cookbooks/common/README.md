common Cookbook
===============
cookbook for common funtionality across the Automated Infrastructure Development Kit

Attributes
----------

find_nodes.rb library
---------------------
#### Description
This library is used to provide a helper method for searching for nodes in the current stack with a particular role.

#### Usage
Find nodes with the role 'role_name' and in the current stack:
```ruby
find_node_by_role("role_name", node[:stack])
```

Find nodes with the role 'role_name' and in the current stack (where if no node is found, an alternate node can be used):
```ruby
find_node_by_role("role_name", node[:stack], "alt_role_name")
```

Find optional nodes with the role 'role_name' and in the current stack (where the node is not required and the deployment can continue without returning any node data):
```ruby
find_optional_node_by_role("role_name", node[:stack], "alt_role_name")
```

#### Examples
1. when searching for rdk, if no rdk nodes are found we must exit the deployment because rdk is required.
```ruby
find_node_by_role("rdk", node[:stack])
```

2. when searching for pjds, if no pjds nodes are found we can use the ip address of a jds node.
```ruby
find_node_by_role("pjds", node[:stack], "pjds")
```

3. when searching for jbpm, if no jbpm nodes are found we can continue without adding jbpm to the configuration.
```ruby
find_node_by_role("jbpm", node[:stack])
```

#### Creating a data_bag to represent a chef node
In production environments, many of the local/development mocks will not exist and instead will be replaced by the actual servers.
In order to allow our deployments to connect to the actual servers, there will need to be data_bag_items to represent these nodes.
The find_node_by_role definition will search for a data bag with the name of node[:stack] and if found, will attempt to find a data bag item with the name of the role being searched.

Typically, the ipaddress is the target of the node search, so at the very least the data bag item should include values for id, ipaddress, stack and roles.

```json 
{
  "id": "machine",
  "ip_address": "10.1.1.10",
  "stack": "example-stack",
  "roles": [
    "example",
    "machine_role"
  ]
}
```

Authors: team-milkyway@vistacore.us
