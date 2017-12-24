#http://IP             /patientrecord/labpanels?pid=SITE%3B1&_ack=true&accessCode=USER  &verifyCode=PW      &site=SITE
class LabsByPanel < BuildQuery
  def initialize(parameter_hash_table)
    super()
    title = "patient-record-labsbypanel"
    domain_path = RDClass.resourcedirectory_fetch.get_url(title)
    p "domain path: #{domain_path}"
    @path.concat(domain_path)
    @number_parameters = 0

    parameter_hash_table.each do |key, value|
      add_parameter(key, value) unless value.nil? || value.empty?
    end
  end # initialize
end # class

When(/^the client requests a response in VPR format from RDK API with the labsbypanel parameters$/) do |parameter_table|
  parameter_hash_table = parameter_table.hashes[0]
  path = LabsByPanel.new(parameter_hash_table).path
  @response = HTTPartyRDK.get(path)
end
