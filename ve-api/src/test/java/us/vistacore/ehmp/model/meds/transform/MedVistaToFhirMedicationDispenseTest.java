package us.vistacore.ehmp.model.meds.transform;

/**
 * This class tests the MedVistaToFhirMedicationDispense class
 *
 */

import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.MedicationDispense;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Type;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.meds.Fills;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.MedicationData;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

@RunWith(Parameterized.class)
public class MedVistaToFhirMedicationDispenseTest {

    private static final SimpleDateFormat FILL_DATE_FORMAT = new SimpleDateFormat("yyyyMMdd");
    private static final SimpleDateFormat DISPENSE_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");


    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return MedicationsGenerator.create();
    }

    private static MedResult emptyMedResult = new MedResult();

    private MedResult medResult;


    public MedVistaToFhirMedicationDispenseTest(MedResult medicationResultInput, String dfn) {
        this.medResult = medicationResultInput;
    }

    @Before
    public void setUp() throws Exception { }

    @Test
    public void testGetMedicationDispenseIdentifer() {
        for (Fills fill : medResult.getFills()) {
            String expectedId = medResult.getUid() + ":fill:" + fill.getDispenseDate();
            assertEquals("The medication dispense id should match the expected format", expectedId,
                    MedVistaToFhirMedicationDispense.getMedicationDispenseIdentifer(medResult, fill));
        }
    }

    @Test
    public void testTransform() throws ModelTransformException {

        MedicationData data = new MedicationData();
        data.addItems(medResult);

        VPRMedicationsRpcOutput rpcOutput = new VPRMedicationsRpcOutput();
        rpcOutput.setApiVersion("1.0");
        rpcOutput.setData(data);

        List<MedicationDispense> results = MedVistaToFhirMedicationDispense.transform(rpcOutput, new VistaPatientIdentity());
        if (medResult != null && NullChecker.isNotNullish(medResult.getVaType()) && medResult.getVaType().equals("O")) {
            assertEquals("There should be a single Dispense Record", 1, results.size());
            MedicationDispense medicationDispense = results.iterator().next();

            List<MedicationPrescription> prescriptionList = FhirUtils.getContainedResources(medicationDispense, MedicationPrescription.class);
            assertEquals("There should be a single medication prescription", 1, prescriptionList.size());

            List<Medication> medicationList = FhirUtils.getContainedResources(medicationDispense, Medication.class);
            assertEquals("There should be a single medication", 1, medicationList.size());
        } else {
            assertEquals("There should not be no Dispense Record", 0, results.size());
        }

    }

    @Test
    public void testTransformOneMedicationDispense() throws ModelTransformException {


            MedicationDispense medDispense = MedVistaToFhirMedicationDispense.transformOneMedicationDispense(medResult, new VistaPatientIdentity());

            if (medResult.getVaType() != null && medResult.getVaType().equals("O")) {
                verifyTransformIdentifier(medDispense, medResult);
                verifyTransformStatus(medDispense, medResult);
                verifyTransformPatient(medDispense, medResult);
                verifyTransformDispenser(medDispense, medResult);
                verifyTransformAuthorizingPrescription(medDispense, medResult);
                verifyTransformDispense(medDispense, medResult);
                verifyTransformSubstitution(medDispense, medResult);
                verifyTransformExtensions(medDispense, medResult);
            } else {
                assertNull("vpr record is not a outpatient record, so no MedicationDispense object.", medDispense);
            }


    }

    @Test
    public void testTransformIdentifier() {
        doTestTransformIdentifier(medResult);
    }

    @Test
    public void testTransformIdentifierEmpty() {
        doTestTransformIdentifier(emptyMedResult);
    }

    public void doTestTransformIdentifier(MedResult result) {
        MedicationDispense medDispense = new MedicationDispense();
        MedVistaToFhirMedicationDispense.transformIdentifier(medDispense, result);
        verifyTransformIdentifier(medDispense, result);
    }

    @Test
    public void testTransformStatus() {
        MedicationDispense medDispense = new MedicationDispense();
        MedVistaToFhirMedicationDispense.transformStatus(medDispense, null);
        verifyTransformStatus(medDispense, null);
    }

    @Test
    public void testTransformPatient() {
        MedicationDispense medDispense = new MedicationDispense();
        MedVistaToFhirMedicationDispense.transformPatient(medDispense, new VistaPatientIdentity());
        verifyTransformPatient(medDispense, null);
    }

    @Test
    public void testTransformDispenser() {
        // TODO
    }

    @Test
    public void testTransformAuthorizingPrescription() throws ModelTransformException {
        doTestTransformAuthorizingPrescription(medResult);
    }

    @Test
    public void testTransformAuthorizingPrescriptionEmpty() throws ModelTransformException {
        doTestTransformAuthorizingPrescription(emptyMedResult);
    }

    private void doTestTransformAuthorizingPrescription(MedResult result) throws ModelTransformException {
            MedicationDispense medDispense = new MedicationDispense();
            MedVistaToFhirMedicationDispense.transformAuthorizingPrescription(medDispense, result, new VistaPatientIdentity());
            verifyTransformAuthorizingPrescription(medDispense, result);
    }

    @Test
    public void testTransformDispense() {
        doTestTransformDispense(medResult);
    }

    @Test
    public void testTransformDispenseEmpty() {
        doTestTransformDispense(emptyMedResult);
    }

    private void doTestTransformDispense(MedResult result) {
        MedicationDispense medDispense = new MedicationDispense();
        MedVistaToFhirMedicationDispense.transformDispense(medDispense, result);
        verifyTransformDispense(medDispense, result);
    }

    @Test
    public void testTransformSubstitution() {
        // TODO
    }

    @Test
    public void testTransformExtensions() {
        doTestTransformExtensions(medResult, true);
    }

    @Test
    public void testTransformExtensionsEmpty() {
        doTestTransformExtensions(emptyMedResult, false);
    }

    private void doTestTransformExtensions(MedResult result, boolean expectExtensions) {
        MedicationDispense medDispense = new MedicationDispense();
        MedVistaToFhirMedicationDispense.transformExtensions(medDispense, result);

        if (expectExtensions) {
            verifyTransformExtensions(medDispense, result);
        }
    }

    private void verifyTransformStatus(MedicationDispense medDispense, MedResult result) {
        assertNotNull("The status should not have been null", medDispense.getStatusSimple());
        assertEquals("The status should have been 'completed'", MedicationDispense.MedicationDispenseStatus.completed, medDispense.getStatusSimple());
    }

    private void verifyTransformIdentifier(MedicationDispense medDispense, MedResult result) {

        if (result == null) {
            assertNull("medDispense should be null", medDispense);
            return;
        }

        Identifier identifier = medDispense.getIdentifier();
        if (result.getUid() != null) {
            assertNotNull("The identifier should not have been null", identifier);
        } else {
            assertNull("The identifier should be null", identifier);
        }

    }

    private void verifyTransformPatient(MedicationDispense medDispense, MedResult result) {

        if (medDispense == null) {
            assertNull("result should be null", result);
            return;
        }

        ResourceReference ref = medDispense.getPatient();
        assertNotNull("The patient reference should not have been null", ref);
        assertNotNull("The patient's resource reference should not have been null", ref.getReferenceSimple());
        assertNotEquals("The patient's resource reference should not have been empty", ref.getReferenceSimple(), "");
    }

    private void verifyTransformDispenser(MedicationDispense medDispense, MedResult result) {
        // TODO
    }

    private void verifyTransformAuthorizingPrescription(MedicationDispense medDispense, MedResult result) {

        if (result == null) {
            assertNull("medDispense should be null", medDispense);
            return;
        }

        List<ResourceReference> refs = medDispense.getAuthorizingPrescription();

        assertEquals("There should only be one authorizing prescription", 1, refs.size());

        ResourceReference ref = refs.get(0);

        assertNotNull("The authorizing prescription reference should not have been null", ref);
        assertNotNull("The authorizing prescription's resource reference should not have been null", ref.getReferenceSimple());
        assertNotEquals("The authorizing prescription's resource reference should not have been empty", ref.getReferenceSimple(), "");

    }

    private void verifyTransformDispense(MedicationDispense medDispense, MedResult result) {
        if (result == null) {
            assertNull("medDispense should be null", medDispense);
            return;
        }

        List<MedicationDispense.MedicationDispenseDispenseComponent> dispenseComponents = medDispense.getDispense();

        Iterator<MedicationDispense.MedicationDispenseDispenseComponent> dispenseComponentIter = dispenseComponents.iterator();

        if (result.getFills() == null || result.getFills().size() == 0) {
            assertEquals("The number of fills should be zero", 0, dispenseComponents.size());
        } else {

            Iterator<Fills> fillsIter = result.getFills().iterator();

            assertEquals("The number of fills should match the number of dispenses", result.getFills().size(), dispenseComponents.size());

            while (fillsIter.hasNext() && dispenseComponentIter.hasNext()) {
                // Note: assuming the fills and the dispenses are in the same order
                Fills fill = fillsIter.next();
                MedicationDispense.MedicationDispenseDispenseComponent dispenseComponent = dispenseComponentIter.next();

                //verify handover date
    //            System.out.println("fill date: "+fill.getDispenseDate());
    //            System.out.println("dispense date: "+dispenseComponent.getWhenHandedOver().asStringValue());
                try {
                    Date fillDate = FILL_DATE_FORMAT.parse(fill.getDispenseDate());
                    Date dispenseDate = DISPENSE_DATE_FORMAT.parse(dispenseComponent.getWhenHandedOver().asStringValue());
                    assertEquals("The original date and the transformed date should be equivalent", fillDate, dispenseDate);
                } catch (ParseException pe) {
                    fail(pe.getMessage());
                }

                //verify dosage
                List<MedicationDispense.MedicationDispenseDispenseDosageComponent> dosages = dispenseComponent.getDosage();
                assertEquals("There should be a single dosage", 1, dosages.size());
                MedicationDispense.MedicationDispenseDispenseDosageComponent dosage = dosages.get(0);
    //            System.out.println("fill dosage quantity = " + fill.getQuantityDispensed());
    //            System.out.println("dispense dosage quantity = "+dosage.getQuantity().getValueSimple().toString());
                BigDecimal fillQuantity = new BigDecimal(fill.getQuantityDispensed());
                BigDecimal dosageQuantity = dosage.getQuantity().getValueSimple();
                assertEquals("The dosage quantity should match the fill quantity", fillQuantity.compareTo(dosageQuantity), 0);

                //verify extensions
                List<Extension> extensions = dispenseComponent.getExtensions();
                assertEquals("There should be an extension for each extension field", MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_FILL_EXTENSION_FIELD_NAMES.size() + MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_ORDER_EXTENSION_FIELD_NAMES.size(), extensions.size());
            }
        }
    }

    private void verifyTransformSubstitution(MedicationDispense medDispense, MedResult result) {
        // TODO
    }

    private void verifyTransformExtensions(MedicationDispense medDispense, MedResult result) {

        if (result == null) {
            assertNull("medDispense should be null", medDispense);
            return;
        }

        List<Extension> extensions = medDispense.getExtensions();
        int foundFields = 0;

        //Since extensions are conditionally created if the value exists, we need a better check
//        assertEquals("There should be an extension for each extension field", 
//                MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES.size() + 
//                MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_MED_EXTENSION_FIELD_NAMES.size(), 
//                extensions.size());


        for (Extension extension : extensions) {
            String url = extension.getUrlSimple();
            Type value = extension.getValue();

            assertNotNull("The extension value should not have been null", value);

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    assertTrue("The field should have been prefixed correctly",
                            url.startsWith(MedVistaToFhirMedicationDispense.MEDICATION_EXTENSION_URL_PREFIX));
                }
            }
        }

        assertEquals("The extension URLs should all end in a field name", foundFields,
                MedVistaToFhirMedicationDispense.MEDICATION_DISPENSE_EXTENSION_PRODUCT_FIELD_NAMES.size());
    }
    

}
