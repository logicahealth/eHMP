require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative '../base/base'

class AppointmentsList
  include PageObject


  h5(:videoVisitAppletTitle, :text => 'Video Visits - Next 90 Days')

  button(:refreshBtn, :css => '.applet-refresh-button')
  button(:helpBtn, :css => '.grid-help-button .help-icon-link')  
  button(:addBtn, :css => '.applet-add-button') 
  button(:filterBtn, :css => '.applet-filter-button') 
  button(:optionsBtn, :css => '.applet-options-button') 
  
  button(:dateHeaderBtn, :css => '[data-header-instanceid=videovisits-dateTimeFormatted]') 
  button(:facilityHeaderBtn, :css => '[data-header-instanceid=videovisits-facility]') 
  button(:locationHeaderBtn, :css => '[data-header-instanceid=videovisits-clinic]') 

  table(:headerrow2, :id => 'data-grid-applet-1')

  div(:listModal, :id => 'applet-1')

  button(:summaryView, :css => '.summary[data-viewtype=summary][type=button]')
  button(:remove, :css => '.btn-icon[data-viewtype=removeApplet][type=button]')
  button(:closeOptions, :css => '.applet-exit-options-button .fa-close.fa')
  text_field(:filterText, :id => 'input-filter-search-applet-1')


end
