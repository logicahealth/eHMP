
When(/^the client requests for (wards|clinics) with\
(?: names beginning with "(.*?)")?\
(?: and)?\
(?: facility code of "(.*?)")?\
(?: site code of "(.*?)")?\
(?: start index of (\d+))?\
(?: limited to (\d+))?/) do |type, name, facilitycode, sitecode, start, limit|
  search_ward = RDKQuery.new("locations-#{type}")
  search_ward.add_parameter('name', name)  unless name.nil?
  search_ward.add_parameter('facility.code', facilitycode) \
    unless facilitycode.nil?
  search_ward.add_parameter('site.code', sitecode)  unless sitecode.nil?
  search_ward.add_parameter('start', start) unless start.nil?
  search_ward.add_parameter('limit', limit) unless limit.nil?
  path = search_ward.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end

When(/^the client requests for patients in (ward|clinic) location uid "(.*?)"\
(?: with)?\
(?: reference id of "(.*?)")?\
(?: start date of "(.*?)")?\
(?: and end date of "(.*?)")?\
(?: filtered by \'(.*?)\')?/) do |type, uid, refid, startdate, enddate, filter|
  type = type == 'ward' ? 'wards' : type
  type = type == 'clinic' ? 'clinics' : type
  search_ward = RDKQuery.new("locations-#{type}-search")
  search_ward.add_parameter('uid', uid)
  search_ward.add_parameter('ref.id', refid) unless refid.nil?
  search_ward.add_parameter('date.start', startdate)  unless startdate.nil?
  search_ward.add_parameter('date.end', enddate)  unless enddate.nil?
  search_ward.add_parameter('filter', filter) unless filter.nil?
  path = search_ward.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end
