package us.vistacore.ehmp.model.demographics.transform;

import com.google.common.collect.ImmutableMap;
import org.hl7.fhir.instance.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.model.demographics.Address;
import us.vistacore.ehmp.model.demographics.*;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.model.transform.coding.HL7TableCodes;
import us.vistacore.ehmp.util.FhirUtils;

import java.util.*;

import static java.lang.String.format;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

public class DemographicsVistaToFhir {

    private static Logger logger = LoggerFactory.getLogger(DemographicsVistaToFhir.class);

    // Version 2 table code.  The 4 digit identifier for a table must be appended to the URI
    public static final String VERSION_2_SYSTEM = "http://hl7.org/fhir/sid/v2-";

    public static final String MARITAL_STATUS_SYSTEM = "http://hl7.org/fhir/v3/MaritalStatus";
    public static final String GENDER_SYSTEM = "http://hl7.org/fhir/v3/AdministrativeGender";
    public static final String RELATIONSHIP_TYPE_SYSTEM = "http://hl7.org/fhir/patient-contact-relationship";
    public static final String ETHNICITY_SYSTEM_URI = VERSION_2_SYSTEM + HL7TableCodes.ETHNICITY_TABLE;
    public static final String SSN_IDENTIFIER_SYSTEM = "http://hl7.org/fhir/sid/us-ssn";
    public static final String ICN_SYSTEM = "http://vistacore.us/fhir/id/icn";
    public static final String DFN_SYSTEM = "http://vistacore.us/fhir/id/dfn";
    public static final String LRDFN_SYSTEM = "http://vistacore.us/fhir/id/lrdfn";
    public static final String UID_SYSTEM = "http://vistacore.us/fhir/id/uid";
    public static final String PID_SYSTEM = "http://vistacore.us/fhir/id/pid";

    // System URI for VistA Patient Identifiers - the VHA OID plus ".100" to indicate
    // the Master Patient Index within VHA.  Note that this same value is currently also used
    // in the mock PIX/PDQ implementation.
    public static final String VHA_MASTER_PATIENT_INDEX_SYSTEM = "urn:oid:2.16.840.1.113883.6.233.100";

    public static final String BASE_EXTENSION_URL = "http://vistacore.us/fhir/profiles";
    public static final String RELIGION_EXTENSION_URL = BASE_EXTENSION_URL + "/@main#religion";
    public static final String SERVICE_CONNNECTED_EXTENSION_URL = BASE_EXTENSION_URL + "/@main#service-connected";
    public static final String SERVICE_PERCENT_EXTENSION_URL = BASE_EXTENSION_URL + "/@main#service-connected-percent";
    public static final String ETHNICITY_EXTENSION_URL = BASE_EXTENSION_URL + "/ethnicity";
    public static final String SENSITIVE_EXTENSION_URL = BASE_EXTENSION_URL + "/@main#sensitive";
    public static final Map<String, CodeableConcept> VA_TO_FHIR_MARITAL_STATUS_CODES = ImmutableMap.<String, CodeableConcept>builder()
                                                                    .put("urn:va:pat-maritalStatus:U", FhirUtils.createCodeableConcept("UNK", "unknown", MARITAL_STATUS_SYSTEM))
                                                                    .put("urn:va:pat-maritalStatus:D", FhirUtils.createCodeableConcept("D", "Divorced", MARITAL_STATUS_SYSTEM))
                                                                    .put("urn:va:pat-maritalStatus:S", FhirUtils.createCodeableConcept("S", "Never Married", MARITAL_STATUS_SYSTEM))
                                                                    .put("urn:va:pat-maritalStatus:M", FhirUtils.createCodeableConcept("M", "Married", MARITAL_STATUS_SYSTEM))
                                                                    .put("urn:va:pat-maritalStatus:L", FhirUtils.createCodeableConcept("L", "Legally Separated", MARITAL_STATUS_SYSTEM))
                                                                    .put("urn:va:pat-maritalStatus:W", FhirUtils.createCodeableConcept("W", "Widowed", MARITAL_STATUS_SYSTEM))
                                                                    .build();

    public static final Map<String, String> VA_TO_FHIR_RELATIONSHIP_CODES = ImmutableMap.<String, String>builder()
                                                                    .put("urn:va:pat-contact:NOK", "family")
                                                                    .put("urn:va:pat-contact:ECON", "emergency")
                                                                    .build();

    private static final Map<String, Coding> GENDER_MAP = ImmutableMap.<String, Coding>builder()
            .put("urn:va:pat-gender:M", FhirUtils.createCoding("M", "Male", GENDER_SYSTEM))
            .put("urn:va:pat-gender:F", FhirUtils.createCoding("F", "Female", GENDER_SYSTEM))
            .put("urn:va:pat-gender:U", FhirUtils.createCoding("UN", "Undifferentiated", GENDER_SYSTEM))
            .build();

    public DemographicsVistaToFhir() {
    }

    public List<Patient> transform(VPRDemographicsRpcOutput vprDemographicsRpcOutput) throws ModelTransformException {
        List<Patient> fhirPatients = new ArrayList<>();

        if ((vprDemographicsRpcOutput != null) && (vprDemographicsRpcOutput.getData() != null) && (isNotNullish(vprDemographicsRpcOutput.getData().getItems()))) {
            for (PatientDemographics patientDemographicsItem : vprDemographicsRpcOutput.getData().getItems()) {
                Patient fhirPatient = transformOneDemographicsResult(patientDemographicsItem);
                if (fhirPatient != null) {
                    fhirPatients.add(fhirPatient);
                }
            }
        }

        return fhirPatients;
    }

    protected Patient transformOneDemographicsResult(PatientDemographics patientDemographics) throws ModelTransformException {
        // If there is nothing to convert - get out of here.
        //---------------------------------------------------
        if (patientDemographics == null) {
            return null;
        }
        Patient fhirPatient = new Patient();

        transformText(fhirPatient, patientDemographics);
        transformEthnicity(fhirPatient, patientDemographics);
        transformReligion(fhirPatient, patientDemographics);
        transformVeteran(fhirPatient, patientDemographics);
        transformSensitive(fhirPatient, patientDemographics);
        transformSupport(fhirPatient, patientDemographics);
        transformSsn(fhirPatient, patientDemographics);
        transformGender(fhirPatient, patientDemographics);
        transformDateOfBirth(fhirPatient, patientDemographics);
        transformTelecom(fhirPatient, patientDemographics);
        transformUid(fhirPatient, patientDemographics);
        transformIcn(fhirPatient, patientDemographics);
        transformDfn(fhirPatient, patientDemographics);
        transformLrdfn(fhirPatient, patientDemographics);
        transformPid(fhirPatient, patientDemographics);
        transformMaritalStatus(fhirPatient, patientDemographics);
        transformName(fhirPatient, patientDemographics);
        transformAddresses(fhirPatient, patientDemographics);
        transformManagingOrganization(fhirPatient, patientDemographics);

        return fhirPatient;
    }

    protected void transformText(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getFullName()) && isNotNullish(patientDemographics.getSsn())) {
            fhirPatient.setText(FhirUtils.createNarrative(Narrative.NarrativeStatus.generated, format("%s. SSN: %s", patientDemographics.getFullName(), patientDemographics.getSsn())));
        }
    }

    protected void transformEthnicity(Patient fhirPatient, PatientDemographics patientDemographics) {
        Set<PatientEthnicity> ethnicities = patientDemographics.getEthnicities();
        if (isNotNullish(ethnicities)) {
            for (PatientEthnicity ethnicity : ethnicities) {
                Extension ethnicityExtension = FhirUtils.createExtension(ETHNICITY_EXTENSION_URL, FhirUtils.createCoding(ethnicity.getCode(), ethnicity.getName(), ETHNICITY_SYSTEM_URI));
                fhirPatient.getExtensions().add(ethnicityExtension);
            }
        }
    }

    protected void transformReligion(Patient fhirPatient, PatientDemographics patientDemographics) {
        String religionCode = patientDemographics.getReligionCode();
        if (religionCode != null) {
            String religionName = patientDemographics.getReligionName();
            Extension religion = FhirUtils.createExtension(RELIGION_EXTENSION_URL, FhirUtils.createCoding(religionCode, religionName, null));
            fhirPatient.getExtensions().add(religion);
        }
    }

    protected void transformVeteran(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (patientDemographics.isVeteran() != null && patientDemographics.isServiceConnected() != null) {
            boolean isServiceConnected = patientDemographics.isServiceConnected();
            String servicePercentValue = patientDemographics.getScPercent();

            Extension serviceConnected = FhirUtils.createExtension(SERVICE_CONNNECTED_EXTENSION_URL, FhirUtils.createCoding(isServiceConnected ? "Y" : "N", "Service Connected", null));
            fhirPatient.getExtensions().add(serviceConnected);

            if (isServiceConnected) {
                Extension servicePercent = FhirUtils.createExtension(SERVICE_PERCENT_EXTENSION_URL, FhirUtils.createQuantity(servicePercentValue, "%"));
                fhirPatient.getExtensions().add(servicePercent);
            }
        }
    }

    protected void transformSensitive(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (patientDemographics != null && patientDemographics.getSensitive() != null) {
            Extension sensitive = FhirUtils.createExtension(SENSITIVE_EXTENSION_URL, patientDemographics.getSensitive());
            fhirPatient.getExtensions().add(sensitive);
        }
    }

    protected void transformSupport(Patient fhirPatient, PatientDemographics patientDemographics) {
        Set<PatientContact> contacts = patientDemographics.getContacts();
        if (isNotNullish(contacts)) {
            for (PatientContact patientContact : contacts) {
                Patient.ContactComponent contactComponent = fhirPatient.addContact();

                // Relationship code
                CodeableConcept relationshipCode = contactComponent.addRelationship();
                Coding relationshipCoding = FhirUtils.createCoding(VA_TO_FHIR_RELATIONSHIP_CODES.get(patientContact.getTypeCode()), patientContact.getTypeName(), RELATIONSHIP_TYPE_SYSTEM);
                relationshipCode.getCoding().add(relationshipCoding);
                relationshipCode.setTextSimple(patientContact.getTypeName());

                Set<Telecom> supportTelecomList = patientContact.getTelecomList();
                Set<Address> supportAddressList = patientContact.getAddresses();
                List<Address> contactAddressList = new ArrayList<>();
                List<Contact> contactTelecomList = new ArrayList<>();
                if (isNotNullish(supportTelecomList)) {
                    for (Telecom domainTelecom : supportTelecomList) {
                        Contact contact = new Contact();
                        contact.setValueSimple(domainTelecom.getValue());
                        contact.setUseSimple(usageCodeToContactUse(domainTelecom.getUse()));
                        contact.setSystemSimple(Contact.ContactSystem.phone);
                        contactTelecomList.add(contact);
                    }
                }
                if (isNotNullish(supportAddressList)) {
                    for (Address domainSupportAddress : supportAddressList) {
                        Address address = new Address();
                        address.setCity(domainSupportAddress.getCity());
                        if (domainSupportAddress.getLine1() != null) {
                            address.setLine1(domainSupportAddress.getLine1());
                        }
                        if (domainSupportAddress.getLine2() != null) {
                            address.setLine2(domainSupportAddress.getLine2());
                        }

                        address.setState(domainSupportAddress.getState());
                        address.setZip(domainSupportAddress.getZip());
                        contactAddressList.add(address);
                    }
                }
                contactComponent.getTelecom().addAll(contactTelecomList);

                HumanName contactName = new HumanName();
                contactName.setTextSimple(patientContact.getName());
                contactName.setUseSimple(HumanName.NameUse.usual);
                contactComponent.setName(contactName);
            }
        }
    }

    protected void transformSsn(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (patientDemographics.getSsn() != null) {
            Identifier ssnIdentifier = fhirPatient.addIdentifier();
            ssnIdentifier.setValueSimple(patientDemographics.getSsn());
            ssnIdentifier.setLabelSimple("ssn");
            ssnIdentifier.setSystemSimple(SSN_IDENTIFIER_SYSTEM);
            ssnIdentifier.setUseSimple(Identifier.IdentifierUse.official);
        }
    }

    protected void transformGender(Patient fhirPatient, PatientDemographics patientDemographics) {
        String genderCode = patientDemographics.getGenderCode();
        if (genderCode != null) {
            Coding administrativeGender = GENDER_MAP.get(genderCode);
            fhirPatient.setGender(FhirUtils.createCodeableConcept(administrativeGender));
        }
    }

    protected void transformDateOfBirth(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getBirthDate())) {
            DateTime birthDate = null;
            try {
                birthDate = FhirUtils.createFhirDateTime(patientDemographics.getBirthDate());
            } catch (ModelTransformException e) {
                logger.warn("Error transforming Date/Time; birthDate being set to null.", e);
            }
            fhirPatient.setBirthDate(birthDate);
        }
    }

    protected void transformTelecom(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getTelecoms())) {
            for (Telecom telecom : patientDemographics.getTelecoms()) {
                Contact contact = fhirPatient.addTelecom();
                contact.setUseSimple(usageCodeToContactUse(telecom.getUse()));
                contact.setValueSimple(telecom.getValue());
                contact.setSystemSimple(Contact.ContactSystem.phone);
            }
        }
    }

    protected void transformUid(Patient fhirPatient, PatientDemographics patientDemographics) {
        String uid = patientDemographics.getUid();
        if (uid != null) {
            Identifier identifier = fhirPatient.addIdentifier();
            identifier.setValueSimple(uid);
            identifier.setLabelSimple("uid");
            identifier.setSystemSimple(UID_SYSTEM);
        }
    }

    protected void transformIcn(Patient fhirPatient, PatientDemographics patientDemographics) {
        String icn = patientDemographics.getIcn();
        if (icn != null) {
            Identifier icnIdentifier = fhirPatient.addIdentifier();
            icnIdentifier.setValueSimple(icn);
            icnIdentifier.setLabelSimple("icn");
            icnIdentifier.setSystemSimple(ICN_SYSTEM);
        }
    }

    protected void transformDfn(Patient fhirPatient, PatientDemographics patientDemographics) {
        String dfn = patientDemographics.getLocalId();
        if (dfn != null) {
            Identifier icnIdentifier = fhirPatient.addIdentifier();
            icnIdentifier.setValueSimple(dfn);
            icnIdentifier.setLabelSimple("dfn");
            icnIdentifier.setSystemSimple(DFN_SYSTEM);
        }
    }

    protected void transformLrdfn(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getLrdfn())) {
            String lrdfn = patientDemographics.getLrdfn();
            Identifier icnIdentifier = fhirPatient.addIdentifier();
            icnIdentifier.setValueSimple(lrdfn);
            icnIdentifier.setLabelSimple("lrdfn");
            icnIdentifier.setSystemSimple(LRDFN_SYSTEM);
        }
    }

    protected void transformPid(Patient fhirPatient, PatientDemographics patientDemographics) {
        String pid = patientDemographics.getPid();
        if (pid != null) {
            Identifier icnIdentifier = fhirPatient.addIdentifier();
            icnIdentifier.setValueSimple(pid);
            icnIdentifier.setLabelSimple("pid");
            icnIdentifier.setSystemSimple(PID_SYSTEM);
        }
    }

    protected void transformMaritalStatus(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getMaritalStatusCode())) {
            fhirPatient.setMaritalStatus(VA_TO_FHIR_MARITAL_STATUS_CODES.get(patientDemographics.getMaritalStatusCode()));
        }
    }

    protected void transformName(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (isNotNullish(patientDemographics.getFamilyName()) && isNotNullish(patientDemographics.getGivenNames())) {
            HumanName fhirName = fhirPatient.addName();
            fhirName.setUseSimple(HumanName.NameUse.official);

            // Set family name
            if (patientDemographics.getFamilyName() != null) {
                fhirName.addFamilySimple(patientDemographics.getFamilyName());
            }

            // Set full name
            fhirName.setTextSimple(patientDemographics.getFullName());

            // Given name
            if (patientDemographics.getGivenNames() != null) {
                fhirName.addGivenSimple(patientDemographics.getGivenNames());
            }
        }
    }

    protected void transformAddresses(Patient fhirPatient, PatientDemographics patientDemographics) {
        Set<Address> addresses = patientDemographics.getAddresses();
        if (isNotNullish(addresses)) {
            for (Address address : addresses) {
                org.hl7.fhir.instance.model.Address fhirAddress = fhirPatient.addAddress();
                fhirAddress.setCitySimple(address.getCity());
                fhirAddress.setCountrySimple(address.getCountry());
                if (address.getLine1() != null) {
                    fhirAddress.addLineSimple(address.getLine1());
                }
                if (address.getLine2() != null) {
                    fhirAddress.addLineSimple(address.getLine2());
                }

                fhirAddress.setStateSimple(address.getState());
                fhirAddress.setZipSimple(address.getZip());
            }
        }
    }

    protected void transformManagingOrganization(Patient fhirPatient, PatientDemographics patientDemographics) {
        if (patientDemographics != null && patientDemographics.getHomeFacility() != null) {
            Organization homeFacility = new Organization();
            homeFacility.setNameSimple(patientDemographics.getHomeFacility().getName());

            Identifier facilityCode = homeFacility.addIdentifier();
            facilityCode.setLabelSimple("facility-code");
            facilityCode.setValueSimple(patientDemographics.getHomeFacility().getCode());

            UUID referenceId = UUID.randomUUID();
            homeFacility.setXmlId(referenceId.toString());

            fhirPatient.getContained().add(homeFacility);
            fhirPatient.setManagingOrganization(FhirUtils.createResourceReferenceAnchor(referenceId.toString()));
        }
    }

    protected static Contact.ContactUse usageCodeToContactUse(String usageCode) {
        if ("WP".equalsIgnoreCase(usageCode)) {
            return Contact.ContactUse.work;
        }
        if ("H".equalsIgnoreCase(usageCode)) {
            return Contact.ContactUse.home;
        }
        if ("MC".equalsIgnoreCase(usageCode)) {
            return Contact.ContactUse.mobile;
        }
        return Contact.ContactUse.temp;
    }

}
