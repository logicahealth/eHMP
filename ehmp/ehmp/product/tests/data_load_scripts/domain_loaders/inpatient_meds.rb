require 'greenletters'

# options
#------------------------------------
serve_ip = "10.2.2.101"
meds_amount = 10
# patient_id = 100841 #alpha test
patient_name = "alphatest"
#------------------------------------

console = Greenletters::Process.new("ssh vagrant@#{serve_ip}",:transcript => $stdout, :timeout => 20)

console.on(:output, /Press Return to continue/i) do |process, match_data|
  console << "\n"
end

console.on(:output, /Enter RETURN to continue/i) do |process, match_data|
  console << "\n"
end

console.on(:output, /NO ALLERGY ASSESSMENT/i) do |process, match_data|
  console << "\n"
end

console.on(:output, /PROVIDER:/i) do |process, match_data|
  console << "PROVIDER,EIGHT\n"
  console << "1\n"
end

console.on(:output, /RECOMMENDATION/i) do |process, match_data|
  console << "1\n"
end

console.on(:output, /CLINIC LOCATION:/i) do |process, match_data|
  console << "CARDIOLOGY\n"
end


console.on(:output, /CHOOSE/i) do |process, match_data|
  console << "1\n"
end

console.on(:output, /Do you wish to continue/i) do |process, match_data|
  console << "YES\n"
end


console.on(:output, /Do you wish to view active patient record flag details/i) do |process, match_data|
  console << "No\n"
end


console.start!

console.wait_for(:output, /password:/i)
console << "vagrant\n"

console.wait_for(:output, /$/i)
console << "sudo csession cache -U VISTA\n"

console.wait_for(:output, /VISTA>/i)
console << "s DUZ=1\n"

console.wait_for(:output, /VISTA>/i)
console << "d ^XUP\n"

console.wait_for(:output, /Select OPTION NAME/i)
console << "PHARMACY MASTER MENU\n"


console.wait_for(:output, /Select PHARMACY MASTER MENU/i)
console << "PSIV\n"


console.wait_for(:output, /Select IV ROOM NAME/i)
console << "ALBANY IV ROOM\n"


console.wait_for(:output, /Enter IV LABEL device/i)
console << "\n"

console.wait_for(:output, /Enter IV REPORT device/i)
console << "\n"

console.wait_for(:output, /Select IV Menu/i)
console << "Order Entry\n"

console.wait_for(:output, /Select PATIENT/i)
# console << "BCMA,e\n"
console << "#{patient_name}\n"


console.wait_for(:output, /Select Action/i)
console << "NO\r"


meds_amount.times do
      console.wait_for(:output, /Select IV TYPE/i)
      console << "PIGGYBACK\n"

      console.wait_for(:output, /Select ADDITIVE/i)
      console << "SODIUM ACETATE\n"

      console.wait_for(:output, /Strength/i)
      console << "2\n"

      console.wait_for(:output, /Select ADDITIVE/i)
      console << "\n"

      console.wait_for(:output, /Select SOLUTION/i)
      console << "AMINO ACID SOLUTION 8.5%\n"

      console.wait_for(:output, /INFUSION RATE/i)
      console << "10\n"

      console.wait_for(:output, /MED ROUTE/i)
      console << "INTRA-ARTICULAR\n"

      console.wait_for(:output, /SCHEDULE/i)
      console << "Q24H\n"

      console.wait_for(:output, /ADMINISTRATION TIMES/i)
      console << "\n"



      console.wait_for(:output, /REMARKS/i)
      console << "diabetic\n"


      console.wait_for(:output, /1>/i)
      console << "\n"

      console.wait_for(:output, /START DATE/i)
      console << "\n"

      console.wait_for(:output, /STOP DATE/i)
      console << "\n"

      console.wait_for(:output, /Is this O.K./i)
      console << "\n"

      console.wait_for(:output, /NATURE OF ORDER/i)
      console << "\n"

      console.wait_for(:output, /Select Item/i)
      console << "Verify\r"

      console.wait_for(:output, /Action/i)
      console << "\n"

      console.wait_for(:output, /# of labels/i)
      console << "\n"
end
