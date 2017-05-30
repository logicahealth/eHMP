require 'vistarpc4r'

# options
#------------------------------------
serve_ip = "IP        "
allergy_amount = 212 # up to 212
patient_id = "100841" # alpha test
#------------------------------------


broker = VistaRPC4r::RPCBrokerConnection.new(serve_ip, PORT, "DNS   ", "REDACTED", false)
broker.connect
broker.setContext('OR CPRS GUI CHART')


# get the SSN for the patient
patient_rpc = VistaRPC4r::VistaRPC.new("ORWPT ID INFO", VistaRPC4r::RPCResponse::SINGLE_VALUE)
patient_rpc.params = [
	patient_id
]

patient_resp = broker.execute(patient_rpc)
social = patient_resp.value.split("^")[0]


rpc = VistaRPC4r::VistaRPC.new("ISI IMPORT ALLERGY", VistaRPC4r::RPCResponse::ARRAY)

count = 0
File.open("./allergies.txt", "r") do |f|
  f.each_line do |line|
  	rpc.params = [[
  		["1","PAT_SSN^#{social}"],
		["2", "HISTORIC^1"],
		["3", "ALLERGEN^#{line.strip}"],
		["4", "SYMPTOM^ITCHING"],
		["5", "SYMPTOM^ITCHING,WATERING EYES"],
		["6", "ORIG_DATE^T-#{count}"],
		["7", "ORIGINTR^PROVIDER,ONE"]
	]]


	broker.execute(rpc)

	count = count + 1
	if count >= allergy_amount
		break
	end
  end
  f.close
end