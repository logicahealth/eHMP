@F353
Feature: F353 Stacked Graph

@US5399
Scenario Outline: Client can query for stacked graph information through the rdk
	Given a patient with pid "9E7A;3" has been synced through the RDK API
    When the client requests labs by type for the patient "9E7A;3"
    | paramter_name | value       |
    | type          | <type_name> |
    | date.end      | 20150918    |
   Then a successful response is returned
Examples: 
  | type_name      |
  | HEMOGLOBIN+A1C |
  | GLUCOSE        |
  | CREATININE     |
  | HDL            |
  | LDL+CHOLESTEROL|
  | O2HB% ++(SAT)  |

@US5399 @US5399_VITALS
Scenario Outline: Client can query for stacked graph VITAL information through the rdk
	Given a patient with pid "9E7A;3" has been synced through the RDK API
    When the client requests vitals type for the patient "9E7A;3"
    | value |
    | "<type_name>"" |
   Then a successful response is returned
Examples: 
  | type_name      |
  | PULSE          |
  | PULSE+OXIMETRY |
  | BLOOD+PRESSURE |
  | RESPIRATION    |
  