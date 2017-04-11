# vxapi_utility

VXAPI_URL = 'http://IP_ADDRESS:PORT/resource/docs/vx-api/'

# Utilities for RDK API tests
module VxAPIUtility
  def refresh_token
    # Refresh the token so that the test account does not get session timeout
    @auth_refresh_token.commit
    @auth_refresh_token.responseCode_element.when_visible(@wait_time)
    @auth_refresh_token.responseCode_element.text
  end

  def verify_body_contents(responseBodyElement, expectedBody)
    actual_response_body = responseBodyElement.split("\n")
    actual_response_body.each_with_index do |e, i|
      # puts "verify:<#{i}> Actual=<#{e.strip}>  Exp=<#{expectedBody[i].strip}>"
      if e.strip[0..10] != '"updated": '
        expect(e.strip).to eq(expectedBody[i].strip)
      end
    end
    verify_body_size(actual_response_body, expectedBody)
  end

  def verify_body_size(responseBodyElement, expectedBody)
    expect(responseBodyElement.size).to eq(expectedBody.size)
  end

  def rdk_sync(pid)
    statuspath = QueryRDKSync.new('status', pid).path
    @response = HTTPartyWithBasicAuth.get_with_authorization(statuspath)
    until sync_complete
      path = QueryRDKSync.new('load', pid).path
      @response = HTTPartyWithBasicAuth.get_with_authorization(path)
      expect(@response.code).to eq(201)
      time_out = 300
      wait_time = 10
      is_synced = false
      (0..Integer(time_out) / wait_time).each do
        @response = HTTPartyWithBasicAuth.get_with_authorization(statuspath)
        if sync_complete
          is_synced = true
          break
        else
          sleep wait_time
        end
      end
      expect(is_synced).to eq(true)
    end
  end

  def sync_complete
    is_sync_complete = false
    # 2015-06-19 new way
    status = JSON.parse(@response.body)["data"]
    if status == nil
      status = JSON.parse(@response.body)
    end
    # --DEBUG-------------------------------------------------------------------
    # puts 'sync_status...........................................'
    # puts status
    # puts '----------------------'
    # puts status.key?('syncStatus')
    # puts status['syncStatus'].key?('completedStamp')
    # puts !status['syncStatus'].key?('inProgress')
    # puts status['jobStatus'].empty?
    # puts status['jobStatus']
    # puts 'sync_status...........................................'
    # --DEBUG-------------------------------------------------------------------

    if status.key?("syncStatus") \
      && status["syncStatus"].key?("completedStamp") \
      && !status["syncStatus"].key?("inProgress") \
      && status["jobStatus"].empty?
      is_sync_complete = true
    end

    is_sync_complete
  end

  def get_fhir_composition(test_pid, additional_parms = '')
    command = 'resource/fhir/Composition?' \
              "subject.identifier=#{test_pid}&_ack=true" + additional_parms

    path = QueryGenericRDK.new(command).path
    response = HTTPartyWithBasicAuth.get_with_authorization(path)

    expect(response.code).to eq(200)
    # DEBUG: puts "-------------------------------------"
    # DEBUG: puts "exp="
    # DEBUG: puts JSON.pretty_generate(expected_body)
    # DEBUG: puts "------------"
    # DEBUG: puts "act="
    # DEBUG: puts JSON.pretty_generate(JSON.parse(response.body))
    response.body
  end

  def dump(response_body)
    puts "======================================"
    # puts JSON.parse(response.body)["data"]["currentItemCount"]
    # puts JSON.parse(response.body)["data"]["totalItems"]
    puts "- - - - - - - - - - - - - - - - - - -"
    puts JSON.pretty_generate(JSON.parse(response_body))
    puts "--------------------------------------"
  end

  def rdk_fetch(resource_directory_path, parms = nil)
    query = QueryGenericRDK.new(resource_directory_path)
    unless parms.nil?
      parms.each do |k, v|
        # puts "<#{k}><#{v}>"
        query.add_parameter(k, v)
      end
    end
    # post_resources = [ '/patient-search/global',
    #                     '/sync/expire'
    # ]
    # if resource_directory_path.to_set.intersect?(post_resources.to_set)
    # if resource_directory_path.any? { |x| post_resources.include?(x) }
    if resource_directory_path.include?('/patient-search/global')
      return HTTPartyWithBasicAuth.post_with_authorization(query.path)
    else
      return HTTPartyWithBasicAuth.get_with_authorization(query.path)
    end
  end

  def rdk_fetch_post(resource_directory_path, parms = nil)
    query = QueryGenericRDK.new(resource_directory_path)
    unless parms.nil?
      parms.each do |k, v|
        # puts "<#{k}><#{v}>"
        query.add_parameter(k, v)
      end
    end
    return HTTPartyWithBasicAuth.post_with_authorization(query.path)
  end
end
