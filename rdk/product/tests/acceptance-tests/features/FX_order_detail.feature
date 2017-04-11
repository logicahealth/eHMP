@FX @DE6912
Feature: Unknown: call order applet makes to view details

@first_order
Scenario: first order
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;100022"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId
  When the client requests orders detail lab with saved localId for patient "9E7A;100022"
  And a successful response is returned

@DE6912 @DE6912_consult
Scenario: client can request single consult
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Consult"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_dietorder
Scenario: client can request single Dietetics Order
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Dietetics Order"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_lab
Scenario: client can request single Laboratory
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Laboratory"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_med_in
Scenario: client can request single Medication, Inpatient
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;100022"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Medication, Inpatient"
  When the client requests orders detail lab with saved localId for patient "9E7A;100022"
  And a successful response is returned

@DE6912 @DE6912_med_nonva
Scenario: client can request single Medication, Non-VA
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Medication, Non-VA"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_med_out
Scenario: client can request single Medication, Outpatient
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Medication, Outpatient"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_nursing
Scenario: client can request single Nursing
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Text Order"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_radiology
Scenario: client can request single Radiology
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;3"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Radiology"
  When the client requests orders detail lab with saved localId for patient "9E7A;3"
  And a successful response is returned

@DE6912 @DE6912_infusion
Scenario: client can request single Medication, Infusion
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  And the client requests all-orders for the patient "9E7A;8"
  And a successful response is returned
  And the response contains at least 1 items
  And the client notes the first order localId for kind "Medication, Infusion"
  When the client requests orders detail lab with saved localId for patient "9E7A;8"
  And a successful response is returned

