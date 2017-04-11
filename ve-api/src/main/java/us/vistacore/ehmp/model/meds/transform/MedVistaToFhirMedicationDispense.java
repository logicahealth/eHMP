package us.vistacore.ehmp.model.meds.transform;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.MedicationDispense;
import org.hl7.fhir.instance.model.MedicationDispense.MedicationDispenseDispenseComponent;
import org.hl7.fhir.instance.model.MedicationDispense.MedicationDispenseDispenseDosageComponent;
import org.hl7.fhir.instance.model.MedicationDispense.MedicationDispenseStatus;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.meds.Fills;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import com.google.common.collect.ImmutableList;

/**
 * The Class MedVistaToFhirMedicationDispense.
 */
public final class MedVistaToFhirMedicationDispense {

    /** The Constant LOGGER. */
    private static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationDispense.class);

    /** The Constant MED_RESULTS_UID_IDENTIFIER_SYSTEM. */
    public static final String MED_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES. */
    protected static final List<String> MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES = ImmutableList.<String>builder()
            .add("type")
            .add("lastFilled")
            .build();

    /** The Constant MEDICATION_DISPENSE_EXTENSION_URL_PREFIX. */
    protected static final String MEDICATION_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#";


    /** The Constant MEDICATION_DISPENSE_FILL_EXTENSION_PRODUCT_FIELD_NAMES. */
    protected static final List<String> MEDICATION_DISPENSE_FILL_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("daysSupplyDispensed")
            .add("routing")
            .add("partial")
            .build();

    /** The Constant MEDICATION_DISPENSE_ORDER_EXTENSION_FIELD_NAMES. */
    protected static final List<String> MEDICATION_DISPENSE_ORDER_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("fillCost")
            .add("fillsRemaining")
            .add("vaRouting")
            .build();
    
    /** The Constant MEDICATION_DISPENSE_ORDER_EXTENSION_FIELD_NAMES. */
    protected static final List<String> MEDICATION_DISPENSE_MED_EXTENSION_FIELD_NAMES = ImmutableList.<String>builder()
            .add("units")
            .add("imo")
            .build();
    
    /**
     * Instantiates a new med vista to fhir medication dispense (Private for Utility class use only)
     */
    private MedVistaToFhirMedicationDispense() {
    }

    /**
     * Gets the medication dispense identifer.
     *
     * @param medResult the med result
     * @param fill the fill
     * @return the medication dispense identifer
     */
    public static String getMedicationDispenseIdentifer(MedResult medResult, Fills fill) {
        return medResult.getUid() + ":fill:" + fill.getDispenseDate();
    }

    /**
     * Transform Out-Patient Medication VPR records into FHIR MedicationDispense records.
     *
     * @param vprMedicationsRpcOutput the vpr medications rpc output
     * @param oVistaPatientIdentity the o vista patient identity
     * @return The FHIR object list of the medication dispense reports
     */
    public static List<MedicationDispense> transform(VPRMedicationsRpcOutput vprMedicationsRpcOutput, VistaPatientIdentity oVistaPatientIdentity) {
        List<MedicationDispense> fhirResourceList = new ArrayList<MedicationDispense>();

        if ((vprMedicationsRpcOutput != null) && (vprMedicationsRpcOutput.getData() != null) && (isNotNullish(vprMedicationsRpcOutput.getData().getItems()))) {
            for (MedResult medResult : vprMedicationsRpcOutput.getData().getItems()) {
                MedicationDispense fhirMedicationDispense = transformOneMedicationDispense(medResult, oVistaPatientIdentity);
                if (fhirMedicationDispense != null) {
                    fhirResourceList.add(fhirMedicationDispense);
                }
            }
        }
        return fhirResourceList;
    }

    /**
     * Transform one medication dispense.
     *
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the medication dispense
     */
    protected static MedicationDispense transformOneMedicationDispense(MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) {
        if (medResult == null || NullChecker.isNullish(medResult.getVaType()) || !medResult.getVaType().equals("O")) {
            return null;
        }

        MedicationDispense fhirMedicationDispense = new MedicationDispense();

        transformIdentifier(fhirMedicationDispense, medResult);
        transformStatus(fhirMedicationDispense, medResult);
        transformPatient(fhirMedicationDispense, oVistaPatientIdentity);
        transformAuthorizingPrescription(fhirMedicationDispense, medResult, oVistaPatientIdentity);
        transformDispense(fhirMedicationDispense, medResult);
        transformExtensions(fhirMedicationDispense, medResult);
        
        return fhirMedicationDispense;
    }

    /**
     * Transform identifier.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param medResult the med result
     */
    protected static void transformIdentifier(MedicationDispense fhirMedicationDispense, MedResult medResult) {
        fhirMedicationDispense.setIdentifier(FhirUtils.createIdentifier(MED_RESULTS_UID_IDENTIFIER_SYSTEM, medResult.getUid()));
    }

    /**
     * Transform status.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param medResult the med result
     */
    protected static void transformStatus(MedicationDispense fhirMedicationDispense, MedResult medResult) {
        fhirMedicationDispense.setStatusSimple(MedicationDispenseStatus.completed);
    }

    /**
     * Transform patient.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param oVistaPatientIdentity the o vista patient identity
     */
    protected static void transformPatient(MedicationDispense fhirMedicationDispense, VistaPatientIdentity oVistaPatientIdentity) {
        String sResourceReferenceId = "Patient/" + oVistaPatientIdentity.getEnterprisePatientIdentifier();
        ResourceReference ref = FhirUtils.createResourceReferenceExternal(sResourceReferenceId);
        fhirMedicationDispense.setPatient(ref);


    }

    /**
     * Transform authorizing prescription.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param medResult the med result
     * @param oVistaPatientIdentity the o vista patient identity
     */
    protected static void transformAuthorizingPrescription(MedicationDispense fhirMedicationDispense, MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) {
        MedicationPrescription fhirMedicationPrescription = MedVistaToFhirMedicationPrescription.transformOneMedicationPrescription(medResult, oVistaPatientIdentity, fhirMedicationDispense);
        if (fhirMedicationPrescription != null) {
            ResourceReference ref = FhirUtils.createLocalResourceReference(fhirMedicationDispense, fhirMedicationPrescription);
            fhirMedicationDispense.getAuthorizingPrescription().add(ref);
            fhirMedicationDispense.setDispenser(ref);
        }
    }

    /**
     * Transform dispense.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param medResult the med result
     */
    protected static void transformDispense(MedicationDispense fhirMedicationDispense, MedResult medResult) {
        MedicationDispenseDispenseComponent dispense = null;

        if (medResult.getFills() != null && medResult.getFills().size() > 0) {
            for (Fills fill : medResult.getFills()) {
                dispense = fhirMedicationDispense.addDispense();
                try {
                    String sDateTime = FhirUtils.transformHL7V2DateToFhirDateTime(fill.getDispenseDate());
                    dispense.setWhenHandedOver(FhirUtils.createFhirDateTime(sDateTime));
                } catch (ModelTransformException e) {
                    LOGGER.error(e.getMessage(), e);
                }

                MedicationDispenseDispenseDosageComponent dosage = dispense.addDosage();
                BigDecimal quantityDispensed = FhirUtils.createBigDecimal(fill.getQuantityDispensed());
                
                if (quantityDispensed != null) {
                    dosage.setQuantity(FhirUtils.createQuantity(quantityDispensed, null));
                }
                
                if (isNotNullish(fill.getReleaseDate())) {
                    try {
                        DateAndTime releasedDate = DateAndTime.parseV3(fill.getReleaseDate());
                        dispense.setWhenPreparedSimple(releasedDate);
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                }
                
                if (isNotNullish(fill.getQuantityDispensed())) {
                    BigDecimal qd = FhirUtils.createBigDecimal(fill.getQuantityDispensed());
                    Quantity quantityDispense = FhirUtils.createQuantity(qd, null);
                    dispense.setQuantity(quantityDispense);
                }

                FhirUtils.addExtensionsFromBeanProperties(dispense, fill,
                        MEDICATION_EXTENSION_URL_PREFIX,
                        MEDICATION_DISPENSE_FILL_EXTENSION_FIELD_NAMES);
            }
        }
        
        if (medResult.getOrders() != null) {
            int index = 0;
            for (Orders order : medResult.getOrders()) {
                //extensions from orders only used if there is a corresponding fill record
                if (fhirMedicationDispense.getDispense().size() > index) {
                    dispense = fhirMedicationDispense.getDispense().get(index);
                    if (dispense != null) {
                        FhirUtils.addExtensionsFromBeanProperties(dispense, order,
                                MEDICATION_EXTENSION_URL_PREFIX,
                                MEDICATION_DISPENSE_ORDER_EXTENSION_FIELD_NAMES);
                    }
                }
                index++;
            }
        }
        
        if (medResult != null) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedicationDispense, medResult,
                        MEDICATION_EXTENSION_URL_PREFIX,
                        MEDICATION_DISPENSE_MED_EXTENSION_FIELD_NAMES);
        }
        
    }

    /**
     * Transform extensions.
     *
     * @param fhirMedicationDispense the fhir medication dispense
     * @param medResult the med result
     */
    protected static void transformExtensions(MedicationDispense fhirMedicationDispense, MedResult medResult) {
            FhirUtils.addExtensionsFromBeanProperties(fhirMedicationDispense, medResult,
                    MEDICATION_EXTENSION_URL_PREFIX,
                    MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES);
    }
}
