require 'vistarpc4r'

# options
#------------------------------------
serve_ip = "IP_ADDRESS"
problem_amount = 1743 # up to 1743
patient_id = "100841" # alpha test
#------------------------------------

broker = VistaRPC4r::RPCBrokerConnection.new(serve_ip, 9210, "lu1234", "lu1234!!", false)
broker.connect
broker.setContext('OR CPRS GUI CHART')

# create a problem


	vrpc = VistaRPC4r::VistaRPC.new("ORQQPL INIT PT", VistaRPC4r::RPCResponse::ARRAY)
	vrpc.params[0]=patient_id
	resp = broker.execute(vrpc)


	ptVAMC=resp.value[0]  #             := copy(Alist[i],1,999);
	ptDead=resp.value[1]  #             := AList[i];
	ptBID=resp.value[6]   #             := Alist[i];
	ptname=""
	gmpdfn = patient_id + "^" + ptname + "^" + ptBID + "^" + ptDead

count = 0
File.open("./problems_list.txt", "r") do |f|
  	f.each_line do |line|

		split = line.strip.split("^")
		code = split[0]
		description = split[1]



		vrpc = VistaRPC4r::VistaRPC.new("ORQQPL ADD SAVE", VistaRPC4r::RPCResponse::ARRAY)
		vrpc.params[0] = gmpdfn
		vrpc.params[1] = "1"
		vrpc.params[2] = ptVAMC
		vrpc.params[3] = [
		                  ["1", "GMPFLD(.01)=\"\""],  # Diagnosis
		                  ["2", "GMPFLD(.05)=\"^#{description}\""], # Narrative
		                  ["3", "GMPFLD(.12)=\"A\""], # activie or inactive
		                  ["4", "GMPFLD(.13)=\"3150801^AUG 10 2014\""], # Date of onset
		                  ["5", "GMPFLD(1.01)=\"\"\"\"\"\""], # Problem??
		                  ["6", "GMPFLD(1.08)=\"16\""], # location code
		                  ["7", "GMPFLD(1.1)=\"0^NO\""], # Problem
		                  ["8", "GMPFLD(1.14)=\"C\""], #accute or cronic
		                  ["9", "GMPFLD(10,0)=\"\"\"\"\"\""], # Note
		                  ["10", "GMPFLD(80001)=\"#{code}\""] # snowmed
		                 ]

		resp = broker.execute(vrpc)
		count = count + 1
		if count >= problem_amount
			break
		end
  	end
  	f.close
end

broker.close

