 # Team Europa
 @F361 @DE3161

 Feature: F361 - CDS FHIR Domain (PatientDemographics)
 @F361_patient @US5108 @DE3161
 Scenario: Client can request demographics in FHIR format
     Given a patient with "demographics" in multiple VistAs
     When the client requests demographics for that patient "9E7A;229"
     Then a successful response is returned
     And the results contain
     	  | field 					          	            | value                    				                    |
      	| resourceType                          | Patient                                                   |
      	| text.status                           | generated                                                 |
       	| text.div                              | <div>FOUR,PATIENT. SSN: 666000004</div>         |
       	| gender                                | male              										|
       	| extension.url                         | http://vistacore.us/fhir/profiles/@main#service-connected |
       	| extension.valueCoding.code            | Y                                                         |
       	| extension.valueCoding.display         | Service Connected                                         |
       	| identifier.use                        | official                                                  |
       	| identifier.system                     | http://hl7.org/fhir/sid/us-ssn                            |
       	| identifier.value                      | 666000004											    |
       	| identifier.system                     | http://vistacore.us/fhir/id/uid                |
       	| identifier.system                     | http://vistacore.us/fhir/id/dfn                |
       	| identifier.system					            | http://vistacore.us/fhir/id/pid                |
       	| identifier.system                     | http://vistacore.us/fhir/id/icn                |
       	| birthDate								              | 1935-04-07												|
       	| name.text                             | FOUR,PATIENT                     |
