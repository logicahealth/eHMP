package us.vistacore.ehmp.util;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import us.vistacore.ehmp.model.transform.ModelTransformException;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Duration;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Patient;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.String_;
import org.hl7.fhir.instance.model.Type;
import org.hl7.fhir.utilities.xhtml.XhtmlNode;
import org.junit.Test;

/**
 * This class tests the methods of the {@link FhirUtils} class.
 *
 * @author Les.Westberg
 *
 */
public class FhirUtilsTest {

    @Test
    public void testJsonToResourceNull() {
        try {
            assertNull(FhirUtils.jsonToResource((String) null));
            assertNull(FhirUtils.jsonToResource((InputStream) null));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected error occurred.  Error: " + e.getMessage());
        }
    }

    @Test
    public void testJsonToResourceEmpty() {
        try {
            assertNull(FhirUtils.jsonToResource(""));
            assertNull(FhirUtils.jsonToResource(new ByteArrayInputStream("".getBytes())));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected error occurred.  Error: " + e.getMessage());
        }
    }

    @Test
    public void testJsonToResourceSuccess() {
        String validJson = "{ \"resourceType\":\"Patient\" }";

        try {
            assertNotNull(FhirUtils.jsonToResource(validJson));
            assertThat(FhirUtils.jsonToResource(validJson), instanceOf(Patient.class));

            assertNotNull(FhirUtils.jsonToResource(new ByteArrayInputStream(validJson.getBytes())));
            assertThat(FhirUtils.jsonToResource(new ByteArrayInputStream(validJson.getBytes())), instanceOf(Patient.class));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected error occurred.  Error: " + e.getMessage());
        }
    }

    /**
     * This method tests the createNarrative method.
     */
    @Test
    public void testCreateNarrative() {
        Narrative oNarrative = FhirUtils.createNarrative(NarrativeStatus.generated, "ThisIsTheMessage");
        assertNotNull("The narrative should not have been null.", oNarrative);
        assertEquals("The status was incorrect.", NarrativeStatus.generated, oNarrative.getStatusSimple());
        assertNotNull("The div node should not have been null.", oNarrative.getDiv());
        FhirUtilsVerify.verifyXhtmlNode("ThisIsTheMessage", oNarrative.getDiv());
    }

    /**
     * This method tests the createDivNode method.
     */
    @Test
    public void testCreateDivNode() {
        XhtmlNode oNode = FhirUtils.createDivNode("ThisIsTheValue");
        FhirUtilsVerify.verifyXhtmlNode("ThisIsTheValue", oNode);
    }

    /**
     * This method tests the createCoding method.
     */
    @Test
    public void testCreateCoding() {
        Coding oCoding = FhirUtils.createCoding("1.1.1", "TheCodeName", "MyCodeScheme");
        assertNotNull("The return result should not have been null.", oCoding);
        assertEquals("The code was not correct.", "1.1.1", oCoding.getCodeSimple());
        assertEquals("The display was not correct.", "TheCodeName", oCoding.getDisplaySimple());
        assertEquals("The system/scheme was not correct.", "MyCodeScheme", oCoding.getSystemSimple());
    }

    /**
     * This method tests createCodeableConcept methods.
     */
    @Test
    public void testCreateCodeableConcept() {
        // Test creation with a null coding object.
        // ------------------------------------------
        CodeableConcept oCodeableConcept = FhirUtils.createCodeableConcept((Coding) null);
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 0, oCodeableConcept.getCoding().size());

        // Test creation with a null text object.
        // ---------------------------------------
        oCodeableConcept = FhirUtils.createCodeableConcept((String) null);
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 0, oCodeableConcept.getCoding().size());
        assertNull("The text node should have been null.", oCodeableConcept.getTextSimple());

        // Test creation with a valid coding object.
        // ------------------------------------------
        Coding oCoding = FhirUtils.createCoding("1.1", "MyText", "urn:oid:1.1");
        oCodeableConcept = FhirUtils.createCodeableConcept(oCoding);
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 1, oCodeableConcept.getCoding().size());
        assertEquals("The code was not correct.", "1.1", oCodeableConcept.getCoding().get(0).getCodeSimple());
        assertEquals("The display was not correct.", "MyText", oCodeableConcept.getCoding().get(0).getDisplaySimple());
        assertEquals("The coding system was not correct.", "urn:oid:1.1", oCodeableConcept.getCoding().get(0).getSystemSimple());

        // Test creation with a list of coding objects.
        // ------------------------------------------
        List<Coding> oaCoding = new ArrayList<Coding>();
        oCoding = FhirUtils.createCoding("1.1", "MyText", "urn:oid:1.1");
        oaCoding.add(oCoding);
        oCoding = FhirUtils.createCoding("2.2", "MyText2", "urn:oid:2.2");
        oaCoding.add(oCoding);
        oCodeableConcept = FhirUtils.createCodeableConcept(oaCoding);
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 2, oCodeableConcept.getCoding().size());
        boolean bFound1 = false;
        boolean bFound2 = false;
        for (Coding oResponseCoding : oCodeableConcept.getCoding()) {
            if ("1.1".equals(oResponseCoding.getCodeSimple())) {
                assertEquals("The code was not correct.", "1.1", oResponseCoding.getCodeSimple());
                assertEquals("The display was not correct.", "MyText", oResponseCoding.getDisplaySimple());
                assertEquals("The coding system was not correct.", "urn:oid:1.1", oResponseCoding.getSystemSimple());
                bFound1 = true;
            } else if ("2.2".equals(oResponseCoding.getCodeSimple())) {
                assertEquals("The code was not correct.", "2.2", oResponseCoding.getCodeSimple());
                assertEquals("The display was not correct.", "MyText2", oResponseCoding.getDisplaySimple());
                assertEquals("The coding system was not correct.", "urn:oid:2.2", oResponseCoding.getSystemSimple());
                bFound2 = true;
            }
        }
        assertTrue("The first coding was not found.", bFound1);
        assertTrue("The second coding was not found.", bFound2);

        // Test creation with valid coding fields.
        // ------------------------------------------
        oCodeableConcept = FhirUtils.createCodeableConcept("1.1", "MyText", "urn:oid:1.1");
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 1, oCodeableConcept.getCoding().size());
        assertEquals("The code was not correct.", "1.1", oCodeableConcept.getCoding().get(0).getCodeSimple());
        assertEquals("The display was not correct.", "MyText", oCodeableConcept.getCoding().get(0).getDisplaySimple());
        assertEquals("The coding system was not correct.", "urn:oid:1.1", oCodeableConcept.getCoding().get(0).getSystemSimple());

        // Test creation with valid coding fields and a text field.
        // ---------------------------------------------------------
        oCodeableConcept = FhirUtils.createCodeableConcept("1.1", "MyText", "urn:oid:1.1", "SomeText");
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("There should have been no entries in the list.", 1, oCodeableConcept.getCoding().size());
        assertEquals("The code was not correct.", "1.1", oCodeableConcept.getCoding().get(0).getCodeSimple());
        assertEquals("The display was not correct.", "MyText", oCodeableConcept.getCoding().get(0).getDisplaySimple());
        assertEquals("The coding system was not correct.", "urn:oid:1.1", oCodeableConcept.getCoding().get(0).getSystemSimple());
        assertEquals("The text field was not correct.", "SomeText", oCodeableConcept.getTextSimple());

        // Test creation with text value.
        // -------------------------------
        oCodeableConcept = FhirUtils.createCodeableConcept("TheText");
        assertNotNull("The result should not have been null.", oCodeableConcept);
        assertEquals("The text field was not correct.", "TheText", oCodeableConcept.getTextSimple());

    }

    /**
     * This method tests the createFhirString method.
     */
    @Test
    public void testCreateFhirString() {
        String_ oFhirString = FhirUtils.createFhirString("MyStringValue");
        assertNotNull("The string should not have been null.", oFhirString);
        assertEquals("The string value was incorrect.", "MyStringValue", oFhirString.getValue());
    }

    /**
     * This method tests extracting a string value from a FHIR string.
     */
    @Test
    public void testExtractFhirStringValue() {
        // Verify the String_ version of this method.
        // -------------------------------------------
        String_ sFhirValue = FhirUtils.createFhirString("MyStringValue");
        String sValue = FhirUtils.extractFhirStringValue(sFhirValue);
        assertEquals("The string value was not correct.", "MyStringValue", sValue);

        // Verify the Type version of this method.
        // -------------------------------------------
        Type oFhirValue = sFhirValue;
        sValue = FhirUtils.extractFhirStringValue(oFhirValue);
        assertEquals("The string value was not correct.", "MyStringValue", sValue);

    }

    /**
     * This method tests the isHL7V2DateTimeFormat method.
     */
    @Test
    public void testIsHL7V2DateFormat() {
        // Test for null.
        // ---------------
        String sDateTime = null;
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for empty string
        // ----------------------
        sDateTime = "";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for only year
        // ----------------------
        sDateTime = "1111";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMdd
        // -------------------
        sDateTime = "20130325";
        assertTrue("This should have returned true.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHH
        // -------------------
        sDateTime = "2013032501";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmm
        // ----------------------
        sDateTime = "201303250120";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmmSS
        // ------------------------
        sDateTime = "20130325012005";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmmSS-
        // --------------------------
        sDateTime = "20130325012005-";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmmSS-0500
        // -----------------------------
        sDateTime = "20130325012005-0500";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmmSS+0500
        // -----------------------------
        sDateTime = "20130325012005+0500";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));

        // Test for yyyyMMddHHmmSS+0500
        // -----------------------------
        sDateTime = " 20130325012005+0500 ";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateFormat(sDateTime));
    }

    /**
     * This method tests the isHL7V2DateTimeFormat method.
     */
    @Test
    public void testIsHL7V2DateTimeFormat() {
        // Test for null.
        // ---------------
        String sDateTime = null;
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for empty string
        // ----------------------
        sDateTime = "";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for only year
        // ----------------------
        sDateTime = "1111";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for yyyyMMdd
        // -------------------
        sDateTime = "20130325";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for yyyyMMddHH
        // -------------------
        sDateTime = "2013032501";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for yyyyMMddHHmm
        // ----------------------
        sDateTime = "201303250120";
        assertTrue("This should have returned true.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for yyyyMMddHHmmSS
        // ------------------------
        sDateTime = "20130325012005";
        assertTrue("This should have returned true.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // Test for yyyyMMddHHmmSS-
        // --------------------------
        sDateTime = "20130325012005-";
        assertFalse("This should have returned false.", FhirUtils.isHL7V2DateTimeFormat(sDateTime));

        // // Test for yyyyMMddHHmmSS-0500
        // //-----------------------------
        // sDateTime = "20130325012005-0500";
        // assertTrue("This should have returned true.",
        // FhirUtils.isHL7V2DateTimeFormat(sDateTime));
        //
        // // Test for yyyyMMddHHmmSS+0500
        // //-----------------------------
        // sDateTime = "20130325012005+0500";
        // assertTrue("This should have returned true.",
        // FhirUtils.isHL7V2DateTimeFormat(sDateTime));
        //
        // // Test for yyyyMMddHHmmSS+0500
        // //-----------------------------
        // sDateTime = " 20130325012005+0500 ";
        // assertFalse("This should have returned false.",
        // FhirUtils.isHL7V2DateTimeFormat(sDateTime));
    }

    /**
     * This tests the isFhirDateFormat method.
     */
    @Test
    public void testIsFhirDateFormat() {
        // Test for null.
        // ---------------
        String sDate = null;
        assertFalse("This should have returned false.", FhirUtils.isFhirDateFormat(sDate));

        // Test for empty string
        // ----------------------
        sDate = "";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateFormat(sDate));

        // Test year only
        // ---------------
        sDate = "2013";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateFormat(sDate));

        // Test 2013-10
        // ----------------------
        sDate = "2013-10";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateFormat(sDate));

        // Test 2013-10-01
        // ----------------------
        sDate = "2013-10-01";
        assertTrue("This should have returned true.", FhirUtils.isFhirDateFormat(sDate));

        // Test 2013-10-01T08:01:09
        // --------------------------
        sDate = "2013-10-01T08:01:09";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateFormat(sDate));

    }

    /**
     * This tests the isFhirDateTimeFormat method.
     */
    @Test
    public void testIsFhirDateTimeFormat() {
        // Test for null.
        // ---------------
        String sDateTime = null;
        assertFalse("This should have returned false.", FhirUtils.isFhirDateTimeFormat(sDateTime));

        // Test for empty string
        // ----------------------
        sDateTime = "";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateTimeFormat(sDateTime));

        // Test year only
        // ---------------
        sDateTime = "2013";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateTimeFormat(sDateTime));

        // Test 2013-10
        // ----------------------
        sDateTime = "2013-10";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateTimeFormat(sDateTime));

        // Test 2013-10-01
        // ----------------------
        sDateTime = "2013-10-01";
        assertFalse("This should have returned false.", FhirUtils.isFhirDateTimeFormat(sDateTime));

        // Test 2013-10-01T08:01:09
        // --------------------------
        sDateTime = "2013-10-01T08:01:09";
        assertTrue("This should have returned true.", FhirUtils.isFhirDateTimeFormat(sDateTime));

    }

    /**
     * This tests the transformHL7V2DateToFhirDateTime method.
     */
    @Test
    public void testTransformHL7V2DateToFhirDateTime() {
        String sDate = "";
        try {
            assertTrue("This should have returned a nullish Fhir date.", NullChecker.isNullish(FhirUtils.transformHL7V2DateToFhirDateTime(sDate)));
        } catch (Exception e) {
            fail("An unexpected exception occurred: " + e.getMessage());
        }

        // Test a valid date.
        // -------------------
        sDate = "20120909";
        try {
            assertEquals("The date was not transformed correctly.", "2012-09-09", FhirUtils.transformHL7V2DateToFhirDateTime(sDate));
        } catch (Exception e) {
            fail("An unexpected exception occurred: " + e.getMessage());
        }

    }

    /**
     * This tests the transformHL7V2DateTimeToFhirDateTime method.
     */
    @Test
    public void testTransformHL7V2DateTimeToFhirDateTime() {
        String sDate = "";
        try {
            assertTrue("This should have returned a nullish Fhir date.", NullChecker.isNullish(FhirUtils.transformHL7V2DateTimeToFhirDateTime(sDate)));
        } catch (Exception e) {
            fail("An unexpected exception occurred: " + e.getMessage());
        }

        // Test a valid date with precision to the minute.
        // ------------------------------------------------
        sDate = "201209090510";
        try {
            assertEquals("The date was not transformed correctly.", "2012-09-09T05:10:00", FhirUtils.transformHL7V2DateTimeToFhirDateTime(sDate));
        } catch (Exception e) {
            fail("An unexpected exception occurred: " + e.getMessage());
        }

        // Test a valid date with precision to the second.
        // ------------------------------------------------
        sDate = "20120909051008";
        try {
            assertEquals("The date was not transformed correctly.", "2012-09-09T05:10:08", FhirUtils.transformHL7V2DateTimeToFhirDateTime(sDate));
        } catch (Exception e) {
            fail("An unexpected exception occurred: " + e.getMessage());
        }

        // // Test a valid date with precision to the second with time zone
        // //--------------------------------------------------------------
        // sDate = "20120909051008-0500";
        // try {
        // assertEquals("The date was not transformed correctly.",
        // "2012-09-09T05:10:08-0500",
        // FhirUtils.transformHL7V2DateTimeToFhirDateTime(sDate));
        // }
        // catch (Exception e) {
        // fail("An unexpected exception occurred: " + e.getMessage());
        // }

    }

    /**
     * This tests the createFhirDateTimeString method.
     */
    @Test
    public void testCreateFhirDateTimeString() {
        // Check null values.
        // -------------------
        String sDateTime = null;
        try {
            assertTrue("This should have been null.", NullChecker.isNullish(FhirUtils.createFhirDateTimeString(sDateTime)));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.");
        }

        // Check a FHIR date format
        // -------------------------
        sDateTime = "2012-04-03T08:05:06";
        try {
            String sFhirDateTime = FhirUtils.createFhirDateTimeString(sDateTime);
            assertEquals("The date time value was incorrect.", sDateTime, sFhirDateTime);
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }

        // Check an HL7 date format
        // -------------------------
        sDateTime = "20120403";
        try {
            String sFhirDateTime = FhirUtils.createFhirDateTimeString(sDateTime);
            assertEquals("The date time value was incorrect.", "2012-04-03", sFhirDateTime);
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }

        // Check an HL7 date timeformat
        // ------------------------------
        sDateTime = "20120403080506";
        try {
            String sFhirDateTime = FhirUtils.createFhirDateTimeString(sDateTime);
            assertEquals("The date time value was incorrect.", "2012-04-03T08:05:06", sFhirDateTime);
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }
    }

    /**
     * This tests the createFhirDateTime method.
     */
    @Test
    public void testCreateFhirDateTime() {
        // Check null values.
        // -------------------
        String sDateTime = null;
        try {
            assertNull("This should have been null.", FhirUtils.createFhirDateTime(sDateTime));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.");
        }

        // Check a FHIR date format
        // -------------------------
        sDateTime = "2012-04-03T08:05:06";
        try {
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime(sDateTime);
            assertNotNull("This should have been null.", oFhirDateTime);
            assertEquals("The date time value was incorrect.", sDateTime, FhirUtils.extractFhirDateTimeValue(oFhirDateTime));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }

        // Check an HL7 date format
        // -------------------------
        sDateTime = "20120403";
        try {
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime(sDateTime);
            assertNotNull("This should have been null.", oFhirDateTime);
            assertEquals("The date time value was incorrect.", "2012-04-03", FhirUtils.extractFhirDateTimeValue(oFhirDateTime));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }

        // Check an HL7 date timeformat
        // ------------------------------
        sDateTime = "20120403080506";
        try {
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime(sDateTime);
            assertNotNull("This should have been null.", oFhirDateTime);
            assertEquals("The date time value was incorrect.", "2012-04-03T08:05:06", FhirUtils.extractFhirDateTimeValue(oFhirDateTime));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }

        // Verify the version that uses the date format.
        // -----------------------------------------------
        Date dtNow = new Date();
        SimpleDateFormat oFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        String sNow = oFormat.format(dtNow);
        DateTime oFhirDateTime = FhirUtils.createFhirDateTime(dtNow);
        assertNotNull("This should have been null.", oFhirDateTime);
        assertEquals("The date time value was incorrect.", sNow, FhirUtils.extractFhirDateTimeValue(oFhirDateTime));
    }

    /**
     * This method tests extracting a date time string value from a FHIR Date Time.
     */
    @Test
    public void testExtractFhirDateTimeValue() {
        try {

            // Verify the DateTime version of this method.
            // -------------------------------------------
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime("20130801");
            String sDateTime = FhirUtils.extractFhirDateTimeValue(oFhirDateTime);
            assertEquals("The string value was not correct.", "2013-08-01", sDateTime);

            // Test Null case on Type version of this method.
            // ------------------------------------------------
            Type oFhirValue = null;
            sDateTime = FhirUtils.extractFhirDateTimeValue(oFhirValue);
            assertNull("The string should have been null.", sDateTime);

            // Verify the Type version of this method.
            // -------------------------------------------
            oFhirValue = oFhirDateTime;
            sDateTime = FhirUtils.extractFhirDateTimeValue(oFhirValue);
            assertEquals("The string value was not correct.", "2013-08-01", sDateTime);
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }
    }

    /**
     * This tests the transformFhirDateTimeToDate method.
     */
    @Test
    public void testTransformFhirDateTimeToDate() {
        try {
            SimpleDateFormat oDateFormat = new SimpleDateFormat("yyyyMMdd");
            SimpleDateFormat oDateTimeFormat = new SimpleDateFormat("yyyyMMddHHmmss");

            // Check with null value.
            // -----------------------
            String sFhirDateTime = null;
            Date dtDateTime = FhirUtils.transformFhirDateTimeToDate(sFhirDateTime);
            assertNull("The result should have been null.", dtDateTime);

            // Check for FHIR date format
            // ---------------------------
            sFhirDateTime = "2011-03-04";
            dtDateTime = FhirUtils.transformFhirDateTimeToDate(sFhirDateTime);
            assertNotNull("The result should not have been null.", dtDateTime);
            assertEquals("The date value was incorrect.", "20110304", oDateFormat.format(dtDateTime));

            // Check for FHIR date format
            // ---------------------------
            sFhirDateTime = "2011-03-04T09:08:07";
            dtDateTime = FhirUtils.transformFhirDateTimeToDate(sFhirDateTime);
            assertNotNull("The result should not have been null.", dtDateTime);
            assertEquals("The date value was incorrect.", "20110304090807", oDateTimeFormat.format(dtDateTime));
        } catch (ModelTransformException e) {
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }
    }

    /**
     * This tests the createCalendarDateTime method.
     */
    @Test
    public void testCreateCalendarDateTime() {
        try {
            // Check our null condition
            // --------------------------
            String sDateTime = null;
            Calendar oCalDateTime = FhirUtils.createCalendarDateTime(sDateTime);
            assertNull("The calendar should have been null.", oCalDateTime);

            // Check a string formatted in HL7 Format
            // ---------------------------------------
            sDateTime = "20000506";
            oCalDateTime = FhirUtils.createCalendarDateTime(sDateTime);
            assertNotNull("The calendar should not have been null.", oCalDateTime);
            assertEquals("The year was incorrect.", 2000, oCalDateTime.get(Calendar.YEAR));
            assertEquals("The month was incorrect.", 4, oCalDateTime.get(Calendar.MONTH)); // Values
                                                                                           // are
                                                                                           // offset
                                                                                           // from
                                                                                           // 0
                                                                                           // -
                                                                                           // January
                                                                                           // =
                                                                                           // 0
            assertEquals("The day was incorrect.", 6, oCalDateTime.get(Calendar.DAY_OF_MONTH));
            assertEquals("The hour was incorrect.", 0, oCalDateTime.get(Calendar.HOUR_OF_DAY));
            assertEquals("The minutes was incorrect.", 0, oCalDateTime.get(Calendar.MINUTE));
            assertEquals("The seconds was incorrect.", 0, oCalDateTime.get(Calendar.SECOND));

            // Check a string formatted in FHIR Format
            // ---------------------------------------
            sDateTime = "2000-05-06T10:08:07";
            oCalDateTime = FhirUtils.createCalendarDateTime(sDateTime);
            assertNotNull("The calendar should not have been null.", oCalDateTime);
            assertEquals("The year was incorrect.", 2000, oCalDateTime.get(Calendar.YEAR));
            assertEquals("The month was incorrect.", 4, oCalDateTime.get(Calendar.MONTH)); // Values
                                                                                           // are
                                                                                           // offset
                                                                                           // from
                                                                                           // 0
                                                                                           // -
                                                                                           // January
                                                                                           // =
                                                                                           // 0
            assertEquals("The day was incorrect.", 6, oCalDateTime.get(Calendar.DAY_OF_MONTH));
            assertEquals("The hour was incorrect.", 10, oCalDateTime.get(Calendar.HOUR_OF_DAY));
            assertEquals("The minutes was incorrect.", 8, oCalDateTime.get(Calendar.MINUTE));
            assertEquals("The seconds was incorrect.", 7, oCalDateTime.get(Calendar.SECOND));
        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("Failed to create the FhirDateTime value.  Message:" + e.getMessage());
        }
    }

    /**
     * Test createQuantity using string values method.
     */
    @Test
    public void testCreateQuantityUsingStringValues() {

        // Test with both null values.
        // ----------------------------
        Quantity oQuantity = FhirUtils.createQuantity((String) null, (String) null);
        FhirUtilsVerify.verifyQuantity(oQuantity, (String) null, (String) null);

        // Test with both empty strings.
        // ------------------------------
        oQuantity = FhirUtils.createQuantity("", "");
        FhirUtilsVerify.verifyQuantity(oQuantity, (String) null, (String) null);

        // Test with String - no units
        // -----------------------------
        oQuantity = FhirUtils.createQuantity("100.10", null);
        FhirUtilsVerify.verifyQuantity(oQuantity, "100.10", null);

        // Test with Units no value.
        // -----------------------------
        oQuantity = FhirUtils.createQuantity((String) null, "mm[HG]");
        FhirUtilsVerify.verifyQuantity(oQuantity, (String) null, "mm[HG]");

        // Test with both value and Units
        // -------------------------------
        oQuantity = FhirUtils.createQuantity("100.10", "mm[HG]");
        FhirUtilsVerify.verifyQuantity(oQuantity, "100.10", "mm[HG]");

        // Test with bad value and Units
        // -------------------------------
        try {
            oQuantity = FhirUtils.createQuantity("ABC", "mm[HG]");
            fail("We should have received a number format exception.");
        } catch (NumberFormatException ne) {
            // We expect this. So no failure.
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.");
        }
    }

    /**
     * Test createQuantity using BigDecimal values method.
     */
    @Test
    public void testCreateQuantityUsingBigDecimalValues() {

        // Test with both null values.
        // ----------------------------
        Quantity oQuantity = FhirUtils.createQuantity((BigDecimal) null, (String) null);
        FhirUtilsVerify.verifyQuantity(oQuantity, (BigDecimal) null, (String) null);

        // Test with both empty strings.
        // ------------------------------
        oQuantity = FhirUtils.createQuantity(new BigDecimal(0), "");
        FhirUtilsVerify.verifyQuantity(oQuantity, new BigDecimal(0), (String) null);

        // Test with String - no units
        // -----------------------------
        oQuantity = FhirUtils.createQuantity(new BigDecimal(100), null);
        FhirUtilsVerify.verifyQuantity(oQuantity, new BigDecimal(100), null);

        // Test with Units no value.
        // -----------------------------
        oQuantity = FhirUtils.createQuantity((BigDecimal) null, "mm[HG]");
        FhirUtilsVerify.verifyQuantity(oQuantity, (BigDecimal) null, "mm[HG]");

        // Test with both value and Units
        // -------------------------------
        oQuantity = FhirUtils.createQuantity(new BigDecimal(100), "mm[HG]");
        FhirUtilsVerify.verifyQuantity(oQuantity, new BigDecimal(100), "mm[HG]");
    }

    /**
     * Test createQuantity using BigDecimal with a string extension values.
     */
    @Test
    public void testCreateQuantityUsingBigDecimalValuesWithStringExtension() {

        // Test with both null values.
        // ----------------------------
        Quantity oQuantity = FhirUtils.createQuantity((BigDecimal) null, null, null);
        FhirUtilsVerify.verifyQuantity(oQuantity, null, null, null, null);

        // Test with no value or units, but an extension
        // ----------------------------------------------
        Extension oExtension = FhirUtils.createExtension("test", "value");
        oQuantity = FhirUtils.createQuantity(null, null, oExtension);
        FhirUtilsVerify.verifyQuantity(oQuantity, null, null, "test", "value");

        // Test with value,units, and an extension
        // ----------------------------------------------
        oExtension = FhirUtils.createExtension("test", "value");
        oQuantity = FhirUtils.createQuantity(new BigDecimal(100), "ML", oExtension);
        FhirUtilsVerify.verifyQuantity(oQuantity, new BigDecimal(100), "ML", "test", "value");
    }

    /**
     * Test the createLocalResourceReferenceAnchorString method.
     */
    @Test
    public void testCreateLocalResourceReferenceAnchorString() {
        // Test with null values
        // -----------------------
        String sLocalAnchor = FhirUtils.createLocalResourceReferenceAnchorString(null);
        assertNull("The result should have been null.", sLocalAnchor);

        // Test with valid values.
        // ------------------------
        sLocalAnchor = FhirUtils.createLocalResourceReferenceAnchorString("SomeText");
        assertEquals("The result was incorrect", FhirUtils.RESOURCE_REFERENCE_ANCHOR_PREFIX + "SomeText", sLocalAnchor);
    }

    /**
     * Test the createResourceReferenceAnchor method.
     */
    @Test
    public void testCreateResourceReferenceAnchor() {
        // Test with null values
        // -----------------------
        ResourceReference oResourceReference = FhirUtils.createResourceReferenceAnchor(null);
        assertNull("The result should have been null.", oResourceReference);

        // Test with valid values.
        // ------------------------
        oResourceReference = FhirUtils.createResourceReferenceAnchor("SomeText");
        assertNotNull("The result should not have been null.", oResourceReference);
        assertEquals("The result was incorrect", FhirUtils.createLocalResourceReferenceAnchorString("SomeText"), oResourceReference.getReferenceSimple());
    }

    /**
     * This method creates an extension and adds it to the list of extensions.
     *
     * @param oaExtension The extension list.
     * @param sExtUrl The URL of the extension to be added.
     */
    private void addExtension(List<Extension> oaExtension, String sExtUrl) {
        Extension oExtension = new Extension();
        oExtension.setUrlSimple(sExtUrl);
        oaExtension.add(oExtension);
    }

    /**
     * Test the removeExtensions method.
     */
    @Test
    public void testRemoveExtensions() {
        // Test with null extension array.
        // ---------------------------------
        List<Extension> oaExtension = null;
        FhirUtils.removeExtensions(oaExtension, null);
        assertNull("The extension should have remanined null.", oaExtension);

        // Test with null URL
        // -------------------
        oaExtension = new ArrayList<Extension>();
        addExtension(oaExtension, "Test1");
        addExtension(oaExtension, "Test2");
        addExtension(oaExtension, "Test3");
        addExtension(oaExtension, "Test3");
        FhirUtils.removeExtensions(oaExtension, null);
        assertEquals("The size should have been 4.", 4, oaExtension.size());

        // Test with trying to remove one that is not in the list.
        // ---------------------------------------------------------
        FhirUtils.removeExtensions(oaExtension, "Test4");
        assertEquals("The size should have been 4.", 4, oaExtension.size());

        // Test with removing 1 item
        // --------------------------
        FhirUtils.removeExtensions(oaExtension, "Test1");
        assertEquals("The size should have been 3.", 3, oaExtension.size());

        // Test with removing 2 items
        // ----------------------------
        FhirUtils.removeExtensions(oaExtension, "Test3");
        assertEquals("The size should have been 1.", 1, oaExtension.size());
        assertEquals("An incorrect item was in the list.", "Test2", oaExtension.get(0).getUrlSimple());

        // Put a null in the list and make sure we still work.
        // ------------------------------------------------------
        oaExtension.add(null);
        FhirUtils.removeExtensions(oaExtension, "Test2");
        assertEquals("There should have been one item in the list.", 1, oaExtension.size());
        assertNull("The remaining item should have been null.", oaExtension.get(0));

    }

    /**
     * Test the findExtension method.
     */
    @Test
    public void testFindExtension() {
        // Test with null extension array.
        // ---------------------------------
        List<Extension> oaExtension = null;

        Extension oExtension = FhirUtils.findExtension(oaExtension, null);
        assertNull("The extension should have been null.", oExtension);

        // Test with null URL
        // -------------------
        oaExtension = new ArrayList<Extension>();
        addExtension(oaExtension, "Test1");
        addExtension(oaExtension, "Test2");
        addExtension(oaExtension, "Test3");
        addExtension(oaExtension, "Test3");
        oExtension = FhirUtils.findExtension(oaExtension, null);
        assertNull("The extension should have been null.", oExtension);

        // Attempt to find one not in the list.
        // -------------------------------------
        oExtension = FhirUtils.findExtension(oaExtension, "Test4");
        assertNull("The extension should have been null.", oExtension);

        // Attempt to find one where there is only one in the list.
        // ----------------------------------------------------------
        oExtension = FhirUtils.findExtension(oaExtension, "Test1");
        assertNotNull("The extension should not have been null.", oExtension);
        assertEquals("The URL of the returned extension was not correct.", "Test1", oExtension.getUrlSimple());

        // Attempt to find one where there is two in the list.
        // ----------------------------------------------------------
        oExtension = FhirUtils.findExtension(oaExtension, "Test3");
        assertNotNull("The extension should not have been null.", oExtension);
        assertEquals("The URL of the returned extension was not correct.", "Test3", oExtension.getUrlSimple());
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    @Test
    public void testGetContainedResources() {
        Resource resource = new Patient();
        resource.getContained().add(new Patient());
        resource.getContained().add(new Practitioner());
        resource.getContained().add(new Organization());

        assertEquals("There should have been 0 resources.", 0, FhirUtils.getContainedResources(resource, AdverseReaction.class).size());

        for (Class typeClass : new Class[] {Patient.class, Practitioner.class, Organization.class}) {
            assertEquals("There should have been one resource for type " + typeClass, 1, FhirUtils.getContainedResources(resource, typeClass).size());
        }

        resource.getContained().add(new Patient());
        assertEquals("There should have been 2 resources.", 2, FhirUtils.getContainedResources(resource, Patient.class).size());
    }

    /**
     * This tests the createExtension(url, String) method.
     */
    @Test
    public void testCreateExtensionStringValue() {
        // Test null URL case
        // -------------------
        Extension oExtension = FhirUtils.createExtension(null, (String) null);
        assertNull("Extension should have been null.", oExtension);

        // Test null value case
        // ----------------------
        oExtension = FhirUtils.createExtension("http://somevalue", (String) null);
        assertNotNull("Extension should not have been null.", oExtension);
        assertEquals("The URL was incorrect.", "http://somevalue", oExtension.getUrlSimple());
        assertNull("The value should have been null.", FhirUtils.extractFhirStringValue(oExtension.getValue()));

        // Test Empty string case
        // ----------------------
        oExtension = FhirUtils.createExtension("http://somevalue", "");
        assertNotNull("Extension should not have been null.", oExtension);
        assertEquals("The URL was incorrect.", "http://somevalue", oExtension.getUrlSimple());
        assertEquals("The value should have been the empty string.", "", FhirUtils.extractFhirStringValue(oExtension.getValue()));

        // Test valid value
        // -----------------
        oExtension = FhirUtils.createExtension("http://somevalue", "Value1");
        assertNotNull("Extension should not have been null.", oExtension);
        assertEquals("The URL was incorrect.", "http://somevalue", oExtension.getUrlSimple());
        assertEquals("The value should have been the empty string.", "Value1", FhirUtils.extractFhirStringValue(oExtension.getValue()));
    }

    /**
     * This tests the createExtension(url, BigDecimal) method.
     */
    @Test
    public void testCreateExtensionBigDecimalValue() {
        // Test null URL case
        // -------------------
        Extension oExtension = FhirUtils.createExtension(null, (BigDecimal) null);
        FhirUtilsVerify.verifyExtensionDecimal(oExtension, null, null);

        // Test null value case
        // ----------------------
        oExtension = FhirUtils.createExtension("http://somevalue", (BigDecimal) null);
        FhirUtilsVerify.verifyExtensionDecimal(oExtension, "http://somevalue", null);

        // Test valid value
        // -----------------
        BigDecimal oValue = new BigDecimal(100);
        oExtension = FhirUtils.createExtension("http://somevalue", oValue);
        FhirUtilsVerify.verifyExtensionDecimal(oExtension, "http://somevalue", new BigDecimal(100));
    }

    /**
     * This tests the createExtension(url, Quantity) method.
     */
    @Test
    public void testCreateExtensionQuantityValue() {
        // Test null URL case
        // -------------------
        Extension oExtension = FhirUtils.createExtension(null, (Quantity) null);
        assertNull("Extension should have been null.", oExtension);

        // Test null value case
        // ----------------------
        oExtension = FhirUtils.createExtension("http://somevalue", (Quantity) null);
        assertNull("Extension should have been null.", oExtension);

        // Test valid value
        // -----------------
        Quantity oQuantity = new Quantity();
        oQuantity.setValueSimple(new BigDecimal(20));
        oExtension = FhirUtils.createExtension("http://somevalue", oQuantity);
        assertNotNull("Extension should not have been null.", oExtension);
        assertEquals("The URL was incorrect.", "http://somevalue", oExtension.getUrlSimple());
        assertTrue("The data type was incorrect.", Quantity.class.isInstance(oExtension.getValue()));
        oQuantity = (Quantity) oExtension.getValue();
        assertNotNull("The value should not have been null.", oQuantity.getValueSimple());
        assertEquals("The value was not correct.", 20, oQuantity.getValueSimple().intValue());
    }

    /**
     * This tests the createExtension(url, Integer) method.
     */
    @Test
    public void testCreateExtensionIntegerValue() {
        // Test null URL case
        // -------------------
        Extension oExtension = FhirUtils.createExtension(null, (Integer) null);
        FhirUtilsVerify.verifyExtensionInteger(oExtension, null, null);

        // Test null value case
        // ----------------------
        oExtension = FhirUtils.createExtension("http://somevalue", (Integer) null);
        FhirUtilsVerify.verifyExtensionInteger(oExtension, "http://somevalue", null);

        // Test valid value
        // -----------------
        Integer oValue = new Integer(100);
        oExtension = FhirUtils.createExtension("http://somevalue", oValue);
        FhirUtilsVerify.verifyExtensionInteger(oExtension, "http://somevalue", oValue);
    }

    /**
     * This tests the createExtension(url, DateTime) method.
     */
    @Test
    public void testCreateExtensionDateTimeValue() {
        try {
            // Test null URL case
            // -------------------
            Extension oExtension = FhirUtils.createExtension(null, (DateTime) null);
            FhirUtilsVerify.verifyExtensionDateTime(oExtension, null, null);

            // Test null value case
            // ----------------------
            oExtension = FhirUtils.createExtension("http://somevalue", (DateTime) null);
            FhirUtilsVerify.verifyExtensionDateTime(oExtension, "http://somevalue", null);

            // Test valid value
            // -----------------
            Calendar oCalDateTime = VistaUtils.fmDatetimeToDateDate("2991112.100101");
            DateTime oDateTime = FhirUtils.createFhirDateTime(oCalDateTime);
            oExtension = FhirUtils.createExtension("http://somevalue", oDateTime);
            FhirUtilsVerify.verifyExtensionDateTime(oExtension, "http://somevalue", "11/12/1999.10:01:01");
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exceptiopn occurred.  Error: " + e.getMessage());
        }
    }

    @Test
    public void testCreateExtensionBooleanValue() {
        try {
            // Test null URL case
            // -------------------
            Extension oExtension = FhirUtils.createExtension(null, (Boolean) null);
            FhirUtilsVerify.verifyExtensionBoolean(oExtension, null, null);

            // Test null value case
            // ----------------------
            oExtension = FhirUtils.createExtension("http://somevalue", (Boolean) null);
            FhirUtilsVerify.verifyExtensionBoolean(oExtension, "http://somevalue", null);

            // Test valid value
            // -----------------
            oExtension = FhirUtils.createExtension("http://somevalue", Boolean.TRUE);
            FhirUtilsVerify.verifyExtensionBoolean(oExtension, "http://somevalue", Boolean.TRUE);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exceptiopn occurred.  Error: " + e.getMessage());
        }
    }

    /**
     * This tests the getContainedResource() methods.
     */
    @Test
    public void testGetContainedResource() {
        // Check null ID
        // -----------------
        Resource oResource = FhirUtils.getContainedResource(null, null);
        assertNull("Resource should have been null.", oResource);

        // Check Null Resource
        // ---------------------
        oResource = FhirUtils.getContainedResource(null, "1");
        assertNull("Resource should have been null.", oResource);

        // Check Null "Contained" array
        // -----------------------------
        Practitioner oPractitioner = new Practitioner();
        oResource = FhirUtils.getContainedResource(oPractitioner, "1");
        assertNull("Resource should have been null.", oResource);

        // Search contained array: no match - using ID with #
        // ----------------------------------------------------
        oPractitioner = new Practitioner();
        Organization oOrg = new Organization();
        oOrg.setXmlId("1");
        oPractitioner.getContained().add(oOrg);
        Location oLoc = new Location();
        oLoc.setXmlId("2");
        oPractitioner.getContained().add(oLoc);
        oResource = FhirUtils.getContainedResource(oPractitioner, "#3");
        assertNull("Resource should have been null.", oResource);

        // Search contained array: no match - using ID without #
        // -------------------------------------------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, "3");
        assertNull("Resource should have been null.", oResource);

        // Search contained array: march using ID with #
        // -----------------------------------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, "#2");
        assertNotNull("Resource should not have been null.", oResource);

        // Search contained array: march using ID without #
        // --------------------------------------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, "1");
        assertNotNull("Resource should not have been null.", oResource);

        // Test with valid type
        // ----------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, "1", Organization.class);
        assertNotNull("Resource should not have been null.", oResource);

        // Test with invalid type
        // ----------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, "1", Location.class);
        assertNull("Resource should have been null.", oResource);

        // Test with null Resource Reference
        // ------------------------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, (ResourceReference) null, Organization.class);
        assertNull("Resource should have been null.", oResource);

        // Test with empty Resource Reference
        // ------------------------------------
        oResource = FhirUtils.getContainedResource(oPractitioner, new ResourceReference(), Organization.class);
        assertNull("Resource should have been null.", oResource);

        // Test with valid Resource Reference
        // ------------------------------------
        ResourceReference oResRef = new ResourceReference();
        oResRef.setReferenceSimple("1");
        oResource = FhirUtils.getContainedResource(oPractitioner, oResRef, Organization.class);
        assertNotNull("Resource should not have been null.", oResource);
    }

    /**
     * This tests the createIdentifier method.
     */
    @Test
    public void testCreateIdentifier() {
        // Test null conditions
        // ----------------------
        Identifier oIdentifier = FhirUtils.createIdentifier(null, null);
        assertNull("Identifier should have been null", oIdentifier);

        oIdentifier = FhirUtils.createIdentifier("urn:oid:1.1.1", null);
        assertNull("Identifier should have been null", oIdentifier);

        // Test without system
        // ---------------------
        oIdentifier = FhirUtils.createIdentifier(null, "100");
        assertNotNull("Identifier should not have been null", oIdentifier);
        assertNull("System should have been null.", oIdentifier.getSystemSimple());
        assertEquals("The identifier value was incorrect.", "100", oIdentifier.getValueSimple());

        // Test with system
        // -----------------
        oIdentifier = FhirUtils.createIdentifier("urn:oid:1.1.1", "100");
        assertNotNull("Identifier should not have been null", oIdentifier);
        assertEquals("System should have been null.", "urn:oid:1.1.1", oIdentifier.getSystemSimple());
        assertEquals("The identifier value was incorrect.", "100", oIdentifier.getValueSimple());
    }

    /**
     * This tests the createFhirDateTime method.
     */
    @Test
    public void testCreateFhirDateTimeWithCalendar() {
        // Test null case
        // ----------------
        Calendar oCalDate = null;
        DateTime oDateTime = FhirUtils.createFhirDateTime(oCalDate);
        assertNull("The result should have been null.", oDateTime);

        oCalDate = Calendar.getInstance();
        oDateTime = FhirUtils.createFhirDateTime(oCalDate);
        assertNotNull("The result should have been null.", oDateTime);

    }

    /**
     * This method tests the createPractitionerResource() method.
     */
    @Test
    public void testCreatePractitionerResource() {

        // Check for all null
        // -------------------
        Practitioner oPractitioner = FhirUtils.createPractitionerResource(null, null, null, null, null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, null, null, null, null, null, null, null, null);

        // Check for valid ID, rest null
        // -----------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", null, null, null, null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", null, null, null, null, null, null, null);

        // Check for valid ID and system, rest null
        // -------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", null, null, null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", null, null, null, null, null, null);

        // Check for valid name, rest null
        // --------------------------------
        oPractitioner = FhirUtils.createPractitionerResource(null, null, "Smith, John", null, null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, null, null, "Smith, John", null, null, null, null, null);

        // Check for valid Id, Id System, name, rest null
        // ------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", null, null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", null, null, null, null, null);

        // Check for valid Id, Id System, name, ord ID, rest null
        // -------------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", "200", null, null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", "200", null, null, null, null);

        // Check for valid Id, Id System, name, ord ID, Loc ID, rest null
        // ----------------------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", "200", "300", null, null, null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", "200", "300", null, null, null);

        // Check for valid Id, Id System, name, ord ID, Loc ID, HL7 Role Code System, rest null
        // --------------------------------------------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", "200", "300", null, "urn:oid:2.2", null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", "200", "300", null, "urn:oid:2.2", null);

        // Check for valid Id, Id System, name, ord ID, Loc ID, HL7 Role Code, HL7 Role Code System, rest null
        // -----------------------------------------------------------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", "200", "300", "PH", "urn:oid:2.2", null);
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", "200", "300", "PH", "urn:oid:2.2", null);

        // Check for valid Id, Id System, name, ord ID, Loc ID, HL7 Role Code, HL7 Role Code System, HL7 Role Display
        // ------------------------------------------------------------------------------------------------------------
        oPractitioner = FhirUtils.createPractitionerResource("101", "urn:oid:1.1", "Smith, John", "200", "300", "PH", "urn:oid:2.2", "Pharmacist");
        FhirUtilsVerify.verifyPractitionerResource(oPractitioner, "101", "urn:oid:1.1", "Smith, John", "200", "300", "PH", "urn:oid:2.2", "Pharmacist");
    }

    /**
     * Test the getReferenceId methods
     */
    @Test
    public void testGetReferenceId() {
        // Test getReferenceId(ResourceReference) first...
        // -------------------------------------------------

        // Test Null
        // ----------
        String sRefId = FhirUtils.getReferenceId((ResourceReference) null);
        assertNull("The result should have been null.", sRefId);

        // Test Null SimpleReference
        // ---------------------------
        ResourceReference oResRef = new ResourceReference();
        sRefId = FhirUtils.getReferenceId(oResRef);
        assertNull("The result should have been null.", sRefId);

        // Test valid value with #
        // -------------------------
        oResRef = new ResourceReference();
        oResRef.setReferenceSimple("#1234");
        sRefId = FhirUtils.getReferenceId(oResRef);
        assertEquals("The value was incorrect.", "1234", sRefId);

        // Test valid value
        // ------------------
        oResRef = new ResourceReference();
        oResRef.setReferenceSimple("1234");
        sRefId = FhirUtils.getReferenceId(oResRef);
        assertEquals("The value was incorrect.", "1234", sRefId);

        // Test getReferenceId(List<ResourceReference>) next...
        // -------------------------------------------------

        // Test Null
        // ----------
        sRefId = FhirUtils.getReferenceId((List<ResourceReference>) null);
        assertNull("The result should have been null.", sRefId);

        // Test Null array
        // ------------------
        List<ResourceReference> oaResRef = new ArrayList<ResourceReference>();
        sRefId = FhirUtils.getReferenceId((List<ResourceReference>) null);
        assertNull("The result should have been null.", sRefId);

        // Test Null element
        // ------------------
        oaResRef = new ArrayList<ResourceReference>();
        oaResRef.add(null);
        sRefId = FhirUtils.getReferenceId((List<ResourceReference>) null);
        assertNull("The result should have been null.", sRefId);
    }

    /**
     * This method tests the createOrganizationResource() method.
     */
    @Test
    public void testCreateOrganizationResource() {

        // Check for all null
        // -------------------
        Organization oOrganization = FhirUtils.createOrganizationResource(null, null, null);
        FhirUtilsVerify.verifyOrganizationResource(oOrganization, null, null, null);

        // Check for valid ID, rest null
        // -----------------------------
        oOrganization = FhirUtils.createOrganizationResource("101", null, null);
        FhirUtilsVerify.verifyOrganizationResource(oOrganization, "101", null, null);

        // Check for valid ID and system, rest null
        // -------------------------------------------
        oOrganization = FhirUtils.createOrganizationResource("101", "urn:oid:1.1", null);
        FhirUtilsVerify.verifyOrganizationResource(oOrganization, "101", "urn:oid:1.1", null);

        // Check for valid name, rest null
        // --------------------------------
        oOrganization = FhirUtils.createOrganizationResource(null, null, "Acme Organization");
        FhirUtilsVerify.verifyOrganizationResource(oOrganization, null, null, "Acme Organization");

        // Check for valid Id, Id System, name, rest null
        // ------------------------------------------------
        oOrganization = FhirUtils.createOrganizationResource("101", "urn:oid:1.1", "Another Organization");
        FhirUtilsVerify.verifyOrganizationResource(oOrganization, "101", "urn:oid:1.1", "Another Organization");
    }

    /**
     * This method tests the createLocationResource() method.
     */
    @Test
    public void testCreateLocationResource() {

        // Check for all null
        // -------------------
        Location oLocation = FhirUtils.createLocationResource(null, null, null);
        FhirUtilsVerify.verifyLocationResource(oLocation, null, null, null);

        // Check for valid ID, rest null
        // -----------------------------
        oLocation = FhirUtils.createLocationResource("101", null, null);
        FhirUtilsVerify.verifyLocationResource(oLocation, "101", null, null);

        // Check for valid ID and system, rest null
        // -------------------------------------------
        oLocation = FhirUtils.createLocationResource("101", "urn:oid:1.1", null);
        FhirUtilsVerify.verifyLocationResource(oLocation, "101", "urn:oid:1.1", null);

        // Check for valid name, rest null
        // --------------------------------
        oLocation = FhirUtils.createLocationResource(null, null, "Acme Location");
        FhirUtilsVerify.verifyLocationResource(oLocation, null, null, "Acme Location");

        // Check for valid Id, Id System, name, rest null
        // ------------------------------------------------
        oLocation = FhirUtils.createLocationResource("101", "urn:oid:1.1", "Another Location");
        FhirUtilsVerify.verifyLocationResource(oLocation, "101", "urn:oid:1.1", "Another Location");
    }

    /**
     * Test the createResourceReferenceExternal method
     */
    @Test
    public void testCreateResourceReferenceExternal() {
        // Test null case
        // ---------------
        ResourceReference oResRef = FhirUtils.createResourceReferenceExternal(null);
        assertNull("The resource should have been null.", oResRef);

        // Test with valid resource
        // --------------------------
        oResRef = FhirUtils.createResourceReferenceExternal("Testing");
        assertNotNull("The resource should not have been null.", oResRef);
        assertEquals("The resource reference ID was not correct.", "Testing", oResRef.getReferenceSimple());
    }

    /**
     * This method tests the createDuration() method.
     */
    @Test
    public void testCreateDuration() {
        // Test null condition
        // --------------------
        Duration oDuration = FhirUtils.createDuration(null, null, null, null);
        FhirUtilsVerify.verifyDuration(oDuration, null, null, null, null);

        // Test value with all other fields null
        // ---------------------------------------
        oDuration = FhirUtils.createDuration(new BigDecimal(1), null, null, null);
        FhirUtilsVerify.verifyDuration(oDuration, new BigDecimal(1), null, null, null);

        // Test value with all other fields null
        // ---------------------------------------
        oDuration = FhirUtils.createDuration(new BigDecimal(1), "TheSystem", "TheCode", "TheUnits");
        FhirUtilsVerify.verifyDuration(oDuration, new BigDecimal(1), "TheSystem", "TheCode", "TheUnits");
    }

    /**
     * This method tests the createPeriod(...) methods
     */
    @Test
    public void testCreatePeriod() {
        // Test Null case two parameters
        // -------------------------------
        Period oPeriod = FhirUtils.createPeriod(null, null);
        assertNull("Period should have been null.", oPeriod);

        // Test Null case three parameters
        // -------------------------------
        oPeriod = FhirUtils.createPeriod(null, null, null);
        assertNull("Period should have been null.", oPeriod);

        // Test filling in values.
        // ------------------------
        Calendar oStartTime = Calendar.getInstance();
        oStartTime.clear();
        oStartTime.set(2010, 1, 2, 10, 10, 10);
        Calendar oEndTime = Calendar.getInstance();
        oEndTime.clear();
        oEndTime.set(2010, 1, 2, 11, 11, 11);
        Extension oExtension = FhirUtils.createExtension("TheURL", "TheValue");
        oPeriod = FhirUtils.createPeriod(oStartTime, oEndTime, oExtension);
        FhirUtilsVerify.verifyPeriod(oPeriod, "02/02/2010.10:10:10", "02/02/2010.11:11:11", "TheURL", "TheValue");

    }

    /**
     * Test the {@link FhirUtils#findIdentifierByLabel(java.util.Collection, String)} method.
     */
    @Test
    public void testFindIdentifierByLabel() {
        // Null checks
        assertNull(FhirUtils.findIdentifierByLabel(null, null));
        assertNull(FhirUtils.findIdentifierByLabel(null, "dfn"));
        assertNull(FhirUtils.findIdentifierByLabel(new ArrayList<Identifier>(), null));
        assertNull(FhirUtils.findIdentifierByLabel(new ArrayList<Identifier>(), "dfn"));

        List<Identifier> identifiers = new ArrayList<Identifier>();
        Identifier dfn = new Identifier();
        dfn.setLabelSimple("dfn");
        dfn.setValueSimple("20");
        identifiers.add(dfn);

        assertEquals("20", FhirUtils.findIdentifierByLabel(identifiers, "dfn"));
        assertNull(FhirUtils.findIdentifierByLabel(identifiers, "boguslabel"));
    }

}
