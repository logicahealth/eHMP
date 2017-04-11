package us.vistacore.ehmp.model.meds.transform;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.Collection;
import java.util.List;

import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.Medication.MedicationProductComponent;
import org.hl7.fhir.instance.model.Medication.MedicationProductIngredientComponent;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Products;
import us.vistacore.ehmp.util.NullChecker;

/**
 * This class tests the MedicationsVistaToFhir class
 *
 * @author Les Westberg
 *
 */

@RunWith(Parameterized.class)
public class MedsVistaToFhirMedicationTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return MedicationsGenerator.create();
    }

    private MedResult medResult;
    private static MedResult emptyMedResult = new MedResult();

    public MedsVistaToFhirMedicationTest(MedResult medicationResultInput, String dfn) {
        this.medResult = medicationResultInput;
    }

    @Before
    public void setUp() throws Exception {
    }

    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationPrescription.class);

    /**
     * This method tests creates an empty medication prescription report and
     * transform the extension
     */
    @Test
    public void testTransformCode() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformCode(fhirMedication, this.medResult);
        verifyTransformCode(fhirMedication, this.medResult);
    }

    @Test
    public void testTransformCodeNull() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformCode(fhirMedication, MedsVistaToFhirMedicationTest.emptyMedResult);
        assertNull("The code must be null", fhirMedication.getNameSimple());
    }

    @Test
    public void testTransformName() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformName(fhirMedication, this.medResult);
        assertEquals("The name must be the same", this.medResult.getName(), fhirMedication.getNameSimple());
    }

    @Test
    public void testTransformNameNull() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformName(fhirMedication, MedsVistaToFhirMedicationTest.emptyMedResult);
        assertNull("The name must be null", fhirMedication.getNameSimple());
    }

    @Test
    public void testTransformProduct() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformProduct(fhirMedication, this.medResult, fhirMedication);
        verifyProduct(fhirMedication, this.medResult);
    }

    private void verifyProduct(Medication fhirMedication, MedResult medResult2) {
        assertNotNull("The medication result should not have been null.", fhirMedication);
        MedicationProductComponent component =  fhirMedication.getProduct();
        assertNotNull("The MedicationProductComponent should not have been null.", component);
        assertEquals("The form should match", medResult.getProductFormName(), component.getForm().getTextSimple());
        List<MedicationProductIngredientComponent> ingredientList = component.getIngredient();
        assertEquals("the ingrediant list should be the same size as the product list", medResult.getProducts().size(), ingredientList.size());
        verifyIingredients(ingredientList, medResult.getProducts());
    }


    private void verifyIingredients(List<MedicationProductIngredientComponent> ingredientList, List<Products> products) {
        // TODO Auto-generated method stub
    }

    @Test
    public void testTransformProductNull() {
        Medication fhirMedication = new Medication();
        MedVistaToFhirMedication.transformProduct(fhirMedication, MedsVistaToFhirMedicationTest.emptyMedResult, fhirMedication);
        assertNull("The manufacturer must be null by default", fhirMedication.getProduct());
    }

    /**
     * This method tests verifies we populated Fhir correctly
     *
     * @param medResult
     *            The med result to compare to.
     * @param oFhirMedication
     *            The MedicationPrescription being verified.
     */
    private void verifyTransformCode(Medication oFhirMedication, MedResult medResult) {
        assertNotNull("The medication result should not have been null.", oFhirMedication);

        // Verify that the codes are placed in here correctly.
        // -----------------------------------------------------
        int iNumCodes = medResult.getCodesList().size();
        if (iNumCodes > 0) {
            assertNotNull("The code object should not have been nullish.", oFhirMedication.getCode());
            assertTrue("There should have been items in the coding list.", NullChecker.isNotNullish(oFhirMedication.getCode().getCoding()));
            for (TerminologyCode oCode : medResult.getCodesList()) {
                verifyContainsCode(oFhirMedication.getCode().getCoding(), oCode.getCode(), oCode.getSystem(), oCode.getDisplay());
            }
        } else {
            // Either the encapsulating code or at a minimum the underlying
            // coding should be null.
            // ------------------------------------------------------------------------------------
            if (oFhirMedication.getCode() != null) {
                assertTrue("The coding object should have been nullish.", NullChecker.isNullish(oFhirMedication.getCode().getCoding()));
            }
        }
    }

    /**
     * This verifies that the coding array contains the given code in one of its
     * elements.
     *
     * @param oaCoding
     *            The coding array
     * @param sCode
     *            The code that should exist in the array.
     * @param sSystem
     *            The system associated with that code.
     * @param sDisplay
     *            The display associated with that code.
     */
    private void verifyContainsCode(List<Coding> oaCoding, String sCode, String sSystem, String sDisplay) {
        boolean bFound = false;
        for (Coding oCoding : oaCoding) {
            if ((oCoding != null) && (NullChecker.isNotNullish(oCoding.getCodeSimple())) && (oCoding.getCodeSimple().equals(sCode))) {
                assertEquals("The coding code was incorrect.", sCode, oCoding.getCodeSimple());
                assertEquals("The coding system was incorrect.", sSystem, oCoding.getSystemSimple());
                assertEquals("The coding display was incorrect.", sDisplay, oCoding.getDisplaySimple());
                bFound = true;
                break;
            }
        }

        assertTrue("The coding item was not found.", bFound);

    }

}
