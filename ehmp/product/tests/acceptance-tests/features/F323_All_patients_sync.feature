@All_sync @future
Feature: sync all patients that have been used for test
#This is just onetime test and it should not be run in CI pipeline  

@sync_all_list
Scenario: Check sync request is stable
	Given the patient(s) with pid
      | pid                | site_name 			|
	  | DNS       V088473  | SITE;SITE;VLER;HDR	|
	  | 10101V964144	   | SITE;SITE;VLER;HDR	|
      | 10104V248233       | SITE;SITE;VLER;HDR	|
      | 10105V001065       | SITE;SITE;VLER;HDR	|
      | 10106V187557       | SITE;SITE;VLER;HDR	|
      | 10107V395912       | SITE;SITE;VLER;HDR	|
      | 10108V420871       | SITE;SITE;DoD;VLER;HDR	|
      | 10110V004877       | SITE;SITE;DoD;VLER;HDR	|
      | 10117V810068       | SITE;SITE;VLER;HDR	|
      | 10118V572553       | SITE;SITE;VLER;HDR	|
      | 10146V393772       | SITE;SITE;VLER;HDR	|
      | 10180V273016       | SITE;SITE;VLER;HDR	|
      | 10199V865898       | SITE;SITE;VLER;HDR	|
      | 11016V630869       | SITE;SITE;DoD;VLER;HDR	|
      | 5000000009V082878  | SITE;SITE;VLER;HDR	|
      | 5000000116V912836  | SITE;SITE;DoD;VLER;HDR	|
      | 5000000217V519385  | SITE;SITE;DoD;VLER;HDR	|
      | 5000000341V359724  | SITE;SITE;DoD;VLER;HDR	|
      | 5123456789V027402  | SITE;SITE;VLER;HDR	|
      | 100031V310296      | SITE;VLER;HDR	|
      | SITE;1             | SITE |
      | SITE;100033        | SITE |
      | SITE;100084        | SITE |
      | SITE;100184        | SITE |
      | SITE;11            | SITE |
      | SITE;129           | SITE |
      | SITE;13            | SITE |
      | SITE;164           | SITE |
      | SITE;167           | SITE |
      | SITE;17            | SITE |
      | SITE;21            | SITE |
      | SITE;35            | SITE |
      | SITE;4             | SITE |
      | SITE;50            | SITE |
      | SITE;6             | SITE |
      | SITE;71            | SITE |
      | SITE;737           | SITE |
      | SITE;1             | SITE |
      | SITE;100184        | SITE |
      | SITE;129           | SITE |
      | SITE;164           | SITE |
      | SITE;167           | SITE |
      | SITE;17            | SITE |
      | SITE;21            | SITE |
      | SITE;6             | SITE |
      | SITE;737           | SITE |

      
	Given select patient(s) from above pid that have not been synced
	When the client requests sync for a patient with above pid every 2 second
	Then the patient(s) with above pid should sync

#it will take 35 min to synnc all patients
@sync_all_list1
Scenario: Check sync request is stable
	Given the patient(s) with pid
      | pid               | site_name 			   |
     #| 10104V248233      | SITE;SITE;VLER;HDR 	   |
     #| 10108V420871      | SITE;SITE;DoD;VLER;HDR |
      | 10101V964144      | SITE;SITE;VLER;HDR     |
      | 10102V813496      | SITE;SITE;VLER;HDR     |
      | 10105V001065      | SITE;SITE;VLER;HDR     |
      | 10107V395912      | SITE;SITE;VLER;HDR     |
      | 10110V004877      | SITE;SITE;DoD;VLER;HDR |
      | 10112V399621      | SITE;SITE;VLER;HDR     |
      | 10113V428140      | SITE;SITE;VLER;HDR     |
      | 10114V651499      | SITE;SITE;VLER;HDR     |
      | 10117V810068      | SITE;SITE;VLER;HDR     |
      | 10118V572553      | SITE;SITE;VLER;HDR     |
      | 10119V246915      | SITE;SITE;VLER;HDR     |
      | 10123V057919      | SITE;SITE;VLER;HDR     |
      | 10146V393772      | SITE;SITE;VLER;HDR     |
      | 10181V049578      | SITE;SITE;VLER;HDR     |
      | 10132V467385      | SITE;SITE;VLER;HDR     |
      | 10199V865898      | SITE;SITE;VLER;HDR     |
      | 11000V221996      | SITE;SITE;VLER;HDR     |
      | 11010V543403      | SITE;SITE;VLER;HDR     |
      | 11016V630869      | SITE;SITE;DoD;VLER;HDR |
      | 5000000318V495398 | SITE;SITE;VLER;HDR     |
      | 5000000009V082878 | SITE;SITE;VLER;HDR     |
      | 5000000116V912836 | SITE;SITE;DoD;VLER;HDR |
      | 5000000217V519385 | SITE;SITE;DoD;VLER;HDR |
      | 5000000317V387446 | SITE;SITE;VLER;HDR     |
      | 5000000341V359724 | SITE;SITE;DoD;VLER;HDR |
      | 5000000339V988748 | SITE;SITE;DoD;VLER;HDR |
      | 5000000327V828570 | SITE;SITE;VLER;HDR 	   |
      | 5000000232V962263 | SITE;SITE;VLER;HDR 	   |
      | SITE;1            | SITE                   |
      | SITE;9            | SITE                   |
      | SITE;20           | SITE                   |
      | SITE;100184       | SITE                   |
      | SITE;230          | SITE                   |
      | SITE;287          | SITE                   |
      | SITE;737          | SITE                   |
      | SITE;100599       | SITE                   |
      | SITE;164          | SITE                   |
      | SITE;167          | SITE                   |
      | SITE;71           | SITE                   |
      | SITE;631          | SITE                   |
      | SITE;1            | SITE                   |
      | SITE;9            | SITE                   |
      | SITE;164          | SITE                   |
      | SITE;287          | SITE                   |
      | SITE;631          | SITE                   |
      | SITE;737          | SITE                   |
      | SITE;100184       | SITE                   |
      | SITE;100599       | SITE                   |
      
	Given select patient(s) from above pid that have not been synced
	When the client requests sync for a patient with above pid every 2 second
	Then the patient(s) with above pid should sync
	
	
@sync_all_list2
Scenario: Check sync request is stable
	Given the patient(s) with pid
      | pid               | site_name 			   |
      | SITE;1            | SITE                   |
      | SITE;9            | SITE                   |
      | SITE;20           | SITE                   |
      | SITE;100184       | SITE                   |
      | SITE;230          | SITE                   |
      | SITE;287          | SITE                   |
      | SITE;737          | SITE                   |
      | SITE;100599       | SITE                   |
      | SITE;164          | SITE                   |
      | SITE;167          | SITE                   |
      | SITE;71           | SITE                   |
      | SITE;631          | SITE                   |
      | SITE;1            | SITE                   |
      | SITE;9            | SITE                   |
      | SITE;164          | SITE                   |
      | SITE;287          | SITE                   |
      | SITE;631          | SITE                   |
      | SITE;737          | SITE                   |
      | SITE;100184       | SITE                   |
      | SITE;100599       | SITE                   |
      
	Given select patient(s) from above pid that have not been synced
	When the client requests sync for a patient with above pid every 10 second
	Then the patient(s) with above pid should sync	
	
	
	
@sync_all_list3
Scenario: Check sync request is stable
	Given the patient(s) with pid
      | pid               | site_name 			   |
     #| 10104V248233      | SITE;SITE;VLER;HDR 	   |
     #| 10108V420871      | SITE;SITE;DoD;VLER;HDR |
      | 10101V964144      | SITE;SITE;VLER;HDR     |
      | 10102V813496      | SITE;SITE;VLER;HDR     |
      | 10105V001065      | SITE;SITE;VLER;HDR     |
      | 10107V395912      | SITE;SITE;VLER;HDR     |
      | 10110V004877      | SITE;SITE;DoD;VLER;HDR |
      | 10112V399621      | SITE;SITE;VLER;HDR     |
      | 10113V428140      | SITE;SITE;VLER;HDR     |
      | 10114V651499      | SITE;SITE;VLER;HDR     |
      | 10117V810068      | SITE;SITE;VLER;HDR     |
      | 10118V572553      | SITE;SITE;VLER;HDR     |
      | 10119V246915      | SITE;SITE;VLER;HDR     |
      | 10123V057919      | SITE;SITE;VLER;HDR     |
      | 10146V393772      | SITE;SITE;VLER;HDR     |
      | 10181V049578      | SITE;SITE;VLER;HDR     |
      | 10132V467385      | SITE;SITE;VLER;HDR     |
      | 10199V865898      | SITE;SITE;VLER;HDR     |
      | 11000V221996      | SITE;SITE;VLER;HDR     |
      | 11010V543403      | SITE;SITE;VLER;HDR     |
      | 11016V630869      | SITE;SITE;DoD;VLER;HDR |
      | 5000000318V495398 | SITE;SITE;VLER;HDR     |
      | 5000000009V082878 | SITE;SITE;VLER;HDR     |
      | 5000000116V912836 | SITE;SITE;DoD;VLER;HDR |
      | 5000000217V519385 | SITE;SITE;DoD;VLER;HDR |
      | 5000000317V387446 | SITE;SITE;VLER;HDR     |
      | 5000000341V359724 | SITE;SITE;DoD;VLER;HDR |
      | 5000000339V988748 | SITE;SITE;DoD;VLER;HDR |
      | 5000000327V828570 | SITE;SITE;VLER;HDR 	   |
      | 5000000232V962263 | SITE;SITE;VLER;HDR 	   |
      
	Given select patient(s) from above pid that have not been synced
	When the client requests sync for a patient with above pid every 10 second
	Then the patient(s) with above pid should sync  
