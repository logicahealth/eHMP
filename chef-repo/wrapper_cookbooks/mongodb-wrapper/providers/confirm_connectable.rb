
action :execute do

  chef_gem 'mongo' do
    version '1.12.5'
  end

  ruby_block "confirm_connectable:#{new_resource.name}" do
    block do
      raise "Could not connect to mongo at host #{new_resource.connection['host']} port #{new_resource.connection['port']} after #{new_resource.attempts} attempts!" unless check_connection(new_resource.connection, 1, new_resource.attempts)
    end
  end

end

def check_connection(connection, attempt, max_attempts)

  require 'rubygems'
  require 'mongo'

  return false if attempt > max_attempts
  begin
    Chef::Log.info("Attempt #{attempt} to connect to mongo.")
    Mongo::MongoClient.new(
        connection['host'],
        connection['port'],
        :connect_timeout => 15,
        :slave_ok => true,
        :ssl => node[:mongodb][:mongo_client_ssl]
      )
  rescue Exception => e
    Chef::Log.info(e.message)
    sleep(5)
    return check_connection(connection, attempt + 1, max_attempts)
  end
  true

end
