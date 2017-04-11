require 'greenletters'

class Lab
  def run(options)
    begin
      logger = Logger.new('./logs/lab.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      # console.on(:output, /Do you wish to request a HINQ inquiry/i) do |process, match_data|
      #   console << "\n"
      # end

      console.on(:output, /Are you sure you want to continue connecting/i) do |process, match_data|
        console << "YES\n"
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
      console << "s DUZ=20365\n"


      #------------------------------------------- update divison

      console.wait_for(:output, /VISTA>/i)
      console << "d P^DI\n"

      console.wait_for(:output, /Select OPTION/i)
      console << "1\n"

      console.wait_for(:output, /INPUT TO WHAT FILE/i)
      console << "NEW PERSON\n"


      console.wait_for(:output, /EDIT WHICH FIELD/i)
      console << "DIVISION\n"

      console.wait_for(:output, /EDIT WHICH DIVISION SUB-FIELD/i)
      console << "\n"

      console.wait_for(:output, /THEN EDIT FIELD/i)
      console << "\n"

      console.wait_for(:output, /Select NEW PERSON NAME/i)
      console << "labtech,e\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select DIVISION:/i)
      console << "CAMP MASTER\n"

      console.wait_for(:output, /Are you adding/i)
      console << "yes\n"

      console.wait_for(:output, /DEFAULT/i)
      console << "\n"

      console.wait_for(:output, /Select NEW PERSON NAME/i)
      console << "\n"
      console.wait_for(:output, /Select OPTION/i)
      console << "\n"

      #-------------------------------------------

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"

      console.wait_for(:output, /OPTION NAME:/i)
      console << "Laboratory DHCP Menu\n"

      console.wait_for(:output, /Select Laboratory DHCP Menu/i)
      console << "Accessioning menu\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Accessioning menu/i)
      console << "Accessioning tests ordered by ward order entry\n"

      console.wait_for(:output, /Select Order number/i)
      console << "\n"

      console.wait_for(:output, /Select Patient Name/i)
      console << "TWO,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /PATIENT LOCATION/i)
      console << "\n"

      console.wait_for(:output, /PROVIDER/i)
      console << "\n"

      console.wait_for(:output, /Select LABORATORY TEST NAME/i)
      console << "A1\n"

      console.wait_for(:output, /Select URGENCY/i)
      console << "\n"

      console.wait_for(:output, /Select LABORATORY TEST NAME/i)
      console << "\n"

      console.wait_for(:output, /Specimen collected how/i)
      console << "\n"

      console.wait_for(:output, /Nature of Order/i)
      console << "\n"

      console.wait_for(:output, /All satisfactory/i)
      console << "\n"

      console.wait_for(:output, /ORDER COPY DEVICE/i)
      console << "\n"

      console.wait_for(:output, /LAB Order number/i)


      contents = console.output_buffer.string
      regex = /(LAB Order number: )(?<order_id>[\d]*)/

      order_id = 0
      contents.gsub(regex){ |match|
        order_id = match.gsub(regex, '\k<order_id>')
      }

      console << "\n"

      console.wait_for(:output, /Press RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Collection Date@Time/i)
      console << "\n"


      console.wait_for(:output, /(ACCESSION:  CH )(?<accession>\d*) 1/i)

      contents = console.output_buffer.string
      regex = /(ACCESSION:  CH )(?<accession>\d*) 1/

      accession = ""
      contents.gsub(regex){ |match|
        accession = match.gsub(regex, '\k<accession>')
      }


      console.wait_for(:output, /Select Order number/i)
      console << "\n"



      console.wait_for(:output, /Select Patient Name/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      # console << "\n"

      console.wait_for(:output, /Select Accessioning menu/i)
      console << "Delete entire order or individual tests\n"

      console.wait_for(:output, /ENTER ORDER NUMBER/i)
      console << "#{order_id}\n"


      console.wait_for(:output, /Change entire order/i)
      console << "y\n"

      console.wait_for(:output, /Cancellation Reason/i)
      console << "TESTING\n"

      console.wait_for(:output, /Do you want the entire/i)
      console << "y\n"

      console.wait_for(:output, /Cancellation Reason/i)
      console << "PATIENT UNAVAILABLE\n"

      console.wait_for(:output, /Select NP comment Lab Description screen/i)
      console << "GENERAL\n"



      console.wait_for(:output, /Not Perform Reason/i)
      console << "p\n"

      console.wait_for(:output, /Satisfactory Comment/i)
      console << "y\n"

      console.wait_for(:output, /ENTER ORDER NUMBER/i)
      console << "\n"


      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Accessioning menu/i)
      console << "Add tests to a given accession\n"

      console.wait_for(:output, /Select Accession or UID/i)
      console << "CH #{accession} 1\n"

      console.wait_for(:output, /Nature of Order/i)
      console << "\n"

      console.wait_for(:output, /Select Original Ordered Test/i)
      console << "1\n"

      console.wait_for(:output, /...OK/i)
      console << "\n"



      console.wait_for(:output, /Add LABORATORY TEST/i)
      console << "Thy\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"

      console.wait_for(:output, /...OK/i)
      console << "\n"


      console.wait_for(:output, /That test normally belongs to accession area RIA/i)
      console << "Y\n"

      console.wait_for(:output, /Select URGENCY/i)
      console << "\n"

      console.wait_for(:output, /...OK/i)
      console << "\n"



      console.wait_for(:output, /Type of test order being added/i)
      console << "1\n"

      console.wait_for(:output, /Add LABORATORY TEST/i)
      console << "\n"

      console.wait_for(:output, /Select Accession or UID/i)
      console << "\n"


      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Accessioning menu/i)
      console << "Delete entire order or individual tests\n"

      console.wait_for(:output, /ENTER ORDER NUMBER/i)
      console << "#{order_id}\n"

      console.wait_for(:output, /Change entire order/i)
      console << "y\n"


      console.wait_for(:output, /Cancellation Reason/i)
      console << "TESTING\n"

      console.wait_for(:output, /Do you want the entire ORDER REASON List/i)
      console << "y\n"


      console.wait_for(:output, /Cancellation Reason/i)
      console << "p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"


      console.wait_for(:output, /Select NP comment Lab Description screen/i)
      console << "k\n"


      console.wait_for(:output, /Not Perform Reason/i)
      console << "p\n"

      console.wait_for(:output, /Satisfactory Comment/i)
      console << "y\n"

      console.wait_for(:output, /ENTER ORDER NUMBER/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"



      console.wait_for(:output, /Select Accessioning menu/i)
      console << "FAST LAB TEST ORDER (ROUTINE)\n"


      console.wait_for(:output, /Do you want copies of the orders/i)
      console << "n\n"


      console.wait_for(:output, /SPECIMEN COLLECTION DATE/i)
      console << "t+1@10:00\n"


      console.wait_for(:output, /Select ACCESSION TEST GROUP/i)
      console << "??\n"

      console.wait_for(:output, /Select ACCESSION TEST GROUP/i)
      console << "NYC ROUTINE COLLECT\n"


      console.wait_for(:output, /Select Patient Name/i)
      console << "two,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /PATIENT LOCATION/i)
      console << "\n"

      console.wait_for(:output, /PROVIDER/i)
      console << "\n"

      console.wait_for(:output, /TEST number/i)
      console << "5\n"

      console.wait_for(:output, /Other tests/i)
      console << "\n"

      console.wait_for(:output, /Nature of Order/i)
      console << "\n"

      console.wait_for(:output, /All satisfactory/i)
      console << "\n"

      console.wait_for(:output, /Select Patient Name/i)
      console << "\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"


      console.wait_for(:output, /Select Accessioning menu/i)
      console << "bypass normal data entry\n"




      console.wait_for(:output, /Select Performing Laboratory/i)
      console << "\n"

      console.wait_for(:output, /Do you want to enter draw times/i)
      console << "\n"

      console.wait_for(:output, /Select Patient Name/i)
      console << "three,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

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

      console.wait_for(:output, /CALCIUM/i)
      console << "123\n"

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

      console.wait_for(:output, /Select Accessioning menu/i)
      console << "\n"

      console.wait_for(:output, /Select Laboratory DHCP Menu/i)
      console << "3\n"

      console.wait_for(:output, /Select Process data in lab menu/i)
      console << "EM\n"

      console.wait_for(:output, /Do you want to review the data before and after you edit/i)
      console << "\n"

      console.wait_for(:output, /Do you wish to see all previously verified results/i)
      console << "\n"

      console.wait_for(:output, /Verify by/i)
      console << "\n"

      console.wait_for(:output, /Select Accession/i)
      console << "CH #{accession} 2\n"

      console.wait_for(:output, /Select Performing Laboratory/i)
      console << "\n"

      console.wait_for(:output, /If you need to change something, enter your initials/i)
      console << "LE\n"

      console.wait_for(:output, /SELECT/i)
      console << "e\n"

      console.wait_for(:output, /CALCIUM/i)
      console << "35\n"

      console.wait_for(:output, /Select COMMENT/i)
      console << "\n"

      console.wait_for(:output, /COMMENT/i)
      console << "\n"

      console.wait_for(:output, /Select COMMENT/i)
      console << "\n"

      console.wait_for(:output, /If you need to change something, enter your initials/i)
      console << "LE\n"

      console.wait_for(:output, /SELECT/i)
      console << "\n"

      console.wait_for(:output, /Approve update of data by entering your initials/i)
      console << "LE\n"

      console.wait_for(:output, /LAST IN WORK LIST/i)

      return true
    rescue
      puts "lab regression test failed"
      return false
    end
  end
end
