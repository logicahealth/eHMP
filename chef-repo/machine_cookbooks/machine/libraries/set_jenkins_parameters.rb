require 'nokogiri'

def set_jenkins_parameters(project, branch)
  puts "Retrieving parameters from last successful build of #{project}-acceptance-test-build-#{branch}..."
  xml = "https://build.vistacore.us/job/#{project}-acceptance-test-build-#{branch}/api/xml?depth=1&xpath=(/*/build[result=%27SUCCESS%27])[position()=1]/action[position()=1]"
  doc = Nokogiri::XML(open(xml))
  names = doc.xpath('//action/parameter/name').collect { |node| node.text }
  values = doc.xpath('//action/parameter/value').collect { |node| node.text }
  names.each_with_index do |name, i|
    ENV[name] = values[i]
    puts "#{name}=#{values[i]}"
  end
end
