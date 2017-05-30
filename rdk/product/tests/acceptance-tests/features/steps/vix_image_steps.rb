When(/^the client request metadata for an imaging study for the patient with all parameters/) do |table|
  table.hashes.each do |row|
    pid = row[:pid]
    site_number =  row[:siteNumber]
    context_id = row[:contextId]
    resource = RDKQuery.new('vix-image')
    resource.add_parameter('pid', pid)  unless pid.nil?
    resource.add_parameter('siteNumber', site_number) unless site_number.nil?
    resource.add_parameter('contextId', context_id) unless context_id.nil?
    path = resource.path
    @response = HTTPartyRDK.get(path)
    expect(@response.code).to eq(200), "code: #{@response.code}, body: #{@response.body}"
  end
end

When(/^the client request metadata for an imaging study for the patient with missing pid parameters/) do |table|
  table.hashes.each do |row|
    pid = row[:pid]
    site_number =  row[:siteNumber]
    context_id = row[:contextId]
    resource = RDKQuery.new('vix-image')
    resource.add_parameter('pid', pid)  unless pid.nil?
    resource.add_parameter('siteNumber', site_number) unless site_number.nil?
    resource.add_parameter('contextId', context_id) unless context_id.nil?
    path = resource.path
    @response = HTTPartyRDK.get(path)
    expect(@response.body).to eq('{"message":"PEP: Unable to process request. Pid not found.","status":403}'), "code: #{@response.code}, body: #{@response.body}"
  end
end

When(/^the client request metadata for an imaging study for the patient with missing siteNumber parameters/) do |table|
  table.hashes.each do |row|
    pid = row[:pid]
    site_number =  row[:siteNumber]
    context_id = row[:contextId]
    resource = RDKQuery.new('vix-image')
    resource.add_parameter('pid', pid)  unless pid.nil?
    resource.add_parameter('siteNumber', site_number) unless site_number.nil?
    resource.add_parameter('contextId', context_id) unless context_id.nil?
    path = resource.path
    @response = HTTPartyRDK.get(path)
    expect(@response.body).to eq('{"message":"The required parameter \"siteNumber\" is missing.","status":400}'), "code: #{@response.code}, body: #{@response.body}"
  end
end

When(/^the client request metadata for an imaging study for the patient with missing contextId parameters/) do |table|
  table.hashes.each do |row|
    pid = row[:pid]
    site_number =  row[:siteNumber]
    context_id = row[:contextId]
    resource = RDKQuery.new('vix-image')
    resource.add_parameter('pid', pid)  unless pid.nil?
    resource.add_parameter('siteNumber', site_number) unless site_number.nil?
    resource.add_parameter('contextId', context_id) unless context_id.nil?
    path = resource.path
    @response = HTTPartyRDK.get(path)
    expect(@response.body).to eq('{"message":"The required parameter \"contextId\" is missing.","status":400}'), "code: #{@response.code}, body: #{@response.body}"
  end
end


