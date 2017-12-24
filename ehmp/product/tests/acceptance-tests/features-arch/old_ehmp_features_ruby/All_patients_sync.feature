@All_sync @future
Feature: sync all patients that have been used for test


@sync_all_list
Scenario: Check sync request is stable
	Given the patient(s) with pid
      | pid                |
	  | DNS       V088473  |
	  | 10101V964144	   |
      | 10104V248233       |
      | 10105V001065       |
      | 10106V187557       |
      | 10107V395912       |
      | 10108V420871       |
      | 10110V004877       |
      | 10117V810068       |
      | 10118V572553       |
      | 10146V393772       |
      | 10180V273016       |
      | 10199V865898       |
      | 11016V630869       |
      | 5000000009V082878  |
      | 5000000116V912836  |
      | 5000000217V519385  |
      | 5123456789V027402  |
      | SITE;1             |
      | SITE;100022        |
      | SITE;100033        |
      | SITE;100084        |
      | SITE;100184        |
      | SITE;11            |
      | SITE;129           |
      | SITE;13            |
      | SITE;164           |
      | SITE;167           |
      | SITE;17            |
      | SITE;21            |
      | SITE;35            |
      | SITE;4             |
      | SITE;50            |
      | SITE;6             |
      | SITE;71            |
      | SITE;737           |
      | SITE;1             |
      | SITE;100022        |
      | 100031V310296      |
      | SITE;100184        |
      | SITE;129           |
      | SITE;164           |
      | SITE;167           |
      | SITE;17            |
      | SITE;21            |
      | SITE;6             |
      | SITE;737           |

      
	Given select patient(s) from above pid that have not been synced
	When the client requests sync for a patient with above pid every 20 second
	Then the patient(s) with above pid should sync within 10 minute

	  
