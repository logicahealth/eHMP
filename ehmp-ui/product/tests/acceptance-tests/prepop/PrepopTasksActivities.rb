require 'json'
require 'httparty'
require File.dirname(__FILE__) + '/HTTPartyRDK.rb'
require File.dirname(__FILE__) + '/activity_builder.rb'
require File.dirname(__FILE__) + '/../features/steps/helper/DefaultLogin.rb'

# tasks add Consult Order activity ( urgent low, medium task priority ) priority ( Routine, Urgent, Emergent activity Urgency) 
# tasks add activity ( 3 different patient names )

# activity request

class PrepopTasksActivities
  def self.deployment_id
    request = RDKQuery.new('activities-available')
    response = HTTPartyRDK.get(request.path)
    p "BAD RESPONSE ( to activities-available ) ! #{response.code}: #{response.body}" if response.code != 200

    json_object = JSON.parse(response.body)
    item_array = json_object['data']['items']
    all_ids = []
    item_array.each do | item_object |
      if item_object['id'] == 'Order.Request'
        all_ids.push(item_object['deploymentId'])
      end
    end
    deployment_id = all_ids.last
    deployment_id
  end

  def self.contains_tasks
    user = "SITE;#{DefaultLogin.accesscode}"
    pass = DefaultLogin.verifycode
    request = RDKQuery.new('activities-instances-available')
    request.add_parameter('context', 'staff')
    request.add_parameter('mode', 'open')
    request.add_parameter('createdByMe', 'true')
    request.add_parameter('intendedForMeAndMyTeams', 'true')

    path = request.path
    p path
    response = HTTPartyRDK.get_as_user(path, user,  pass)
    p response.code

    full_response = JSON.parse(response.body)
    data_items = full_response['data']['items']
    return false if data_items.nil?
    return false unless data_items.kind_of? Array
    p "Num activities/tasks: #{data_items.length}"
    return data_items.length > 0
  end

  def self.create_tasks_activities
    @deployment_id = deployment_id

    user = "SITE;#{DefaultLogin.accesscode}"
    pass = DefaultLogin.verifycode

    request = RDKQuery.new('activities-start')
    path = request.path
    parameters = default_activity('100737', 9)

    payload_json = start_person_activity(parameters).to_json 
    response = HTTPartyRDK.post_as_user(path, user, pass, payload_json, TaskHelper.headers)
    p "#{response.code}: #{response.body}" if response.code != 200

    parameters = default_activity('420', 4)

    payload_json = start_person_activity(parameters).to_json 
    response = HTTPartyRDK.post_as_user(path, user, pass, payload_json, TaskHelper.headers)
    p "#{response.code}: #{response.body}" if response.code != 200
  end

  def self.default_activity(patient_id, urgency)
    parameters = {}
    parameters['patient_facility'] = 'SITE'
    parameters['assignedToFac'] = 'SITE'
    parameters['assignedToUser'] = '10000000236'
    parameters['full_assignedTo'] = 'SITE;10000000236'
    parameters['authorFac'] = 'SITE'
    parameters['authorId'] = '10000000236'
    parameters['authorName'] = 'EHMP,UATTWO'
    parameters['patient_id'] = patient_id
    parameters['urgency'] = urgency.to_s
    parameters
  end
end

class BuildQuery
  def initialize
    @path = ''
    @number_parameters = 0
  end

  def add_parameter(param, value)
    if @number_parameters == 0
      @path.concat("?")
    else
      @path.concat("&")
    end
    @number_parameters += 1
    @path.concat(param)
    @path.concat("=")
    @path.concat(value)
  end

  def replace_path_var(var, value)
    @path.gsub!(var, value)
  end

  def add_acknowledge(ack)
    add_parameter("_ack", ack)
  end

  def path
    #p URI.encode(@path)
    return URI.encode(@path)
  end
end

class RDKQuery < BuildQuery
  def initialize(title)
    super()
    domain_path = RDClass.resourcedirectory_fetch.get_url(title)
    @path.concat(domain_path)
  end
end

class FetchResourceDirectory
  @@urls = {}
  def initialize(json, base_url)
    links = json['data']['link']
    links.each do |paths|
      @@urls[paths['title']] = base_url + paths['href']
    end # links
  end #initialize

  def get_url(title)
    return @@urls[title]
  end #get_url
end # FetchResourceDirectory

class RDClass
  @@resourcedirectory_fetch = nil

  def self.resourcedirectory_fetch
    if @@resourcedirectory_fetch.nil?
      p "FIRST TIME: DISCOVER PATHS"
      base_url = "http://#{ENV['RDK_IP']}:#{ENV['RDK_PORT']}"
      path = "#{base_url}/resource/resourcedirectory"
      p path
      @response = HTTParty.get(path)
      @@resourcedirectory_fetch= FetchResourceDirectory.new(JSON.parse(@response.body), base_url)
    end # if
    return @@resourcedirectory_fetch
  end #def self.resourcedirectory_fetch
end
