require 'greenletters'

# options
#------------------------------------
serve_ip = "IP        "
path_amount = 10
# patient_id = 100841 #alpha test
patient_name = "alphatest"
#------------------------------------

console = Greenletters::Process.new("ssh vagrant@#{serve_ip}",:transcript => $stdout, :timeout => 20)

console.on(:output, /CHOOSE/i) do |process, match_data|
  console << "1\n"
end

console.start!

console.wait_for(:output, /password:/i)
console << "vagrant\n"

console.wait_for(:output, /$/i)
console << "sudo csession cache -U VISTA\n"

console.wait_for(:output, /VISTA>/i)
console << "s DUZ=20365\n"

console.wait_for(:output, /VISTA>/i)
console << "d ^XUP\n"

console.wait_for(:output, /OPTION NAME:/i)
console << "LRAP\n"


path_amount.times do
	console.wait_for(:output, /Select Anatomic pathology/i)
	console << "L\n"

	console.wait_for(:output, /Select Log-in menu, anat path/i)
	console << "LI\n"

	console.wait_for(:output, /Select ANATOMIC PATHOLOGY SECTION/i)
	console << "SP\n"

	console.wait_for(:output, /Log-In for/i)
	console << "\n"

	console.wait_for(:output, /Select Patient Name/i)
	console << "#{patient_name}\n"

	console.wait_for(:output, /PATIENT LOCATION/i)
	console << "LAB\n"

	console.wait_for(:output, /Assign SURGICAL PATHOLOGY \(SP\) accession #: /i)


	contents = console.output_buffer.string
	regex = /(Assign SURGICAL PATHOLOGY \(SP\) accession #: )(?<accession>\d*)\?/

	accession = ""
	contents.gsub(regex){ |match|
	  accession = match.gsub(regex, '\k<accession>')
	}

	console << "\n"

	# read accession number

	# Assign SURGICAL PATHOLOGY (SP) accession #: 1? YES// 





	console.wait_for(:output, /time Specimen taken/i)
	console << "\n"

	console.wait_for(:output, /PHYSICIAN/i)
	console << "provider,eight\n"

	console.wait_for(:output, /SPECIMEN SUBMITTED BY/i)
	console << "NURSE-\n"

	console.wait_for(:output, /Select SPECIMEN/i)
	console << "Liver\n"

	console.wait_for(:output, /SPECIMEN TOPOGRAPHY/i)
	console << "liv\n"


	console.wait_for(:output, /COLLECTION SAMPLE/i)
	console << "BIOPSY\n"

	console.wait_for(:output, /Select SPECIMEN/i)
	console << "\n"

	console.wait_for(:output, /TIME SPECIMEN RECEIVED/i)
	console << "\n"

	console.wait_for(:output, /PATHOLOGIST/i)
	console << "prov\n"

	console.wait_for(:output, /Select COMMENT/i)
	console << "Testing\n"

	console.wait_for(:output, /Select COMMENT/i)
	console << "\n"

	console.wait_for(:output, /Select LABORATORY TEST/i)
	console << "su\n"


	console.wait_for(:output, /Select Patient Name/i)
	console << "\n"


	console.wait_for(:output, /Select Log-in menu/i)
	console << "\n"

	console.wait_for(:output, /Select Anatomic pathology/i)
	console << "D\n"

	console.wait_for(:output, /Select Data entry/i)
	console << "GI\n"


	console.wait_for(:output, /Select ANATOMIC PATHOLOGY SECTION/i)
	console << "Sur\n"


	console.wait_for(:output, /Data entry for/i)
	console << "\n"


	console.wait_for(:output, /Select one/i)
	console << "\n"

	console.wait_for(:output, /Enter Accession Number/i)
	console << "#{accession}\n"


	console.wait_for(:output, /GROSS DESCRIPTION/i)
	console << "Received fresh, subsequently fixed in formalin labeled\n"
	console << "\"liver biopsy\" are multiple red-brown irregular to cylindrical tissue fragments which have an aggregate measurement of 1.2 x 0.4 x     cm.  pecimens are entirely submitted in one\n"
	console << "\n"

	console.wait_for(:output, /EDIT Option:/i)
	console << "\n"

	console.wait_for(:output, /MICROSCOPIC DESCRIPTION/i)
	console << "A&B:\n"
	console << "Histologic type: Invasive adenocarcinoma, not otherwise specified. Histologic grade: Moderately differentiated.\n"
	console << "Primary tumor (pT): Tumor invades through muscularis propria in two pericolonic fat (pT3).\n"
	console << "Proximal margin: Negative for tumor.\n"
	console << "Distal margin: Negative for tumor.\n"
	console << "Circumferential (radial) margin: Negative for tumor.\n"
	console << "Distance of tumor from closest margin: 5.7 cm from both proximal and distal margin.\n"
	console << "Vascular invasion: Not identified.\n"
	console << "Regional lymph nodes (pN): 21 lymph nodes are all negative for metastatic tumor (pN0).\n"
	console << "Non-lymph node pericolonic tumor: Not identified.\n"
	console << "Distant metastasis (pM): Metastatic carcinoma is identified in the liver core biopsy in specimen B (pM1).\n"
	console << "Other findings: The attached omentum is negative for tumor. The background colonic mucosa was unremarkable.\n"
	console << "\n"

	console.wait_for(:output, /EDIT Option:/i)
	console << "\n"

	console.wait_for(:output, /PATHOLOGIST:/i)
	console << "\n"

	console.wait_for(:output, /DATE REPORT COMPLETED/i)
	console << "t\n"

	console.wait_for(:output, /Select ICD DIAGNOSIS/i)
	console << "liver\n"

	console.wait_for(:output, /Select 1-8/i)
	console << "4\n"


	console.wait_for(:output, /Select 1-4/i)
	console << "3\n"


	console.wait_for(:output, /Select ICD DIAGNOSIS/i)
	console << "\n"


	console.wait_for(:output, /Designate performing laboratory for/i)
	console << "\n"


	console.wait_for(:output, /Select Performing Laboratory/i)
	console << "\n"


	console.wait_for(:output, /Sure you want to add this record/i)
	console << "YES\n"

	console.wait_for(:output, /Designate performing laboratory for/i)
	console << "\n"


	console.wait_for(:output, /Enter CPT coding/i)
	console << "\n"


	console.wait_for(:output, /Select one/i)
	console << "\n"

	console.wait_for(:output, /Enter Accession Number/i)
	console << "\n"


	console.wait_for(:output, /Select Data entry/i)
	console << "\n"

	console.wait_for(:output, /Select Anatomic pathology/i)
	console << "v\n"


	console.wait_for(:output, /release menu/i)
	console << "rr\n"


	console.wait_for(:output, /Select ANATOMIC PATHOLOGY SECTION/i)
	console << "\n"


	console.wait_for(:output, /release menu/i)
	console << "\n"
end


