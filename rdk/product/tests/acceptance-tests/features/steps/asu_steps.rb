When(/^the client requests documents through rdk "([^"]*)"$/) do |pid|
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('pid', pid)

  path = request.path
  @response_rdk = HTTPartyRDK.get(path)
  expect(@response_rdk.code).to eq(200)
end

Given(/^the jds response contains an item$/) do |table|

  json_vxsync_documents = JSON.parse(@response_vx_sync.body)
  found_item = nil
  found_match = false
  json_vxsync_documents['data']['items'].each do | item |
    full_match = Set.new
    table.rows.each do | parameter, value |
      full_match.add(item[parameter] == value)
    end
    found_match = (full_match.size == 1) && full_match.to_a[0]
    found_item = item if found_match
    break if found_match
  end
  expect(found_match).to eq(true), "Response did not contain item with expected parameter/value pairs"
  expect(found_item).to_not be_nil
  @filtered_uid = found_item['uid']
  p @filtered_uid
end

Then(/^the response does not contain the asu\-filtered document$/) do
  json_rdk = JSON.parse(@response_rdk.body)
  p json_rdk['data']['items'].length

  steps_source = 'data.items.uid'.split('.')

  rdk_uids = []
  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json_rdk, '', rdk_uids)
  expect(rdk_uids).to_not include @filtered_uid
end

Given(/^the client requests documents through jds for patient "([^"]*)"$/) do |pid|
  request_through_jds = "#{DefaultLogin.jds_url}/vpr/#{pid}/find/document"
  p request_through_jds
  @response_vx_sync = HTTPartyRDK.get(request_through_jds)
  expect(@response_vx_sync.code).to eq(200)
end

Given(/^the client requests documents through rdk as pathology,one "([^"]*)"$/) do |pid|
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('pid', pid)

  path = request.path
  @response_rdk_path = HTTPartyRDK.get_as_user(path, '9E7A;PR12345', 'PR12345!!')

  expect(@response_rdk_path.code).to eq(200)
end

Then(/^compare documents$/) do
  json_rdk = JSON.parse(@response_rdk.body)
  json_vxsync_documents = JSON.parse(@response_jds_pano.body)
  json_vxsync_consults = JSON.parse(@response_consult.body)

  all_vxsync = json_vxsync_documents['data']['items'] + json_vxsync_consults['data']['items']

  p json_rdk['data']['items'].length

  p all_vxsync.length

  steps_source = 'uid'.split('.')

  rdk_uids = []
  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json_rdk, '', rdk_uids)

  vxsync_uids = []
  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, all_vxsync, '', vxsync_uids)

  p rdk_uids - vxsync_uids
  combine = rdk_uids - vxsync_uids
  p combine.length

  p rdk_uids & vxsync_uids
  combine = rdk_uids & vxsync_uids
  p combine.length
end

When(/^the client requests documents by scrolling for the patient "([^"]*)" limited by$/) do |pid, table|
  parameter_hash = {}

  parameter_hash['template'] = 'notext'

  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end
  start_index = 0
  @limit_size = parameter_hash['limit'].to_i

  @response_has_skipped_document = false
  quit_after_loop = 20
  no_more_pages_available = false
  @response_count = []
  until no_more_pages_available
    parameter_hash['start'] = start_index
    request_sorted_documents(pid, parameter_hash, "", "")
    expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"

    json_body = JSON.parse(@response.body)
    current_response_next_start_index = json_body['data']['nextStartIndex'].to_i
    current_response_start_index = json_body['data']['startIndex'].to_i

    @response_count.push(json_body['data']['items'].length) unless current_response_start_index == current_response_next_start_index
    no_more_pages_available = true if json_body['data']['items'].length == 0
    break if (quit_after_loop -= 1) == 0

    expect(json_body['data']['currentItemCount'].to_i).to be <= @limit_size

    @response_has_skipped_document = true if current_response_next_start_index > start_index + @limit_size

    start_index = current_response_next_start_index

    p "quit_after_loop #{quit_after_loop}"
    p "startIndex #{json_body['data']['startIndex']}"
    p "pageIndex #{json_body['data']['pageIndex']}"
    p "currentItemCount #{json_body['data']['currentItemCount']}"
    p "itemsPerPage #{json_body['data']['itemsPerPage']}"
    p "nextStartIndex #{json_body['data']['nextStartIndex']}"
  end
end

Then(/^the document response maintains minimum page size$/) do
  expect(@response_has_skipped_document).to eq(true), "nextStartIndex did not indicate that a document had been skipped for asu rules"
  p @response_count
  for i in 0..@response_count.length - 2
    expect(@response_count[i]).to eq(@limit_size), "response #{i} did not contain miminum page size of #{@limit_size}, it contained #{@response_count[i]}"
  end
  expect(@response_count.last).to be <= @limit_size
end
