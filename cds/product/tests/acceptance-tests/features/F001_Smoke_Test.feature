@F001_Smoke_Test
Feature:Simple smoke test of the CDSInvocation VM

Scenario: CDSInvocation Smoke Test
  Given that we have a browser available
  When I go to the cdsinvocation base url plus ""
  Then what I get back contains "Apache Server"
