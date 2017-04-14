require 'greenletters'

class UnitDose
  def run(options)
    begin
      logger = Logger.new('./logs/unit_dose.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /Are you sure you want to continue connecting/i) do |process, match_data|
        console << "YES\n"
      end

      console.on(:output, /Do you wish to continue with this patient/i) do |process, match_data|
        console << "yes\n"
      end

      console.on(:output, /Would you like to enter one now/i) do |process, match_data|
        console << "no\n"
      end

      console.on(:output, /Press any key to continue/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /Press Return to continue/i) do |process, match_data|
        console << "\n"
      end


      console.on(:output, /Select TERMINAL TYPE NAME:/i) do |process, match_data|
        console << "C-3101\n"
      end

      console.on(:output, /Review active orders?/i) do |process, match_data|
        console << "n\n"
      end


      console.on(:output, /There is already a movement at that date/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /<C>ontinue, <M>ore, or <Q>uit?/i) do |process, match_data|
        console << "\n"
      end


      #       console.wait_for(:output, /Do you wish to continue with this patient/i)
      # console << "yes\n"




      console.start!

      unless options[:ssh_key]
        console.wait_for(:output, /password:/i)
        console << "#{options[:password]}\n"
      end

      console.wait_for(:output, /$/i)
      if options[:sudo]
            console << "sudo csession cache -U VISTA\n"
      else
            console << "csession cache -U VISTA\n"
      end
      console.wait_for(:output, /VISTA(?<inverse>[>])/i)
      console << "s DUZ=1\n"

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"



      #--------------admit a patient-------------

      console.wait_for(:output, /Select OPTION NAME:/i)
      console << "MAS MASTER MENU\n"

      console.wait_for(:output, /Select MAS MASTER MENU <TEST ACCOUNT> Option:/i)
      console << "DG\n"

      console.wait_for(:output, /Select ADT Manager Menu <TEST ACCOUNT> Option:/i)
      console << "Bed Control Menu\n"

      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Admit a Patient\n"

      console.wait_for(:output, /Admit PATIENT:/i)
      console << "regression,male\n"

      console.wait_for(:output, /Select ADMISSION DATE:/i)
      console << "\n"

      console.wait_for(:output, /AS A NEW ADMISSION DATE?/i)
      console << "y\n"

      console.wait_for(:output, /DOES THE PATIENT WISH TO BE EXCLUDED FROM THE FACILITY DIRECTORY?/i)
      console << "no\n"

      console.wait_for(:output, /ADMITTING REGULATION:/i)
      console << "op\n"

      console.wait_for(:output, /TYPE OF ADMISSION:/i)
      console << "OPT-NSC\n"

      # console.wait_for(:output, /CHOOSE 1-2:/i)
      # console << "1\n"

      console.wait_for(:output, /DIAGNOSIS/i)
      console << "R/o\n"

      console.wait_for(:output, /WARD LOCATION:/i)
      console << "7A GEN MED\n"

      console.wait_for(:output, /ROOM-BED:/i)
      console << "\n"

      console.wait_for(:output, /FACILITY TREATING SPECIALTY:/i)
      console << "GENERAL SURGERY\n"

      # console.wait_for(:output, /CHOOSE 1-5:/i)
      # console << "1\n"

      console.wait_for(:output, /PRIMARY PHYSICIAN:/i)
      console << "provider,e\n"

      console.wait_for(:output, /CHOOSE 1-5:/i)
      console << "2\n"

      console.wait_for(:output, /ATTENDING PHYSICIAN:/i)
      console << "provider,ten\n"

      console.wait_for(:output, /EDIT Option:/i)
      console << "\n"

      console.wait_for(:output, /SOURCE OF ADMISSION:/i)
      console << "1M\n"

      console.wait_for(:output, /Admit PATIENT:/i)
      console << "\n"

      console << "\n"
      console << "\n"
      console << "\n"
      console << "\n"

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"


      #----------------

      console.wait_for(:output, /Select OPTION NAME/i)
      console << "PHARMACY MASTER MENU\n"



      console.wait_for(:output, /Select PHARMACY MASTER MENU/i)
      console << "PSG\n"


      console.wait_for(:output, /Select Unit Dose Medications/i)
      console << "Discontinue All\n"


      # console.wait_for(:output, /Select PATIENT/i)
      # console << "eight,p\n"


      # console.wait_for(:output, /CHOOSE/i)
      # console << "1\n"

      # console.wait_for(:output, /Do you wish to view active patient record flag details/i)
      # console << "n\n"


      # console.wait_for(:output, /Do you want to discontinue all of this patient's orders/i)
      # console << "\n"



      console.wait_for(:output, /Select PATIENT/i)
      console << "regression,male\n"


      # console.wait_for(:output, /Do you wish to continue with this patient/i)
      # console << "yes\n"


      # console.wait_for(:output, /Do you want to discontinue all of this patient's orders/i)
      # console << "\n"


      console.wait_for(:output, /Select PATIENT/i)
      console << "\n"





      console.wait_for(:output, /Select Unit Dose Medications/i)
      console << "IOE\n"


      console.wait_for(:output, /Select IV ROOM NAME/i)
      console << "ALBANY IV ROOM\n"



      console.wait_for(:output, /Enter IV LABEL device/i)
      console << "\n"


      console.wait_for(:output, /Enter IV REPORT device/i)
      console << "\n"


      console.wait_for(:output, /Select PATIENT/i)
      console << "regression,male\n"


      console.wait_for(:output, /Select Action/i)
      console << "NO\r"

      console.wait_for(:output, /Drug/i)
      console << "LEVOTHYROXINE\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "5\n"


      console.wait_for(:output, /Enter Free Text Dose/i)
      console << "1\n"

      console.wait_for(:output, /is this correct/i)
      console << "\n"

      console.wait_for(:output, /MED ROUTE/i)
      console << "\n"

      console.wait_for(:output, /SCHEDULE/i)
      console << "Q24H\n"

      console.wait_for(:output, /SCHEDULE TYPE/i)
      console << "\n"

      console.wait_for(:output, /ADMIN TIMES/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "testing\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Flag the Special Instructions/i)
      console << "No\n"

      console.wait_for(:output, /START DATE/i)
      console << "n\n"

      console.wait_for(:output, /STOP DATE/i)
      console << "\n"

      console.wait_for(:output, /PROVIDER/i)
      console << "\n"

      console.wait_for(:output, /Select Item/i)
      console << "AC\r"


      console.wait_for(:output, /NATURE OF ORDER/i)
      console << "\n"


      console.wait_for(:output, /Select Item/i)
      console << "VF\r"

      console.wait_for(:output, /Pre-Exchange DOSES/i)
      console << "1\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Select DRUG/i)
      console << "\n"

      console.wait_for(:output, /Select IV TYPE/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "QUIT\r"

      console.wait_for(:output, /Select DEVICE/i)
      console << "\n"


      console.wait_for(:output, /DO YOU NEED TO PRINT THIS REPORT AGAIN/i)
      console << "\n"


      console.wait_for(:output, /Select PATIENT/i)
      console << "\n"



      console.wait_for(:output, /Select Unit Dose Medications/i)
      console << "IPF\n"

      console.wait_for(:output, /Select by WARD GROUP/i)
      console << "Patient\n"

      console.wait_for(:output, /Select PATIENT/i)
      console << "regression,male\n"

      # console.wait_for(:output, /CHOOSE/i)
      # console << "1\n"


      console.wait_for(:output, /Select another PATIENT/i)
      console << "\n"

      console.wait_for(:output, /SHORT, LONG, or NO Profile/i)
      console << "\n"

      console.wait_for(:output, /Show PROFILE only/i)
      console << "\n"

      console.wait_for(:output, /Select PRINT DEVICE/i)
      console << "\n"

      console.wait_for(:output, /View ORDER/i)
      console << "\n"

      console.wait_for(:output, /Select by WARD GROUP/i)
      console << "\n"


      console.wait_for(:output, /Select Unit Dose Medications/i)
      console << "Hold All of a Patient's Orders\n"


      console.wait_for(:output, /Select PATIENT/i)
      console << "regression,male\n"

      # console.wait_for(:output, /CHOOSE/i)
      # console << "1\n"

      console.wait_for(:output, /DO YOU WANT TO PLACE THIS PATIENT'S ORDERS/i)
      console << "\n"


      console.wait_for(:output, /HOLD REASON/i)
      console << "Testing Regression\n"


      console.wait_for(:output, /Select Unit Dose Medications/i)

      return true
    rescue
      puts "Unit Dose regression test failed"
      return false
    end
  end
end
