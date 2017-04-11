@data_verification_orders @F144
Feature: F144 - eHMP Viewer GUI - Orders

# This test replaces the Orders Display for GDF All test in ehmp-ui
@F144_Orders_GDF_all @US2926
Scenario: Verify Documents will display all Consult, Imaging, Surgery, Advance Directive and Procedure for a given patient
Given a patient with pid "9E7A;420" has been synced through the RDK API
When the client requests the ORDERS for the patient "9E7A;420" with GDF set to all
Then a successful response is returned
And the VPR results contain
      | field           	| value                 |
      | entered				| 200404012347	        |
      | statusName      	| DISCONTINUED          |
      | name				| HEMATOLOGY CONSULT    |
      | summary         	| CONTAINS 01HEMATOLOGY CONSULT Cons Consultant's Choice |
      | kind				| Consult			    |
      | providerDisplayName | Pathology,One			|
      | facilityName    	| CAMP MASTER	        |
      | start				| 200404012348			|
      | stop				| 200712311257			|
And the VPR results contain
      | field           	| value                 |
      | entered				| 200403250839	        |
      | statusName      	| DISCONTINUED          |
      | name				| REGULAR    			|
      | summary         	| CONTAINS REGULAR Diet |
      | kind				| Dietetics Order	    |
      | providerDisplayName | Labtech,Fortyeight	|
      | facilityName    	| ABILENE (CAA)	        |
      | start				| 20040325				|
      | stop				| 200403251918			|
      
@F144_Orders_Custom_Date_Range @US2926
Scenario: Verify Documents will display all Consult, Imaging, Surgery, Advance Directive and Procedure for a given patient
Given a patient with pid "9E7A;420" has been synced through the RDK API
When the client requests the ORDERS for the patient "9E7A;420" with GDF set to custom date range between "20100128" and "20100228235959"
Then a successful response is returned
And the VPR results contain
      | field           	| value                 |
      | entered				| 201002270903	        |
      | localId				| 27871					|
      | statusName      	| EXPIRED               |
      | name				| CONTAINS METFORMIN TAB,SA |
      | summary         	| CONTAINS METFORMIN TAB,SA  500MG |
      | kind				| Medication, Outpatient|
      | providerDisplayName | Provider,One			|
      | facilityName    	| CAMP MASTER	        |
      | start				| 20100227				|
      | stop				| 20100528				|
And the VPR results contain
      | field           	| value                 |
      | entered				| 201002270903	        |
      | localId				| 27971					|
      | statusName      	| EXPIRED               |
      | name				| CONTAINS METOPROLOL TARTRATE TAB|
      | summary         	| CONTAINS METOPROLOL TARTRATE TAB  50MG |
      | kind				| Medication, Outpatient|
      | providerDisplayName | Provider,One			|
      | facilityName    	| CAMP BEE		        |
      | start				| 20100227				|
      | stop				| 20110228				|
      
      
