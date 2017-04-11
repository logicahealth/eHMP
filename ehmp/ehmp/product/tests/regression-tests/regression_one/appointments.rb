require 'greenletters'
require 'date'


class Appointments
  def run(options)
    begin
      logger = Logger.new('./logs/appointments.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      console.on(:output, /DISPLAY PENDING APPOINTMENTS/i) do |process, match_data|
        console << "n\n"
      end


      console.on(:output, /Are you sure you want to continue connecting/i) do |process, match_data|
        console << "YES\n"
      end

      # console.on(:output, /WANT TO PRINT THE PRE-APPOINTMENT LETTER?/i) do |process, match_data|
      #   console << "n\n"
      # end

      # console.on(:output, /OVERBOOK!/i) do |process, match_data|
      #   console << "y\n"
      # end

      # console.on(:output, /DO YOU WANT TO CANCEL IT/i) do |process, match_data|
      #   console << "y\n"
      # end

      console.on(:output, /CHECKED-IN/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /IS THIS CORRECT/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /OR EKG STOPS/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /OTHER INFO/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /PATIENT ALREADY HAS APPOINTMENT ON THE SAME DAY/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /Select ETHNICITY:/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /Select RACE:/i) do |process, match_data|
        console << "\n"
      end

      console.on(:output, /ARE YOU SURE THAT YOU WANT TO PROCEED/i) do |process, match_data|
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
      console << "d ^XUP\n"

      # ----- Make Appointment -----

      console.wait_for(:output, /OPTION NAME:/i)
      console << "MAS MASTER MENU\n"

      console.wait_for(:output, /Scheduling Manager's Menu/i)
      console << "Scheduling Manager's Menu\n"

      console.wait_for(:output, /Appointment Menu/i)
      console << "appointment Menu\n"

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      console.wait_for(:output, /Option:/i)
      console << "Make Appointment\n"

      console.wait_for(:output, /select CLINIC:/i)
      console << "car\n"

      console.wait_for(:output, /PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /APPOINTMENT TYPE:/i)
      console << "\n"

      console.wait_for(:output, /NEXT AVAILABLE/i)
      console << "y\n"

      console.wait_for(:output, /TIME:/i)
      console << "T@10\n"

      # # ----- Appointment Check In -----

      console.wait_for(:output, /ISSUE REQUEST FOR RECORDS?/i)
      console << "\n"

      console.wait_for(:output, /Check In or Check Out/i)
      console << "CI\n"


      console.wait_for(:output, /...checked in/i)


      # # # # ----- Appointment checkout -----

      console.wait_for(:output, /select CLINIC:/i)
      console << "car\n"

      console.wait_for(:output, /PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /APPOINTMENT TYPE:/i)
      console << "\n"

      console.wait_for(:output, /IS THIS A 'NEXT AVAILABLE' APPOINTMENT REQUEST?/i)
      console << "n\n"

      console.wait_for(:output, /ENTER THE DATE DESIRED FOR THIS APPOINTMENT:/i)
      console << "n\n"

      console.wait_for(:output, /TIME:/i)

      today = Date.today
      weekday = today.strftime('%A')

      if weekday == "Monday"
            console << "t-3@9:00\n"
      else
           console << "t-1@9:00\n"
      end

      console.wait_for(:output, /Check out date and time/i)
      console << "\n"

      console.wait_for(:output, /Enter PROVIDER:/i)
      console << "PROVIDER,EIGHT\n"

      console.wait_for(:output, /to continue:/i)
      console << "1\n"

      console.wait_for(:output, /Is this the PRIMARY provider for this ENCOUNTER/i)
      console << "\n"

      console.wait_for(:output, /Enter PROVIDER:/i)
      console << "\n"

      console.wait_for(:output, /ICD-10 Diagnosis/i)
      console << "chest\n"

      console.wait_for(:output, /Select 1-/i)
      console << "1\n"

      console.wait_for(:output, /for this ENCOUNTER?/i)
      console << "\n"

      console.wait_for(:output, /Ordering or Resulting/i)
      console << "or\n"

      console.wait_for(:output, /ICD-10 Diagnosis/i)
      console << "\n"

      console.wait_for(:output, /Would you like to add any Diagnoses to the Problem List/i)
      console << "\n"

      console.wait_for(:output, /Enter PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /Do you wish to see the check out screen/i)
      console << "\n"

      # -------------- delete all the appointments -------------------

      console.wait_for(:output, /select CLINIC:/i)
      console << "\n"

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      # # # ------------ Multiple Appointment Booking --------------

      console.wait_for(:output, /Select Appointment Menu/i)
      console << "Multiple Appointment Booking\n"

      console.wait_for(:output, /Select CLINIC:/i)
      console << "CARDIOLOGY\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /APPOINTMENT TYPE:/i)
      console << "\n"

      console.wait_for(:output, /ENTER THE DATE DESIRED FOR THIS APPOINTMENT:/i)
      console << "t+7\n"

      console.wait_for(:output, /WANT TO MAKE DAILY OR WEEKLY APPOINTMENTS?/i)
      console << "\n"

      console.wait_for(:output, /DATE\/TIME:/i)
      console << "t+7@10\n"

      console.wait_for(:output, /FOR HOW MANY CONSECUTIVE/i)
      console << "4\n"

      console.wait_for(:output, /APPOINTMENTS MADE/i)

      # # # ------------ Display Appointments --------------

      console.wait_for(:output, /select CLINIC:/i)
      console << "\n"

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      console.wait_for(:output, /Select Appointment Menu/i)
      console << "Display Appointments\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /Do you want to see only pending appointments/i)
      console << "YES\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Right Margin/i)
      console << "\n"


      # # # ------------ Check-in Unscheduled --------------

      console.wait_for(:output, /PATIENT NAME:/i)
      console << "\n"

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      console.wait_for(:output, /Select Appointment Menu/i)
      console << "Check-in/Unsched. Visit\n"


      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /Do you want to add a new/i)
      console << "y\n"

      console.wait_for(:output, /Select Clinic:/i)
      console << "CARDIOLOGY\n"

      console.wait_for(:output, /APPOINTMENT TIME:/i)
      console << "\n"

      console.wait_for(:output, /APPOINTMENT TYPE:/i)
      console << "\n"

      console.wait_for(:output, /ISSUE REQUEST FOR RECORDS/i)
      console << "n\n"

      console.wait_for(:output, /Select Appointment Check In or Check Out/i)
      console << "CI\n"


      console.wait_for(:output, /DO YOU WANT TO PRINT A ROUTING SLIP NOW/i)
      console << "n\n"


      # # # ------------ Cancel Appointment --------------

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      console.wait_for(:output, /Select Appointment Menu/i)
      console << "Cancel Appointment\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /DO YOU WANT TO CANCEL/i)
      console << "\n"

      console.wait_for(:output, /APPOINTMENTS CANCELLED BY/i)
      console << "C\n"

      console.wait_for(:output, /Select CANCELLATION REASONS NAME/i)
      console << "Tr\n"

      console.wait_for(:output, /CANCELLATION REMARKS/i)
      console << "testing cancel appoinment\n"

      console.wait_for(:output, /SELECT APPOINTMENTS TO BE CANCELLED/i)
      console << "3\n"

      console.wait_for(:output, /DO YOU WISH TO REBOOK ANY APPOINTMENT/i)
      console << "\n"

      console.wait_for(:output, /DO YOU WISH TO PRINT LETTERS FOR THE CANCELLED APPOINTMENT/i)
      console << "\n"


      # # # ------------ Discharge from clinic --------------

      console.wait_for(:output, /to exit:/i)
      console << "\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "\n"

      console.wait_for(:output, /to stop:/i)
      console << "\n"

      console.wait_for(:output, /Select Appointment Menu/i)
      console << "D\n"

      console.wait_for(:output, /CHOOSE 1-3:/i)
      console << "2\n"

      console.wait_for(:output, /Select PATIENT NAME:/i)
      console << "#{options[:patient]}\n"

      console.wait_for(:output, /PATIENT NOT ENROLLED IN ANY CLINICS!!/i)
      return true
    rescue
      puts "appointments regression test failed"
      return false
    end
  end
end






