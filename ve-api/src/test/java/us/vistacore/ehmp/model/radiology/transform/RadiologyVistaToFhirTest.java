package us.vistacore.ehmp.model.radiology.transform;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.allergies.transform.AllergiesVistaToFhir;
import us.vistacore.ehmp.model.radiology.Diagnosis;
import us.vistacore.ehmp.model.radiology.Providers;
import us.vistacore.ehmp.model.radiology.RadiologyResult;
import us.vistacore.ehmp.model.radiology.VPRRadiologyRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

@RunWith(Parameterized.class)
public class RadiologyVistaToFhirTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return RadiologyResultsGenerator.create();
    }

    private RadiologyResultsVistaToFhir testObject = null;
    private RadiologyResult radResult;

    public RadiologyVistaToFhirTest(RadiologyResult radResultInput) {
        this.radResult = radResultInput;
    }

    @Before
    public void setUp() throws Exception {
        testObject = new RadiologyResultsVistaToFhir();
    }

    /**
     * This method tests creates an empty diagnostic report and transform the extension
     */
    @Test
    public void testTransformExtensions() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformExtensions(this.radResult, fhirDiagnosticReport);
        verifyTransformExtensions(this.radResult, fhirDiagnosticReport);
    }

    /**
     * This method tests verifies we populated Fhir correctly
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformExtensions(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The status node should not have been null.", fhirDiagnosticReport.getExtensions());

        for (String fieldName : RadiologyResultsVistaToFhir.EXTENSION_RAD_FIELD_NAMES) {
            String fieldValue = (String) FhirUtils.getBeanPropertyValue(radResult, fieldName);
            if (isNotNullish(fieldValue)) {
                String name = RadiologyResultsVistaToFhir.RAD_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirDiagnosticReport.getExtension(name);
                assertEquals("Extension value does not equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }

        for (Providers provider : radResult.getProviders()) {
            for (String fieldName : RadiologyResultsVistaToFhir.EXTENSION_PROVIDERS_FIELD_NAMES) {
                String fieldValue = (String) FhirUtils.getBeanPropertyValue(provider, fieldName);
                if (isNotNullish(fieldValue)) {
                    String name = RadiologyResultsVistaToFhir.RAD_EXTENSION_URL_PREFIX + fieldName;
                    Extension extension = fhirDiagnosticReport.getExtension(name);
                    assertEquals("Extension value does not equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
                }
            }
        }
    }

    /**
     * This method tests the transformText method for null conditions
     */
    @Test
    public void testTransformTextNull() {

        DiagnosticReport fhirDiagnosticReport = null;

        // Check for not null
        testObject.transformText(fhirDiagnosticReport);
        assertNull(fhirDiagnosticReport);

        // Check for null Text
        fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformText(fhirDiagnosticReport);
        assertNotNull("The text node should have been null.", fhirDiagnosticReport.getText());
        testObject.transformText(fhirDiagnosticReport);
        assertNotNull("The text node should not have been null.", fhirDiagnosticReport.getText());
    }

    /**
     * This method tests the transformText method for non-null conditions.
     */
    @Test
    public void testTransformTextValidValues() throws ModelTransformException {
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformText(fhirDiagnosticReport);
        assertNotNull(fhirDiagnosticReport.getText());
        assertNotNull(fhirDiagnosticReport.getText().getDiv());
        assertNotNull(fhirDiagnosticReport.getText().getDiv().allText());

        fhirDiagnosticReport = testObject.transformOneRadiologyResult(radResult, oPtIdentity);

        verifyTransformText(this.radResult, fhirDiagnosticReport);
    }

    /**
     * Verify that the text was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformText(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The text node should not have been null.", fhirDiagnosticReport.getText());
        assertEquals("The narrative status was incorrect.", NarrativeStatus.generated, fhirDiagnosticReport.getText().getStatusSimple());
        assertNotNull("The div node in the Text should not have been null.", fhirDiagnosticReport.getText().getDiv());
        assertNotNull("The div node text in the Text should not have been null.", fhirDiagnosticReport.getText().getDiv().allText());

        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Name"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Status"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Report Released"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Subject"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Performer"));
        if (isNotNullish(radResult.getUid())) {
            assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Identifier"));
        }

        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Conclusion"));
    }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformName(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertEquals("Results name text is incorrect.", radResult.getName(), fhirDiagnosticReport.getName().getTextSimple());
    }

    /**
     * This method tests the transformStatus method for null conditions
     */
    @Test
    public void testTransformStatusNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        // --------------------------
        testObject.transformStatus(null, fhirDiagnosticReport);
        assertNull("The status should have been null.", fhirDiagnosticReport.getStatusSimple());

        // Check for null Text
        // ------------------------
        RadiologyResult radResult = new RadiologyResult();
        testObject.transformStatus(radResult, fhirDiagnosticReport);
        assertNull("The status should have been null.", fhirDiagnosticReport.getStatusSimple());
    }

    /**
     * This method tests the transformStatus method for non-null conditions.
     */
    @Test
    public void testTransformStatusValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformStatus(radResult, fhirDiagnosticReport);
        verifyTransformStatus(this.radResult, fhirDiagnosticReport);
    }
    
    /**
     * This method tests the transformStatus method for status not found conditions.
     */
    @Test
    public void testTransformStatusUnknownValue() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        
        RadiologyResult vprRadiologyResult = new RadiologyResult();
        vprRadiologyResult.setStatusName("UNKNOWNSTATUS");
        testObject.transformStatus(vprRadiologyResult, fhirDiagnosticReport);
        
        assertNotNull("The status node should not have been null.", fhirDiagnosticReport.getStatusSimple());
        assertEquals("The status was incorrect.", RadiologyResultsVistaToFhir.DEFAULT_STATUS, fhirDiagnosticReport.getStatusSimple());
    }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param radResult The radiology to compare to
     * @param fhirDiagnosticReport The DiagnosticReport being verified
     */
    private void verifyTransformStatus(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The status node should not have been null.", fhirDiagnosticReport.getStatusSimple());
        assertEquals("The status was incorrect.", DiagnosticReport.DiagnosticReportStatus.final_, fhirDiagnosticReport.getStatusSimple());
    }

    /**
     * This method tests the transformIssuedDateTime method for null conditions
     */

    /**
     * Verify that the issuedDateTime was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformIssuedDateTime(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The Issued field should not have been null.", fhirDiagnosticReport.getIssuedSimple());
        SimpleDateFormat oHL7Format = new SimpleDateFormat("yyyyMMddHHmmss");

        Date issuedDate = FhirUtils.toCalender(fhirDiagnosticReport.getIssuedSimple()).getTime();

        String sDateTime = oHL7Format.format(issuedDate);
        assertTrue("The issued date/time was incorrect.", sDateTime.startsWith(radResult.getDateTime()));
    }

    @Test
    public void testTransformIssuedDateTimeNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            // Check for null
            // --------------------------
            testObject.transformIssuedDateTime(null, fhirDiagnosticReport);
            assertNull("The issued datetime should have been null.", fhirDiagnosticReport.getIssued());

            // Check for null Text
            // ------------------------
            RadiologyResult radResult = new RadiologyResult();
            testObject.transformIssuedDateTime(radResult, fhirDiagnosticReport);
            assertNull("The issued datetime should have been null.", fhirDiagnosticReport.getIssued());

        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformIssuedDateTime method for non-null conditions.
     */
    @Test
    public void testTransformIssuedDateTimeValidValue() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            testObject.transformIssuedDateTime(this.radResult, fhirDiagnosticReport);
            verifyTransformIssuedDateTime(this.radResult, fhirDiagnosticReport);
        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method verifies the contents of the transformed radiology result subject.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformSubject(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport, ResourceReference patientReference) {
        assertNotNull("The subject should not have been null.", fhirDiagnosticReport.getSubject());
        assertEquals("The subject was not correct.", patientReference.getReferenceSimple(), fhirDiagnosticReport.getSubject().getReferenceSimple());
    }

    /**
     * This method tests transformSubject method for null conditions.
     */
    @Test
    public void testTransformSubjectNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

            // Check for null
            // -----------------------
            testObject.transformSubject(null, fhirDiagnosticReport, null);
            assertNull("The subject node should have been null.", fhirDiagnosticReport.getSubject());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformSubject method for non-null conditions.
     */
    @Test
    public void testTransformSubjectValidValues() {
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        try {
            DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
            ResourceReference patientReference = testObject.transformSubject(radResult, fhirDiagnosticReport, oPtIdentity);
            verifyTransformSubject(this.radResult, fhirDiagnosticReport, patientReference);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformPerformer method for null conditions
     */
    @Test
    public void testTransformPerformerNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        // --------------------------
        testObject.transformPerformer(null, fhirDiagnosticReport);
        assertNull("The performer should have been null.", fhirDiagnosticReport.getPerformer());
        assertEquals("There should be no contained organization resources.", 0, FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class).size());

        // Check for null identifier
        // ---------------------------
        RadiologyResult radResult = new RadiologyResult();
        testObject.transformPerformer(radResult, fhirDiagnosticReport);
        assertNull("The performer should have been null.", fhirDiagnosticReport.getPerformer());
        assertEquals("There should be no contained organization resources.", 0, FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class).size());

    }

    /**
     * This method tests the transformPerformer method for non-null conditions.
     */
    @Test
    public void testTransformPerformerValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformPerformer(this.radResult, fhirDiagnosticReport);
        verifyTransformPerformer(this.radResult, fhirDiagnosticReport);
    }

    /**
     * This method verifies that the Performer field was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformPerformer(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The Performer field should not have been null.", fhirDiagnosticReport.getPerformer());

        List<Organization> containedOrganizations = FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class);
        assertEquals("There should have been only one contained organization.", 1, containedOrganizations.size());
        Organization containedOrganization = containedOrganizations.get(0);

        assertTrue("The performer field should reference the contained resource.", fhirDiagnosticReport.getPerformer().getReferenceSimple().contains(containedOrganization.getXmlId()));

        if (radResult.getFacilityCode() != null) {
            assertEquals("Organization Should contain one identifier", containedOrganization.getIdentifier().size(), 1);
            assertEquals("Organization identifier should have facility Code for value", radResult.getFacilityCode(), containedOrganization.getIdentifier().get(0).getValueSimple());
        }

        assertTrue(isNullish(containedOrganization.getAddress()));
        assertEquals(radResult.getFacilityName(), containedOrganization.getNameSimple());
        assertEquals(radResult.getFacilityName(), fhirDiagnosticReport.getPerformer().getDisplaySimple());

    }

    @Test
    public void testIdentifier() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformIdentifier(this.radResult, fhirDiagnosticReport);
        verifyTransformIdentifier(this.radResult, fhirDiagnosticReport);
    }

    /**
     * This method verifies the contents of the transformed radiology result report id.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformIdentifier(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The identifier node should not have been nullish.", fhirDiagnosticReport.getIdentifier());
        assertEquals("Identifier.system was incorrect.", AllergiesVistaToFhir.ALLERGY_IDENTIFIER_SYSTEM, fhirDiagnosticReport.getIdentifier().getSystemSimple());
        assertEquals("Identifier.value was incorrect.", radResult.getUid(), fhirDiagnosticReport.getIdentifier().getValueSimple());
    }

    /**
     * This method tests transformServiceCategory method for null conditions.
     */
    @Test
    public void testTransformServiceCategoryNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

            // Check for null
            // -----------------------
            testObject.transformServiceCategory(null, fhirDiagnosticReport);
            assertNull("The subject node should have been null.", fhirDiagnosticReport.getServiceCategory());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformServiceCategory method for non-null conditions.
     */
    @Test
    public void testTransformServiceCategoryValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformServiceCategory(this.radResult, fhirDiagnosticReport);
        verifyTransformServiceCategory(this.radResult, fhirDiagnosticReport);
    }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformServiceCategory(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The service category node should not have been null.", fhirDiagnosticReport.getServiceCategory());
    }

    /**
     * Verify that the diagnosticDateTime was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformDiagnosticDateTime(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The diagnostic field should not have been null.", fhirDiagnosticReport.getDiagnostic());
        SimpleDateFormat oHL7Format = new SimpleDateFormat("yyyyMMddHHmmss");

        Date diagnosticDate = FhirUtils.toCalender((DateTime) fhirDiagnosticReport.getDiagnostic()).getTime();
        String sDateTime = oHL7Format.format(diagnosticDate);
        assertTrue("The diagnostic datetime was incorrect.", sDateTime.startsWith(radResult.getDateTime()));
    }

    /**
     * This method tests the transformDiagnosticDateTime method for null conditions
     */
    @Test
    public void testTransformDiagnosticDateTimeNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            // Check for null
            // --------------------------
            testObject.transformDiagnosticDateTime(null, fhirDiagnosticReport);
            assertNull("The diagnostic datetime should have been null.", fhirDiagnosticReport.getDiagnostic());

            // Check for null Text
            // ------------------------
            RadiologyResult radResult = new RadiologyResult();
            testObject.transformDiagnosticDateTime(radResult, fhirDiagnosticReport);
            assertNull("The diagnostic datetime should have been null.", fhirDiagnosticReport.getDiagnostic());
        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformDiagnosticDateTime method for non-null conditions.
     */
    @Test
    public void testTransformDiagnosticDateTimeValidValue() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            testObject.transformDiagnosticDateTime(this.radResult, fhirDiagnosticReport);
            verifyTransformDiagnosticDateTime(this.radResult, fhirDiagnosticReport);
        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformResults method for null conditions
     */
    @Test
    public void testTransformResultsNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        // --------------------------
        testObject.transformResult(null, fhirDiagnosticReport);
        assertEquals("The results should have been null.", fhirDiagnosticReport.getResult().size(), 0);

        // Check for null Text
        // ------------------------
        RadiologyResult radResult = new RadiologyResult();
        testObject.transformResult(radResult, fhirDiagnosticReport);
        assertEquals("The results should have been null.", fhirDiagnosticReport.getResult().size(), 0);
    }

    /**
     * This method tests the transformResults method for non-null conditions.
     */
    @Test
    public void testTransformResultsValidValue() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        @SuppressWarnings("unused") ResourceReference subjectReference = testObject.transformSubject(this.radResult, fhirDiagnosticReport, oPtIdentity);
    }

    /**
     * Verify that the diagnositic results was transformed correctly.
     *
     * @param radResult The radiology result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    @SuppressWarnings("unused")
    private void verifyTransformResults(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The results should not have been null.", fhirDiagnosticReport.getResult());
        assertNotNull("The results name should not have been null.", fhirDiagnosticReport.getName().getTextSimple());

        verifyTransformName(radResult, fhirDiagnosticReport);
    }

    @Test
    public void testConclusion() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformConclusion(this.radResult, fhirDiagnosticReport);
    }

    public void verifyTransformConclusion(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("Conclusion should not have been null", fhirDiagnosticReport.getConclusionSimple());
        assertEquals("Conclusion should have equal", radResult.getInterpretation(), fhirDiagnosticReport.getConclusionSimple());
    }

    @Test
    public void testTransformConclusionNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        // --------------------------
        testObject.transformConclusion(null, fhirDiagnosticReport);
        assertNull("The conclusion should have been null.", fhirDiagnosticReport.getConclusionSimple());
    }

    @Test
    public void testCodedDiagnosis() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformCodedDiagnosis(this.radResult, fhirDiagnosticReport);
    }

    public void verifyTransformCodedDiagnosis(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        for (Diagnosis diagnosis : radResult.getDiagnosis()) {
            assertNotNull("Coded diagnosis should not have been null", fhirDiagnosticReport.getCodedDiagnosis());
            assertEquals("Coded diagnosis code should have equal", diagnosis.getCode(), fhirDiagnosticReport.getCodedDiagnosis().get(0).getCoding().get(0).getCode());
        }
    }

    @Test
    public void testTransformCodedDiagnosisNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        // --------------------------
        testObject.transformCodedDiagnosis(null, fhirDiagnosticReport);
        assertEquals("The coded diagnosis should have been 0.", 0, fhirDiagnosticReport.getCodedDiagnosis().size());
    }

    /**
     * This method tests an overall transform containing two radiology results.
     */
    @Test
    public void testTransformWithTwoRadiologyResults() {
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        try {
            VPRRadiologyRpcOutput radsRpcOutput = RadiologyResultsGenerator.createSampleVprRadiologyRpcOutput();
            RadiologyResultsGenerator.addToRadiologyResultsArray(1, radsRpcOutput);
            RadiologyResultsGenerator.addToRadiologyResultsArray(2, radsRpcOutput);

            List<Resource> fhirDiagnosticReports = testObject.transform(radsRpcOutput, oPtIdentity);
            assertTrue("The return result should not have been nullish.", NullChecker.isNotNullish(fhirDiagnosticReports));
            assertEquals("There should have been two results returned.", 2, fhirDiagnosticReports.size());
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the case of passing in a null into the TransformOneLabResult method.
     */
    @Test
    public void testTransformOneRadiologyResultNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = testObject.transformOneRadiologyResult(null, null);
            assertNull("The response should have been null.", fhirDiagnosticReport);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }
}

final class VistaPatientIdentityGenerator {

    public static final String ENTERPRISE_PATIENT_IDENTIFIER = "3";
    public static final String PATIENT_ID = "30";
    public static final String LOCATION = "FACILITY1";

    private VistaPatientIdentityGenerator() {
    }

    /**
     * Create an instance of the VistaPatientIdentity that we can use to do the various transforms from.
     *
     * @return A sample VistaPatientIdentity object to use for transformation purposes.
     */
    public static VistaPatientIdentity createSampleVistaPatientIdentity() {
        VistaPatientIdentity oPtIdentity = new VistaPatientIdentity();

        oPtIdentity.setEnterprisePatientIdentifier(ENTERPRISE_PATIENT_IDENTIFIER);
        oPtIdentity.setLocalId(PATIENT_ID);
        oPtIdentity.setSiteCode(LOCATION);

        return oPtIdentity;
    }

}
