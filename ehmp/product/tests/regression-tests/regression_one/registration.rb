require 'greenletters'

class Registration
  def run(options)
    begin
      logger = Logger.new('./logs/registration.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /Do you wish to request a HINQ inquiry/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /Do you wish to make another Request?/i) do |process, match_data|
        console << "\n"
      end

      console.start!

      console.wait_for(:output, /password:/i)
      console << "#{options[:password]}\n"

      console.wait_for(:output, /$/i)
      if options[:sudo]
            console << "sudo csession cache -U VISTA\n"
      else
            console << "csession cache -U VISTA\n"
      end

      console.wait_for(:output, /VISTA>/i)
      console << "s DUZ=20365\n"
      console << "d ^XUP\n"


      console.wait_for(:output, /OPTION NAME:/i)
      console << "mas\n"

      console.wait_for(:output, /CHOOSE 1-5:/i)
      console << "1\n"

      console.wait_for(:output, /Select MAS MASTER MENU/i)
      console << "DG\n"

      console.wait_for(:output, /Press any key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select ADT Manager Menu/i)
      console << "Registration Menu\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Registration Menu/i)
      console << "Load/Edit Patient Data\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Press ENTER to continue/i)
      console << "\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      # Do you wish to request a HINQ inquiry  ? No//       OR  Do you wish to make another Request? No//   (No)

      console.wait_for(:output, /Do you want to edit Patient Data?/i)
      console << "n\n"

      console.wait_for(:output, /Do you want to edit the Patient's Address?/i)
      console << "n\n"

      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "n\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Registration Menu/i)
      console << "Patient Enrollment\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Press ENTER to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "quit\r"


      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Registration Menu/i)
      console << "Patient Enrollment\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Press ENTER to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "ep\r"

      console.wait_for(:output, /Select Action:/i)
      console << "quit\r"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Registration Menu/i)
      console << "Edit Inconsistent Data for a Patient\n"

      console.wait_for(:output, /Check consistency for which PATIENT:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"


      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "\n"

      console.wait_for(:output, /MARITAL STATUS:/i)
      console << "u\n"

      console.wait_for(:output, /RELIGIOUS PREFERENCE:/i)
      console << "unknown\n"

      console.wait_for(:output, /COUNTRY:/i)
      console << "\n"

      console.wait_for(:output, /STREET ADDRESS/i)
      console << "\n"

      console.wait_for(:output, /STREET ADDRESS/i)
      console << "\n"

      console.wait_for(:output, /STREET ADDRESS/i)
      console << "\n"

      console.wait_for(:output, /ZIP/i)
      console << "\n"

      console.wait_for(:output, /CITY:/i)
      console << "\n"

      console.wait_for(:output, /BAD ADDRESS INDICATOR:/i)
      console << "\n"

      console.wait_for(:output, /Are you sure that you want to save the above changes?/i)
      console << "y\n"

      console.wait_for(:output, /Press ENTER to continue:/i)
      console << "\n"




      console.wait_for(:output, /OCCUPATION:/i)
      console << "r\n"

      console.wait_for(:output, /EMPLOYMENT STATUS:/i)
      console << "u\n"

      console.wait_for(:output, /E-NAME:/i)
      console << "\n"

      console.wait_for(:output, /TYPE:/i)
      console << "\n"

      console.wait_for(:output, /VETERAN/i)
      console << "\n"

      console.wait_for(:output, /BENEFITS/i)
      console << "n\n"

      console.wait_for(:output, /RECEIVING HOUSEBOUND BENEFITS/i)
      console << "n\n"

      console.wait_for(:output, /RECEIVING A VA PENSION/i)
      console << "n\n"

      console.wait_for(:output, /POW STATUS INDICATED/i)
      console << "U\n"

      console.wait_for(:output, /PRIMARY ELIGIBILITY CODE:/i)
      console << "\n"

      console.wait_for(:output, /PERIOD OF SERVICE:/i)
      console << "\n"



      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "\n"

      console.wait_for(:output, /E-NAME:/i)
      console << "\n"

      console.wait_for(:output, /TYPE:/i)
      console << "\n"

      console.wait_for(:output, /VETERAN/i)
      console << "\n"

      console.wait_for(:output, /BENEFITS/i)
      console << "\n"

      console.wait_for(:output, /RECEIVING HOUSEBOUND BENEFITS/i)
      console << "\n"

      console.wait_for(:output, /RECEIVING A VA PENSION/i)
      console << "\n"

      console.wait_for(:output, /POW STATUS INDICATED/i)
      console << "\n"

      console.wait_for(:output, /PRIMARY ELIGIBILITY CODE:/i)
      console << "EMPLOYEE\n"

      console.wait_for(:output, /PERIOD OF SERVICE:/i)
      console << "\n"




      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "\n"

      console.wait_for(:output, /E-NAME:/i)
      console << "\n"

      console.wait_for(:output, /TYPE:/i)
      console << "\n"

      console.wait_for(:output, /VETERAN/i)
      console << "\n"

      console.wait_for(:output, /BENEFITS/i)
      console << "\n"

      console.wait_for(:output, /RECEIVING HOUSEBOUND BENEFITS/i)
      console << "\n"

      console.wait_for(:output, /RECEIVING A VA PENSION/i)
      console << "\n"

      console.wait_for(:output, /POW STATUS INDICATED/i)
      console << "\n"

      console.wait_for(:output, /PRIMARY ELIGIBILITY CODE:/i)
      console << "\n"

      console.wait_for(:output, /PERIOD OF SERVICE:/i)
      console << "\n"




      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "n\n"

      console.wait_for(:output, /Check consistency for which PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"



      console.wait_for(:output, /Select Registration Menu/i)
      console << "Eligibility Verification\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"



      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"

      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"

      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"

      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"

      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"





      console.wait_for(:output, /Select Action:/i)
      console << "quit\r"

      console.wait_for(:output, /To edit only veteran income/i)
      console << "\n"

      console.wait_for(:output, /to CONTINUE/i)
      console << "\n"

      console.wait_for(:output, /to QUIT/i)
      console << "\n"



      console.wait_for(:output, /DO YOU WANT TO UPDATE THESE INCONSISTENCIES NOW?/i)
      console << "n\n"

      console.wait_for(:output, /Do you wish to return to Screen/i)
      console << "n\n"



      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"



      console.wait_for(:output, /Select Registration Menu/i)
      console << "Disposition an Application\n"

      console.wait_for(:output, /Disposition PATIENT:/i)
      console << "ehmp,six\n"

      console.wait_for(:output, /Do you want to continue processing this patient record?/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /STATUS:/i)
      console << "\n"

      console.wait_for(:output, /TYPE OF BENEFIT APPLIED FOR:/i)
      console << "\n"

      console.wait_for(:output, /TYPE OF CARE APPLIED FOR:/i)
      console << "\n"

      console.wait_for(:output, /REGISTRATION ELIGIBILITY CODE:/i)
      console << "\n"

      console.wait_for(:output, /LOG OUT DATE TIME:/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR LATE DISPOSITION:/i)
      console << "OTHER DELAY\n"

      console.wait_for(:output, /Disposition deleted/i)
      return true
    rescue
      puts "registration regression test failed"
      return false
    end
  end
end






