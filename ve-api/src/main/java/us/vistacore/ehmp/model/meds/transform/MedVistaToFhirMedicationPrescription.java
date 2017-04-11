package us.vistacore.ehmp.model.meds.transform;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Duration;
import org.hl7.fhir.instance.model.Encounter;
import org.hl7.fhir.instance.model.Encounter.EncounterLocationComponent;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.HumanName;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.MedicationPrescription.MedicationPrescriptionDispenseComponent;
import org.hl7.fhir.instance.model.MedicationPrescription.MedicationPrescriptionDosageInstructionComponent;
import org.hl7.fhir.instance.model.MedicationPrescription.MedicationPrescriptionStatus;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Schedule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * This class contains the logic for VPR Med to FHIR Medication Prescription transformation
 * for MedicationPrescription.
 *
 * @author josephg
 */
public final class MedVistaToFhirMedicationPrescription {

    /** The Constant MEDICATION_PRESCRIPTION_ID_PREFIX. */
    public static final String MEDICATION_PRESCRIPTION_ID_PREFIX = "MedicationPrescription/";

    /** The Constant MED_RESULTS_UID_IDENTIFIER_SYSTEM. */
    protected static final String MED_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant ORDERS_UID_IDENTIFIER_SYSTEM. */
    protected static final String ORDERS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant MED_EXTENSION_URL_PREFIX. */
    protected static final String MED_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#";

    /** The Constant ROUTE_INTERPRETATION_SYSTEM. */
    public static final String ROUTE_INTERPRETATION_SYSTEM = "http://www.hl7.org/implement/standards/fhir/v3/RouteOfAdministration/";

    /** The Constant PRESCRIBER_INTERPRETATION_SYSTEM. */
    public static final String PRESCRIBER_INTERPRETATION_SYSTEM = "http://hl7.org/implement/standards/fhir/practitioner.html";

    /** The Constant ENCOUNTER_INTERPRETATION_SYSTEM. */
    public static final String ENCOUNTER_INTERPRETATION_SYSTEM = "http://hl7.org/implement/standards/fhir/encounter.html#Encounter";

    /** The Constant PATIENT_PREFIX. */
    public static final String PATIENT_PREFIX = "Patient/";


    /** The Constant LOGGER. */
    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationPrescription.class);

    /** Fields from vista orders to add as extension for MedicationPrescription encounter. */
    protected static final List<String> ENCOUNTER_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("locationUid")
            .build();

    /** Fields from vista items to add as extension for MedicationPrescription. */
    protected static final List<String> MEDICATIONPRECRIPTION_MED_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("localId")
            .add("medStatus")
            .add("medStatusName")
            .add("medType")
            .add("supply")
            .add("kind")
            .build();

    /** Fields from vista orders to add as extension for MedicationPrescription. */
    protected static final List<String> MEDICATIONPRECRIPTION_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("orderUid")
            .add("pharmacistUid")
            .add("pharmacistName")
            .build();

    /** Fields from vista dosages to add as extension for MedicationPrescription. */
    protected static final List<String> MEDICATIONPRECRIPTION_DOSAGES_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("scheduleFreq")
            .add("complexDuration")
            .build();

    /** Fields from vista dosages to add as extension for MedicationPrescriptionDosageInstructionComponent. */
    protected static final List<String> DOSAGEINSTRUCTION_DOSAGES_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("relativeStart")
            .add("relativeStop")
            .build();

    /** Fields from vista orders to add as extension for MedicationPrescriptionDosageInstructionComponent. */
    protected static final List<String> DOSAGEINSTRUCTION_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("predecessor")
            .add("successor")
            .build();

    /** The Constant MED_STATUS_NAME_MAP. */
    protected static final Map<String, MedicationPrescriptionStatus> MED_STATUS_NAME_MAP = ImmutableMap.<String, MedicationPrescriptionStatus>builder()
            .put("historical", MedicationPrescriptionStatus.completed)
            .put("not active", MedicationPrescriptionStatus.stopped)
            .put("hold", MedicationPrescriptionStatus.onHold)
            .put("active", MedicationPrescriptionStatus.active)
            .build();

    /** The Constant DOSAGE_ROUTE_MAP. */
    protected static final Map<String, CodeableConcept> DOSAGE_ROUTE_MAP = ImmutableMap.<String, CodeableConcept>builder()
            .put("BUCC", FhirUtils.createCodeableConcept("BUCC", "Buccal", ROUTE_INTERPRETATION_SYSTEM))
            .put("DENT", FhirUtils.createCodeableConcept("DENT", "Dental", ROUTE_INTERPRETATION_SYSTEM))
            .put("ED", FhirUtils.createCodeableConcept("ED", "Epidural", ROUTE_INTERPRETATION_SYSTEM))
            .put("INHL", FhirUtils.createCodeableConcept("INHL", "Inhalation", ROUTE_INTERPRETATION_SYSTEM))
            .put("IAER", FhirUtils.createCodeableConcept("IAER", "Intra-Arterial", ROUTE_INTERPRETATION_SYSTEM))
            .put("IA", FhirUtils.createCodeableConcept("IA", "Intra-Articular", ROUTE_INTERPRETATION_SYSTEM))
            .put("IC", FhirUtils.createCodeableConcept("IC", "Intra-Cardiac", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Cavernosal", INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("ID", "Intrad-Dermal", INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Lesional", INTERPRETATION_SYSTEM))
            .put("IM", FhirUtils.createCodeableConcept("IM", "Intra-Muscular", ROUTE_INTERPRETATION_SYSTEM))
            .put("IO", FhirUtils.createCodeableConcept("IO", "Intra-Ocular", ROUTE_INTERPRETATION_SYSTEM))
            .put("IP", FhirUtils.createCodeableConcept("IP", "Intra-Peritoneal", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Pleural", INTERPRETATION_SYSTEM))
            .put("INTH", FhirUtils.createCodeableConcept("INTH", "Intra-Thecal", ROUTE_INTERPRETATION_SYSTEM))
            .put("ITRC", FhirUtils.createCodeableConcept("ITRC", "Intra-Tracheal", ROUTE_INTERPRETATION_SYSTEM))
            .put("IV", FhirUtils.createCodeableConcept("IV", "Intravenous", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intravesical", INTERPRETATION_SYSTEM))
            .put("IRRG", FhirUtils.createCodeableConcept("IRRG", "Irrigation", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Nebulization", INTERPRETATION_SYSTEM))
            .put("OPH", FhirUtils.createCodeableConcept("OPH", "Ophthamic", ROUTE_INTERPRETATION_SYSTEM))
            .put("PO", FhirUtils.createCodeableConcept("PO", "Oral", ROUTE_INTERPRETATION_SYSTEM))
            .put("OTIC", FhirUtils.createCodeableConcept("OTIC", "Otic", ROUTE_INTERPRETATION_SYSTEM))
            .put("RTL", FhirUtils.createCodeableConcept("RTL", "Rectal", ROUTE_INTERPRETATION_SYSTEM))
            .put("SC", FhirUtils.createCodeableConcept("SC", "Subcutaneous", ROUTE_INTERPRETATION_SYSTEM))
            .put("SL", FhirUtils.createCodeableConcept("SL", "Sublingual", ROUTE_INTERPRETATION_SYSTEM))
            .put("TOP", FhirUtils.createCodeableConcept("TOP", "Topical", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Transdermal", INTERPRETATION_SYSTEM))
            .put("VAG", FhirUtils.createCodeableConcept("VAG", "Vaginal", ROUTE_INTERPRETATION_SYSTEM))
            //.put("NA", FhirUtils.createCodeableConcept("NA", "Nasal", INTERPRETATION_SYSTEM))
            .put("URH", FhirUtils.createCodeableConcept("URH", "Urethral", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Caudal", INTERPRETATION_SYSTEM))
            .put("IS", FhirUtils.createCodeableConcept("IS", "Intra-Spinal", ROUTE_INTERPRETATION_SYSTEM))
            .put("IF", FhirUtils.createCodeableConcept("IF", "Infiltration", ROUTE_INTERPRETATION_SYSTEM))
            .put("INBU", FhirUtils.createCodeableConcept("INBU", "Intra-Bursal", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Not Applicable", INTERPRETATION_SYSTEM))
            .put("ICAV", FhirUtils.createCodeableConcept("ICAV", "Intra-Cavitary", ROUTE_INTERPRETATION_SYSTEM))
            .put("ISY", FhirUtils.createCodeableConcept("ISY", "Intra-Synovial", ROUTE_INTERPRETATION_SYSTEM))
            .put("IU", FhirUtils.createCodeableConcept("IU", "Intra-Uterine", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Vitreal", INTERPRETATION_SYSTEM))
            .put("RBUL", FhirUtils.createCodeableConcept("RBUL", "Retrobulbar", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Enternal", INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Tympanic", INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Subconjunctival", INTERPRETATION_SYSTEM))
            .put("IAM", FhirUtils.createCodeableConcept("IAM", "Intra-Amniotic", ROUTE_INTERPRETATION_SYSTEM))
            //.put("", FhirUtils.createCodeableConcept("", "Intra-Ductal", INTERPRETATION_SYSTEM))
            .build();

    /**
     * Instantiates a new med vista to fhir medication prescription (private so utility class cannot be instantiated).
     */
    private MedVistaToFhirMedicationPrescription() {
    }


    /**
     * Gets the med type code.
     *
     * @param categoryCode the category code
     * @return the med type code
     */
    protected static String getMedTypeCode(String categoryCode) {
        return categoryCode.substring(Math.max(categoryCode.length() - 2, 0));
    }

    /**
     * Gets the paitent external reference id.
     *
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the paitent external reference id
     */
    protected static String getPaitentExternalReferenceId(VistaPatientIdentity oVistaPatientIdentity) {
        String referenceId = null;
        if (oVistaPatientIdentity != null && isNotNullish(oVistaPatientIdentity.getEnterprisePatientIdentifier())) {
            referenceId = PATIENT_PREFIX + oVistaPatientIdentity.getEnterprisePatientIdentifier();
        }
        return referenceId;
    }

    /**
     * Transform one medication prescription.
     *
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @param oTopParentResource the o top parent resource
     * @return the medication prescription
     */
    protected static MedicationPrescription transformOneMedicationPrescription(MedResult medResult, VistaPatientIdentity oVistaPatientIdentity, Resource oTopParentResource) {
        if (medResult == null) {
            return null;
        }

        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent = new MedicationPrescriptionDispenseComponent();

        try {
            transformEncounter(fhirMedicationPrescription, medResult, oTopParentResource);
            transformIdentifier(fhirMedicationPrescription, medResult);
            transformDateWritten(fhirMedicationPrescription, medResult);
            transformMedicationPrescriptionExtensions(fhirMedicationPrescription, medResult);
            transformMedicationPrescriptionDosageInstructionExtensions(fhirMedicationPrescription, medResult);
            transformValidityPeriod(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, medResult);
            transformSummary(fhirMedicationPrescription, medResult);
            transformPatientInstruction(fhirMedicationPrescription, medResult);
            transformStatus(fhirMedicationPrescription, medResult);
            transformTiming(fhirMedicationPrescription, medResult);
            transformSig(fhirMedicationPrescription, medResult);
            transformRoute(fhirMedicationPrescription, medResult);
            transformQuantity(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, medResult);
            transformDoseQuantity(fhirMedicationPrescription, medResult);
            transformExpectedSupplyNumberOfRepeats(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, medResult);
            transformScheduleName(fhirMedicationPrescription, medResult);
            transformMedication(fhirMedicationPrescription, medResult, oTopParentResource);
            transformPatient(fhirMedicationPrescription, oVistaPatientIdentity);
            transformPrescriber(fhirMedicationPrescription, medResult, oTopParentResource);
            fhirMedicationPrescription.setDispense(fhirMedicationPrescriptionDispenseComponent);
        } catch (ModelTransformException e) {
            LOGGER.error(e.getMessage(), e);
            return null;
        }

        return fhirMedicationPrescription;
    }

    /**
     * Generate medication prescription id.
     *
     * @param medResult the med result
     * @return the string
     */
    private static String generateMedicationPrescriptionId(MedResult medResult) {
        return MEDICATION_PRESCRIPTION_ID_PREFIX + medResult.getUid();
    }

    /**
     * This method extracts the Patient (DFN) information from the Vista
     * instance and places the information into the FHIR instance.
     *
     * @param fhirMedicationPrescription            The FHIR MedicationPrescription created.
     * @param oVistaPatientIdentity            the vista patient identity
     * @return the resource reference
     */
    protected static ResourceReference transformPatient(MedicationPrescription fhirMedicationPrescription, VistaPatientIdentity oVistaPatientIdentity) {
        ResourceReference patient = new ResourceReference();
        String sPatientReference = getPaitentExternalReferenceId(oVistaPatientIdentity);
        if (NullChecker.isNotNullish(sPatientReference)) {
            patient.setReferenceSimple(sPatientReference);
            fhirMedicationPrescription.setPatient(patient);
        }
        return patient;
    }

    /**
     * This method extracts uid and prescriptionId from vista and transform them into fhir identifier.
     *
     * @param fhirMedicationPrescription            The FHIR MedicationPrescription being created.
     * @param medResult the med result
     */
    protected static void transformIdentifier(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if ((medResult != null) && (isNotNullish(medResult.getUid()))) {
            fhirMedicationPrescription.addIdentifier().setValueSimple(medResult.getUid()).setSystemSimple(MED_RESULTS_UID_IDENTIFIER_SYSTEM);
            fhirMedicationPrescription.setXmlId(generateMedicationPrescriptionId(medResult));
        }

        if ((medResult != null) && (isNotNullish(medResult.getOrders()))) {
            for (Orders order : medResult.getOrders()) {
                if (isNotNullish(order.getPrescriptionId())) {
                    fhirMedicationPrescription.addIdentifier().setValueSimple(order.getPrescriptionId());
                }
                if (isNotNullish(order.getOrderUid())) {
                    fhirMedicationPrescription.addIdentifier().setValueSimple(order.getOrderUid()).setSystemSimple(ORDERS_UID_IDENTIFIER_SYSTEM);
                }
            }
        }
    }

    /**
     * This method extracts the MEDICATIONPRECRIPTION_ORDERS_EXTENSION_FIELD_NAMES,
     * MEDICATIONPRECRIPTION_DOSAGES_EXTENSION_FIELD_NAMES and MEDICATIONPRECRIPTION_MED_EXTENSION_FIELD_NAMES
     * fields from vista and transforms them into fhir MedicationPrescription extension.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformMedicationPrescriptionExtensions(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationPrescription, order, MED_EXTENSION_URL_PREFIX, MEDICATIONPRECRIPTION_ORDERS_EXTENSION_FIELD_NAMES);
            }
        }
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationPrescription, dosage, MED_EXTENSION_URL_PREFIX, MEDICATIONPRECRIPTION_DOSAGES_EXTENSION_FIELD_NAMES);
            }
        }
        FhirUtils.addExtensionsFromBeanProperties(fhirMedicationPrescription, medResult, MED_EXTENSION_URL_PREFIX, MEDICATIONPRECRIPTION_MED_EXTENSION_FIELD_NAMES);
    }

    /**
     * This method extracts the DOSAGEINSTRUCTION_ORDERS_EXTENSION_FIELD_NAMES and
     * DOSAGEINSTRUCTION_DOSAGES_EXTENSION_FIELD_NAMES fields from vista
     * and transform them into fhir MedicationPrescriptionDosageInstructionComponent extension.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformMedicationPrescriptionDosageInstructionExtensions(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        MedicationPrescriptionDosageInstructionComponent fhirMedicationPrescriptionDosageInstructionComponent = fhirMedicationPrescription.addDosageInstruction();
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationPrescriptionDosageInstructionComponent, order, MED_EXTENSION_URL_PREFIX, DOSAGEINSTRUCTION_ORDERS_EXTENSION_FIELD_NAMES);
            }
        }
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationPrescriptionDosageInstructionComponent, dosage, MED_EXTENSION_URL_PREFIX, DOSAGEINSTRUCTION_DOSAGES_EXTENSION_FIELD_NAMES);
            }
        }
    }

    /**
     * This method extracts the summary from vista and transform it into fhir
     * MedicationPrescription narrative text.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformSummary(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        Narrative n = FhirUtils.createNarrative(NarrativeStatus.generated, medResult.getSummary());
        fhirMedicationPrescription.setText(n);
    }

    /**
     * This method extracts providerUid from vista and transform it into fhir MedicationPrescription prescriber.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     * @param oTopParentResource the o top parent resource
     */
    protected static Practitioner transformPrescriber(MedicationPrescription fhirMedicationPrescription, MedResult medResult, Resource oTopParentResource) {
        Practitioner practitioner = new Practitioner();
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                Identifier identifier = FhirUtils.createIdentifier(PRESCRIBER_INTERPRETATION_SYSTEM, order.getProviderUid());
                practitioner.getIdentifier().add(identifier);

                HumanName humanName = new HumanName();
                humanName.setTextSimple(order.getProviderName());
                practitioner.setName(humanName);

                ResourceReference practitionerReference = FhirUtils.createLocalResourceReference(oTopParentResource, practitioner);
                fhirMedicationPrescription.setPrescriber(practitionerReference);
            }
        }
        return practitioner;
    }

    /**
     * This method extracts vatype, facilictyCode, locationUid, facilityName, lacationName, and
     * ENCOUNTER_EXTENSION_FIELD_NAMES from vista and transform them into fhir MedicationPrescription encounter and extension.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     * @param oTopParentResource the o top parent resource
     * @throws ModelTransformException the model transform exception
     */
    protected static void transformEncounter(MedicationPrescription fhirMedicationPrescription, MedResult medResult, Resource oTopParentResource) throws ModelTransformException {
        Encounter encounter = new Encounter();

        if (isNotNullish(medResult.getVaType())) {
            CodeableConcept codeableConcept = FhirUtils.createCodeableConcept(medResult.getVaType());
            encounter.getType().add(codeableConcept);

           ResourceReference encounterRef = FhirUtils.createLocalResourceReference(oTopParentResource, encounter);
           fhirMedicationPrescription.setEncounter(encounterRef);

            if (medResult != null && medResult.getOrders() != null) {
                for (Orders order : medResult.getOrders()) {
                    FhirUtils.addExtensionsFromBeanProperties(encounter, order, MED_EXTENSION_URL_PREFIX, ENCOUNTER_ORDERS_EXTENSION_FIELD_NAMES);

                    Location location = new Location();
                    location.setNameSimple(medResult.getFacilityName());

                    Identifier identifier = FhirUtils.createIdentifier(ENCOUNTER_INTERPRETATION_SYSTEM, medResult.getFacilityCode());
                    location.setIdentifier(identifier);

                    ResourceReference encounterLocationReference = FhirUtils.createLocalResourceReference(oTopParentResource, location);
                    encounter.addLocation().setLocation(encounterLocationReference);

                    if (isNotNullish(order.getLocationName())) {
                        encounterLocationReference.setDisplaySimple(order.getLocationName());
                    }

                    EncounterLocationComponent locationComponent = encounter.addLocation();
                    if (isNotNullish(order.getOrdered())) {
                        DateTime orderedDateTime = FhirUtils.createFhirDateTime(order.getOrdered());
                        Calendar startFhirDateTime = FhirUtils.toCalender(orderedDateTime);

                        Period period = FhirUtils.createPeriod(startFhirDateTime, startFhirDateTime);
                        locationComponent.setPeriod(period);
                    }
                }
            }
        }
    }

    /**
     * This method extracts medStatusName from vista and transform it into fhir MedicationPrescription status.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformStatus(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null) {
            MedicationPrescriptionStatus q = MED_STATUS_NAME_MAP.get(medResult.getMedStatusName());
            fhirMedicationPrescription.setStatusSimple(q);
        }
    }

    /**
     * This method extracts units from vista and transform it into fhir
     * MedicationPrescriptionDosageInstructionComponent dose quantity.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformDoseQuantity(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if ((medResult != null) && (medResult.getDosages() != null)) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getDose()) && NumberUtils.isNumber(dosage.getDose())) {
                    BigDecimal dosageValue = FhirUtils.createBigDecimal(dosage.getDose());
                    Quantity quantity = FhirUtils.createQuantity(dosageValue, dosage.getUnits());
                    fhirMedicationPrescription.addDosageInstruction().setDoseQuantity(quantity);
                }
            }
        }
    }

    /**
     * This method extracts routeName fron vista and transform it into fhir
     * MedicationPrescriptionDosageInstructionComponent route.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformRoute(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (dosage.getRouteName() != null) {
                    try {
                        CodeableConcept codeableConcept = DOSAGE_ROUTE_MAP.get(dosage.getRouteName());
                            if (codeableConcept != null) {
                                fhirMedicationPrescription.addDosageInstruction().setRoute(codeableConcept);
                            }
                    } catch (Exception e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        System.out.println("ROUTE NAME" + dosage.getRouteName());
                    }
                }
            }
        }
    }

    /**
     * This method extracts scheduleName from vista and transform it into fhir
     * MedicationPrescriptionDosageInstructionComponent timing[Schedule] extension.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformScheduleName(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getScheduleName())) {
                    Extension e = new Extension();
                    e.setUrlSimple(MED_EXTENSION_URL_PREFIX + "scheduleName");
                    e.setValue(FhirUtils.createFhirString(dosage.getScheduleName()));
                    Schedule p = new Schedule();
                    p.getExtensions().add(e);
                    fhirMedicationPrescription.addDosageInstruction().setTiming(p);
                }
            }
        }
    }

    /**
     * This method extracts scheduleType, start, end from vista and transform it into fhir
     * MedicationPrescriptionDosageInstructionComponent timing[Period] start and stop and extension.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     * @throws ModelTransformException the model transform exception
     */
    protected static void transformTiming(MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {

                Extension e = new Extension();
                Period p =  null;

                e.setUrlSimple(MED_EXTENSION_URL_PREFIX + "scheduleType");
                e.setValue(FhirUtils.createFhirString(dosage.getScheduleType()));
                if ((isNotNullish(dosage.getStart())) && (isNotNullish(dosage.getStop()))) {
                    DateTime startDateTime = FhirUtils.createFhirDateTime(dosage.getStart());
                    DateTime stopDateTime = FhirUtils.createFhirDateTime(dosage.getStop());

                    Calendar startFhirDateTime = FhirUtils.toCalender(startDateTime);
                    Calendar stopFhirDateTime = FhirUtils.toCalender(stopDateTime);

                    if (isNotNullish(dosage.getScheduleType())) {
                        p = FhirUtils.createPeriod(startFhirDateTime, stopFhirDateTime, e);
                    } else {
                        p = FhirUtils.createPeriod(startFhirDateTime, stopFhirDateTime);
                    }
                }
                fhirMedicationPrescription.addDosageInstruction().setTiming(p);
            }
        }
    }

    /**
     * This method extracts patientInstruction and transform into fhir
     * MedicationPrescriptionDosageInstructionComponent additionalInstructions.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformPatientInstruction(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if ((medResult != null) && isNotNullish(medResult.getPatientInstruction())) {
            MedicationPrescriptionDosageInstructionComponent fhirMedicationPrescriptionDosageInstructionComponent = new MedicationPrescriptionDosageInstructionComponent();
            CodeableConcept t = FhirUtils.createCodeableConcept(medResult.getPatientInstruction());
            MedicationPrescriptionDosageInstructionComponent r = fhirMedicationPrescriptionDosageInstructionComponent.setAdditionalInstructions(t);
            fhirMedicationPrescription.getDosageInstruction().add(r);
        }
    }

    /**
     * This method extracts sig from vista and transform it into fhir
     * MedicationPrescriptionDosageInstructionComponent text.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformSig(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if ((medResult != null) && isNotNullish(medResult.getSig())) {
            MedicationPrescriptionDosageInstructionComponent fhirMedicationPrescriptionDosageInstructionComponent = new MedicationPrescriptionDosageInstructionComponent();
            MedicationPrescriptionDosageInstructionComponent t = fhirMedicationPrescriptionDosageInstructionComponent.setTextSimple(medResult.getSig());
            fhirMedicationPrescription.getDosageInstruction().add(t);
        }
    }

    /**
     * This method extracts stopped, overallStart, overallStop from vista and transform into fhir
     * MedicationPrescriptionDispenseComponent validityPeriod[Period] start, end, and extension.
     *
     * @param fhirMedicationPrescriptionDispenseComponent the fhir medication prescription dispense component
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformValidityPeriod(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null) {
            Extension e = new Extension();
            e.setUrlSimple(MED_EXTENSION_URL_PREFIX + "stopped");
            e.setValue(FhirUtils.createFhirString(medResult.getStopped()));
            if (isNotNullish(medResult.getOverallStart()) && isNotNullish(medResult.getOverallStop())) {
                try {
                    DateAndTime startDateTime = DateAndTime.parseV3(medResult.getOverallStart());
                    DateAndTime stopDateTime = DateAndTime.parseV3(medResult.getOverallStop());

                    Calendar startFhirDateTime = FhirUtils.toCalender(startDateTime);
                    Calendar stopFhirDateTime = FhirUtils.toCalender(stopDateTime);

                    Period p = null;
                    if (medResult.getVaType().equals("N")) {
                        p = FhirUtils.createPeriod(startFhirDateTime, stopFhirDateTime);
                    } else {
                        p = FhirUtils.createPeriod(startFhirDateTime, stopFhirDateTime, e);
                    }
                    fhirMedicationPrescriptionDispenseComponent.setValidityPeriod(p);
                } catch (ParseException e1) {
                    // TODO Auto-generated catch block
                    e1.printStackTrace();
                    LOGGER.info("Validity Period could not be parsed");
                }
            }
        }
    }

    /**
     * This method extracts quantityOrdered from vista and transform it into fhir.
     *
     * @param fhirMedicationPrescriptionDispenseComponent quantity
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformQuantity(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                if (NumberUtils.isNumber(order.getQuantityOrdered())) {
                    Quantity quantity = FhirUtils.createQuantity(order.getQuantityOrdered(), null);
                    fhirMedicationPrescriptionDispenseComponent.setQuantity(quantity);
                }
            }
        }
    }

    /**
     * This method extracts daysSupply, fillsAllowed from vista and transform it into fhir
     * MedicationPrescriptionDispenseComponent expectedSupplyDuration, and numberOfRepeatsAllowed.
     *
     * @param fhirMedicationPrescriptionDispenseComponent the fhir medication prescription dispense component
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     */
    protected static void transformExpectedSupplyNumberOfRepeats(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                Duration d = FhirUtils.createDuration(NumberUtils.createBigDecimal(order.getDaysSupply()), null, null, null);
                Integer fillsAllowed = NumberUtils.toInt(order.getFillsAllowed());
                try {
                    fhirMedicationPrescriptionDispenseComponent.setExpectedSupplyDuration(d);
                    fhirMedicationPrescriptionDispenseComponent.setNumberOfRepeatsAllowedSimple(fillsAllowed);
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * This method extracts uid from vista and transform it into fhir MedicationPrescription medication.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     * @param parentContainer the parent container
     */
    protected static void transformMedication(MedicationPrescription fhirMedicationPrescription, MedResult medResult, Resource parentContainer) {
        if (medResult != null) {
            Medication childResource = MedVistaToFhirMedication.transformOneMedication(medResult, parentContainer);
            if (childResource != null) {
                ResourceReference ref = FhirUtils.createLocalResourceReference(parentContainer, childResource);
                if (isNotNullish(medResult.getName())) {
                    ref.setDisplaySimple(medResult.getName());
                }
                fhirMedicationPrescription.setMedication(ref);
            }
        }
    }

    /**
     * This method extracts ordered from vista and transform in into fhir MedicationPrescription dateWritten.
     *
     * @param fhirMedicationPrescription the fhir medication prescription
     * @param medResult the med result
     * @throws ModelTransformException the model transform exception
     */
    protected static void transformDateWritten(MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        fhirMedicationPrescription.setDateWrittenSimple(null);
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
            String fhirDateTimeString = FhirUtils.transformHL7V2DateTimeToFhirDateTime(order.getOrdered());
            DateTime fhirDateTime = FhirUtils.createFhirDateTime(fhirDateTimeString);
            fhirMedicationPrescription.setDateWritten(fhirDateTime);
            }
        }
    }
}
