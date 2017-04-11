require 'rubygems'
require 'watir-webdriver'
require 'page-object'

require_relative '../common/ehmp_constants.rb'

# VitalsGistPage: Page-Object for vitals gist on overview page and expanded vitals gist
class VisitInformationPage
  include PageObject

  # Visit Management elements accesible from overview screen
  button(:addbtnVitals, css: '[data-appletid=vitals] button.applet-add-button')
  button(:addbtnProb, css: '[data-appletid=problems] button.applet-add-button')
  a(:visitApts, href: '#Clinic-Appointments-tab-panel')
  a(:visitAdmts, href: '#Hospital-Admissions-tab-panel')
  a(:visitNew, href: '#New-Visit-tab-panel')
  div(:selVisitInfo, id: 'setVisitContextBtn')
  div(:encounterLoc, id: 'innerVisit')
  button(:visitCan, id: 'cancel-btn')
  button(:setVisit, id: 'ok-btn')
  button(:cancel, css: '.alert-container .modal-footer button:nth-child(1)')
  button(:continue, css: '.alert-container .modal-footer button:nth-child(2)')
  button(:changeBtn, id: 'add-vital-visit-btn')
  span(:location, class: 'text-muted')
  div(:addVisit, id: 'modal-header')
  button(:vitalCan, id: 'btn-add-vital-cancel')
  select_list(:selectProvider, id: 'selectEncounterProvider')
  text_field(:enterLoc, id: 'location')
  text_field(:enterVisDate, id: 'dp-visit')
  div(:selInfo, id: 'selectedInfo')
  text_field(:enterVisTime, id: 'tp-visit')
  checkbox(:histVisit, id: 'visit-historical')
  div(:list, id: 'location-typeahead-list')
  elements(:locationList, :li, css: '#appts > ul > li')
  li(:locationFirstItem, css: '#appts ul li:nth-of-type(1)')
  text_field(:todateNewVisit, id: 'newVisitDate')
  text_field(:fromDtApts, id: 'clinicAppointmentsFromDate')
  text_field(:thrDtApts, id: 'clinicAppointmentsThroughDate')

  # select the item from list

  div(:list, id: 'location-typeahead-list')
  # h4(:visitInfoHeader, id: 'mainModalLabel')
  h4(:visitInfoHeader, class: 'modal-title')
  span(:displayedEncounterLoc, id: 'encounters-location')
  button(:viewEncounterBtn, id: 'viewEncouters-btn')

  # From the Visit Information area on the Overivew
  div(:visitInfo, id: 'patientDemographic-visitInfo')
  div(:locationInfo, css: '#setVisitContextBtn div div:nth-of-type(1)')
  div(:providerInfo, css: '#setVisitContextBtn div div:nth-of-type(2)')
  select_list(:selectLocation, id: 'selectnewencounterLocation')
  text_field(:newVisitDate, id: 'newVisitDate')
  text_field(:newVisitTime, id: 'newVisitTime')
  div(:mainModal, id: 'mainWorkflow')
  button(:setAndView, id: 'viewEncounters-btn')
  button(:setAndClose, id: 'setClose-btn')
  div(:mainAlert, id: 'mainAlert')
  button(:alertContinue, xpath: "//div[@id='alert-region']/descendant::div[contains(@class, 'modal-footer')]/descendant::button[contains(string(), 'Continue')]")

  span(:providerDropDownArrow, css: 'span[aria-labelledby*="selectEncounterProvider"] .select2-selection__arrow')
  span(:providerBeingSet, css: '.select2-selection__rendered[id*="selectEncounterProvider"]')

  def choose_a_provider_by_index(num_seq)
    self.class.element(:providerList, :li, css: "li[id*='selectEncounterProvider']:nth-of-type(#{ num_seq })")
    providerDropDownArrow_element.when_visible(SMALL_TIMEOUT)
    providerDropDownArrow_element.click
    providerList_element.when_visible(SMALL_TIMEOUT)
    providerList_element.click
    Watir::Wait.until { providerBeingSet != '' }
  end

  # select the item from list
  # def click_the_visit_tobe_added(visit_name)
  #   self.class.elements(:visitInListGroup, :li, class: 'list-group-item')
  #   visitInListGroup_elements.each do |name|
  #     puts 'a'
  #     next unless name.id.strip.include?(visit_name)
  #     self.class.li(:visitRecord, id: visit_name)
  #     puts visit_Record
  #     visitRecord_element.when_visible(20)
  #     puts 'b'
  #     visitRecord_element.click
  #     break
  #   end
  # end

  def select_clinical_visit(_visit_date)
    self.class.elements(:visitInListGroup, :a, class: 'table-row')
    puts visitInListGroup_elements.length
    puts 'a'
    self.class.link(:visitRecord, css: '#selectableTableAppointments > div > div.body > a:nth-child(12) > div:nth-child(2) > span')
    puts visitRecord
    puts 'c'
    visitRecord_element.when_visible(20)
    puts 'b'
    visitRecord_element.click
  end

  def select_hospital_visit(_visit_date)
    self.class.elements(:visitInListGroup, :a, class: 'table-row')
    puts visitInListGroup_elements.length
    puts 'a'
    self.class.link(:visitRecord, css: '#selectableTableAdmissions > div > div.body > a:nth-child(8) > div:nth-child(2) > span')
    puts visitRecord
    puts 'c'
    visitRecord_element.when_visible(20)
    puts 'b'
    visitRecord_element.click
  end

  elements(:encounterList, :div, class: 'encGistItem')

  def location_list_column_element(column_seq, row_seq)
    span_element(css: "#selectableTableAppointments a:nth-of-type( #{ row_seq } ) div:nth-of-type( #{ column_seq } ) span")
  end

  def choose_encounter_location(details_name, date_time_str)
    # e.g. date_time_str: 05/21/2000, 09:00
    # Watir::Wait.until(XLARGE_TIMEOUT) { locationList_elements.length > 0 }
    self.class.elements(:locationList, :a, css: '#selectableTableAppointments a')
    self.class.span(:firstLocation, css: '#selectableTableAppointments a:nth-of-type(1) span:nth-of-type(1)')
    j = 1
    until locationList_elements.length > 0
      sleep 1
      j += 1
      break if j > LARGE_TIMEOUT
    end
    firstLocation_element.when_visible(LARGE_TIMEOUT)
    # wait for the first and the last record to load
    location_list_column_element(1, 1).when_visible(XLARGE_TIMEOUT)

    i = 1
    locationList_elements.each do |record|
      # puts 'actual=' + location_list_column_element(1, i).text.strip + ', expected=' + date_time_str
      location_list_column_element(1, i).when_visible(SMALL_TIMEOUT)
      # location_list_column_element(2, i).when_visible(SMALL_TIMEOUT)
      if location_list_column_element(1, i).text.strip == date_time_str && location_list_column_element(2, i).text.strip == details_name
        record.click
        Watir::Wait.until(SMALL_TIMEOUT) { record.attribute('class').include?('active') == true }
        ok
        p 'found'
        return
      end
      i += 1
    end
    p 'No match found.  Returning null.'
    nil
  end

  def choose_encounter_location_by_index(num_seq)
    # e.g. date_time_str: 05/21/2000, 09:00
    # Watir::Wait.until(XLARGE_TIMEOUT) { locationList_elements.length > 0 }
    self.class.element(:thislocation, :a, css: "#selectableTableAppointments a:nth-of-type(#{ num_seq })")
    self.class.span(:thislocationDateTime, css: "#selectableTableAppointments a:nth-of-type(#{ num_seq }) div:nth-of-type(1) span")
    self.class.elements(:locationList, :a, css: '#selectableTableAppointments a')

    j = 1
    until locationList_elements.length > 0
      sleep 1
      j += 1
      break if j > LARGE_TIMEOUT
    end
    puts 'j=' + j.to_s
    puts 'locationList_elements.length=' + locationList_elements.length.to_s
    thislocationDateTime_element.when_visible(LARGE_TIMEOUT)

    thislocation_element.click
    thislocationDateTime.split(' ')[0]
  end

  def set_current_encounter
    # selVisitInfo_element.when_visible
    # selVisitInfo_element.click
    # mainModal_element.when_visible
    # visitApts_element.when_visible
    # visitApts_element.click
    # choose_encounter_location_by_index(1)
    # selectProvider_element.when_visible(LARGE_TIMEOUT)
    # selectProvider = 'Labtech,One'
  end
end
