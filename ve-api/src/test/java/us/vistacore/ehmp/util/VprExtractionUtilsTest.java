package us.vistacore.ehmp.util;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import us.vistacore.ehmp.model.transform.ModelTransformException;

import java.math.BigDecimal;

import static org.junit.Assert.*;

/**
 * This class is used to test the VprExtractionUtils class.
 *
 * @author Les.Westberg
 *
 */
public class VprExtractionUtilsTest {
    private static final String DFN = "22";
    private static final String UID = "urn:va:domain:site:" + DFN + ":33";

    /**
     * This class is run before every test.
     *
     * @throws Exception
     */
    @Before
    public void setUp() throws Exception {
    }

    /**
     * Test the extractSubjectReferenceFromUid method.
     *
     */
    @Test
    public void testExtractSubjectReferenceFromUid() {

        // Check null condition
        //----------------------
        String sResult = VprExtractionUtils.extractSubjectReferenceFromUid(null);
        assertNull("Response should have been null.", sResult);

        // Check with invalid number of tokens
        //---------------------------------------
        sResult = VprExtractionUtils.extractSubjectReferenceFromUid("urn:va");
        assertNull("Response should have been null.", sResult);

        // Check for UID which does not contain the DFN token
        //----------------------------------------------------
        sResult = VprExtractionUtils.extractSubjectReferenceFromUid("urn:va:domain:site::22");
        assertNull("The identifier node should have been null.", sResult);

        // Check will well formed UID
        //----------------------------
        sResult = VprExtractionUtils.extractSubjectReferenceFromUid(UID);
        assertEquals("Incorrect subject reference.", VprExtractionUtils.PATIENT_REFERENCE_PREFIX + DFN, sResult);
    }

    /**
     * Test the extractVuid method.
     */
    @Test
    public void testExtractVuid() {
        // Test for null parameter
        //-------------------------
        String sUrnVuid = null;
        String sResult = VprExtractionUtils.extractVuid(sUrnVuid);
        assertNull("The result should have been null.", sResult);

        // Test for empty vuid:  ""
        //-------------------------------------
        sUrnVuid = "";
        sResult = VprExtractionUtils.extractVuid(sUrnVuid);
        assertNull("The result should have been null.", sResult);

        // Test for empty vuid:  "urn:va:vuid:"
        //-------------------------------------
        sUrnVuid = VprExtractionUtils.VUID_PREFIX;
        sResult = VprExtractionUtils.extractVuid(sUrnVuid);
        assertNull("The result should have been null.", sResult);

        // Test for empty vuid:  "urn:va:vuid:1111"
        //-----------------------------------------
        sUrnVuid = VprExtractionUtils.VUID_PREFIX + "1111";
        sResult = VprExtractionUtils.extractVuid(sUrnVuid);
        assertEquals("The result should have been null.", "1111", sResult);

        // Test for empty vuid with no prefix:  "2222"
        //-----------------------------------------
        sUrnVuid = "2222";
        sResult = VprExtractionUtils.extractVuid(sUrnVuid);
        assertEquals("The result should have been null.", "2222", sResult);

    }

    /**
     * This tests the extractNumber method.
     */
    @Test
    public void testExtractNumber() {
        // Test null case
        //---------------
        try {
            BigDecimal oValue = VprExtractionUtils.extractNumber(null);
            assertNull("The value should have been null.", oValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value
        //-------------------
        try {
            BigDecimal oValue = VprExtractionUtils.extractNumber("300.1");
            assertNotNull("The value should not have been null.", oValue);
            assertEquals("The value was incorrect.", "300.1", oValue.toString());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value with text
        //-----------------------------
        try {
            BigDecimal oValue = VprExtractionUtils.extractNumber("300.1ML");
            assertNotNull("The value should not have been null.", oValue);
            assertEquals("The value was incorrect.", "300.1", oValue.toString());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value with multiple text tokens
        //--------------------------------------------
        try {
            BigDecimal oValue = VprExtractionUtils.extractNumber("300.1ML caps");
            assertNotNull("The value should not have been null.", oValue);
            assertEquals("The value was incorrect.", "300.1", oValue.toString());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Multiple value with multiple text tokens
        //----------------------------------------------
        try {
            @SuppressWarnings("unused")
            BigDecimal oValue = VprExtractionUtils.extractNumber("300.1ML 2 caps");
            fail("We should have received an exception from this call.");
        } catch (ModelTransformException me) {
            // Note we should have received this exception.  We are fine if we got it.
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

    }

    /**
     * This tests the extractNonNumericValues method.
     */
    @Test
    public void testExtractNonNumericValues() {
        // Test null case
        //---------------
        try {
            String sValue = VprExtractionUtils.extractNonNumericValues(null);
            assertNull("The value should have been null.", sValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value
        //-------------------
        try {
            String sValue = VprExtractionUtils.extractNonNumericValues("300.1");
            assertEquals("The value was incorrect.", "", sValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value with text
        //-----------------------------
        try {
            String sValue = VprExtractionUtils.extractNonNumericValues("300.1ML");
            assertEquals("The value was incorrect.", "ML", sValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Single value with multiple text tokens
        //--------------------------------------------
        try {
            String sValue = VprExtractionUtils.extractNonNumericValues("300.1ML caps");
            assertEquals("The value was incorrect.", "ML caps", sValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

        // Test Multiple value with multiple text tokens
        //----------------------------------------------
        try {
            String sValue = VprExtractionUtils.extractNonNumericValues("300.1ML 2 caps");
            assertEquals("The value was incorrect.", "ML caps", sValue);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.  Error: " + e.getMessage());
        }

    }

    /**
     * Code to show how the splitting of these regular expressions works.
     */
    @Ignore
    @Test
    public void testJunk() {
        String s1 = "100.1 UNIT]ML";
        String[] arr = s1.trim().split("[a-zA-Z /\\-\\&\\(\\)\\^\\%\\$#@!~\\+\\=\\{\\}:;<>,?\\|'\"\\*\\\\\\[\\]]+"); // Please note a space is there after Z
        String[] arr2 = s1.trim().split("[0-9.]+"); // Please note a space is there after Z

        for (int i = 0; i < arr.length; i++) {
            System.out.println("arr[" + i + "] = " + arr[i]);
        }

        for (int i = 0; i < arr2.length; i++) {
            System.out.println("arr2[" + i + "] = " + arr2[i]);
        }
    }

}
