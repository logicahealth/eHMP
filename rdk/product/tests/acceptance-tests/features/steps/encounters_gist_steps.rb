When(/^the client requests the Encounters Admission for the patient "([^"]*)"$/) do |pid|
  #filter=&timerange=04/07/1935|02/28/2016&pid=SITE;164
  today = convert_cucumber_date('TODAY')
  filter_string = "or(eq(kind, 'Visit')"
  filter_string << ",eq(kind, 'Admission')"
  filter_string << ",eq(kind, 'Procedure')"
  filter_string << ",eq(kind, 'DoD Appointment')"
  filter_string << ",eq(kind, 'Appointment')"
  filter_string << ",eq(kind, 'DoD Encounter')"
  request = QueryRDKDomain.new('timeline')
  request.add_parameter('filter', filter_string)
  #request.add_parameter('order', "dateTime DESC")
  #request.add_parameter('timerange', "04/07/1935|02/28/2016")
  #request.add_parameter('timerange', "01/01/2014|02/28/2016")
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end
