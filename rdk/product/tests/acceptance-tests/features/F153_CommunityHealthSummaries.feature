@data_verification @F153
Feature:F153-HIE C32 - Community Health Summaries



@US2113 @US4283
Scenario: Verify Community Health Summary Applet data call
  # 10108V420871 = Eight,Patient
  Given a patient with pid "SITE;3" has been synced through the RDK API
  #When the client requests allergies for the patient "5000000341V359724" in VPR format
  When the client requests COMMUNITY HEALTH SUMMARIES for the patient "SITE;3" with parameters
   | label  | value |
   | callType | vler_list |
 Then a successful response is returned
 # Then the client receives 11 result(s)
 And the VPR results contain
  | field       | value  |
  |authorList.institution | Kaiser Permanente Southern California - RESC |
  | creationTime | 20140617014108 |
