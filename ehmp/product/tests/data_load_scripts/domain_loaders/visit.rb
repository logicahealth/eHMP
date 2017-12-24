require 'vistarpc4r'


# options
#------------------------------------
serve_ip = "IP        "
visit_amount = 207 # up to 62
patient_id = "100841" # alpha test
#------------------------------------


@broker = VistaRPC4r::RPCBrokerConnection.new(serve_ip, PORT, "USER   ", "PW       ", false)
@broker.connect
@broker.setContext('OR CPRS GUI CHART')

count = 0

while count < visit_amount

	load_time = Time.now

	time =  load_time - (60 * 15 * count)

	formated_time = time.strftime "3%y%m%d.%H%M"

	vrpc = VistaRPC4r::VistaRPC.new("TIU CREATE RECORD", VistaRPC4r::RPCResponse::SINGLE_VALUE)
	vrpc.params = [
		patient_id, #patient id
		"16", # note type
		"",
		"",
		"",
		[
			["1202","991"], #provider id
			["1301","#{formated_time}"], # time
			["1205","195"], #location
			["1701",""]
		],
		"195;#{formated_time};A", # time and location
		"1"
	]

	resp = @broker.execute(vrpc)
	note_id = resp.value

	vrpc = VistaRPC4r::VistaRPC.new("TIU SET DOCUMENT TEXT", VistaRPC4r::RPCResponse::SINGLE_VALUE)
	vrpc.params = [
		"#{note_id}",
		[
			["\"TEXT\",1,0","visit note"],
			["\"HDR\"","1^1"]
		],
		"0"
	]

	resp = @broker.execute(vrpc)

	vrpc = VistaRPC4r::VistaRPC.new("ORWPCE SAVE", VistaRPC4r::RPCResponse::SINGLE_VALUE)

	input_array =[
		["1","HDR^0^^32;#{formated_time};A"], # time = 3150416.15135
		["2","VST^DT^#{formated_time}"], # visit time
		["3","VST^PT^100841"], # patient icn
		["4","VST^HL^32"], # location, primary care
		["5","VST^VC^A"], # ????
		["6","PRV^991^^^PROVIDER,EIGHT^1"], # provider
	]
	vrpc.params = [
		input_array,
		"#{note_id}",
		"32"
	]

	resp = @broker.execute(vrpc)

	vrpc = VistaRPC4r::VistaRPC.new("TIU SIGN RECORD", VistaRPC4r::RPCResponse::SINGLE_VALUE)
	vrpc.params = [
		"#{note_id}",
		"%KpV7x&*p0"
	]

	resp = @broker.execute(vrpc)

	count = count + 1
end

@broker.close