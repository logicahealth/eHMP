@data_verification_orders @F144
Feature: F144 - eHMP Viewer GUI - Orders



# This test replaces the Orders Display for GDF All test in ehmp-ui
@F144_Orders_GDF_all @US2926
Scenario: Verify Orders will display all orders for a given patient
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests the ORDERS for the patient "9E7A;100022" with GDF set to all
Then a successful response is returned
And the VPR results contain
      | field           	| value                 |
      | entered				| 19970930092508	    |
      | statusName      	| COMPLETE          	|
      | name				| 					    |
      | summary         	| CONTAINS IRON BLOOD   SERUM LB #912   SP |
      | kind				| Laboratory			   |
      | providerDisplayName | Provider,One			|
      | facilityName    	| New Jersey HCS	    |
      | start				| 199709300925			|
      | stop				| 199710221456			|
And the VPR results contain
      | field           	| value                 |
      | entered				| 20060616122700	        |
      | statusName      	| DISCONTINUED/EDIT     |
      | name				| CONTAINS INSULIN NOVOLIN N(NPH) INJ |
      | summary         	| CONTAINS INSULIN NOVOLIN N(NPH) INJ |
      | kind				| Medication, Inpatient	|
      | providerDisplayName | Physician,Assistant	|
      | facilityName    	| CAMP MASTER	        |
      | start				| 20060616122700			|
      | stop				| 20060616123000			|
      
@F144_Orders_Custom_Date_Range @US2926
Scenario: Verify Orders will display all orders that fall withing a given range of GDF for a given patient
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests the ORDERS for the patient "9E7A;100022" with GDF set to custom date range between "20140101" and "20140131235959"
Then a successful response is returned
And the VPR results contain
      | field           	| value                 |
      | entered				| 20140115163800	        |
      | localId				| 33606					|
      | statusName      	| EXPIRED               |
      | name				| CONTAINS METHYLPREDNISOLONE NA SUCC INJ,SOLN 	|
      | summary         	| CONTAINS METHYLPREDNISOLONE NA SUCC INJ,SOLN 	|
      | kind				| Medication, Inpatient	|
      | providerDisplayName | Provider,Thirty		|
      | facilityName    	| CAMP MASTER	        |
      | start				| 20140115210000			|
      | stop				| 20140214210000			|
And the VPR results contain
      | field           	| value                 |
      | entered				| 20140115163600	        |
      | localId				| 33605					|
      | statusName      	| EXPIRED               |
      | name				| CONTAINS DEXT 5 NACL 0.45% W |
      | summary         	| CONTAINS DEXT 5 NACL 0.45% W |
      | kind				| Medication, Inpatient	|
      | providerDisplayName | Provider,Thirty		|
      | facilityName    	| CAMP MASTER	        |
      | start				| 20140115150000			|
      | stop				| 20140215000000			|
