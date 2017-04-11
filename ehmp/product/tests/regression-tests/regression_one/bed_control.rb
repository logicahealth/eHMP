require 'greenletters'

class Bed_Control
  def run(options)
    begin
      logger = Logger.new('./logs/bed_control.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /Are you sure you want to continue connecting/i) do |process, match_data|
        console << "YES\n"
      end

      console.on(:output, /Press any key to continue/i) do |process, match_data|
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

      console.wait_for(:output, /VISTA>/i)
      console << "s DUZ=11399\n"
      console << "d ^XUP\n"

      # ----- Make Appointment -----

      console.wait_for(:output, /Select OPTION NAME:/i)
      console << "MAS MASTER MENU\n"

      console.wait_for(:output, /Select MAS MASTER MENU <TEST ACCOUNT> Option:/i)
      console << "DG\n"

      console.wait_for(:output, /Select ADT Manager Menu <TEST ACCOUNT> Option:/i)
      console << "Bed Control Menu\n"

      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Admit a Patient\n"

      console.wait_for(:output, /Admit PATIENT:/i)
      console << "regression,female\n"

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

      console.wait_for(:output, /Select Bed Control Menu/i)
      console << "Transfer a Patient\n"

      console.wait_for(:output, /Transfer PATIENT:/i)
      console << "regression,female\n"

      console.wait_for(:output, /Select TRANSFER DATE:/i)
      console << "\n"

      console.wait_for(:output, /SURE YOU WANT TO ADD/i)
      console << "\n"

      console.wait_for(:output, /TYPE OF TRANSFER:/i)
      console << "11\n"

      console.wait_for(:output, /WARD LOCATION:/i)
      console << "3 NORTH SURG\n"

      console.wait_for(:output, /ROOM-BED:/i)
      console << "AS-1\n"

      console.wait_for(:output, /CHOOSE 1-2:/i)
      console << "1\n"

      console.wait_for(:output, /facility treating specialty/i)
      console << "yes\n"

      console.wait_for(:output, /FACILITY TREATING SPECIALTY:/i)
      console << "GENERAL SURGERY\n"

      console.wait_for(:output, /PRIMARY PHYSICIAN:/i)
      console << "PROVIDER,EIGHT\n"

      console.wait_for(:output, /CHOOSE 1-5:/i)
      console << "1\n"

      console.wait_for(:output, /ATTENDING PHYSICIAN:/i)
      console << "provider,ten\n"

      console.wait_for(:output, /1>/i)
      console << "R/O Her HERNIA\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Transfer PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Switch Bed\n"

      console.wait_for(:output, /SWITCH BED FOR PATIENT:/i)
      console << "regression,female\n"

      console.wait_for(:output, /ROOM-BED:/i)
      console << "AS-5\n"

      console.wait_for(:output, /SWITCH BED FOR PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Discharge a Patient\n"

      console.wait_for(:output, /Discharge PATIENT:/i)
      console << "regression,female\n"

      console.wait_for(:output, /DISCHARGE DATE:/i)
      console << "\n"

      console.wait_for(:output, /TYPE OF DISCHARGE:/i)
      console << "REGULAR\n"

      console.wait_for(:output, /Do you wish to assign patient to Primary Care?/i)
      console << "\n"

      console.wait_for(:output, /Discharge PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Detailed Inpatient\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "regression,female\n"


      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "bcma\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /ADMISSION:/i)
      console << "\n"

      # console.wait_for(:output, /Select PATIENT NAME:/i)
      # console << "\n"

      console.wait_for(:output, /Select Bed Control Menu/i)
      console << "extended Bed Control\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "regression,female\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select Option:/i)
      console << "1\n"

      console.wait_for(:output, /ADMISSION DATE:/i)
      console << "\n"

      console.wait_for(:output, /DOES THE PATIENT WISH TO BE EXCLUDED FROM THE FACILITY DIRECTORY/i)
      console << "\n"

      console.wait_for(:output, /ADMITTING REGULATION:/i)
      console << "\n"

      console.wait_for(:output, /TYPE OF ADMISSION:/i)
      console << "\n"

      console.wait_for(:output, /DIAGNOSIS/i)
      console << "\n"

      console.wait_for(:output, /WARD LOCATION:/i)
      console << "\n"

      console.wait_for(:output, /ROOM-BED:/i)
      console << "\n"

      console.wait_for(:output, /FACILITY TREATING SPECIALTY:/i)
      console << "\n"

      console.wait_for(:output, /PRIMARY PHYSICIAN:/i)
      console << "\n"

      console.wait_for(:output, /ATTENDING PHYSICIAN:/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option:/i)
      console << "\n"

      console.wait_for(:output, /SOURCE OF ADMISSION:/i)
      console << "\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "\n"


      console.wait_for(:output, /Select Bed Control Menu <TEST ACCOUNT> Option:/i)
      console << "Check-in\n"

      console.wait_for(:output, /Check-in PATIENT:/i)
      console << "regression,female\n"



      console.wait_for(:output, /Select LODGER CHECK-IN DATE:/i)
      console << "\n"

      console.wait_for(:output, /AS A NEW LODGER CHECK-IN DATE?/i)
      console << "y\n"

      console.wait_for(:output, /CHECK-IN TYPE:/i)
      console << "41\n"

      console.wait_for(:output, /WARD LOCATION:/i)
      console << "3 NORTH SURG\n"

      console.wait_for(:output, /ROOM-BED:/i)
      console << "AS\n"

      console.wait_for(:output, /CHOOSE 1-5:/i)
      console << "1\n"

      console.wait_for(:output, /REASON FOR LODGING:/i)
      console << "EARLY APPOINTMENT\n"

      console.wait_for(:output, /LODGING COMMENTS:/i)
      console << "TESTING\n"


      console.wait_for(:output, /Check-in PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /Select Bed Control Menu/i)
      console << "lodger Check-out\n"

      console.wait_for(:output, /Check-out PATIENT:/i)
      console << "regression,female\n"

      console.wait_for(:output, /CHECK-OUT LODGER DATE:/i)
      console << "\n"

      console.wait_for(:output, /DISPOSITION:/i)
      console << "DISMISSED\n"

      console.wait_for(:output, /Check-out PATIENT:/i)
      console << "\n"

      console.wait_for(:output, /Select Bed Control Menu/i)
      console << "seriously Ill List\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "ehmp,FIVE\n"

      console.wait_for(:output, /CONDITION:/i)
      console << "SERIOUSLY ILL\n"

      console.wait_for(:output, /DATE ENTERED ON SI LIST:/i)
      console << "\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      return true
    rescue
      puts "bed control regression test failed"
      return false
    end
  end
end









