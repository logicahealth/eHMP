package us.vistacore.ehmp.model.allergies;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;

import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput.AllergiesData;

/**
 * This tests the VPRAllergiesRpcOutput class.
 *
 * @author Les.Westberg
 *
 */
public class VPRAllergiesRpcOutputTest {
    VPRAllergiesRpcOutput testSubject = null;

    /**
     * This method is run before each test is run to set up state.
     *
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new VPRAllergiesRpcOutput();
    }

    /**
     * This tests the ApiVersion property.
     */
    @Test
    public void testApiVersion() {
        testSubject.setApiVersion("TheApiVersion");
        assertEquals("The API Version property was incorrect.", "TheApiVersion", testSubject.getApiVersion());
    }

    /**
     * Create the sample information in the AllergiesDataClass
     */
    private void fillInAllergiesDataClass() {
        testSubject.setData(new AllergiesData());
        testSubject.getData().setUpdated("UPDATED");
        testSubject.getData().setTotalItems(2);
        AllergiesResult oResult = new AllergiesResult();
        testSubject.getData().addItems(oResult);
        oResult.setSourceVistaSite("Site1");
        oResult = new AllergiesResult();
        testSubject.getData().addItems(oResult);
        oResult.setSourceVistaSite("Site2");
    }

    /**
     * Verify that the fields in the AllergiesData class are correctly filled in and extracted.
     */
    private void verifyAllergiesDataClass() {
        assertNotNull("The data section should not have been null.", testSubject.getData());
        assertEquals("The updated property was incorrect.", "UPDATED", testSubject.getData().getUpdated());
        assertEquals("The total items property was incorrect.", 2, testSubject.getData().getTotalItems());
        assertEquals("There should have been two array items.", 2, testSubject.getData().getItems().size());
        boolean bFound1 = false;
        boolean bFound2 = false;
        for (AllergiesResult oResult : testSubject.getData().getItems()) {
            assertNotNull("The allegies result object should have existed.", oResult);
            if ("Site1".equals(oResult.getSourceVistaSite())) {
                bFound1 = true;
            } else if ("Site2".equals(oResult.getSourceVistaSite())) {
                bFound2 = true;
            } else {
                fail("Found an allergies result object that should not have existed.");
            }
        }

        assertTrue("The first allergies result object was missing from the array.", bFound1);
        assertTrue("The second allergies result object was missing from the array.", bFound2);
    }

    /**
     * This tests the AllergiesData class property.
     */
    @Test
    public void testAllergiesDataClass() {
        fillInAllergiesDataClass();
        verifyAllergiesDataClass();
    }
}
