package us.vistacore.ehmp.model.meds.transform;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.MedicationAdministration.MedicationAdminStatus;
import org.hl7.fhir.instance.model.MedicationStatement;
import org.hl7.fhir.instance.model.MedicationStatement.MedicationStatementDosageComponent;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Schedule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * The Class MedVistaToFhirMedicationStatement.
 */
public final class MedVistaToFhirMedicationStatement {

    /** The Constant LOGGER. */
    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationAdministration.class);

    /** The Constant MED_RESULTS_UID_IDENTIFIER_SYSTEM. */
    public static final String MED_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant MED_EXTENSION_URL_PREFIX. */
    protected static final String MED_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#";
    protected static final String QUANTITY_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#units";
    protected static final String SCHEDULE_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#scheduleName";
    public static final String PATIENT_PREFIX = "Patient/";

    protected static final List<String> MEDICATIONSTATEMENT_MED_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("kind")
            .add("supply")
            .add("vaStatus")
            .build();

    protected static final List<String> MEDICATIONSTATEMENT_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("pharmacistUid")
            .add("pharmacistName")
            .add("providerUid")
            .add("providerName")
            .add("orderUid")
            .add("locationUid")
            .add("locationName")
            .build();

    /** Fields from vista dosages to add as extension for MedicationPrescriptionDosageInstructionComponent. */
    protected static final List<String> DOSAGE_MED_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("imo")
            .build();

    /** Fields from vista dosages to add as extension for MedicationPrescriptionDosageInstructionComponent. */
    protected static final List<String> DOSAGE_DOSAGES_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("relativeStart")
            .add("relativeStop")
            .add("doseVal")
            .build();

    /** Fields from vista orders to add as extension for MedicationPrescriptionDosageInstructionComponent. */
    protected static final List<String> DOSAGE_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("predecessor")
            .add("successor")
            .build();

    /** The Constant MED_STATUS_NAME_MAP. */
    protected static final Map<String, MedicationAdminStatus> MEDICATION_ADMIN_STATUS_NAME_MAP = ImmutableMap.<String, MedicationAdminStatus>builder()
            .put("DISCONTINUED", MedicationAdminStatus.stopped)
            .put("COMPLETE", MedicationAdminStatus.completed)
            .put("HOLD", MedicationAdminStatus.onHold)
            .put("FLAGGED", MedicationAdminStatus.onHold)
            .put("PENDING", MedicationAdminStatus.inProgress)
            .put("ACTIVE", MedicationAdminStatus.inProgress)
            .put("EXPIRED", MedicationAdminStatus.completed)
            .put("DELAYED", MedicationAdminStatus.onHold)
            .put("UNRELEASED", MedicationAdminStatus.inProgress)
            .put("DISCONTINUED/EDIT", MedicationAdminStatus.stopped)
            .put("CANCELLED", MedicationAdminStatus.stopped)
            .put("LAPSED", MedicationAdminStatus.stopped)
            .put("RENEWED", MedicationAdminStatus.inProgress)
            .put("NO STATUS", MedicationAdminStatus.onHold)
            .build();

    /**
     * Instantiates a new med vista to fhir medication statement.
     */
    MedVistaToFhirMedicationStatement() {
    }

    /**
     * Transform all Non-VA Medication VPR records into FHIR MedicationStatement records.
     *
     * @param vprMedicationsRpcOutput the vpr medications rpc output
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the list
     */
    public static List<MedicationStatement> transform(VPRMedicationsRpcOutput vprMedicationsRpcOutput, VistaPatientIdentity oVistaPatientIdentity) {
        List<MedicationStatement> fhirResourceList = new ArrayList<MedicationStatement>();

        if ((vprMedicationsRpcOutput != null) && (vprMedicationsRpcOutput.getData() != null) && (isNotNullish(vprMedicationsRpcOutput.getData().getItems()))) {
            for (MedResult medResult : vprMedicationsRpcOutput.getData().getItems()) {
                MedicationStatement fhirMedicationStatement = transformOneMedicationStatement(medResult, oVistaPatientIdentity);
                if (fhirMedicationStatement != null) {
                    fhirResourceList.add(fhirMedicationStatement);
                }
            }
        }
        return fhirResourceList;
    }

    /**
     * Transform one medication statement.
     *
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the medication administration
     */
    protected static MedicationStatement transformOneMedicationStatement(MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) {

        if (medResult == null || NullChecker.isNullish(medResult.getVaType()) || !(medResult.getVaType().equals("N"))) {
            return null;
        }

        MedicationStatement fhirMedicationStatement = new MedicationStatement();

            transformExtensions(fhirMedicationStatement, medResult);
            transformPatient(fhirMedicationStatement, oVistaPatientIdentity, medResult);
            transformIdentifier(fhirMedicationStatement, medResult);
            transformWhenGiven(fhirMedicationStatement, medResult);
            transformDosageExtensions(fhirMedicationStatement, medResult);
            transformDosageQuantity(fhirMedicationStatement, medResult);
            transformDosageRoute(fhirMedicationStatement, medResult);
            transformScheduleName(fhirMedicationStatement, medResult);
            transformMedication(fhirMedicationStatement, medResult);

        return fhirMedicationStatement;
    }


    /**
     * Transform authorizing prescription.
     *
     * @param fhirMedicationAdministration the fhir medication administration
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the medication prescription
     */
    protected static Medication transformMedication(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        Medication medication = MedVistaToFhirMedication.transformOneMedication(medResult, fhirMedicationStatement);
        if (medication != null && isNotNullish(medication.getXmlId())) {
            ResourceReference ref = FhirUtils.createLocalResourceReference(fhirMedicationStatement, medication);
            fhirMedicationStatement.setMedication(ref);
        }
        return medication;
    }

//    MedicationStatement.extension[kind].url N/A
//    MedicationStatement.extension[kind].valueString                       data.items[x].kind
//    MedicationStatement.extension[administrations].url  N/A
//    MedicationStatement.extension[administrations].valueString            data.items[x].administrations
//    MedicationStatement.extension[supply].url   N/A
//    MedicationStatement.extension[supply].valueString                     data.items[x].supply
//    MedicationStatement.extension[status].url   N/A
//    MedicationStatement.extension[status].valueString                     data.items[x].vaStatus

//    MedicationStatement.extension[ReleasingPharmacistUid].url   N/A
//    MedicationStatement.extension[ReleasingPharmacistUid].valueString     data.items[x].orders[x].pharmacistUid
//    MedicationStatement.extension[ReleasingPharmacistName].url  N/A
//    MedicationStatement.extension[ReleasingPharmacistName].valueString    data.items[x].orders[x].pharmacistName
//    MedicationStatement.extension[providerUid].url  N/A
//    MedicationStatement.extension[providerUid].valueString                data.items[x].orders[x].providerUid
//    MedicationStatement.extension[providerName].url N/A
//    MedicationStatement.extension[providerName].valueString               data.items[x].orders[x].providerName
//    MedicationStatement.extension[orderUid].url N/A
//    MedicationStatement.extension[orderUid].valueString                   data.items[x].orders[x].orderUid
//    MedicationStatement.extension[locationUid].url  N/A
//    MedicationStatement.extension[locationUid].valueString                data.items[x].orders[x].locationUid
//    MedicationStatement.extension[locationName].url N/A
//    MedicationStatement.extension[locationName].valueString               data.items[x].orders[x].locationName

    /**
     * Transform dosage extensions
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformExtensions(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null) {
            if (isNotNullish(medResult.getImo())) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationStatement, medResult, MED_EXTENSION_URL_PREFIX, MEDICATIONSTATEMENT_MED_EXTENSION_FIELD_NAMES);
            }
            if (medResult.getOrders() != null) {
                for (Orders order : medResult.getOrders()) {
                    FhirUtils.addExtensionsFromBeanProperties(fhirMedicationStatement, order, MED_EXTENSION_URL_PREFIX, MEDICATIONSTATEMENT_ORDERS_EXTENSION_FIELD_NAMES);
                }
            }
        }
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

//    contained[Patient].name[HumanName].display                            data.items[x].pid
    /**
     * This method extracts the Patient (DFN) information from the Vista
     * instance and places the information into the FHIR instance.
     *
     * @param fhirMedicationStatement            The FHIR MedicationPrescription created.
     * @param oVistaPatientIdentity            the vista patient identity
     * @param medResult
     * @return the resource reference
     */
    protected static ResourceReference transformPatient(MedicationStatement fhirMedicationStatement, VistaPatientIdentity oVistaPatientIdentity, MedResult medResult) {
        ResourceReference patient = new ResourceReference();
        patient.setDisplaySimple(medResult.getPid());
        String sPatientReference = getPaitentExternalReferenceId(oVistaPatientIdentity);
        if (NullChecker.isNotNullish(sPatientReference)) {
            patient.setReferenceSimple(sPatientReference);
            fhirMedicationStatement.setPatient(patient);
        }
        return patient;
    }

//    MedicationStatement.whenGiven[Period].start                           data.items[x].dosages[x].start
//    MedicationStatement.whenGiven[Period].end                             data.items[x].dosages[x].stop
    /**
     * Transform whenGiven
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformWhenGiven(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                try {
                    if (isNotNullish(dosage.getStart())) {
                        Calendar start = FhirUtils.createCalendarDateTime(dosage.getStart());
                        Period period = FhirUtils.createPeriod(start, null);
                        fhirMedicationStatement.setWhenGiven(period);
                    }
                } catch (ModelTransformException e) {
                    e.printStackTrace();
                }
            }
        }
    }

//    MedicationStatement.dosage[x],extensions[fills][x].url  N/A
//    MedicationStatement.dosage[x],extensions[fills][x].valueString                        data.items[x].fills[x]
//    MedicationStatement.dosage[x].extension[IMO].url    N/A
//    MedicationStatement.dosage[x].extension[IMO].valueString                              data.items[x].IMO

//    MedicationStatement.dosage[x].extension[successor].url  N/A
//    MedicationStatement.dosage[x].extension[successor].valueString                        data.items[x].orders[x].successor
//    MedicationStatement.dosage[x].extension[predecessor].url    N/A
//    MedicationStatement.dosage[x].extension[predecessor].valueString                      data.items[x].orders[x].predecessor
//    MedicationStatement.dosage[x].extension[doseVal].url    N/A
//    MedicationStatement.dosage[x].extension[doseVal].valueString                          data.items[x].orders[x].doseval

//    MedicationStatement.dosage[x].extension[relativeStart].url  N/A
//    MedicationStatement.dosage[x].extension[relativeStart].valueString                    data.items[x].dosage[x].relativeStart
//    MedicationStatement.dosage[x].extension[relativeStop].url   N/A
//    MedicationStatement.dosage[x].extension[relativeStop].valueString                     data.items[x].dosage[x].relativeStop
    /**
     * Transform dosage extensions
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformDosageExtensions(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        MedicationStatementDosageComponent dosageComponent = fhirMedicationStatement.addDosage();
        if (medResult != null) {
            if (isNotNullish(medResult.getImo())) {
                FhirUtils.addExtensionsFromBeanProperties(dosageComponent, medResult, MED_EXTENSION_URL_PREFIX, DOSAGE_MED_EXTENSION_FIELD_NAMES);
            }
            if (medResult.getDosages() != null) {
                for (Dosages dosage : medResult.getDosages()) {
                    FhirUtils.addExtensionsFromBeanProperties(dosageComponent, dosage, MED_EXTENSION_URL_PREFIX, DOSAGE_DOSAGES_EXTENSION_FIELD_NAMES);
                }
            }
            if (medResult.getOrders() != null) {
                for (Orders order : medResult.getOrders()) {
                    FhirUtils.addExtensionsFromBeanProperties(dosageComponent, order, MED_EXTENSION_URL_PREFIX, DOSAGE_ORDERS_EXTENSION_FIELD_NAMES);
                }
            }
        }
    }

//    MedicationStatement.dosage[x].timing[Schedule].extension[scheduleName].url    N/A
//    MedicationStatement.dosage[x].timing[Schedule].extension[scheduleName].valueString      data.items[x].dosages[x].scheduleName
    /**
     * This method extracts scheduleName from vista and transform it into fhir
     * fhirMedicationAdministrationDosageComponent timing[Schedule] extension.
     *
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformScheduleName(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getScheduleName())) {
                    Extension e = FhirUtils.createExtension(SCHEDULE_EXTENSION_URL_PREFIX, dosage.getScheduleName());
                    Schedule s = new Schedule();
                    s.getExtensions().add(e);
                    fhirMedicationStatement.addDosage().setTiming(s);
                }
            }
        }
    }

//    MedicationStatement.dosage[x].quantity.extension[units].url N/A
//    MedicationStatement.dosage[x].quantity.extension[units].valueString                   data.items[x].dosages[x].units

    /**
     * Transform dosage quantity and extension
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformDosageQuantity(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getDose()) && NumberUtils.isNumber(dosage.getDose())) {
                    BigDecimal doseVal = FhirUtils.createBigDecimal(dosage.getDose());
                    Quantity quantity = FhirUtils.createQuantity(doseVal, dosage.getUnits());
                    fhirMedicationStatement.addDosage().setQuantity(quantity);
                }
            }
        }
    }

//    MedicationStatement.dosage[x].route                                                   data.items[x].dosages[x].routeName
    /**
     * Transform dosage route
     * @param fhirMedicationStatement
     * @param medResult
     */
    protected static void transformDosageRoute(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage :  medResult.getDosages()) {
                if (isNotNullish(dosage.getRouteName())) {
                    CodeableConcept codeableConcept = FhirUtils.createCodeableConcept(dosage.getRouteName());
                    fhirMedicationStatement.addDosage().setRoute(codeableConcept);
                }
            }
        }
    }
    
    /**
     * Transform identifier.
     *
     * @param fhirMedicationStatement the fhir medication statement
     * @param medResult the med result
     */
    protected static void transformIdentifier(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        fhirMedicationStatement.getIdentifier().add((FhirUtils.createIdentifier(MED_RESULTS_UID_IDENTIFIER_SYSTEM, medResult.getUid())));
    }
}
