require 'greenletters'

# options
#------------------------------------
serve_ip = "10.2.2.101"
labs_amount = 10
# patient_id = 100841 #alpha test
patient_name = "alphatest"
#------------------------------------

console = Greenletters::Process.new("ssh vagrant@#{serve_ip}",:transcript => $stdout, :timeout => 20)

console.on(:output, /Do you want an expanded list/i) do |process, match_data|
  console << "\n"
end

console.on(:output, /Is the test one of the above/i) do |process, match_data|
  console << "\n"
end

console.on(:output, /Do You really want another/i) do |process, match_data|
  console << "Y\n"
end


console.on(:output, /CHOOSE/i) do |process, match_data|
  console << "1\n"
end


console.on(:output, /-Lab Order/i) do |process, match_data|
  console << "^\n"
end


console.on(:output, /Press RETURN to continue/i) do |process, match_data|
  console << "\n"
end


console.on(:output, /ORDER COPY DEVICE/i) do |process, match_data|
  console << "\n"
end


console.start!

console.wait_for(:output, /password:/i)
console << "vagrant\n"

console.wait_for(:output, /$/i)
console << "sudo csession cache -U VISTA\n"

console.wait_for(:output, /VISTA>/i)
console << "s DUZ=20365\n"

console.wait_for(:output, /VISTA>/i)
console << "d ^XUP\n"

console.wait_for(:output, /OPTION NAME:/i)
console << "Laboratory DHCP Menu\n"

console.wait_for(:output, /Select Laboratory DHCP Menu/i)
console << "Accessioning menu\n"

console.wait_for(:output, /to continue/i)
console << "\n"

labs_amount.times do


  console.wait_for(:output, /Select Accessioning menu/i)
  console << "bypass normal data entry\n"

  console.wait_for(:output, /Select Performing Laboratory/i)
  console << "\n"

  console.wait_for(:output, /Do you want to enter draw times/i)
  console << "\n"

  console.wait_for(:output, /Select Patient Name/i)
  console << "#{patient_name}\n"

  console.wait_for(:output, /PATIENT LOCATION/i)
  console << "\n"

  console.wait_for(:output, /Specimen collected how/i)
  console << "\n"

  console.wait_for(:output, /PROVIDER/i)
  console << "\n"

  console.wait_for(:output, /Select URGENCY/i)
  console << "\n"

  console.wait_for(:output, /Select LABORATORY TEST NAME/i)
  console << "CALCIUM\n"

  console.wait_for(:output, /Correct sample/i)
  console << "\n"

  console.wait_for(:output, /Nature of Order/i)
  console << "\n"



  prng = Random.new
  number = prng.rand(98..123)


  console.wait_for(:output, /CALCIUM/i)
  console << "#{number}\n"

  console.wait_for(:output, /Select COMMENT/i)
  console << "Test\n"

  console.wait_for(:output, /Select COMMENT/i)
  console << "\n"

  console.wait_for(:output, /SELECT/i)
  console << "\n"

  console.wait_for(:output, /Approve for release by entering your initials/i)
  console << "LE\n"

  console.wait_for(:output, /to continue/i)
  console << "\n"

end
