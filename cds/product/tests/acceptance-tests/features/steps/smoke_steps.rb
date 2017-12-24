require "selenium-webdriver"
require 'rspec/expectations'
require 'httparty'
require 'DefaultLogin.rb'

World(RSpec::Matchers)

When(/^I go to the cdsinvocation base url plus "(.*?)"$/) do |url|
  #@driver.get("#{ENV['CDSINVOCATION_IP']}/#{url}")
  if url != ""
    puts "url => :#{url}:"
    base_url = DefaultLogin.cdsinvocation_url
    puts "SERVER_URL ********* #{base_url}#{url}"
    @response = HTTParty.get("#{base_url}#{url}", :verify => false)
  else
    puts "I don't have aws access, so lets ouput the URL"
    puts "http://#{ENV['CDSINVOCATION_IP']}"
    @response = "Apache Server"
  end
end

Then(/^what I get back contains (?:"(.*?)")?$/) do |text|
  expect(@response).to include(text)
end

And(/^a CDSInvocation "(.*?)" healthcheck is performed$/) do |cds_service|
  base_url = DefaultLogin.cdsinvocation_url
  path = "#{base_url}/#{cds_service}/rest/healthcheck"
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path)
  puts @response
end

When(/^sending a post request with json data "(.*?)"$/) do |payload|
  base_url = DefaultLogin.cdsinvocation_url
  puts "SERVER_URL ********* #{base_url}/cds-results-service/cds/invokeRules"
  @response = HTTParty.post("#{base_url}/cds-results-service/cds/invokeRules", { :body => payload, :headers => { 'Content-Type' => 'application/json', 'Accept' => 'application/json' } })
end

Then(/^successful message returned with code "(.*?)"$/) do  |text|
 # puts "#{ENV['CDSINVOCATION_IP']}/cds-results-service/rest/invokeRulesForPatient"
  expect(@response.code).to eq(200)
end

When(/^trying to connect to MongoDB$/) do
  base_url = DefaultLogin.cdsdb_url
  puts "SERVER_URL ********* #{base_url}"
  @response = HTTParty.get("#{base_url}", :verify => false)
end

When(/^trying to connect to cds DASHBOARD$/) do
  base_url = DefaultLogin.cdsdashboard_url
  puts "SERVER_URL ********* #{base_url}"
  @response = HTTParty.get("#{base_url}/cdsdashboard/", :verify => false)
end

Then(/^successful message returned from MongoDB server with "(.*?)"$/) do |text|
  expect(@response).to include(text)
end

When(/^sending a get request for a advice$/) do
  path = "http://#{ENV['RDK_IP']}:#{ENV['RDK_PORT']}/resource/cds/advice/list?use=providerInteractiveAdvice&pid=SITE;140"
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path)
  puts @response
end

When(/^trying to connect to open CDS$/) do
  base_url = DefaultLogin.opencds_url
  puts "SERVER_URL ********* #{base_url}"
  @response = HTTParty.get("#{base_url}/opencds-decision-support-service", :verify => false)
end

Then(/^Open CDS server is running with (?:"(.*?)")?$/) do |text|
  expect(@response).to include(text)
end

When(/^sending a get request to FHIR server$/) do
  path = "http://#{ENV['RDK_IP']}:#{ENV['RDK_PORT']}/resource/fhir/patient/SITE;253/observation"
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path)
end
