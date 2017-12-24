require 'vistarpc4r'

# options
#------------------------------------
serve_ip = "IP        "
vital_amount = 5000000 # up to 212
patient_id = "100841" # alpha test
#------------------------------------


broker = VistaRPC4r::RPCBrokerConnection.new(serve_ip, PORT, "USER  ", "USER  !!", false)
broker.connect
broker.setContext('OR CPRS GUI CHART')


# get the SSN for the patient
patient_rpc = VistaRPC4r::VistaRPC.new("ORWPT ID INFO", VistaRPC4r::RPCResponse::SINGLE_VALUE)
patient_rpc.params = [
	patient_id
]

patient_resp = broker.execute(patient_rpc)
social = patient_resp.value.split("^")[0]


rpc = VistaRPC4r::VistaRPC.new("ISI IMPORT VITALS", VistaRPC4r::RPCResponse::ARRAY)


load_time = Time.now

count = 0

vital_amount.times do |f|
	time =  load_time - (60 * count)

	formated_time = time.strftime "3%y%m%d.%H%M"

  	prng = Random.new
  	number = prng.rand(98..104)

  	rpc.params = [[
  		["1","PAT_SSN^#{social}"],
		["2", "VITAL_TYPE^TEMPERATURE"],
		["3", "RATE^#{number}"],
		["4", "LOCATION^GENERAL MEDICINE"],
		["5", "DT_TAKEN^#{formated_time}"],
		["6", "ENTERED_BY^PROVIDER,ONE"]
	]]
	resp = broker.execute(rpc)

	puts "#{formated_time} #{resp.value} #{count}"

	count = count + 1
end