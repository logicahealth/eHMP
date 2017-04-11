require 'greenletters'

class Allergy
  def run(options)
    begin
      logger = Logger.new('./logs/allergies.log')

      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

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
      console << "enter/Edit Patient Reaction\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "regression,male\n"


      console.wait_for(:output, /Enter Causative Agent/i)
      console << "Milk\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /OK/i)
      console << "y\n"

      console.wait_for(:output, /Adverse Reaction/i)
      console << "H\n"

      console.wait_for(:output, /Enter from the list above/i)
      console << "1\n"

      console.wait_for(:output, /of appearance of Sign/i)
      console << "t-30\n"

      console.wait_for(:output, /Select Action/i)
      console << "\n"

      console.wait_for(:output, /MECHANISM/i)
      console << "A\n"

      console.wait_for(:output, /1/i)
      console << "Testing\n"

      console.wait_for(:output, /2/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Enter another Causative Agent/i)
      console << "n\n"

      console.wait_for(:output, /Is this correct/i)
      console << "y\n"

      console.wait_for(:output, /This session you have CHOSEN/i)

      return true
    rescue
      puts "Allergy regression test failed"
      return false
    end
  end
end
