class VerifyEncounterHxOccuranceFormat
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    #p "#{html_element.text} should contain #{value}"
    reggie = /\d+/
    text = html_element.text
    @error_message = "Does element text match regex #{reggie}: #{text}"
    
    return !(reggie.match(text)).nil?
  end

  def error_message
    return @error_message
  end
end

class EncountersGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super  
    @appletid = 'encounters'
    appletid_css = "[data-appletid=#{@appletid}]"

    add_verify(CucumberLabel.new("Encounter Gist Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[ddata-appletid=encounters] .panel-title"))
    add_verify(CucumberLabel.new("EncountersGridVisible"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] .enc-gist-list"))
    #Encounter Header Verification 
    add_verify(CucumberLabel.new("Description-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="description-header"]'))
    add_verify(CucumberLabel.new("Event-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="event-header"]'))
    add_verify(CucumberLabel.new("Age-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="age-header"]'))
    #Encounter details at top level verification
    add_verify(CucumberLabel.new("Visits"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits]"))
    add_verify(CucumberLabel.new("Appointments"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Appointments]"))
    add_verify(CucumberLabel.new("Admissions"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Admissions]"))
    add_verify(CucumberLabel.new("Procedures"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Procedures]"))

    add_verify(CucumberLabel.new("Visits Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Appointments Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Admissions Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Admissions] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Procedures Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Procedures] .flex-width-2 div.table-cell:nth-of-type(2)"))
    
    # add actions for applet buttons, ex refresh, filter, maximize
    add_applet_buttons appletid_css  
    add_applet_title appletid_css
    add_toolbar_buttons

    #Expand encounter objects
    add_action(CucumberLabel.new("Expand_Visits"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] i"))
    add_action(CucumberLabel.new("Expand_Procedures"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] i"))
    add_action(CucumberLabel.new("Expand_Appointments"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] i"))
    add_action(CucumberLabel.new("Expand_Admissions"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] i"))
    #expand collapse timeline  
    add_action(CucumberLabel.new("Close-Timeline"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=newsfeed] .applet-minimize-button"))
    #text filter  
    #Quick View
    add_verify(CucumberLabel.new("Quick View Table Title"), VerifyText.new, AccessHtmlElement.new(:css, ".overview .popover-title"))
    #menu
    # add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] div.toolbarActive [button-type=quick-look-button-toolbar]"))
    # add_action(CucumberLabel.new("Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] div.toolbarActive [button-type=detailView-button-toolbar]"))
    #modal title
    add_verify(CucumberLabel.new("Main Modal Label"), VerifyContainsText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))
  end

  def applet_loaded?
    # return true if am_i_visible? 'Empty Gist' I don't believe it is possible for encounters to be empty, there is always 4 rows
    return TestSupport.driver.find_elements(:css, '[data-appletid=encounters] div.enc-gist-list').length > 0
  rescue => e 
    # p e
    false
  end
end 

class VisitObject <  ADKContainer
  include Singleton
  def initialize
    super   
    #Visit expand Header Verification 
    add_verify(CucumberLabel.new("Visit Type Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new("Hx Occurrence Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header1']"))
    add_verify(CucumberLabel.new("Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header2']"))
    
    #Visit expand view details  
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Visit-GENERALINTERNALMEDICINE"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE Hx Occurrence"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Visit-GENERALINTERNALMEDICINE]"))
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Visit-GENERALINTERNALMEDICINE]"))

    add_verify(CucumberLabel.new("CARDIOLOGY"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Visit-CARDIOLOGY"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("CARDIOLOGY Hx Occurrence"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Visit-CARDIOLOGY]"))
    add_verify(CucumberLabel.new("CARDIOLOGY Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Visit-CARDIOLOGY]"))
      
    #Visit right and left click
    add_action(CucumberLabel.new("Visits Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] .right-side"))
    add_action(CucumberLabel.new("Visit Type-GENERAL INTERNAL MEDICINE Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Visit-GENERALINTERNALMEDICINE]"))
    #add_action(CucumberLabel.new("Visit Type-GENERAL INTERNAL MEDICINE Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "#encountersVisits-event-gist #event_name_encounters-Visit-GENERALINTERNALMEDICINE"))
    # visit_tab_id_left = 'event_name_encounters-Visit-GENERALINTERNALMEDICINE'
    #  add_action(CucumberLabel.new("Visit Type-GENERAL INTERNAL MEDICINE Left Click"), FocusInAction.new(visit_tab_id_left), AccessHtmlElement.new(:css, "[data-appletid='encounters'] ##{visit_tab_id_left}"))
    add_action(CucumberLabel.new("Visit Type-GENERAL INTERNAL MEDICINE Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=event_name_encounters-Visit-GENERALINTERNALMEDICINE]"))
    
    #sorting header definitions  
    add_action(CucumberLabel.new("Visit Type Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='name-header']"))
    add_action(CucumberLabel.new("Hx Occurrence Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header1']"))
    add_action(CucumberLabel.new("Last Header"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] [data-header-instanceid='count-header2']"))
    
    #Quick View closing
    add_verify(CucumberLabel.new("Quick View Visits"), VerifyText.new, AccessHtmlElement.new(:css, "#encountersTooltipVisits"))
    add_verify(CucumberLabel.new("Quick View Visit Type"), VerifyText.new, AccessHtmlElement.new(:css, "#encounters-Visit-GENERALINTERNALMEDICINE"))
  end
end

class ProcedureObject <  ADKContainer
  include Singleton
  def initialize
    super 
    #Procedures expand Header Verification 
    # add_verify(CucumberLabel.new("Procedure name Header"), VerifyText.new, AccessHtmlElement.new(:css, '#encountersProcedures-event-gist #name-header'))
    # add_verify(CucumberLabel.new("Hx Occurrence Header"), VerifyText.new, AccessHtmlElement.new(:css, '#encountersProcedures-event-gist #count-header1'))
    # add_verify(CucumberLabel.new("Last Header"), VerifyText.new, AccessHtmlElement.new(:css, '#encountersProcedures-event-gist #count-header2'))
    add_verify(CucumberLabel.new("Procedure name Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new("Hx Occurrence Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] [data-header-instanceid='count-header1']"))
    add_verify(CucumberLabel.new("Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] [data-header-instanceid='count-header2']"))
    
    #Procedures expand view details  
    add_verify(CucumberLabel.new("PULMONARY FUNCTION INTERPRET"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Procedure-PULMONARYFUNCTIONINTERPRET"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("PULMONARY FUNCTION INTERPRET Hx Occurrence"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Procedure-PULMONARYFUNCTIONINTERPRET]"))
    add_verify(CucumberLabel.new("PULMONARY FUNCTION INTERPRET Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Procedure-PULMONARYFUNCTIONINTERPRET]"))

    add_verify(CucumberLabel.new("PULMONARY FUNCTION TEST"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Procedure-PULMONARYFUNCTIONTEST"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("PULMONARY FUNCTION TEST Hx Occurrence"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Procedure-PULMONARYFUNCTIONTEST]"))
    add_verify(CucumberLabel.new("PULMONARY FUNCTION TEST Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Procedure-PULMONARYFUNCTIONTEST] .eventsTimeSince"))
      
    #Procedures right and left click
    add_action(CucumberLabel.new("Procedures Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] .right-side"))
    add_action(CucumberLabel.new("Procedure Name-PULMONARY FUNCTION INTERPRET Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Procedure-PULMONARYFUNCTIONINTERPRET]"))
    # procedure_tab_id_left = 'event_name_encounters-Procedure-PULMONARYFUNCTIONINTERPRET'
    #    add_action(CucumberLabel.new("Procedure Name-PULMONARY FUNCTION INTERPRET Left Click"), FocusInAction.new(procedure_tab_id_left), AccessHtmlElement.new(:css, "[data-appletid='encounters'] ##{procedure_tab_id_left}"))
   
    add_action(CucumberLabel.new("Procedure Name-PULMONARY FUNCTION INTERPRET Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=event_name_encounters-Procedure-PULMONARYFUNCTIONINTERPRET]"))
      
    #Quick View closing
    add_verify(CucumberLabel.new("Quick View Procedures"), VerifyText.new, AccessHtmlElement.new(:css, "#encountersTooltipProcedures"))
    add_verify(CucumberLabel.new("Quick View Procedure Name"), VerifyText.new, AccessHtmlElement.new(:css, "#encounters-Procedure-PULMONARYFUNCTIONINTERPRET"))
  end
end    

class AppointmentObject <  ADKContainer
  include Singleton
  def initialize
    super 
    #Appointments expand Header Verification 
    add_verify(CucumberLabel.new("Appointment Type Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new("Hx Occurrence Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] [data-header-instanceid='count-header1']"))
    add_verify(CucumberLabel.new("Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] [data-header-instanceid='count-header2']"))
      
    #Appointments expand view details  
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Appointment-GENERALINTERNALMEDICINE"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE Hx Occurrence"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Appointment-GENERALINTERNALMEDICINE]"))
    add_verify(CucumberLabel.new("GENERAL INTERNAL MEDICINE Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=time_since_encounters-Appointment-GENERALINTERNALMEDICINE]"))
      
    #Appointment right and left click
    add_action(CucumberLabel.new("Appointments Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] .right-side"))
    add_action(CucumberLabel.new("Appointment Type-GENERAL INTERNAL MEDICINE Right Click"), ClickAction.new, AccessHtmlElement.new(:css,  "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Appointment-GENERALINTERNALMEDICINE]"))
    # appointment_tab_id_left = 'event_name_encounters-Appointment-GENERALINTERNALMEDICINE'
    # add_action(CucumberLabel.new("Appointment Type-GENERAL INTERNAL MEDICINE Left Click"), FocusInAction.new(appointment_tab_id_left), AccessHtmlElement.new(:css, "[data-appletid='encounters'] ##{appointment_tab_id_left}"))
      
    add_action(CucumberLabel.new("Appointment Type-GENERAL INTERNAL MEDICINE Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=event_name_encounters-Appointment-GENERALINTERNALMEDICINE]"))
      
    #Quick View closing
    add_verify(CucumberLabel.new("Quick View Appointments"), VerifyText.new, AccessHtmlElement.new(:css, "#encountersTooltipAppointments"))
    add_verify(CucumberLabel.new("Quick View Appointment Type"), VerifyText.new, AccessHtmlElement.new(:css, "#encounters-Appointment-GENERALINTERNALMEDICINE"))
  end
end    

class AdmissionObject <  ADKContainer
  include Singleton
  def initialize
    super 
    #Admissions expand Header Verification 
    add_verify(CucumberLabel.new("Diagnosis Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] [data-header-instanceid='name-header']"))
    add_verify(CucumberLabel.new("Hx Occurrence Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] [data-header-instanceid='count-header1']"))
    add_verify(CucumberLabel.new("Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] [data-header-instanceid='count-header2']"))
      
    #Admissions expand view details  
    add_verify(CucumberLabel.new("SLKJFLKSDJF"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Admission-SLKJFLKSDJF"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("SLKJFLKSDJF Hx Occurrence"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid=encounter_count_encounters-Admission-SLKJFLKSDJF]"))
    add_verify(CucumberLabel.new("SLKJFLKSDJF Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid=time_since_encounters-Admission-SLKJFLKSDJF] .eventsTimeSince"))
      
    add_verify(CucumberLabel.new("OBSERVATION"), VerifyText.new, AccessHtmlElement.new(:css, '[data-cell-instanceid="event_name_encounters-Admission-OBSERVATION"] span:nth-of-type(2)'))
    add_verify(CucumberLabel.new("OBSERVATION Hx Occurrence"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid=encounter_count_encounters-Admission-OBSERVATION]"))
    add_verify(CucumberLabel.new("OBSERVATION Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid=time_since_encounters-Admission-OBSERVATION]"))
      
    #Admissions right and left click
    add_action(CucumberLabel.new("Admissions Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] .right-side"))
    add_action(CucumberLabel.new("Diagnosis-OBSERVATION Right Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] [data-cell-instanceid=encounter_count_encounters-Admission-OBSERVATION]"))
    # admission_tab_id_left = 'event_name_encounters-Admission-OBSERVATION'
    #    add_action(CucumberLabel.new("Diagnosis-OBSERVATION Left Click"), FocusInAction.new(admission_tab_id_left), AccessHtmlElement.new(:css, "[data-appletid='encounters'] ##{admission_tab_id_left}"))
    
    add_action(CucumberLabel.new("Diagnosis-OBSERVATION Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid=event_name_encounters-Admission-OBSERVATION]"))
    # spinal_cord_injury_row = 'event_name_encounters-Admission-SPINALCORDINJURYNOSURINTRACTINFECTIONNOSECOLIINFEC-24'
    #add_action(CucumberLabel.new("Diagnosis-SPINAL CORD INJURY Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] ##{spinal_cord_injury_row}"))
    add_action(CucumberLabel.new("Diagnosis-SPINAL CORD INJURY Left Click"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-cell-instanceid^=event_name_encounters-Admission-SPINALCORDINJURYNOSURINTRACTINFECTIONNOSECOLIINFEC]"))
    #Quick View closing
    add_verify(CucumberLabel.new("Quick View Admissions"), VerifyText.new, AccessHtmlElement.new(:css, "#encountersTooltipAdmissions"))
    add_verify(CucumberLabel.new("Quick View Diagnosis"), VerifyText.new, AccessHtmlElement.new(:css, "#encounters-Admission-OBSERVATION"))
  end
end    

Then(/^the Encounters Gist Applet details view has headers$/) do |table|
  aa = EncountersGist.instance
  
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time)).to be_true
    
  table.rows.each do |row|
    expect(aa.perform_verification(row[0]+"-header", row[1])).to be_true, "The value #{row[0]} is not present in the encounter detail headers"
  end
end

Then(/^the Encounters Gist Applet detail view contains$/) do |table|
  aa = EncountersGist.instance  
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time+60)).to be_true    
  table.rows.each do |row|
    expect(aa.perform_verification(row[0], row[0])).to be_true, "The value #{row[0]} is not present in the encounter Description"
    expect(aa.perform_verification("#{row[0]} Occurance", row[1])).to be_true, "The value #{row[1]} is not present in the encounter Hx Occurence"
    #  expect(aa.perform_verification(row[0], row[2])).to be_true, "The value #{row[2]} is not present in the encounter Last"
  end
end

Then(/^the Encounters Gist Applet detail view contains "(.*?)"$/) do |value|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_applet_title_visible
  expect(@ehmp.fld_empty_gist.text.include? value).to eq(true), "Actual: #{@ehmp.fld_empty_gist.text}, Expected: #{value}"
end

Then(/^user sees Encounters Gist$/) do 
  aa = EncountersGist.instance 
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", "ENCOUNTERS")).to be_true
end

def arrow_position(css, expected_arrow_position)
  driver = TestSupport.driver
  arrow_position = driver.find_element(:css, css).attribute("arrowposition")
  return arrow_position.eql? expected_arrow_position
rescue Exception => e
  p "#{e}"
  return false
end

Then(/^there is a dynamic arrow next to visits in Encounters Gist Applet$/) do
  aa = EncountersGist.instance 
  
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { arrow_position "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] i", 'right' }
end

When(/^the user expands "(.*?)" in Encounters Gist Applet$/) do |element|
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible("Expand_"+element, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Expand_"+element, "")).to be_true, "#{element} could not be expanded"
  #wait for animation to complete
  sleep(1)
end

When(/^the user expands "(.*?)" in Encounters Gist Applet with css$/) do |element|
  aa = EncountersGist.instance
  procedure_access = AccessHtmlElement.new(:css, '[data-appletid=encounters] #Procedures #caret')
  aa.add_action(CucumberLabel.new('Procedure with css'), ClickAction.new, procedure_access)
  expect(aa.perform_action('Procedure with css')).to be_true, "#{element} could not be expanded"
end

When(/^the user expands "(.*?)" in Encounters Gist Applet with xpath$/) do |element|
  aa = EncountersGist.instance
  procedure_access = AccessHtmlElement.new(:xpath, "//div[@id='Procedures']/descendant::*[contains(@class, 'caret-placer')]")
  aa.add_action(CucumberLabel.new('Procedure with xpath'), ClickAction.new, procedure_access)
  expect(aa.perform_action('Procedure with xpath')).to be_true, "#{element} could not be expanded"
end

Then(/^Encounters Gist Applet "(.*?)" grouping expanded view contains headers$/) do |object_type, table|
  case object_type
  when 'Visits'
    aa = VisitObject.instance
  when 'Procedures'
    aa = ProcedureObject.instance
  when 'Appointments'
    aa = AppointmentObject.instance
  when 'Admissions'
    aa = AdmissionObject.instance
  else
    fail "**** No function found! Check your script ****"
  end
 
  expected_headers = table.headers
  for i in 0...expected_headers.size do
    p expected_headers[i]
    expect(aa.perform_verification(expected_headers[i] + " Header", expected_headers[i])).to be_true, "Header #{expected_headers[0]} is not present in the #{object_type}"
  end
end

Then(/^the Encounters Gist Applet "(.*?)" grouping expanded view contains$/) do |object_type, table|
  case object_type
  when 'Visits'
    aa = VisitObject.instance
  when 'Procedures'
    aa = ProcedureObject.instance
  when 'Appointments'
    aa = AppointmentObject.instance
  when 'Admissions'
    aa = AdmissionObject.instance
  else
    fail "**** No function found! Check your script ****"
  end
  expected_headers = table.headers
  table.rows.each do |row|
    expect(aa.perform_verification(row[0], row[0])).to be_true, "The value #{row[0]} is not present in the encounter #{object_type}"
    expect(aa.perform_verification(row[0] + " #{expected_headers[1]}", row[1])).to be_true, "The value #{row[1]} is not present in the encounter #{object_type}"
    #  expect(aa.perform_verification(row[0] + " #{expected_headers[2]}", row[2])).to be_true, "The value #{row[2]} is not present in the encounter #{object_type}"
  end  
end

When(/^user exits the Timeline Applet$/) do
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible("Close-Timeline", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Close-Timeline", "")).to be_true, "Could not exit Timeline applet"
end

When(/^the user closes the search filter in Encounters Gist Applet$/) do
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible("Control - applet - Filter Toggle", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Control - applet - Filter Toggle", "")).to be_true, "Could not clear search filter"
end

When(/^user hovers over and selects the right side of the "(.*?)" tile$/) do |object_type|
  case object_type
  when 'Visits'
    aa = VisitObject.instance
  when 'Procedures'
    aa = ProcedureObject.instance
  when 'Appointments'
    aa = AppointmentObject.instance
  when 'Admissions'
    aa = AdmissionObject.instance
  else
    fail "**** No function found! Check your script ****"
  end
  expect(aa.wait_until_action_element_visible(object_type + " Right Click", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(object_type + " Right Click", "")).to be_true, "Could not select the right side of the object #{object_type}"
end

Then(/^quick view table with title "(.*?)" appears$/) do |object_type|
  aa = EncountersGist.instance
  expect(aa.perform_verification("Quick View Table Title", object_type)).to be_true, "The title #{object_type} is not present in the encounter quick view table"
end

When(/^user clicks on the "(.*?)" hand side of the "(.*?)" "(.*?)"$/) do |direction, object_type, object_type_value|
  case object_type
  when 'Visit Type'
    aa = VisitObject.instance
  when 'Procedure Name'
    aa = ProcedureObject.instance
  when 'Appointment Type'
    aa = AppointmentObject.instance
  when 'Diagnosis'
    aa = AdmissionObject.instance
  else
    fail "**** No function found! Check your script ****"
  end
  string_value = object_type + "-" + object_type_value + " " + direction + " Click"
  p "string_value = #{string_value}"
  expect(aa.wait_until_action_element_visible(string_value, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(string_value, "")).to be_true, "Could not select the left side of the object #{object_type} and #{object_type_value}"
  sleep(5)
end

Then(/^a Menu appears on the Encounters Gist$/) do
  aa = EncountersGist.instance
  # expect(aa.wait_until_action_element_visible("Quick View Icon", DefaultLogin.wait_time)).to be_true, "Menu with Quick View icon is not displayed"
  # expect(aa.wait_until_action_element_visible("Detail View Icon", DefaultLogin.wait_time)).to be_true, "Menu Detail View icon is not displayed"    
  expect(aa.wait_until_action_element_visible("Quick View Button", DefaultLogin.wait_time)).to be_true, "Menu with Quick View icon is not displayed"
  expect(aa.wait_until_action_element_visible("Detail View Button", DefaultLogin.wait_time)).to be_true, "Menu Detail View icon is not displayed"    
end

When(/^user select the menu "(.*?)" in Encounters Gist$/) do |icon_type|
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible(icon_type, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(icon_type, "")).to be_true, "#{icon_type} can't be clicked"
end

Then(/^it should show the detail modal of the most recent encounter$/) do
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible("Main Modal Label", DefaultLogin.wait_time)).to be_true
end

Then(/^the "(.*?)" modal contains data$/) do |object_type, table|
  aa = EncountersGist.instance
  table.rows.each do |row|
    expect(aa.perform_verification("Modal Details", row[0])).to be_true, "The #{row[0]} not found in the #{object_type} modal details"
    expect(aa.perform_verification("Modal Details", row[1])).to be_true, "The #{row[1]} not found in the #{object_type} modal details"
  end
end

Then(/^Quick View draw box for "(.*?)" closes$/) do |object_type|
  case object_type
  when 'Visits'
    aa = VisitObject.instance
  when 'Visit Type'
    aa = VisitObject.instance
  when 'Procedures'
    aa = ProcedureObject.instance
  when 'Procedure Name'
    aa = ProcedureObject.instance
  when 'Appointments'
    aa = AppointmentObject.instance
  when 'Appointment Type'
    aa = AppointmentObject.instance
  when 'Admissions'
    aa = AdmissionObject.instance
  when 'Diagnosis'
    aa = AdmissionObject.instance
  else
    fail "**** No function found! Check your script ****"
  end

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { !aa.am_i_visible?("Quick View " + object_type) }
end

When(/^user clicks on the column header "(.*?)" in Encounters Gist$/) do |name_column_header|
  aa = VisitObject.instance
  expect(aa.wait_until_action_element_visible(name_column_header + " Header", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(name_column_header + " Header", "")).to be_true
end

Then(/^"(.*?)" column is sorted in ascending order in Encounters Gist$/) do |column_name|
  aa = EncountersGist.instance
  driver = TestSupport.driver
  column_values_array = []
    
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time)).to be_true
  
  case column_name
  when 'Visit Type'
    element_column_values = driver.find_elements(css: '#encountersVisits-event-gist-items div.col-sm-8.problem-name')
  when 'Hx Occurrence'
    element_column_values = driver.find_elements(css: '#encountersVisits-event-gist-items div.eventsCount.col-sm-2.counter2.text-center')
  else
    fail "**** No function found! Check your script ****"
  end

  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    if column_name == "Hx Occurrence"
      column_values_array << row.text.downcase.to_i
    else
      column_values_array << row.text.downcase
    end
  end

  (column_values_array == column_values_array.sort { |x, y| x <=> y }).should == true
end

Then(/^"(.*?)" column is sorted in descending order in Encounters Gist$/) do |column_name|
  aa = EncountersGist.instance
  driver = TestSupport.driver
  column_values_array = []
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time)).to be_true   
 
  case column_name
  when 'Visit Type'
    element_column_values = driver.find_elements(css: '#encountersVisits-event-gist-items div.col-sm-8.problem-name')
  when 'Hx Occurrence'
    element_column_values = driver.find_elements(css: '#encountersVisits-event-gist-items div.eventsCount.col-sm-2.counter2.text-center')
  else
    fail "**** No function found! Check your script ****"
  end
     
  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    if column_name == "Hx Occurrence"
      column_values_array << row.text.downcase.to_i
    else
      column_values_array << row.text.downcase
    end
  end
  
  (column_values_array == column_values_array.sort { |x, y| y <=> x }).should == true
end

Then(/^Last column is sorted in "(.*?)" order in Encounters Gist$/) do |_arg1, table|
  aa = EncountersGist.instance
  driver = TestSupport.driver
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time)).to be_true
  element_column_values = driver.find_elements(css: '#encountersVisits-event-gist-items div.eventsTimeSince.counter2.text-center')
  column_values_array = []
 
  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    column_values_array << row.text.downcase
  end
  
  cucumber_array = table.headers  
  (column_values_array == cucumber_array).should == true
end

class SpecificEncounterRows < AccessBrowserV2
  include Singleton
  def initialize
    super
    applet_toolbar_css = ".toolbar-container .appletToolbar"

    pulmonary_function_interpret_css = "[data-group-instanceid=panel-Procedures] .gist-item:nth-child(1)"
    add_action(CucumberLabel.new("PULMONARY FUNCTION INTERPRET Info View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=info-button-toolbar]"))
    add_action(CucumberLabel.new("PULMONARY FUNCTION INTERPRET Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("PULMONARY FUNCTION INTERPRET Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=quick-look-button-toolbar]"))
 

    #GENERAL INTERNAL MEDICINE
    pulmonary_function_interpret_css = "[data-group-instanceid=panel-Appointments] .gist-item:nth-child(1)"
    add_action(CucumberLabel.new("GENERAL INTERNAL MEDICINE Info View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=info-button-toolbar]"))
    add_action(CucumberLabel.new("GENERAL INTERNAL MEDICINE Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("GENERAL INTERNAL MEDICINE Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{pulmonary_function_interpret_css} #{applet_toolbar_css} [button-type=quick-look-button-toolbar]"))
 
    #event_name_encounters-Admission-OBSERVATION
    observation_css = "[data-group-instanceid=panel-Admissions] .gist-item:nth-child(2)"
    add_action(CucumberLabel.new("OBSERVATION Info View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{observation_css} #{applet_toolbar_css} [button-type=info-button-toolbar]"))
    add_action(CucumberLabel.new("OBSERVATION Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{observation_css} #{applet_toolbar_css} [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("OBSERVATION Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{observation_css} #{applet_toolbar_css} [button-type=quick-look-button-toolbar]"))
 
    spinal_cord_injury_css = "//div[contains(@id, 'event_encounters-Admission-SPINALCORDINJURYNOSURINTRACTINFECTIONNOSECOLIINFEC')]"
    add_action(CucumberLabel.new("SPINAL CORD INJURY Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{applet_toolbar_css} [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("SPINAL CORD INJURY Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "#{applet_toolbar_css} [button-type=quick-look-button-toolbar]"))
  end
end

Then(/^a Menu appears on the Encounters Gist for the item "(.*?)"$/) do |arg1|
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible("EncountersGridVisible", DefaultLogin.wait_time)).to be_true
  ser = SpecificEncounterRows.instance
  #  expect(ser.wait_until_action_element_visible("#{arg1} Info View Icon", DefaultLogin.wait_time)).to be_true, "Info view icon is not displayed"
  # expect(ser.wait_until_action_element_visible("#{arg1} Detail View Icon", DefaultLogin.wait_time)).to be_true, "Detail view icon is not displayed"
  # expect(ser.wait_until_action_element_visible("#{arg1} Quick View Icon", DefaultLogin.wait_time)).to be_true, "Quick view icon is not displayed"    
  expect(aa.wait_until_action_element_visible("Detail View Button")).to eq(true)
  expect(aa.wait_until_action_element_visible("Quick View Button")).to eq(true)

end

Then(/^user selects the "(.*?)" detail icon in Encounters Gist$/) do |arg1|
  # ser = SpecificEncounterRows.instance
  # label = "#{arg1} Detail View Icon"
  # expect(ser.perform_action(label)).to be_true
  expect(EncountersGist.instance.perform_action("Detail View Button")).to eq(true)
end

Then(/^user selects the "(.*?)" quick view icon in Encounters Gist$/) do |arg1|
  ser = SpecificEncounterRows.instance
  label = "#{arg1} Quick View Icon"
  p label
  expect(ser.perform_action(label)).to be_true
end

Then(/^the user can view and interact with the "(.*?)" control$/) do |control|
  container = EncountersGist.instance
  control_accesor = "Control - modal - #{control}"
  element = TestSupport.driver.find_element(:id => 'modal-close-button')
  element.location_once_scrolled_into_view
  expect(element.displayed?).to be_true
  expect(element.enabled?).to be_true
  # take_screenshot("encounters_close")
end

class EncountersQuickView < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Recent Visits Table"), VerifyText.new, AccessHtmlElement.new(:id, 'encountersTooltipVisits'))
    recent_visit_table_rows = AccessHtmlElement.new(:css, '#encountersTooltipVisits tbody tr')
    add_verify(CucumberLabel.new("Recent Visits Rows"), VerifyXpathCount.new(recent_visit_table_rows), recent_visit_table_rows)
    add_verify(CucumberLabel.new("Encounter Visits type table"), VerifyText.new, AccessHtmlElement.new(:id, "encounters-Visit-GENERALINTERNALMEDICINE"))
    gm_visit_table_rows = AccessHtmlElement.new(:css, '#encounters-Visit-GENERALINTERNALMEDICINE tbody tr')
    add_verify(CucumberLabel.new("Encounter Visits type Rows"), VerifyXpathCount.new(gm_visit_table_rows), gm_visit_table_rows)
    add_verify(CucumberLabel.new("Recent Admissions Table"), VerifyText.new, AccessHtmlElement.new(:id, 'encountersTooltipAdmissions'))
    recent_admissions_table_rows = AccessHtmlElement.new(:css, '#encountersTooltipAdmissions tbody tr')
    add_verify(CucumberLabel.new("Recent Admissions Rows"), VerifyXpathCount.new(recent_admissions_table_rows), recent_admissions_table_rows)
    add_verify(CucumberLabel.new("Encounter Admissions type table"), VerifyText.new, AccessHtmlElement.new(:id, "encounters-Admission-OBSERVATION"))
    gm_visit_table_rows = AccessHtmlElement.new(:css, '#encounters-Admission-OBSERVATION tbody tr')
    add_verify(CucumberLabel.new("Encounter Admissions type Rows"), VerifyXpathCount.new(gm_visit_table_rows), gm_visit_table_rows)
  end
end
Then(/^the Encounters Gist Quick View \- Recent "([^"]*)" table contains rows$/) do |arg1|
  encounters_quick_view = EncountersQuickView.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { encounters_quick_view.am_i_visible? "Recent #{arg1} Table" }
  expect(encounters_quick_view.wait_until_xpath_count_greater_than("Recent #{arg1} Rows", 0)).to eq(true)
end

Then(/^the Encounters Gist Quick View \- "([^"]*)" Type table contains rows$/) do |arg1|
  encounters_quick_view = EncountersQuickView.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { encounters_quick_view.am_i_visible? "Encounter #{arg1} type table" }
  expect(encounters_quick_view.wait_until_xpath_count_greater_than("Encounter #{arg1} type Rows", 0)).to eq(true)
end

When(/^the Encounters Gist Applet contains data rows$/) do
  compare_item_counts("[data-appletid=encounters] [data-group-instanceid]")
end

When(/^user refreshes Encounters Gist Applet$/) do
  applet_refresh_action("encounters")
end

Then(/^the message on the Encounters Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("encounters", message_text)
end

Then(/^the Encounters Gist Quick View \- Appointments table contains rows$/) do
  driver = TestSupport.driver
  css = "[id=encountersTooltipAppointments] tbody tr"
  rows = driver.find_elements(:css, css)
  expect(rows.length).to be > 0
  rows = driver.find_elements(:css, "#{css} td:nth-child(1)")
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
  rows.each do | row |
    p row.text
    expect(( date_format.match(row.text)).nil?).to eq(false), "#{row.text} does not match expected data format"
  end
end

Then(/^the Encounters Gist Quick View \- Appointments Type table contains rows$/) do
  driver = TestSupport.driver
  css = "#encounters-Appointment-GENERALINTERNALMEDICINE tbody tr"
  rows = driver.find_elements(:css, css)
  expect(rows.length).to be > 0
  rows = driver.find_elements(:css, "#{css} td:nth-child(1)")
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
  rows.each do | row |
    p row.text
    expect(( date_format.match(row.text)).nil?).to eq(false), "#{row.text} does not match expected data format"
  end
end

Then(/^Last column is sorted in ascending order in Encounters Gist$/) do
  encounter_applet = PobEncountersApplet.new
  encounter_applet.wait_for_fld_visits_last_column
  start_time = Time.now
  begin
    visits_last_columns = encounter_applet.fld_visits_last_column
    expect(visits_last_columns.length).to be > 1
    first_visit = visits_last_columns[0]
    visits_last_columns.each do | next_visit |
      expect(first_visit.text).to be <= next_visit.text, "#{first_visit.text} is not <= #{next_visit.text}"
      first_visit = next_visit
    end
  rescue => e
    raise e if (start_time + 30) < Time.now
    retry
  end
end

Then(/^Last column is sorted in descending order in Encounters Gist$/) do
  encounter_applet = PobEncountersApplet.new
  encounter_applet.wait_for_fld_visits_last_column
  start_time = Time.now
  begin
    visits_last_columns = encounter_applet.fld_visits_last_column
    expect(visits_last_columns.length).to be > 1
    first_visit = visits_last_columns[0]
    visits_last_columns.each do | next_visit |
      expect(first_visit.text).to be >= next_visit.text, "#{first_visit.text} is not >= #{next_visit.text}"
      first_visit = next_visit
    end
  rescue => e
    raise e if (start_time + 30) < Time.now
    retry
  end
end
