require './regression_one/appointments.rb'
require './regression_one/bed_control.rb'
require './regression_one/registration.rb'
require './regression_one/lab.rb'
require './regression_one/allergies.rb'
require './regression_one/bcma.rb'
require './regression_one/iv_order.rb'
require './regression_one/outpatient_pharmacy.rb'
require './regression_one/radiology.rb'
require './regression_one/unit_dose.rb'
require '../knife-helper.rb'

driver = ARGV[0] || "virtualbox"

options = {
  server: knife_search_for_ip("vista-panorama"),
  user: driver == "aws" ? "ec2-user" : "vagrant",
  password: "vagrant",
  patient: "regression,female",
  sudo: true,
  ssh_key: true,
  ssh_key_path: knife_search_for_key_name("vista-panorama", driver)
}

Dir.mkdir("./logs") unless Dir.exists?("./logs")

count = 0

appointments = Appointments.new
if appointments.run(options)
	count = count + 1
end

bed = Bed_Control.new
if bed.run(options)
	count = count + 1
end

registration = Registration.new
if registration.run(options)
	count = count + 1
end


lab = Lab.new
if lab.run(options)
	count = count + 1
end


allergy = Allergy.new
if allergy.run(options)
	count = count + 1
end

bcma = BCMA.new
if bcma.run(options)
	count = count + 1
end


pharmacy = Outpatient.new
if pharmacy.run(options)
	count = count + 1
end


rad = Radiology.new
if rad.run(options)
	count = count + 1
end

unit = UnitDose.new
if unit.run(options)
	count = count + 1
end


iv = IVOrder.new
if iv.run(options)
	count = count + 1
end

puts "#{count}/10 tests passed"


if count != 10
	raise RuntimeError, "regression one failed to pass all tests"
end