require 'watir-webdriver'
require 'page-object'

require 'DriverUtility'
require 'rspec_helper'
require 'base'
require 'loginLogout'
require 'login'
require 'accessEhmp'
require 'waitUtility'
require 'patientSearch'
require 'appointmentsList'
require 'detailsView'
require 'createAppointment'

class EHMP_PageObject
  include PageObject

  def initialize(driver)
    @driver = driver
  end

  def accessEhmp
    AccessEhmp.new(@driver)
  end

  def login
    Login.new(@driver)
  end

  def loginLogout
    LoginLogout.new(@driver)
  end

  def patientSearch
    PatientSearch.new(@driver)
  end

  def appointmentsList
    AppointmentsList.new(@driver)
  end  

  def detailsView
    DetailsView.new(@driver)
  end   

  def createAppointment
     CreateAppointment.new(@driver)
  end   


end




