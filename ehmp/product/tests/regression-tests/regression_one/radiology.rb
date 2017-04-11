require 'greenletters'

class Radiology
  def run(options)
    begin
      logger = Logger.new('./logs/radiology.log')
      command = "ssh #{options[:user]}@#{options[:server]}"

      if options[:ssh_key]
        command = "ssh -i #{options[:ssh_key_path]} #{options[:user]}@#{options[:server]}"
      end

      console = Greenletters::Process.new(command,:transcript => logger, :timeout => 20)

      # console.on(:output, /Imaging Exam Date/i) do |process, match_data|
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
      console << "s DUZ=11716\n"

      console.wait_for(:output, /VISTA>/i)
      console << "d ^XUP\n"

      console.wait_for(:output, /Select OPTION NAME/i)
      console << "RA Overall\n"

      console.wait_for(:output, /Press any key to continue/i)
      console << "\n"

      console.wait_for(:output, /Please select a sign-on Imaging Location/i)
      console << "RADIOLOGY MAIN FLOOR\n"

      console.wait_for(:output, /Default Flash Card Printer/i)
      console << "\n"

      console.wait_for(:output, /Default Jacket Label Printer/i)
      console << "\n"

      console.wait_for(:output, /Default Report Printer/i)
      console << "\n"

      console.wait_for(:output, /Nuc Med Total System Menu/i)
      console << "radiology/Nuclear Med Order Entry Menu\n"







      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Request an Exam\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "NINE,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Patient Location/i)
      console << "RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Person Requesting Order/i)
      console << "\n"

      console.wait_for(:output, /key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select IMAGING TYPE/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Select Procedure/i)
      console << "12\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "L\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "t+4\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "pain\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "test\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Do you want to change any of the above/i)
      console << "y\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT SCHEDULED FOR PRE-OP/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "\n"

      console.wait_for(:output, /MODE OF TRANSPORT/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT ON ISOLATION PROCEDURES/i)
      console << "\n"

      console.wait_for(:output, /REQUEST URGENCY/i)
      console << "\n"

      console.wait_for(:output, /ORDER ACTIVITY/i)
      console << "\n"

      console.wait_for(:output, /SUBMIT REQUEST TO/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"











      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Request an Exam\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "NINE,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Patient Location/i)
      console << "RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Person Requesting Order/i)
      console << "\n"

      console.wait_for(:output, /key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select IMAGING TYPE/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Select Procedure/i)
      console << "7\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "L\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "t+2\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "pain\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "test\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Do you want to change any of the above/i)
      console << "y\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT SCHEDULED FOR PRE-OP/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "\n"

      console.wait_for(:output, /MODE OF TRANSPORT/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT ON ISOLATION PROCEDURES/i)
      console << "\n"

      console.wait_for(:output, /REQUEST URGENCY/i)
      console << "\n"

      console.wait_for(:output, /ORDER ACTIVITY/i)
      console << "\n"

      console.wait_for(:output, /SUBMIT REQUEST TO/i)
      console << "r\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"








      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Request an Exam\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "NINE,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Patient Location/i)
      console << "RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Person Requesting Order/i)
      console << "\n"

      console.wait_for(:output, /key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select IMAGING TYPE/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Select Procedure/i)
      console << "3\n"


      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "t+5\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "pain\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "test\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Do you want to change any of the above/i)
      console << "y\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT SCHEDULED FOR PRE-OP/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "\n"

      console.wait_for(:output, /MODE OF TRANSPORT/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT ON ISOLATION PROCEDURES/i)
      console << "\n"

      console.wait_for(:output, /REQUEST URGENCY/i)
      console << "\n"

      console.wait_for(:output, /ORDER ACTIVITY/i)
      console << "\n"

      console.wait_for(:output, /SUBMIT REQUEST TO/i)
      console << "r\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"






      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Cancel a Request\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "NINE,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select Request/i)
      console << "1\n"

      console.wait_for(:output, /Select CANCEL REASON/i)
      console << "6\n"




      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Hold a Request\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "nine,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select Request/i)
      console << "1\n"

      console.wait_for(:output, /Select HOLD REASON/i)
      console << "15\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "\n"







      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Detailed Request Display\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "nine,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Nuc Med Location/i)
      console << "\n"

      console.wait_for(:output, /Another one/i)
      console << "\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Select Request/i)
      console << "3\n"

      console.wait_for(:output, /Do you wish to display request status tracking log/i)
      console << "y\n"

      console.wait_for(:output, /to continue/i)
      console << "\n"

      console.wait_for(:output, /Press RETURN to continue/i)
      console << "\n"


























      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Request an Exam\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "NINE,PATIENT\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Patient Location/i)
      console << "RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Person Requesting Order/i)
      console << "\n"

      console.wait_for(:output, /key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select IMAGING TYPE/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Select Procedure/i)
      console << "13\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "L\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "t\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "pain\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "test\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Do you want to change any of the above/i)
      console << "y\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT SCHEDULED FOR PRE-OP/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "\n"

      console.wait_for(:output, /MODE OF TRANSPORT/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT ON ISOLATION PROCEDURES/i)
      console << "\n"

      console.wait_for(:output, /REQUEST URGENCY/i)
      console << "\n"

      console.wait_for(:output, /ORDER ACTIVITY/i)
      console << "\n"

      console.wait_for(:output, /SUBMIT REQUEST TO/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"





      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "\n"








      console.wait_for(:output, /Nuc Med Total System Menu/i)
      console << "exam Entry/Edit Menu\n"

      console.wait_for(:output, /Select Exam Entry/i)
      console << "register Patient for Exams\n"

      console.wait_for(:output, /Select Patient/i)
      console << "nine,p\n"

      console.wait_for(:output, /...OK/i)
      console << "n\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Are you adding/i)
      console << "y\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /Imaging Exam Date/i)
      console << "\n"

      console.wait_for(:output, /Select Request/i)
      console << "3\n"


      # get case number!

      console.wait_for(:output, /(Case Number: )(?<first>[\d]*)/i)

      contents = console.output_buffer.string
      regex = /(Case Number: )(?<first>[\d]*)/

      first = 0
      contents.gsub(regex){ |match|
        first = match.gsub(regex, '\k<first>')
      }



      #------

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /PRINCIPAL CLINIC/i)
      console << "r\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"

      console.wait_for(:output, /TECHNOLOGIST COMMENT/i)
      console << "test\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Do you STILL want your output QUEUED/i)
      console << "\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Do you STILL want your output QUEUED?/i)
      console << "^\n"



      console.wait_for(:output, /Select Barcode Printer/i)
      console << "\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"







      console.wait_for(:output, /Select Patient/i)
      console << "nine,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /...OK/i)
      console << "y\n"





      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      sleep(60)
      console.wait_for(:output, /Imaging Exam Date/i)
      console << "\n"

      console.wait_for(:output, /Select Request/i)
      console << "2\n"


      # get case number!

      console.wait_for(:output, /(Case Number: )(?<second>[\d]*)/i)

      contents = console.output_buffer.string
      regex = /(Case Number: )(?<second>[\d]*)/

      second = 0
      contents.gsub(regex){ |match|
        second = match.gsub(regex, '\k<second>')
      }



      #------


      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"


      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /PRINCIPAL CLINIC/i)
      console << "r\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"

      console.wait_for(:output, /TECHNOLOGIST COMMENT/i)
      console << "test\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Do you STILL want your output QUEUED/i)
      console << "\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Do you STILL want your output QUEUED?/i)
      console << "^\n"


      console.wait_for(:output, /Is this a WET READING/i)
      console << "\n"

      console.wait_for(:output, /Select Patient/i)
      console << "\n"



      console.wait_for(:output, /Select Exam Entry/i)
      console << "Cancel an Exam\n"

      console.wait_for(:output, /Enter Case Number/i)
      console << "#{first}\n"


      console.wait_for(:output, /Do you wish to cancel this exam now/i)
      console << "Y\n"

      console.wait_for(:output, /STATUS CHANGE DATE/i)
      console << "\n"

      console.wait_for(:output, /TECHNOLOGIST COMMENT/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR CANCELLATION/i)
      console << "19\n"

      console.wait_for(:output, /Do you want to cancel the request associated with this exam/i)
      console << "y\n"

      console.wait_for(:output, /Select Exam Entry/i)
      console << "\n"



      console.wait_for(:output, /Nuc Med Total System Menu/i)
      console << "radiology/Nuclear Med Order Entry Menu\n"






      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "Request an Exam\n"

      console.wait_for(:output, /Select PATIENT NAME/i)
      console << "three,p\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Patient Location/i)
      console << "RADIOLOGY\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Person Requesting Order/i)
      console << "\n"

      console.wait_for(:output, /key to continue/i)
      console << "\n"

      console.wait_for(:output, /Select IMAGING TYPE/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Select Procedure/i)
      console << "3\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "b\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "t\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "pain\n"

      console.wait_for(:output, /Enter RETURN to continue/i)
      console << "\n"

      console.wait_for(:output, /1>/i)
      console << "test\n"

      console.wait_for(:output, /2>/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /Do you want to change any of the above/i)
      console << "y\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /REASON FOR STUDY/i)
      console << "\n"

      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT SCHEDULED FOR PRE-OP/i)
      console << "\n"

      console.wait_for(:output, /DATE DESIRED/i)
      console << "\n"

      console.wait_for(:output, /MODE OF TRANSPORT/i)
      console << "\n"

      console.wait_for(:output, /IS PATIENT ON ISOLATION PROCEDURES/i)
      console << "\n"

      console.wait_for(:output, /REQUEST URGENCY/i)
      console << "\n"

      console.wait_for(:output, /ORDER ACTIVITY/i)
      console << "\n"

      console.wait_for(:output, /SUBMIT REQUEST TO/i)
      console << "r\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"






      console.wait_for(:output, /Nuclear Med Order Entry Menu/i)
      console << "\n"





      console.wait_for(:output, /Nuc Med Total System Menu/i)
      console << "exam Entry/Edit Menu\n"

      console.wait_for(:output, /Select Exam Entry/i)
      console << "register Patient for Exams\n"

      console.wait_for(:output, /Select Patient/i)
      console << "three,p\n"


      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Are you adding/i)
      console << "y\n"

      console.wait_for(:output, /Imaging Exam Date/i)
      console << "\n"

      console.wait_for(:output, /Select Request/i)
      console << "1\n"


      # get case number!

      console.wait_for(:output, /(Case Number: )(?<third>[\d]*)/i)

      contents = console.output_buffer.string
      regex = /(Case Number: )(?<third>[\d]*)/

      third = 0
      contents.gsub(regex){ |match|
        third = match.gsub(regex, '\k<third>')
      }

      #------

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /Select PROCEDURE MODIFIERS/i)
      console << "\n"

      console.wait_for(:output, /CATEGORY OF EXAM/i)
      console << "\n"

      console.wait_for(:output, /PRINCIPAL CLINIC/i)
      console << "gen\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "1\n"

      console.wait_for(:output, /TECHNOLOGIST COMMENT/i)
      console << "test\n"

      console.wait_for(:output, /DEVICE/i)
      console << "\n"

      console.wait_for(:output, /Do you STILL want your output QUEUED/i)
      console << "\n"

      console.wait_for(:output, /DEVICE/i)
      console << "^\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"

      console.wait_for(:output, /Select Barcode Printer/i)
      console << "^\n"


      console.wait_for(:output, /Select Patient/i)
      console << "\n"

      console.wait_for(:output, /Select Exam Entry/i)
      console << "status Tracking of Exams\n"


      console.wait_for(:output, /Select the Location/i)
      console << "\n"


      console.wait_for(:output, /Another one/i)
      console << "\n"


      console.wait_for(:output, /Enter Case/i)
      console << "\n"

      console.wait_for(:output, /Enter Case/i)
      console << "\n"

      console.wait_for(:output, /Enter Case/i)
      console << "\n"

      console.wait_for(:output, /Enter Case/i)
      console << "#{third}\n"


      console.wait_for(:output, /Do you wish to continue/i)
      console << "\n"

      console.wait_for(:output, /PROCEDURE/i)
      console << "\n"

      console.wait_for(:output, /CONTRAST MEDIA USED/i)
      console << "\n"

      console.wait_for(:output, /Select FILM SIZE/i)
      console << "\n"

      console.wait_for(:output, /FILM SIZE/i)
      console << "\n"


      console.wait_for(:output, /AMOUNT/i)
      console << "\n"

      console.wait_for(:output, /Select FILM SIZE/i)
      console << "\n"


      console.wait_for(:output, /PRIMARY CAMERA/i)
      console << "2312\n"


      console.wait_for(:output, /Select TECHNOLOGIST/i)
      console << "provider,o\n"


      console.wait_for(:output, /Select TECHNOLOGIST/i)
      console << "provider,o\n"


      console.wait_for(:output, /...OK/i)
      console << "\n"


      console.wait_for(:output, /TECHNOLOGIST/i)
      console << "\n"

      console.wait_for(:output, /Select TECHNOLOGIST/i)
      console << "\n"


      console.wait_for(:output, /TECHNOLOGIST COMMENT/i)
      console << "\n"

      console.wait_for(:output, /STATUS CHANGE DATE/i)
      console << "\n"

      console.wait_for(:output, /Enter Case/i)
      console << "CONTINUE\n"

      console.wait_for(:output, /Enter Case/i)
      console << "CONTINUE\n"

      console.wait_for(:output, /Enter Case/i)
      console << "NEXT\n"

      console.wait_for(:output, /Enter Case/i)
      console << "^\n"

      console.wait_for(:output, /Select Exam Entry/i)
      console << "\n"

      console.wait_for(:output, /Nuc Med Total System Menu/i)
      console << "Films Reporting Menu\n"

      console.wait_for(:output, /Select Films Reporting Menu/i)
      console << "Report Entry/Edit\n"

      console.wait_for(:output, /Select Imaging Type/i)
      console << "GENERAL RADIOLOGY\n"

      console.wait_for(:output, /Another one/i)
      console << "\n"

      console.wait_for(:output, /Enter your Current Signature Code/i)
      console << "radiologist1\n"

      console.wait_for(:output, /Do you want to batch print reports/i)
      console << "no\n"

      console.wait_for(:output, /Enter Case/i)
      console << "#{third}\n"

      console.wait_for(:output, /Select Report to Copy/i)
      console << "\n"

      console.wait_for(:output, /PRIMARY INTERPRETING RESIDENT/i)
      console << "provider,p\n"

      console.wait_for(:output, /PRIMARY INTERPRETING RESIDENT/i)
      console << "provider\n"

      console.wait_for(:output, /Select SECONDARY INTERPRET'G RESIDENT/i)
      console << "\n"

      console.wait_for(:output, /PRIMARY INTERPRETING STAFF/i)
      console << "\n"

      console.wait_for(:output, /INTERPRETING IMAGING LOCATION/i)
      console << "\n"

      console.wait_for(:output, /Report to Copy/i)
      console << "chest\n"


      console.wait_for(:output, /standard report/i)
      console << "Y\n"

      console.wait_for(:output, /Do you want to add another standard to this report/i)
      console << "\n"


      console.wait_for(:output, /REPORTED DATE/i)
      console << "t\n"


      console.wait_for(:output, /1>/i)
      console << "\n"


      console.wait_for(:output, /EDIT Option/i)
      console << "\n"


      console.wait_for(:output, /EDIT Option/i)
      console << "\n"

      console.wait_for(:output, /REPORT STATUS/i)
      console << "v\n"


      console.wait_for(:output, /PRIMARY DIAGNOSTIC CODE/i)
      console << "n\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "2\n"


      console.wait_for(:output, /Select SECONDARY DIAGNOSTIC CODE/i)
      console << "no\n"

      console.wait_for(:output, /CHOOSE/i)
      console << "NO ALERT REQUIRED\n"


      console.wait_for(:output, /Select SECONDARY DIAGNOSTIC CODE/i)
      console << "\n"


      console.wait_for(:output, /Do you wish to print this report/i)
      console << "\n"


      console.wait_for(:output, /Enter Case Number/i)

      return true
    rescue
      puts "Radiology regression test failed"
      return false
    end
  end
end
