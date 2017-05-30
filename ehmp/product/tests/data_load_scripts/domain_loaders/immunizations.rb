require 'vistarpc4r'


# options
#------------------------------------
serve_ip = "IP        "
imuz_amount = 207 # up to 62
patient_id = "100841" # alpha test
#------------------------------------


@broker = VistaRPC4r::RPCBrokerConnection.new(serve_ip, 9210, "pr12345", "pr12345!!", false)
@broker.connect
@broker.setContext('OR CPRS GUI CHART')


it_count = 0

while it_count < imuz_amount

	load_time = Time.now

	time =  load_time - (60 * it_count)

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


	# # save some text to the note


	vrpc = VistaRPC4r::VistaRPC.new("TIU SET DOCUMENT TEXT", VistaRPC4r::RPCResponse::SINGLE_VALUE)
	vrpc.params = [
		"#{note_id}",
		[
			["\"TEXT\",1,0","immunization note"],
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
		# ["7","PED+^612055^^HTN EXERCISE^@^^^^^1"], # ed
		# ["8","COM^1^@"],
		# ["9","HF+^2^^CURRENT SMOKER^H^^^^^1^"], # health factor
		# ["10","COM^2^@"],
		# ["11","HF+^5^^CURRENT SMOKER^H^^^^^1^"], # health factor
		# ["12","COM^3^@"],
		# ["13","IMM+^1020^^DTAP^@^^@^0^^1"],
		# ["14","COM^4^@"]
	]

	count = 0
	index = 6

	File.open("./immunizations.txt", "r") do |f|
		f.each_line do |line|
			if (count + it_count) >= imuz_amount
				break
			end

			components = line.strip.split('^')
			id = components[0]
			name = components[1]
			count = count + 1
			index = index + 1
			imuz = ["#{index}","IMM+^#{id}^^#{name}^@^^@^0^^1"],
			index = index + 1
			com = ["#{index}","COM^#{count}^@"]

			input_array.push(imuz.flatten)
			input_array.push(com.flatten)
		end
	end

	vrpc.params = [
		input_array,
		"#{note_id}",
		"32"
	]

	resp = @broker.execute(vrpc)

	# puts resp

	# # sign me!!!

	vrpc = VistaRPC4r::VistaRPC.new("TIU SIGN RECORD", VistaRPC4r::RPCResponse::SINGLE_VALUE)
	vrpc.params = [
		"#{note_id}",
		"%KpV7x&*p0"
	]

	resp = @broker.execute(vrpc)

	it_count = it_count + count
end

@broker.close