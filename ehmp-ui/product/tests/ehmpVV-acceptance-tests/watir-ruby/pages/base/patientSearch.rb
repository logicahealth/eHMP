require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative '../base/base'

class PatientSearch
  include PageObject

  h5(:patientSelectionTitle, :text => 'Patient Selection')

  text_field(:patientSelection, :id => /patientSelectionMySiteSearchText/)

  table(:patientSelectionContainer, :css => "[aria-controls='patientSelectionMySiteSearchText']")

  button(:confirmationButton, :css => '#confirmationButton')
  button(:confirmFlaggedPatinetButton, :css =>'#confirmFlaggedPatinetButton')

  button(:workSpaceButton, :css => '#workspaceManagerButton')

  button(:addWorkSpace, :css =>'.btn.btn-icon.addScreen')
  text_field(:workSpaceTitle, :text => 'User Defined Workspace 1')

  button(:acceptBtn, :text => 'Accept')
  button(:closeBtn, :text => 'Close')
  button(:rightMargin, :css => '.btn.btn-icon.top-margin-sm.right-margin-xl')


end
