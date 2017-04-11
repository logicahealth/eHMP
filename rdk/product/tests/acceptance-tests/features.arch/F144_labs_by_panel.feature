@F144_labs_by_panel @vxsync @enrich
Feature: F144 - eHMP Viewer GUI

#As a user viewing labs inside of a panel the labs will be sorted in a given order as specified by the displayorder

#Andromeda

  @F144_labsByPanel_pid @US2833 @debug
  Scenario: When a user views, the sort order, to the order of the labs within panels, is on displayOrder
  When the client requests a response in VPR format from RDK API with the labsbypanel parameters
    | pid              | _ack     | observedFrom | observedTo | start | limit |
    | 9E7A;1           | true     |              |            |       |       |
    Then a successful response is returned
    And the VPR results contain
      | field                 | value                |
      | CH 0917 3.groupName   | CH 0917 3            |
      | CH 0917 3.displayName | GLUCOSE              |
      | CH 0917 3.displayOrder| 1                    |
      | CH 0917 3.groupName   | CH 0917 3            |
      | CH 0917 3.displayName | BUN                  |
      | CH 0917 3.displayOrder| 1.1                  |
      | CH 0917 3.groupName   | CH 0917 3            |
      | CH 0917 3.displayName | NA                   |
      | CH 0917 3.displayOrder| 1.2                  |
      | CH 0917 3.groupName   | CH 0917 3            |
      | CH 0917 3.displayName | K                    |
      | CH 0917 3.displayOrder| 1.20000001           |