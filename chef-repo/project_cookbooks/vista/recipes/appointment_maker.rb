#
# Cookbook Name:: vista
# Recipe:: appointment_maker
#


65.times do |i|
  options = {}

  options[:day] = -32 + i

  if i%3 == 0
    options[:patient] = "SIXHUNDRED,PATIENT"
  elsif i%3 == 2
    options[:patient] = "SIXHUNDREDONE,PATIENT"
  else
    options[:patient] = "SIXHUNDREDTHREE,PATIENT"
  end

  if i%2 == 0
    options[:clinic] = "PRIMARY CARE"
  else
    options[:clinic] = "AUDIOLOGY"
  end

  vista_appointment "Create an appointment" do
    duz       1
    programmer_mode true
    namespace node[:vista][:namespace]
    log node[:vista][:chef_log]
    patient options[:patient]
    clinic options[:clinic]
    day options[:day]
    time 10
    not_if { node[:vista][:no_reset] }
  end
end