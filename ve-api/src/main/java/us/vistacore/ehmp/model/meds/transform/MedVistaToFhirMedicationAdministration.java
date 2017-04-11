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
import org.hl7.fhir.instance.model.MedicationAdministration;
import org.hl7.fhir.instance.model.MedicationAdministration.MedicationAdminStatus;
import org.hl7.fhir.instance.model.MedicationAdministration.MedicationAdministrationDosageComponent;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
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
 * The Class MedVistaToFhirMedicationAdministration.
 */
public final class MedVistaToFhirMedicationAdministration {

    /** The Constant LOGGER. */
    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationAdministration.class);

    /** The Constant MED_RESULTS_UID_IDENTIFIER_SYSTEM. */
    public static final String MED_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant MED_EXTENSION_URL_PREFIX. */
    protected static final String MED_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#";
    protected static final String QUANTITY_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#units";
    protected static final String SCHEDULE_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#scheduleName";

    protected static final List<String> MEDICATIONADMINISTRATION_MED_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("supply")
            .add("kind")
            .build();

    protected static final List<String> MEDICATIONADMINISTRATION_ORDERS_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("orderUid")
            .add("pharmacistUid")
            .add("pharmacistName")
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
            .add("ivRate")
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
     * Instantiates a new med vista to fhir medication administration.
     */
    protected MedVistaToFhirMedicationAdministration() {
    }

    /**
     * Transform all In-Patient and IV Medication VPR records into FHIR MedicationAdministration records.
     *
     * @param vprMedicationsRpcOutput the vpr medications rpc output
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the list
     */
    public static List<MedicationAdministration> transform(VPRMedicationsRpcOutput vprMedicationsRpcOutput, VistaPatientIdentity oVistaPatientIdentity) {
        List<MedicationAdministration> fhirResourceList = new ArrayList<MedicationAdministration>();

        if ((vprMedicationsRpcOutput != null) && (vprMedicationsRpcOutput.getData() != null) && (isNotNullish(vprMedicationsRpcOutput.getData().getItems()))) {
            for (MedResult medResult : vprMedicationsRpcOutput.getData().getItems()) {
                MedicationAdministration fhirMedicationAdministration = transformOneMedicationAdministration(medResult, oVistaPatientIdentity);
                if (fhirMedicationAdministration != null) {
                    fhirResourceList.add(fhirMedicationAdministration);
                }
            }
        }
        return fhirResourceList;
    }

    /**
     * Transform one medication administration.
     *
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the medication administration
     */
    protected static MedicationAdministration transformOneMedicationAdministration(MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) {

        if (medResult == null || NullChecker.isNullish(medResult.getVaType()) || !(medResult.getVaType().equals("I") || medResult.getVaType().equals("V"))) {
            return null;
        }

        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();

        try {
            MedicationPrescription medicationPrescription = transformPrescription(fhirMedicationAdministration, medResult, oVistaPatientIdentity);
            transformIdentifier(fhirMedicationAdministration, medResult);
            transformEncounter(fhirMedicationAdministration, medResult, medicationPrescription);
            transformExtensions(fhirMedicationAdministration, medResult);
            transformStatus(fhirMedicationAdministration, medResult);
            transformWhenGiven(fhirMedicationAdministration, medResult);
            transformDosageExtensions(fhirMedicationAdministration, medResult);
            transformDosageQuantity(fhirMedicationAdministration, medResult);
            transformDosageRoute(fhirMedicationAdministration, medResult);
            transformScheduleName(fhirMedicationAdministration, medResult);
        } catch (ModelTransformException e) {
            LOGGER.error(e.getMessage(), e);
            return null;
        }

        return fhirMedicationAdministration;
    }

    /**
     * Transform encounter.
     *
     * @param fhirMedicationAdministration the fhir medication administration
     * @param medResult the med result
     * @param medicationPrescription the medication prescription
     * @throws ModelTransformException the model transform exception
     */
    protected static void transformEncounter(MedicationAdministration fhirMedicationAdministration, MedResult medResult, MedicationPrescription medicationPrescription) throws ModelTransformException {
        if (medicationPrescription != null && medicationPrescription.getEncounter() != null) {
            fhirMedicationAdministration.setEncounter(medicationPrescription.getEncounter());
        }
    }


    /**
     * Transform authorizing prescription.
     *
     * @param fhirMedicationAdministration the fhir medication administration
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the medication prescription
     */
    protected static MedicationPrescription transformPrescription(MedicationAdministration fhirMedicationAdministration, MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) {
        MedicationPrescription medicationPrescription = MedVistaToFhirMedicationPrescription.transformOneMedicationPrescription(medResult, oVistaPatientIdentity, fhirMedicationAdministration);
        if (medicationPrescription != null && isNotNullish(medicationPrescription.getXmlId())) {
            ResourceReference ref = FhirUtils.createLocalResourceReference(fhirMedicationAdministration, medicationPrescription);
            fhirMedicationAdministration.setPrescription(ref);
        }
        return medicationPrescription;
    }

    /**
     * Transform extension
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformExtensions(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        FhirUtils.addExtensionsFromBeanProperties(fhirMedicationAdministration, medResult, MED_EXTENSION_URL_PREFIX, MEDICATIONADMINISTRATION_MED_EXTENSION_FIELD_NAMES);
        if (medResult != null && medResult.getOrders() != null) {
             for (Orders order : medResult.getOrders()) {
                 FhirUtils.addExtensionsFromBeanProperties(fhirMedicationAdministration, order, MED_EXTENSION_URL_PREFIX, MEDICATIONADMINISTRATION_ORDERS_EXTENSION_FIELD_NAMES);
             }
        }
    }

    /**
     * Transform status
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformStatus(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getVaStatus() != null) {
            MedicationAdminStatus vaStatus = MEDICATION_ADMIN_STATUS_NAME_MAP.get(medResult.getVaStatus());
            fhirMedicationAdministration.setStatusSimple(vaStatus);
        }
    }

    /**
     * Transform whenGiven
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformWhenGiven(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                try {
                    Calendar start = FhirUtils.createCalendarDateTime(dosage.getStart());
                    Calendar stop = FhirUtils.createCalendarDateTime(dosage.getStop());
                    Period period = FhirUtils.createPeriod(start, stop);
                    fhirMedicationAdministration.setWhenGiven(period);
                } catch (ModelTransformException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Transform dosage extensions
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformDosageExtensions(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        MedicationAdministrationDosageComponent dosageComponent = fhirMedicationAdministration.addDosage();
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

    /**
     * Transform dosage quantity and extension
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformDosageQuantity(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getDose()) && NumberUtils.isNumber(dosage.getDose())) {
                    BigDecimal dose = FhirUtils.createBigDecimal(dosage.getDose());             
                    Quantity q = FhirUtils.createQuantity(dose, dosage.getUnits());
                    fhirMedicationAdministration.addDosage().setQuantity(q);
                }
            }
        }
    }

    /**
     * This method extracts scheduleName from vista and transform it into fhir
     * fhirMedicationAdministrationDosageComponent timing[Schedule] extension.
     *
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformScheduleName(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getScheduleName())) {
                    Extension e = FhirUtils.createExtension(SCHEDULE_EXTENSION_URL_PREFIX, dosage.getScheduleName());
                    Period p = new Period();
                    p.getExtensions().add(e);
                    fhirMedicationAdministration.addDosage().setTiming(p);
                }
            }
        }
    }

    /**
     * Transform dosage route
     * @param fhirMedicationAdministration
     * @param medResult
     */
    protected static void transformDosageRoute(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage :  medResult.getDosages()) {
                CodeableConcept codeableConcept = FhirUtils.createCodeableConcept(dosage.getRouteName());
                fhirMedicationAdministration.addDosage().setRoute(codeableConcept);
            }
        }
    }
    
    /**
     * Transform identifier.
     *
     * @param fhirMedicationAdministration the fhir medication administration
     * @param medResult the med result
     */
    protected static void transformIdentifier(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        fhirMedicationAdministration.getIdentifier().add((FhirUtils.createIdentifier(MED_RESULTS_UID_IDENTIFIER_SYSTEM, medResult.getUid())));
    }
}
