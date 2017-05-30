require 'VerifyJsonRuntimeValue.rb'
require 'vistarpc4r'
require 'time'

Given(/^save the totalItems$/) do
  @jds_response = @response
  p @total_items = find_total_items(@jds_response)
end

Given(/^a client connect to VistA using "(.*?)"$/) do |site_name|
  @recorde_exisit = false
  site_name = site_name.upcase
  fail "Check you code or the site name #{site_name}! Just PANORAMA and KODAK are define in this code." unless ["PANORAMA", "KODAK"].include? site_name
  # p site_name
  if site_name == "PANORAMA"
    @site_name = "9E7A"
    p base_url = DefaultLogin.panorama_url
  else
    @site_name = "C877"
    p base_url = DefaultLogin.kodak_url
  end
  
  base = base_url.split":"
  ip_address = base[0]
  port = base[1].to_i
  
  access_code = DefaultLogin.access_code
  verify_code = DefaultLogin.verify_code
  
  @broker = VistaRPC4r::RPCBrokerConnection.new(ip_address, port, access_code, verify_code, false)
  @broker.connect
  
  p "*"*62
  p connection_mes = "* The RPC Broker Connection status is #{@broker.isConnected} for site #{site_name} *"
  p "*"*62

  fail connection_mes unless @broker.isConnected
  @broker.setContext('HMP UI CONTEXT')
end

Then(/^the client receive the VistA write\-back response$/) do
  # p "this is the response value"
  response_value = @vista_response.value
  fail "The VistA write-back's response is empty. Response value: #{response_value}" if response_value.nil? || response_value.empty?

  if @recorde_exisit == true
    p "^ Message"* 10 
    p @vista_obj_msg = response_value
    @duplicated = true
    @duplicate_message = "It's duplicated entry. This step did not run."
    expected_data = ["No duplicates allowed", "already exist", "entered in error"]
    result = expected_data.any? { |x| @vista_obj_msg.include?(x) }
    fail "The record exisit, the system should display error message. Response value: #{response_value}" unless result
  else
    json_object = find_object_from_response(@vista_response, "value")
    p "^ object"* 10 
    p @vista_obj_msg = json_object["object"]
    p "^ object"* 10
    @duplicated = false
    fail "The record does not exisit, the system should display Json Object body. Response value: #{response_value}" if @vista_obj_msg.nil? || @vista_obj_msg.empty?
  end
 
end

Then(/^the new "(.*?)" record added for the patient "(.*?)" in VPR format$/) do |domain, pid|
   
  domain = check_domain_name(domain)
  
  max_index_run = 60
  sleep_time = 3
  index = 0
  total_match = false
  # p "9"*80
  # p uid_value_for_new_record = @vista_obj_msg["uid"]
  
  while total_match == false && @recorde_exisit == false && index < max_index_run
    @jds_response = nil
    sleep sleep_time
    
    vpr_formate = VprFormate.new 
    @jds_response = vpr_formate.call_vpr_formate(domain, pid)
  
    new_total_items = find_total_items(@jds_response)
    p @total_items+ 1
    p new_total_items
    total_match = true if new_total_items == @total_items + 1
    
    index = index + sleep_time
  end

  if @recorde_exisit == false
    expect(new_total_items).to eq @total_items + 1
    @total_items = @total_items + 1
  else
    p @duplicate_message
    fail "Your code did not check if the recorde already exisit. Change your code please!" if @duplicate_message.nil?
  end
  
end

When(/^the update "(.*?)" write back record for the patient "(.*?)" dispaly in VPR format with value of$/) do |domain, pid, table|
  domain = check_domain_name(domain)
  vpr_formate = VprFormate.new 
  json_verify = VerifyJsonRuntimeValue.new
  
  max_index_run = 60
  sleep_time = 3
  index = 0
  results_match = false

  table_rows = table.rows
  local_id = table_rows[0][1].downcase
  
  if local_id.start_with? 'above'
    table_rows[0][1] = @vista_local_id.to_s
  end
  
  while results_match == false && index < max_index_run
    @jds_response = nil
    sleep sleep_time
    
    @jds_response = vpr_formate.call_vpr_formate(domain, pid)
    json_object = JSON.parse(@jds_response.body)
    result_array = json_object["data"]["items"]

    p results_match = json_verify.verify_json_runtime_vlaue_for_array(result_array, table_rows, red_flog_on = false)
    
    index = index + sleep_time
  end
  p "The above local id is: #{@vista_local_id.to_s}"
  unless results_match
    json_verify.verify_json_runtime_vlaue_for_array(result_array, table_rows)
  end
end

Then(/^the "(.*?)" record with local id "(.*?)" removed for the patient "(.*?)" in VPR format$/) do |domain, local_id, pid|
  domain = check_domain_name(domain)
  vpr_formate = VprFormate.new 
  
  max_index_run = 120
  sleep_time = 3
  index = 0
  total_match = false
  
  while total_match == false && index < max_index_run
    @response = nil
    sleep sleep_time
    
    @jds_response = vpr_formate.call_vpr_formate(domain, pid)
    
    removed_value = find_removed_value_for_uid(@jds_response, local_id, @site_name)
    
    total_match = true if removed_value == "true"
    
    index = index + sleep_time
  end
  expect(removed_value).to eq("true"), "Expected to find removed=true for reorde #{local_id}, but did not find it.\n reponse body: \n #{@jds_response}"   
end

Then(/^the above "(.*?)" record removed for the patient "(.*?)"$/) do |domain, pid|
  domain = check_domain_name(domain)
  vpr_formate = VprFormate.new 
  
  max_index_run = 120
  sleep_time = 3
  index = 0
  total_match = false
  
  while total_match == false && index < max_index_run
    @response = nil
    sleep sleep_time
    
    @jds_response = vpr_formate.call_vpr_formate(domain, pid)
    
    p removed_value = find_removed_value_for_uid(@jds_response, @local_id, @site_name)
    
    total_match = true if removed_value == "true"
    
    index = index + sleep_time
  end
  expect(removed_value).to eq("true"), "Expected to find removed=true for reorde #{@local_id}, but did not find it.\n reponse body: \n #{@jds_response}"   
end

Then(/^the stamp time get update for recorde Entered in Error$/) do
  p err_msg = "The stamp time after the recorde EIE #{@stamp_time} to be equal or greater than befor the recorde EIE #{@old_stamp_time}" 
  err_msg = "The last up date time should get up to date close to the current time.\n" + err_msg 
  fail err_msg unless @stamp_time.to_i >= @old_stamp_time.to_i 
end

When(/^the client use the vx\-sync write\-back to save the record$/) do
  if @recorde_exisit == true
    p @duplicate_message
    fail "Your code did not check if the recorde already exisit. Change your code please!" if @duplicate_message.nil?
  else
    base_jds_url = DefaultLogin.wb_vx_sync_url
    p path = "#{base_jds_url}/writeback"    
    @vxsync_response = nil
     
    # This is just for test propose. NO one allowed to make change to Last Update Time.
    # In two different times the data get save. One time by Vista and one time by vx-sync.
    # to make sure in our test the recode get save by vx-sync the lastUpdateTime been chagned. 
    p update_time = @vista_obj_msg["lastUpdateTime"]
    update_time = update_time.to_s
  
    update_time = Time.parse(update_time)
    added_date = update_time + 3
    new_time = added_date.strftime("%Y%m%d%H%M%S") 
    sleep 3
    p "********* The new lastUpdateTime is #{new_time.to_i} *******"
    @vista_obj_msg["lastUpdateTime"] = new_time.to_i
   
    param = @vista_obj_msg.to_json
    # p path
    # p param
    p "VXSync writeBack Response" + "^*"* 20
    p @vxsync_response = HTTPartyWithBasicAuth.post_write_back(path, param)
    p "VXSync writeBack Response" + "^*"* 20
  end
end

Then(/^the responce is successful$/) do
  if @recorde_exisit == false
    fail "Expected response code 200, received #{@vxsync_response.code} \n response body: #{@vxsync_response.body} \n params: #{@vista_obj_msg}" unless @vxsync_response.code == 200
  else
    p @duplicate_message
    fail "Your code did not check if the recorde already exisit. Change your code please!" if @duplicate_message.nil?  
  end
end

Then(/^the new write back record dispaly in VPR format with value of$/) do |table|
  # if @recorde_exisit == false
  json_object = JSON.parse(@jds_response.body)
  result_array = json_object["data"]["items"]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_vlaue(result_array, table)
end

Then(/^VistA write-back generate a new localId with values record dispaly in VPR format$/) do |table|
  table_rows = table.rows
  
  if @recorde_exisit == false
    p "^ localId"* 10
    p @vista_local_id = @vista_obj_msg["localId"]
    p "^ localId"* 10
    expect(@vista_local_id.to_i).to be > 0, "The local id should be greater than zero. \n Vista response: #{@vista_obj_msg}"
    table_rows.insert(0, ["localId", @vista_local_id.to_s])
  else
    p @duplicate_message
    fail "Your code did not check if the recorde already exisit. Change your code please!" if @duplicate_message.nil?
  end
 
  json_object = JSON.parse(@jds_response.body)
  result_array = json_object["data"]["items"]

  json_verify = VerifyJsonRuntimeValue.new
  results_match = json_verify.verify_json_runtime_vlaue_for_array(result_array, table_rows)
end

Then(/^the above record dispaly in VPR format with value of$/) do |table|
  table_rows = table.rows
  
  if @local_id.empty?
    fail "Please select another patient, there is no local id found for this patient!"
  else
    table_rows.insert(0, ["localId", @local_id.to_s]) 
  end
 
  json_object = JSON.parse(@jds_response.body)
  result_array = json_object["data"]["items"]

  json_verify = VerifyJsonRuntimeValue.new
  results_match = json_verify.verify_json_runtime_vlaue_for_array(result_array, table_rows)
end

Then(/^the client receive the error message$/) do
  err_mesg = "The recorde already exist, error message should display. \n VistA response: #{@vista_obj_msg}"
  
  expect(@vista_obj_msg).not_to be_empty, err_mesg
  
  expected_data = ["No duplicates allowed", "already exist"]
  
  p result = expected_data.any? { |x| @vista_obj_msg.include?(x) }
  fail err_mesg unless result
end

Then(/^the client receive the "(.*?)" error message$/) do |error_msg|
  response_value = @vista_response.value
  fail "Expected error message: #{error_msg} \n Got: #{response_value}"  unless response_value.include? error_msg
end

When(/^the client search for "(.*?)" related Order IENs$/) do |order_ien|
  rpc_name = "HMP GET RELATED ORDERS"
  @vista_response = ""
  
  data =  order_ien
  params = [data]
  
  p @vista_response = rpc_write_back(rpc_name, params)
end

Then(/^the client receive the whole set of related IENs and what their relationship is$/) do |table|
  vista_obj_message = find_object_from_response(@vista_response, "value")
  table_rows = table.rows
  table_hashes = {}
  table_rows.each do |id, val|
    array_val = val.split(',')
    array_val_i = []
    
    array_val.each do |value|
      value_i = value.to_i
      value = value_i unless value_i ==0
      array_val_i << value
    end
    
    array_val_i = array_val_i[0] if array_val_i.size < 2 
    table_hashes[id] = array_val_i 
  end
  
  expect(vista_obj_message).to eq table_hashes
end

# ------------------------------------------
When(/^the client add new Vital record for patient with DFN "(.*?)"$/) do |dfn, table|
  expected_array = %W[reference_date qualified_name result]
  table_to_hash = convert_table_to_hash(table, expected_array)
  hash_table = table_to_hash[0]
  hash_table_dec = table_to_hash[1]
  reference_date = hash_table["reference_date"]
  reference_date = change_date(reference_date)
  
  rpc_name = "HMP WRITEBACK VITAL"
  # p data = "3150616.0900^"+dfn+"^1;"+value+";^23^10000000224*2:38:50:75"
  data = reference_date + "^" + dfn + "^" + hash_table["qualified_name"] + hash_table["result"] + ";^23^10000000224*2:38:50:75"
  
  @recorde_exisit = false
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client marked a Vital record with local id "(.*?)" as Entered in Error with EIE Reason$/) do |local_id, table|
  removed_value = find_removed_value_for_uid(@response, local_id, @site_name)
  @recorde_exisit = false
  @recorde_exisit = true if removed_value == "true"
  
  table = table.rows
  eie_reason = table[0][1]

  @old_stamp_time = @stamp_time 
  
  rpc_name = "HMP WRITEBACK VITAL EIE"
  
  data =  local_id + "^" + eie_reason
  params = [data]
  
  p @vista_response = rpc_write_back(rpc_name, params)
  
  @current_time_for_domain = Time.new 
end

When(/^the client marked the abvoe Vital record as Entered in Error with EIE Reason "(.*?)"$/) do |eie_reason_code|
  @local_id = @vista_local_id.to_s
  # removed_value = find_removed_value_for_uid(@response, local_id, @site_name)
  @recorde_exisit = false
  # @recorde_exisit = true if removed_value == "true"
  
  eie_reason_code = eie_reason_code.split";"
  eie_code = eie_reason_code[1]

  @old_stamp_time = @stamp_time 
  
  rpc_name = "HMP WRITEBACK VITAL EIE"
  
  data =  @local_id + "^" + eie_code
  params = [data]
  
  p @vista_response = rpc_write_back(rpc_name, params)
  
  @current_time_for_domain = Time.new 
end
 
When(/^the client marked a Allergy record for patient with local id "(.*?)" as Entered in Error$/) do |local_id|
  removed_value = find_removed_value_for_uid(@response, local_id, @site_name)
  @recorde_exisit = false
  @recorde_exisit = true if removed_value == "true"
  
  @old_stamp_time = @stamp_time 
  
  rpc_name = "HMP WRITEBACK ALLERGY EIE"
 
  # data =  local_id + "^" + dfn + "^YES^1^3150813.144304^1^Test - Entered in Error"
  data =  local_id + "^YES^1^3150813.144304^1^Test - Entered in Error"

  params = [data]
  p @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client mark abvoe Allergy record as Entered in Error with comment "(.*?)"$/) do |comment_value|
  # @local_id = ""
  # p @local_id = pick_local_id_that_has_removed_value_false(@response, @site_name)
  
  @local_id = @vista_local_id.to_s
  p "the local id that been chosen to mark as EIE is: #{@local_id}"
  
  @old_stamp_time = @stamp_time 
  
  rpc_name = "HMP WRITEBACK ALLERGY EIE"
 
  # data =  local_id + "^" + dfn + "^YES^1^3150813.144304^1^Test - Entered in Error"
  data =  @local_id + "^YES^1^3150813.144304^1^" + comment_value 

  params = [data]
  p @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add new Lab Order record by using write\-back for patient with DFN "(.*?)" ordering PTT test$/) do |dfn|
  rpc_name = "HMP WRITEBACK LAB ORDERS"
  data = 'XIU,MARGARET^AUDIOLOGY^PTT^BLOOD^SERUM^ASAP^SP^TODAY^ONE TIME^^foo'
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add new Lab Order record by using write\-back for patient with DFN "(.*?)" ordering THEOPHYLLINE test$/) do |dfn|
  rpc_name = "HMP WRITEBACK LAB ORDERS"
  data = 'XIU,MARGARET^AUDIOLOGY^THEOPHYLLINE^BLOOD^SERUM^ROUTINE^SP^TODAY^ONE TIME^^07/07/15 04:00;07/07/15 06:00'
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add new Lab Order record by using write\-back for patient with DFN "(.*?)" ordering GAS AND CARBON MONOXIDE PANEL test$/) do |dfn|
  rpc_name = "HMP WRITEBACK LAB ORDERS"
  data = 'XIU,MARGARET^AUDIOLOGY^GAS AND CARBON MONOXIDE PANEL^BLOOD^BLOOD^ROUTINE^SP^TODAY^ONE TIME^^foo'
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add new Lab Order record by using write\-back for patient with DFN "(.*?)" ordering GENTAMICIN test$/) do |dfn|
  rpc_name = "HMP WRITEBACK LAB ORDERS"
  data = 'XIU,MARGARET^AUDIOLOGY^GENTAMICIN^BLOOD^SERUM^ROUTINE^SP^TODAY^ONE TIME^^PEAK;foo'
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add new problem record by using write\-back for patient with DFN "(.*?)"$/) do |dfn|
  rpc_name = "HMP WRITEBACK PROBLEM"
  # dfn = "66"       
  prv = "9014"    
  vamc = "500"
  flds = [
  [".01", "9777"],
  [".03", "0"],
  [".05", "^Numbness"],
  [".08", "3150729"],
  [".12", "A"],
  ["10,\"NEW\",1", "Farid11 Loss of feeling in extremities"],
  ["10,0", "1"],
  [".13", "3150720"],
  ["1.01", "7078563"],
  ["1.02", "T"],
  ["1.03", "1"],
  ["1.04", "9014"],
  ["1.05", "9025"],
  ["1.06", "9"],
  ["1.07", "3150730"],
  ["1.08", "23"],
  ["1.09", "3150721"],
  ["1.1", "0"],
  ["1.11", "0"],
  ["1.12", "0"],
  ["1.13", "0"],
  ["1.14", "C"],
  ["1.15", "0"],
  ["1.16", "0"],
  ["1.17", "1"],
  ["1.18", "0"]
]

  params = [dfn, prv, vamc, flds]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client (?:add new|try to add existing) Drug Allergy record for patient with DFN "(.*?)"$/) do |dfn, table|
  expected_array = %W[reference_date causative_agent historical author_dictator type_name nature_of_reaction symptom1 symptom2 severity comment]
  table_to_hash = convert_table_to_hash(table, expected_array)
  hash_table = table_to_hash[0]
  hash_table_dec = table_to_hash[1]
  reference_date = hash_table["reference_date"]
  reference_date = change_date(reference_date)
  
  rpc_name = "HMP WRITEBACK ALLERGY"
  flds = [
  ["\"GMRACHT\",0", "1"],
  ["\"GMRACHT\",1", reference_date],
  ["\"GMRAGNT\"", hash_table["causative_agent"]],
  ["\"GMRAOBHX\"", hash_table["historical"]],
  ["\"GMRAORDT\"", reference_date],
  ["\"GMRAORIG\"", hash_table["author_dictator"]],
  ["\"GMRAORDT\"", reference_date],
  ["\"GMRASEVR\"", "2"],
  ["\"GMRATYPE\"", hash_table["type_name"]],
  ["\"GMRANATR\"", hash_table["nature_of_reaction"]],
  ["\"GMRASYMP\",0", "2"],
  ["\"GMRASYMP\",1", hash_table["symptom1"]],
  ["\"GMRASYMP\",2", hash_table["symptom2"]],
  ["\"GMRARDT\"", reference_date],
  ["\"GMRACMTS\",0", hash_table["severity"]],
  ["\"GMRACMTS\",1", hash_table["comment"]]
]
  
  data = hash_table_dec["causative_agent"]
  @recorde_exisit = check_data_exisit_for_allergy(data)
 
  params = ["0", dfn, flds]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add (?:new|same) Immunization record for patient with DFN "(.*?)" enter$/) do |dfn, table|
  hash_table = {}
  hash_table_dec = {}
  table.rows.each do |field, dec, value|
    hash_table[field] =  value
    hash_table_dec[field] =  dec
  end
    
  table_keys = hash_table.keys
  table_keys = table_keys.map(&:downcase)
  expected_array = %W[contra series reaction contraindicated comment]
  expect(table_keys).to match_array(expected_array), "Please check your code. \n expected array: #{expected_array} \n got: #{table_keys} "
  
  rpc_name = "HMP WRITEBACK IMMUNIZATION"
  # data="DFN^IEN^hospitalLocation^date/time^A^991^IMM^immunizationType^series^RESULT CODE^comments date^reaction^CONTRAINDICATED"
  hash_table["comment"] = hash_table["comment"] + " at " + Time.new.to_s
  p data = dfn + "^0^229^3150825.171130^A^991^IMM^" + hash_table["contra"] + "^" + hash_table["series"] + "^1^" + hash_table["comment"] + "^" + hash_table["reaction"] + "^" + hash_table["contraindicated"]
  
  # p @response
  data_check = [["cptName", hash_table_dec["contra"]], ["administeredDateTime", "20150825171130"]]
  @recorde_exisit = check_data_exisit(data_check)
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^new the client add (?:new|same) Immunization record for patient with DFN "(.*?)" enter$/) do |dfn, table|
  expected_array = %W[inpatient location date_time service_category provider_ien immunization_ien category narrative_of_immunization]
  expected_array = expected_array + %W[series encounter_provider reaction contraindicated next_comment_sequence cvx_code event dose route admin_site]
  expected_array = expected_array + %W[lot manufacturer expiration_date event_date ordering_provider vis remarks non_know]
  # expected_array = %W[reference_date contra series reaction contraindicated comment result_code lot_number expiration_date manufacturer info_source order_provider route dose vis_date]

  table_to_hash = convert_table_to_hash(table, expected_array)
  piece = table_to_hash[0]
  piece_dec = table_to_hash[1]
  
  # p piece["date_time"] = change_date(piece["date_time"])
  
  rpc_name = "HMP WRITEBACK IMMUNIZATION"
  p piece["next_comment_sequence"]
  # piece["next_comment_sequence"] = piece["next_comment_sequence"] + " at " + Time.new.to_s
  
  # DATA="DFNEncounterPatient^EncounterInpatient^EncounterLocation^EncounterDateTime^EncounterServiceCategory^ProviderIEN^IMM^ImmunizationIEN^Category^
  # NarrativeOfImmunization^Series^EncounterProvider^Reaction^Contraindicated^^NextCommentSequence^CVXCode^EventInfoSource;HL7Code;IEN^Dose;Units;UnitsIEN^
  # RouteName;HL7Code;IEN^AdminSiteName;HL7Code;IEN^Lot#;IEN^Manufacturer^ExpirationDate^EventDateTime^OrderingProvider^VIS^Remarks"
  
  data = dfn + "^" + piece["inpatient"] + "^" + piece["location"] + "^" + piece["date_time"] + "^" + piece["service_category"] + "^" + piece["provider_ien"]
  data = data + "^IMM^" + piece["immunization_ien"] + "^" + piece["category"] + "^" + piece["narrative_of_immunization"] + "^" + piece["series"]
  data = data + "^" + piece["encounter_provider"] + "^" + piece["reaction"] + "^" + piece["contraindicated"] + "^" + piece["non_know"] + "^" + piece["next_comment_sequence"]
  data = data + "^" + piece["cvx_code"] + "^" + piece["event"] + "^" + piece["dose"] + "^" + piece["route"] + "^" + piece["admin_site"]
  data = data + "^" + piece["lot"] + "^" + piece["manufacturer"] + "^" + piece["expiration_date"] + "^" + piece["event_date"]
  p data = data + "^" + piece["ordering_provider"] + "^" + piece["vis"] + "^" + piece["remarks"]  
  # p "Orlando date"
  # p data_o = dfn + "^0^229^3151020.145115^A^991^IMM^15^^DTAP^3^^FEVER^1^^COMMENT^1^Historical information -source unspecified;ID;1^DOSE^ORAL^1^EHMP0001^ABBOTT LABORATORIES^OCT 20,2015^3151022.145115^86^3151027.174303^OneRemark"
  # p "Tim date"
  # p data_t = dfn + "^0^229^3150121.174303^A^991^IMM^35^3^1^This is a comment!^FEVER^0^EHMP0001;1^3151201.000000^ABBOTT LABORATORIES^0;1^1^INTRADERMAL;ID;1^DOSE^1/3110714.000000;2/3100310.000000"
  # # p @response
  # p "Orlando date"
  # p data = dfn + "^0^229^3150522.174303^A^991^IMM^1020^^DTAP^3^^FEVER^1^^COMMENT^1^2^.25;mg;1^NASAL^LD^EHMP0001;1^ABBOTT LABORATORIES^OCT 20,2015^OCT 21,2015^229^MEASLES/MUMPS/RUBELLA VIS^1"
   
  data_check = [["cptName", piece_dec["immunization_ien"]], ["administeredDateTime", piece_dec["event_date"]], ["uid", "CONTAINS " + @site_name]]
  @recorde_exisit = check_data_exisit(data_check)
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add (?:new|same) Immunization record using Encounter Form for patient with DFN "(.*?)" enter$/) do |dfn, table|
  # @response = @jds_response
  expected_array = %W[contra series reaction contraindicated comment]
  
  hash_table_return = convert_table_to_hash(table, expected_array)
  hash_table = hash_table_return[0] 
  hash_table_dec = hash_table_return[1] 
  
  rpc_name = "HMP WRITEBACK ENCOUNTERS"
  hash_table["comment"] = hash_table["comment"] + " at " + Time.new.to_s
  
  sub_data_a = dfn + "^0^229^3150925.171135^A^991^IMM^"
  sub_data_b = hash_table["contra"] + "^" + hash_table["series"] + "^1^" + hash_table["comment"] + "^" + hash_table["reaction"] + "^" + hash_table["contraindicated"]
  p data = sub_data_a + sub_data_b

  data_check = [["cptName", hash_table_dec["contra"]], ["administeredDateTime", "20150925171135"], ["uid", "CONTAINS " + @site_name]]
  @recorde_exisit = check_data_exisit(data_check)
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client add (?:new|same) CPT record using Encounter Form for patient with DFN "(.*?)" enter$/) do |dfn, table|
  # @response = @jds_response
  expected_array = %W[procedure modifiers provider quantity comment entered procedure_code]
  
  hash_table_return = convert_table_to_hash(table, expected_array)
  p hash_table = hash_table_return[1] 
  p hash_table_dec = hash_table_return[0] 
  
  # data = dfn + "^0^32^3071015.1507^X^983^CPT^" + "82000^^2^USER,PANORAMA"
  # CPT^CPT code^Modifier1 code;Modifier2 code;...^Quantity^Provider name^Comment 
  rpc_name = "HMP WRITEBACK ENCOUNTERS"
  hash_table["comment"] = hash_table["comment"] + " at " + Time.new.to_s
  
  p entered = hash_table["entered"]
  p entered_time = entered.gsub(".", "")
  len = entered.length
  p last_update_time = "3" + entered[2..len]
  
  
  sub_data_a = dfn + "^0^32^" + last_update_time + "^X^983^CPT^"
  sub_data_b = hash_table["procedure_code"] + "^" + hash_table["modifiers"] + "^" + hash_table["quantity"] + "^" + hash_table["provider"] + "^" + hash_table["comment"]
  p data = sub_data_a + sub_data_b
  # data = dfn + "^0^32^3071015.1507^X^983^CPT^" + "82000^^2^USER,PANORAMA"

  data_check = [["name", hash_table["procedure"]], ["entered", entered_time], ["uid", "CONTAINS " + @site_name]]
  @recorde_exisit = check_data_exisit(data_check)  
  # p "Does the record exist?  #{@recorde_exisit}"
  
  params = ["0", dfn, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client create new Note Stub record for patient with DFN "(.*?)" enter$/) do |dfn, table|
  sub_data = []
  expected_array = %W[document_type author_dictator reference_date comment]
  table_to_hash = convert_table_to_hash(table, expected_array)
  hash_table = table_to_hash[1]
  hash_table_dec = table_to_hash[0]
  reference_date = hash_table["reference_date"]
  reference_date = change_date(reference_date)

  hash_table["comment"] = hash_table["comment"] + " At: " + Time.new.to_s
  
  p data = dfn + "^" + hash_table["document_type"] + "^^^^" + hash_table["author_dictator"] + "^" + reference_date + "^^" 
  
  sub_data[0] = ["\"data\"", data]
  sub_data[1] = ["\"text\",1", hash_table["comment"]]
  
  p data = [sub_data[0], sub_data[1]]
  
  rpc_name = "HMP SAVE NOTE STUB"
  
  params = [data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client (?:save|update the above) TIU Note record for patient with DFN "(.*?)" enter$/) do |dfn, table|
  sub_data = []
  expected_array = %W[ien document_type visit_date visit_ien author_dictator reference_date subject service_category comment]
  table_to_hash = convert_table_to_hash(table, expected_array)
  hash_table = table_to_hash[1]
  hash_table_dec = table_to_hash[0]
  reference_date = hash_table["reference_date"]
  reference_date = change_date(reference_date)

  hash_table["comment"] = hash_table["comment"] + " At: " + Time.new.to_s
    
  data1 = dfn + "^" + hash_table["document_type"] + "^" + hash_table["visit_date"] + "^67^" + hash_table["visit_ien"] + "^"
  data2 = hash_table["author_dictator"] + "^" + reference_date + "^" + hash_table["subject"] + "^67;" + reference_date + ";" + hash_table["service_category"] 
  p data12 = data1 + data2
  sub_data[0] = ["\"data\"", data12]
  sub_data[1] = ["\"text\",1", hash_table["comment"]]
  
  p data = [sub_data[0], sub_data[1]]
  
  rpc_name = "HMP WRITEBACK TIU NOTE SAVE"
  
  p ien = hash_table["ien"]
  p ien = @vista_local_id.to_s
  params = [ien, data]
  @vista_response = rpc_write_back(rpc_name, params)
end

When(/^the client sign TIU Note record for patient with DFN "(.*?)" enter$/) do |dfn, table|
  ien = @vista_local_id
  p rpc_name = "HMP WRITEBACK SIGN TIU NOTE"
  access_code = "REDACTED"
  verify_code = "REDACTED"

  # ien = "11597"
  esig = "REDACTED"
  
  vista_rpc = VistaRPC4r::VistaRPC.new(esig)
  p esig = vista_rpc.encrypt(esig)
  
  # data_check = [["name", hash_table["procedure"]], ["entered", entered_time], ["uid", "CONTAINS " + @site_name]]
  # @recorde_exisit = check_data_exisit(data_check)  
  p ien
  params = [ien, esig]
  @vista_response = rpc_write_back(rpc_name, params)
end

Then(/^save the local id from VistA write\-back response$/) do
  p "^ localId"* 10
  p @vista_local_id = @vista_obj_msg["localId"]
  p "^ localId"* 10
  expect(@vista_local_id.to_i).to be > 0, "The local id should be greater than zero. \n Vista response: #{@vista_obj_msg}"
end

# ------------------------------

def rpc_write_back(rpc_name, params)
  # @broker.setContext('HMP UI CONTEXT')
  response = ""
  
  vrpc = VistaRPC4r::VistaRPC.new(rpc_name, VistaRPC4r::RPCResponse::SINGLE_VALUE)
  
  i = 0
  p params
  params.each do |param|
    vrpc.params[i] = param
    i += 1
  end
  
  # p vrpc
  p "* response     "* 10
  p response = @broker.execute(vrpc)
  p "* response     "* 10
  
  p response if response.value.empty? 
  fail "Error: PLease read the above error message #{response}" if response.value.empty?
  return response
end

def find_total_items(jds_response)
  begin
    json_object = JSON.parse(jds_response.body)
  rescue Exception => e
    err_mesf = "An error has occured at JSON::Parser." + e.to_s
    raise err_mesf
  end
  
  return json_object["data"]["totalItems"]
end

def check_domain_name(domain)
  all_domains = { 
    "ALLERGY" => "allergy", "LAB" => "lab", "VITAL" => "vital", "LAB ORDER" => "order", "VLER DOCUMENT" => "vlerdocument", 
    "MEDS" => "med", "CONSULT" => "consult", "PROBLEM LIST" => "problem", "PROCEDURE" => "procedure", 
    "PURPOSE OF VISIT" => "pov", "DOCUMENT" => "document", "APPOINTMENT" => "appointment", "PATIENT DEMOGRAPHICS" => "patient",
    "EDUCATION" => "education", "VISIT" => "visit", "FACTOR" => "factor", "CPT" => "cpt", "SURGERY" => "surgery",
    "SKIN" => "skin", "MENTAL HEALTH" => "mh", "EXAM" => "exam", "IMMUNIZATION" =>"immunization", "IMAGE" => "image" 
  }
  domain_name = all_domains[domain.upcase]
  fail "Please check your step ruby file. \n This domain: #{domain} does not specify in our test. \n #{all_domains.keys}" if domain_name.nil? || domain_name.empty?
  return domain.downcase
end
  
def find_removed_value_for_uid(response, local_id, site_name)
  json_object = JSON.parse(response.body)
  updated = json_object["data"]["updated"]
  result_array = json_object["data"]["items"]
  p result_array.size
  result_array.each do |object|
    
    if (object["uid"].include? local_id) && (object["uid"].include? site_name)
      p "This is the last access time #{updated}"
      p "This is the uid of the patieont that EIE: #{object["uid"]}"
      p "This is the value of removed object for the patieont that EIE: #{object["removed"]}"
      p "This is the stanp time of the patieont that EIE: #{object["stampTime"]}"
      removed_value = object["removed"]
      removed_value = removed_value.to_s
      @stamp_time = object["stampTime"]
      return removed_value
    end
 
  end
  return "false"
end

def pick_local_id_that_has_removed_value_false(response, site_name)
  json_object = JSON.parse(response.body)
  updated = json_object["data"]["updated"]
  result_array = json_object["data"]["items"]
  result_array.each do |object|
    p removed_value = object["removed"]
    if (removed_value.nil?) && (object["uid"].include? site_name)
      return object["localId"]
    end
 
  end
  fail "Please select another patient. This patient does not have any recodr ro mark them as EIE"
end

def check_data_exisit(table)
  if @total_items > 0
    value_field = VerifyJsonRuntimeValue.new
    runtime_json_object = find_object_from_response(@jds_response)
    runtime_json_object = runtime_json_object["data"]["items"]
  
    data_exist = value_field.verify_json_runtime_vlaue_for_array(runtime_json_object, table, false)
    p "The data found in the record: #{data_exist}"
    return data_exist
  else
    return false
  end
end

def check_data_exisit_for_allergy(data)
  return false unless @total_items > 0
  
  value_field = VerifyJsonRuntimeValue.new
  runtime_json_object = find_object_from_response(@jds_response)
  runtime_json_object = runtime_json_object["data"]["items"]
  
  runtime_json_object.each do |object|
     
    if object["removed"] == nil && object["products"][0]["name"] == data
      p "The patient allready has #{data} on uid: #{object["uid"]}"
      data_exist = true
      return true
    end
    
  end
  return false
end

def find_object_from_response(response, for_value_or_body = "body")
  # return nil if @recorde_exisit
  if for_value_or_body == "body"
    response = response.body
  else
    response = response.value
  end
  
  begin
    json_object = JSON.parse(response)
  rescue Exception => e
    err_mesf = "PLease check your VistA response. An error has occured at JSON::Parser." + e.to_s + "\n VistA response: " + response
    raise err_mesf
  end
  return json_object
end

def convert_table_to_hash(table, expected_array)
  hash_table = {}
  hash_table_dec = {}
  table.rows.each do |field, dec, value|
    hash_table[field] =  value
    hash_table_dec[field] =  dec
  end
    
  table_keys = hash_table.keys
  table_keys = table_keys.map(&:downcase)
  
  expect(table_keys).to match_array(expected_array), "Please check your code. \n expected array: #{expected_array} \n got: #{table_keys} "
  return hash_table, hash_table_dec
end

def change_date(date)
  len = date.length
  date = "3" + date[2..len]
  return date
end
