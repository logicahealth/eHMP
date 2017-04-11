require 'greenletters'

class Outpatient
  def run(options)
    begin
      logger = Logger.new('./logs/outpatient.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /Press Return to continue/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /Was treatment for/i) do |process, match_data|
        console << "y\n"
      end
      console.on(:output, /Was treatment related to/i) do |process, match_data|
        console << "n\n"
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
      console << "s DUZ=1\n"

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"

      console.wait_for(:output, /Select OPTION NAME/i)
      console << "PHARMACY MASTER MENU\n"

      console.wait_for(:output, /Select PHARMACY MASTER MENU/i)
      console << "PS\n"

      console.wait_for(:output, /Division/i)
      console << "CAMP MASTER\n"

      console.wait_for(:output, /Select PROFILE PRINTER/i)
      console << "\n"

      console.wait_for(:output, /Right Margin/i)
      console << "\n"

      console.wait_for(:output, /Select LABEL PRINTER/i)
      console << "\n"

      console.wait_for(:output, /Right Margin/i)
      console << "\n"

      console.wait_for(:output, /OK to assume label alignment is correct/i)
      console << "\n"

      console.wait_for(:output, /Bingo Board Display/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Outpatient Pharmacy Manager/i)
      console << "Rx\n"

      console.wait_for(:output, /Do you want an Order Summary/i)
      console << "\n"

      console.wait_for(:output, /Select Rx/i)
      console << "Patient Prescription Processing\n"


      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "THREE,PATIENT\n"


      console.wait_for(:output, /TO STOP/i)
      console << "\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /RX PATIENT STATUS/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "quit\r"

      console.wait_for(:output, /Select Action/i)
      console << "NO\r"

      console.wait_for(:output, /RX PATIENT STATUS/i)
      console << "\n"

      console.wait_for(:output, /DRUG/i)
      console << "LEVOTHYROXINE NA (SYNTHROID) 0.2MG TAB\n"

      console.wait_for(:output, /...OK/i)
      console << "\n"


      console.wait_for(:output, /Enter a Question Mark/i)
      console << "1\n"

      console.wait_for(:output, /is this correct/i)
      console << "\n"

      console.wait_for(:output, /DISPENSE UNITS PER DOSE/i)
      console << "\n"


      console.wait_for(:output, /ROUTE/i)
      console << "\n"

      console.wait_for(:output, /Schedule/i)
      console << "Q24\n"

      console.wait_for(:output, /LIMITED DURATION/i)
      console << "90\n"

      console.wait_for(:output, /CONJUNCTION/i)
      console << "\n"

      console.wait_for(:output, /PATIENT INSTRUCTIONS/i)
      console << "Testing\n"


      console.wait_for(:output, /DAYS SUPPLY/i)
      console << "90\n"

      console.wait_for(:output, /QTY/i)
      console << "\n"

      console.wait_for(:output, /COPIES/i)
      console << "\n"

      console.wait_for(:output, /# OF REFILLS/i)
      console << "\n"

      console.wait_for(:output, /PROVIDER/i)
      console << "PROVIDER,EHMP\n"

      console.wait_for(:output, /CLINIC/i)
      console << "GEN MED\n"

      console.wait_for(:output, /MAIL/i)
      console << "WINDOW\n"

      console.wait_for(:output, /METHOD OF PICK-UP/i)
      console << "window\n"

      console.wait_for(:output, /REMARKS/i)
      console << "\n"

      console.wait_for(:output, /ISSUE DATE/i)
      console << "\n"

      console.wait_for(:output, /FILL DATE/i)
      console << "\n"

      console.wait_for(:output, /Nature of Order/i)
      console << "\n"

      console.wait_for(:output, /WAS THE PATIENT COUNSELED/i)
      console << "\n"

      console.wait_for(:output, /Do you want to enter a Progress Note/i)
      console << "\n"

      console.wait_for(:output, /Is this correct/i)
      console << "\n"

      console.wait_for(:output, /Another New Order/i)
      console << "n\n"

      console.wait_for(:output, /Select Action:/i)
      console << "quit\r"

      console.wait_for(:output, /LABEL/i)
      console << "^\n"


      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "\n"

      console.wait_for(:output, /Select Rx/i)
      console << "Edit Prescriptions\n"

      console.wait_for(:output, /Edit Rx/i)
      console << "501120\n"

      console.wait_for(:output, /Is this OKAY/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "ED\r"

      console.wait_for(:output, /Select fields by number/i)
      console << "3\n"

      console.wait_for(:output, /Enter a Question Mark/i)
      console << ".04MG\n"

      console.wait_for(:output, /is this correct/i)
      console << "\n"

      console.wait_for(:output, /VERB/i)
      console << "\n"

      console.wait_for(:output, /DISPENSE UNITS PER DOSE/i)
      console << ".4\n"

      console.wait_for(:output, /Dosage Ordered/i)
      console << "0.08MG\n"

      console.wait_for(:output, /NOUN/i)
      console << "\n"


      console.wait_for(:output, /ROUTE/i)
      console << "\n"

      console.wait_for(:output, /Schedule/i)
      console << "\n"

      console.wait_for(:output, /LIMITED DURATION/i)
      console << "\n"


      console.wait_for(:output, /CONJUNCTION/i)
      console << "\n"

      console.wait_for(:output, /Select Action/i)
      console << "AC\r"

      console.wait_for(:output, /Nature of Order/i)
      console << "\n"

      console.wait_for(:output, /WAS THE PATIENT COUNSELED/i)
      console << "\n"

      console.wait_for(:output, /Do you want to enter a Progress Note/i)
      console << "\n"


      console.wait_for(:output, /Is this correct/i)
      console << "\n"

      console.wait_for(:output, /LABEL: QUEUE/i)
      console << "^\n"


      console.wait_for(:output, /Select Rx/i)
      console << "View Prescriptions\n"

      console.wait_for(:output, /VIEW PRESCRIPTION/i)
      console << "501121\n"


      console.wait_for(:output, /Select Action/i)
      console << "quit\r"

      console.wait_for(:output, /VIEW PRESCRIPTION/i)

      return true
    rescue
      puts "Outpatient Pharamacy regression test failed"
      return false
    end
  end
end
