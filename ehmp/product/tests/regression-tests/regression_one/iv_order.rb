require 'greenletters'

class IVOrder
  def run(options)
    begin
      logger = Logger.new('./logs/iv_order.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /Press Return to continue/i) do |process, match_data|
        console << "\n"
      end

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
      console << "BCMA,e\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select Action/i)
      console << "No\r"

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
      console << "Q2H\n"

      console.wait_for(:output, /ADMINISTRATION TIMES/i)
      console << "\n"

      console.wait_for(:output, /Enter RETURN to continue /i)
      console << "\n"

      console.wait_for(:output, /REMARKS/i)
      console << "testing\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "\n"

      console.wait_for(:output, /START DATE/i)
      console << "\n"

      console.wait_for(:output, /STOP DATE/i)
      console << "\n"

      console.wait_for(:output, /PROVIDER/i)
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

      console.wait_for(:output, /Select IV TYPE/i)
      console << "halt\n"

      return true
    rescue
      puts "IV Order regression test failed"
      return false
    end
  end
end