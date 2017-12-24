require_relative '../rspec_helper'
require 'videoVisits/eHMP_PageObject'


describe '[eHMPVV-2: Upcoming Appointments List]' do
  include DriverUtility

  before(:all) do
    initializeConfigurations(BASE_URL)
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @ehmp_po.accessEhmp.access_with(UserAccessPu)
    @waitUtility = WaitUtility.new(@driver)
  end

  after(:all) do
    @ehmp_po.loginLogout.logout
  end

  context 'Create workspace for Video Visit Appoitment' do
   #context 'AC#VARUT-796|TC#VARUT-808: User who is authenticated and authorized, can create Assessment Properties' do

    it "Click on video visit appointment applet from the workspace" do
      @ehmp_po.accessEhmp.patient_selection_by_full_name("Ten, Patient")
      p "ten patient selected"
      workspace_and_applet_name = {'workspace_name' => "Video Visit Appointment", 'applet_name' => "Video Visits - Next 90 Days", 'data_appletid' => 'videovisits'}
      p "workspace name :" 
      @ehmp_po.accessEhmp.access_to_workspace_name(workspace_and_applet_name)
      p "access to video visit applet::::"
    end
  end

end