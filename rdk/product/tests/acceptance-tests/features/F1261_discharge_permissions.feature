@F1261
Feature: Discharge Follow-Up Permissions

@US18755
Scenario: Add New Individual Discharge Follow-up Permissions to Permission Sets
  Given the client has requested the permission set list
  When a successful response is returned

  Then the following sets contain permissions to discontinue, edit and read discharge follow ups
      | permission set val        |
      | intern                    |
      | student                   |
      | resident                  |
      | standard-doctor           |
      | psychiatrist              |
      | psychologist              |
      | radiologist               |
      | anesthesiologist          |
      | surgeon                   |
      | physician-assistant       |
      | nurse-practitioner        |
      | registered-nurse          |
      | licensed-practicing-nurse |
      | nurse-manager             |
      | scheduler                 |
      | ward-clerk                |
      | medical-technician        |
      | pharmacist                |
      | lab-tech                  |
      | rad-tech                  |
      | dentist                   |
      | transcriptionist          |
      | service-chief             |
      | chief                     |
      | mso                       |
      | iso                       |
      | mis                       |

  And the following sets do not contain permissions to discontinue, edit and read discharge follow ups
      | permission set val   |
      | acc                  |
      | system-administrator |
      | clinical-analyst     |
      | cds-rules-author     |

  And the following sets contain only read discharge follow ups
      | permission set val   |
      | read-access          |
