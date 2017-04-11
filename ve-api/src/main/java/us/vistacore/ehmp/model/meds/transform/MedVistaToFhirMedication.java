package us.vistacore.ehmp.model.meds.transform;

import com.google.common.collect.ImmutableList;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.Medication.MedicationProductIngredientComponent;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Substance;
import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Products;
import us.vistacore.ehmp.util.FhirUtils;

import java.util.List;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;


/**
 * The Class MedVistaToFhirMedication.
 */
public final class MedVistaToFhirMedication {

    /** The Constant MEDICATION_ID_PREFIX. */
    public static final String MEDICATION_ID_PREFIX = "Medication/";

    /** The Constant MED_RESULTS_UID_IDENTIFIER_SYSTEM. */
    public static final String MED_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant MEDICATION_EXTENSION_PRODUCT_FIELD_NAMES. */
    protected static final List<String> MEDICATION_EXTENSION_PRODUCT_FIELD_NAMES = ImmutableList.<String>builder()
            .add("drugClassCode")
            .add("drugClassName")
            .add("suppliedCode")
            .add("suppliedName")
            .add("strength")
            .add("ingredientRXNCode")
            .add("volume")
            .build();

    /** The Constant MEDICATION_EXTENSION_URL_PREFIX. */
    protected static final String MEDICATION_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/med#";

    /**
     * Instantiates a new med vista to fhir medication.
     */
    private MedVistaToFhirMedication() {
    }

    /**
     * Transform one medication.
     *
     * @param medResult the med result
     * @param oTopParentResource the o top parent resource
     * @return the medication
     */
    protected static Medication transformOneMedication(MedResult medResult, Resource oTopParentResource) {
        Medication fhirMedication = new Medication();
        if (medResult != null) {
            transformId(fhirMedication, medResult);
            transformName(fhirMedication, medResult);
            transformCode(fhirMedication, medResult);
            transformProduct(fhirMedication, medResult, oTopParentResource);
            transformExtensions(fhirMedication, medResult);
        }
        return fhirMedication;
    }

    /**
     * Transform id.
     *
     * @param fhirMedication the fhir medication
     * @param medResult the med result
     */
    protected static void transformId(Medication fhirMedication, MedResult medResult) {
        fhirMedication.setXmlId(generateMedicationId(medResult));
    }

    /**
     * Generate medication id.
     *
     * @param medResult the med result
     * @return the string
     */
    protected static String generateMedicationId(MedResult medResult) {
        return MEDICATION_ID_PREFIX +  medResult.getUid();

    }


    /**
     * Transform name.
     *
     * @param fhirMedication the fhir medication
     * @param medResult the med result
     */
    protected static void transformName(Medication fhirMedication, MedResult medResult) {
        String name = medResult.getName();
        if (name != null) {
            fhirMedication.setNameSimple(name);

        }
    }

    /**
     * Transform code.
     *
     * @param fhirMedication the fhir medication
     * @param medResult the med result
     */
    protected static void transformCode(Medication fhirMedication, MedResult medResult) {
        CodeableConcept codeableConcept = new CodeableConcept();
        boolean bHaveData = false;
        String name = null;
        if (medResult != null) {
            if (isNotNullish(medResult.getName())) {
                name = medResult.getName();
                codeableConcept = FhirUtils.createCodeableConcept(name);
                bHaveData = true;
            }

            if (medResult.getRxncodes() != null) {
                for (String rxncode : medResult.getRxncodes()) {
                    Coding coding = new Coding();
                    coding.setCodeSimple(rxncode);
                    codeableConcept.getCoding().add(coding);
                    bHaveData = true;
                }
            }

            if (isNotNullish(medResult.getCodesList())) {
                for (TerminologyCode oCode : medResult.getCodesList()) {
                    if (oCode != null) {
                        Coding oCoding = FhirUtils.createCoding(oCode.getCode(), oCode.getDisplay(), oCode.getSystem());
                        codeableConcept.getCoding().add(oCoding);
                        bHaveData = true;
                    }
                }
            }
        }

        if (bHaveData) {
            fhirMedication.setCode(codeableConcept);
        }

    }

    /**
     * Transform product.
     *
     * @param fhirMedication the fhir medication
     * @param medResult the med result
     * @param oTopParentResource the o top parent resource
     */
    protected static void transformProduct(Medication fhirMedication, MedResult medResult, Resource oTopParentResource) {
        CodeableConcept codeableConcept = null;
        
        if (medResult.getProducts() != null) {
            Medication.MedicationProductComponent medicationProductComponent = new Medication.MedicationProductComponent();

            String productFormName = medResult.getProductFormName();
            String productFormCode = medResult.getProductFormCode();
            if (isNotNullish(productFormName)) {
                if (isNotNullish(productFormCode)) {
                    codeableConcept = FhirUtils.createCodeableConcept(productFormName, productFormCode, MED_RESULTS_UID_IDENTIFIER_SYSTEM);
                    
                } else {
                    codeableConcept = FhirUtils.createCodeableConcept(productFormName);
                }
                medicationProductComponent.setForm(codeableConcept);
            }
            for (Products product : medResult.getProducts()) {

                Substance substance = createSubstanceFromProducts(product);

                ResourceReference resourceReference = FhirUtils.createLocalResourceReference(oTopParentResource, substance);
                MedicationProductIngredientComponent medicationProductIngredientComponent = medicationProductComponent.addIngredient();
                medicationProductIngredientComponent.setItem(resourceReference);
            }

            fhirMedication.setProduct(medicationProductComponent);
        }
    }

    /**
     * Creates the substance from products.
     *
     * @param product the product
     * @return the substance
     */
    protected static Substance createSubstanceFromProducts(Products product) {
        CodeableConcept codeableConcept = null;
        Substance substance = new Substance();

        codeableConcept = FhirUtils.createCodeableConcept(product.getIngredientName());

        Coding coding = codeableConcept.addCoding();
        coding.setCodeSimple(product.getIngredientCode());
        coding.setDisplaySimple(product.getIngredientCodeName());
        coding.setSystemSimple(MED_RESULTS_UID_IDENTIFIER_SYSTEM);

        //if we have a ingredientRole with urn:sct, we can use it as the type
        if (product.getIngredientRole() != null && product.getIngredientRole().startsWith("urn:sct:")) {
            Coding sctCoding = codeableConcept.addCoding();
            sctCoding.setCodeSimple(product.getIngredientRole());
            sctCoding.setDisplaySimple(product.getIngredientName());
            sctCoding.setSystemSimple("SNOMED-CT");
        }

        substance.setType(codeableConcept);
        substance.setDescriptionSimple(product.getIngredientName());


        return substance;
    }


    /**
     * Transform extensions.
     *
     * @param fhirMedication the fhir medication
     * @param medResult the med result
     */
    protected static void transformExtensions(Medication fhirMedication, MedResult medResult) {
        if (medResult.getProducts() != null) {
            for (Products product : medResult.getProducts()) {
                FhirUtils.addExtensionsFromBeanProperties(fhirMedication, product,
                        MEDICATION_EXTENSION_URL_PREFIX,
                        MEDICATION_EXTENSION_PRODUCT_FIELD_NAMES);
            }
        }
    }



}
