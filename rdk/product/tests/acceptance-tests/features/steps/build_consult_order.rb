def build_consult_order_payload(parameter_hash)
  dest_facility = {}
  dest_facility['code'] = variable_or_default(parameter_hash['destination facility code'], "500")
  dest_facility['name'] = variable_or_default(parameter_hash['destination facility name'], "PANORAMA (PAN) COLVILLE, WA")

  ordering_facility = {}
  ordering_facility['code'] = variable_or_default(parameter_hash['ordering facility code'], "500")
  ordering_facility['name'] = variable_or_default(parameter_hash['ordering facility name'], "PANORAMA")

  earliest_date = Date.today.strftime("%m/%d/%Y")
  latest_date = Date.today.next_month.strftime("%m/%d/%Y")

  consult_order = {}
  consult_order['objectType'] = 'consultOrder'
  consult_order['acceptingClinic'] = { :name => '' }
  consult_order['consultName'] = variable_or_default(parameter_hash['domain'], 'Physical Therapy')
  consult_order['deploymentId'] = @deployment_id
  consult_order['destinationFacility'] = dest_facility
  consult_order['earliestDate'] = earliest_date
  consult_order['executionUserId'] = variable_or_fail(parameter_hash, 'executionUserId')
  consult_order['executionUserName'] = variable_or_fail(parameter_hash, 'executionUserName')
  consult_order['formAction'] = variable_or_default(parameter_hash['formAction'], 'saved')
  consult_order['latestDate'] = latest_date
  consult_order['orderingFacility'] = ordering_facility
  consult_order['preReqOrders'] = []
  consult_order['preReqQuestions'] = []
  consult_order['processDefId'] = "Order.Consult"
  
  consult_order['requestReason'] = @request_reason
  consult_order['requestComment'] = @unique_comment
  consult_order['urgency'] = variable_or_default(parameter_hash['urgency'], '9')
  consult_order
end
