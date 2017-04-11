require 'greenletters'

class BCMA
  def run(options)
    begin
      logger = Logger.new('./logs/bcma.log')
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
      console << "s DUZ=1\n"

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"

      console.wait_for(:output, /Select OPTION NAME/i)
      console << "Due List\n"



      console.wait_for(:output, /Start Date/i)
      console << "JUN 7,2014\t"
      console << "8\t"
      console << "12\t"
      console << "Patient\t"
      console << "BCMA,EIGHT\t"
      console << "1\r"

      console << "\t\t\t\t\t\t\t"

      console << "TELNET\t"
      console << "1\n"

      console << "\t\t"

      console << "E\r"


      console.wait_for(:output, /Save changes before leaving form/i)

      console << "Y\r"

      console.wait_for(:output, /VISTA>/i)

      return true
    rescue
      puts "BCMA regression test failed"
      return false
    end
  end
end