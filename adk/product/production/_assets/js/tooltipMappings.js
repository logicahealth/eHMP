define([], function() {
	var mappings = {
        patient_information_deatils_discrepancies: 'Conflicting data at other site(s)',

		encounters_hxoccurance: 'Historical number of occurrences',
		encounters_last: 'Time since most recent encounter',

		vitals_last: 'Time since vital was last collected',
		vitals_dateobserved: 'Date and time vital was collected',
		vitals_dateentered: 'Date and time vital was recorded',

		immunizations_reaction: 'Reported post vaccine administration',
		immuninizations_series: 'Number in series of vaccine to be administered',
		immuninizations_repeatcontraindicated: '"Yes" if series/repeat administration is to be discontinued. "No" if it can be continued',

		labresults_last: 'Time since last completed',
		labresults_flag: 'Flagged if the reported result is outside of the Reference Range',
		labresults_refrange: 'The reference range for measurement in healthy persons',

		visits_location: 'Location within hospital or clinic where appointment/visit occurred',
		visits_reason: 'Cause or explanation for patient\'s appointment/visit',

		chs_date: 'Date associated with Health Summary',
		chs_authoringinstitution: 'Institution which collected data within the Health Summary, or Company which stores and distributes the patient\'s health data',
		chs_description: 'Type of Health Summary, i.e. Continuity of Care document, Summary of Episode note',

		orders_orderdate: 'Date the order is placed',
		orders_status: 'Identifies the specific status of the order out of the multiple options',
		orders_order: 'Description of order',
		orders_facility: 'Abbreviated name of VA facility at which order is entered, or notation of order entered at DoD',
		orders_providername: 'Name of provider',
		orders_startdate: 'Date the order is to be started',
		orders_stopdate: 'Date the order is to be stopped',
		orders_type: 'Overarching category of order, i.e. Dietetics, Laboratory, Medication',
		orders_flag: 'Identifies that this order has been flagged by a user',

		timeline_datetime: 'Date range of information represented in the timeline',
		timeline_activity: 'Test, order, other action',
		timeline_type: 'Category of information entered',
		timeline_enteredby: 'Person that entered information',
		timeline_facility: 'Abbreviated name of VA facility, or notation of DoD',

		postings: 'Lettered boxes highlighted in yellow are active, whereas lettered boxes that are grayed out are inactive',
		timeline_dateinterval: 'Global date timeline: Set a date range to allow for easier investigation of records',
		timeline_graph: 'Global timeline graph: Shows patient\'s historical events and future appointments, represented as blue bars for outpatient data and green bars for inpatient data; the red line indicates the current date',

		toolbar_infobutton: 'More Information',
		toolbar_detailview: 'Details',
		toolbar_deletestackedgraph: 'Delete Stacked Graph',
		toolbar_tilesortbutton: 'Tile sort',
		toolbar_submenu: 'Submenu',
		toolbar_associatedworkspace: 'Associated Workspace',
		toolbar_quicklook: 'Quicklook',
		toolbar_addorders: 'Add orders',
		toolbar_addimmunizations: 'Add immunization',
		toolbar_addnewitem: 'Add New Item',
		toolbar_edititem: 'Edit Form',
		toolbar_crs: 'Highlight Related Items',
		toolbar_crs_icon: 'May Contain Related Items',
        toolbar_note_object: 'Create Note Object',

        //For 508, these should be reworded to not include visual descriptions such as "White checked cirle"
		patientSync_mySite: 'White checked circle indicates that MySite (the site you are operating from) health data is displayed',
		patientSync_allVA: 'White checked circle indicates that All VA (VA data nationally available) health data is displayed',
		patientSync_DoD: 'White checked circle indicates that DoD (data shared by the Department of Defense) health data is displayed',
		patientSync_community: 'White checked circle indicates that Community (data shared by private vendors) health data is displayed',

		sign_outpatientMeds_relatedTo_SC: 'Service Connected Condition (SC): Veterans are eligible for medical care for treatment of service-connected conditions without incurring copayment charges or payments against their insurance.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_CV: 'Combat Veteran (CV): To receive CV exemption the veteran must have served in combat operations after the Gulf War or in combat against a hostile force after November 11, 1998. In addition, the condition for which the veteran is treated must be related to that combat, the veteran must have registered as a combat veteran, and be within two years of separation from active military service. Finally, the condition must not be already considered to be service related or that exemption should apply.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_AO: 'Agent Orange (AO): herbicide used in Vietnam. Veterans who were present within the borders of the republic of Vietnam from January 1962 through May 1975 are presumed to have been exposed to Agent Orange and are eligible to receive care of conditions possibly for AO exposure without incurring copayment charges or claims against their insurance. Some conditions associated with AO exposure: diabetes (type 2), chloracne, porphyria cutanea tarda, peripheral neuropathy and some cancers.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_MST: 'Military Sexual Trauma (MST): Veterans who experienced sexual trauma while serving on active duty in the military are eligible to receive treatment and counseling services for the sexual trauma without incurring copayment charges or claims against their insurance.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_HNC: 'Head and Neck Cancer (HNC): Veterans with cancer of the head or neck and a history of receipt of Nasopharyngeal (NP) radium therapy while in the military are eligible to receive treatment for the head or neck cancer without incurring copayment charges or claims against their insurance.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_IR: 'Ionizing Radiation (IR): Veterans exposed to ionizing radiation (IR) as a POW or while on active duty at Hiroshima and/or Nagasaki, Japan, or who served at a nuclear device atmospheric testing site are eligible to receive care of any malignant condition and certain other non-malignant conditions for IR exposure without incurring copayment charges or claims against their insurance.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_SHD: 'Shipboard Hazard anbd Defense (SHD): Veterans with conditions recognized by VA as associated with Project 112/SHAD, shipboard and land-based biological and chemical testing conducted by the United States (U.S.) military between 1962 and 1973 are eligible for enrollment in priority group 6, unless eligible for enrollment in a higher priority. In addition, veterans receive care at no charge for care and medications provided for treatment of conditions related to exposure.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo_SWAC: 'Southwest Asia Conditions (SWAC): Veterans who served in Southwest Asia during the Gulf War are eligible to receive treatment for conditions relating to this service, including exposure to depleted uranium, pesticides, anti-nerve gas pill, pyridostigmine bromide, infectious diseases, chemical and biological warfare agents, etc. without incurring copayment charges or claims against their insurance.\n\nClick here to toggle all enabled options in this column to Yes or No.',
		sign_outpatientMeds_relatedTo: 'SC - Service Connected Condition; CV - Combat Veteran; AO - Agent Orange Exposure; IR - Ionizing Radiation Exposure; SWAC - Southwest Asia Conditions; SHD - Shipboard Hazard and Defense; MST - Military Sexual Trauma; HNC - Head and/or Neck Cancer;',
	};


	return mappings;
});