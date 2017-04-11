package us.vistacore.ehmp.model.labresults.transform;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.Address;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Observation.ObservationReliability;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Specimen;
import org.hl7.fhir.instance.model.String_;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.allergies.transform.AllergiesVistaToFhir;
import us.vistacore.ehmp.model.labresults.LabResult;
import us.vistacore.ehmp.model.labresults.LabResult.GramStain;
import us.vistacore.ehmp.model.labresults.LabResult.Organism;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

/**
 * This class tests the LabResultsVistaToFhir class.
 *
 * @author seth.gainey
 *
 */
@RunWith(Parameterized.class)
public class LabResultsVistaToFhirTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return LabResultsGenerator.create();
    }

    private LabResultsVistaToFhir testObject = null;
    private LabResult labResult;

    public LabResultsVistaToFhirTest(LabResult labResultInput, String dfn) {
        this.labResult = labResultInput;
    }

    @Before
    public void setUp() throws Exception {
        testObject = new LabResultsVistaToFhir();
    }

    /**
     * This method tests creates an empty diagnostic report and transform the extension
     */
    @Test
    public void testTransformExtensions() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformExtensions(fhirDiagnosticReport, this.labResult);
        verifyTransformExtensions(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method tests verifies we populated Fhir correctly
     * @param labResult2 The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformExtensions(LabResult labResult2, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The status node should not have been null.", fhirDiagnosticReport.getExtensions());

        for (String fieldName : LabResultsVistaToFhir.LAB_EXTENSION_MAIN_FIELD_NAMES) {
            String fieldValue = LabResultsVistaToFhir.getFieldValue(labResult2, fieldName);
            if (isNotNullish(fieldValue)) {
                String name = LabResultsVistaToFhir.LAB_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirDiagnosticReport.getExtension(name);
                assertEquals("Extension value does not equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }
    }

    /**
     * This method test creates an empty diagnostic report and transform gramStain
     */
    @Test
    public void testGramStain() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformGramStainResults(fhirDiagnosticReport, this.labResult);
        verifyTransformGramStain(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method test verifies we populate gramStain properly
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformGramStain(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        //assertNotNull("Code string should be 664-3", LabResultsVistaToFhir.GramStain_Code);
        //assertNotNull("Display text should be Microscopic observation [Identifier] in Unspecified specimen by Gram stain", LabResultsVistaToFhir.GramStain_Display);
        //assertNotNull("Display text should equal http://loinc.org", LabResultsVistaToFhir.GramStain_System);

            for (GramStain gramStain : labResult.getGramStain()) {
                UUID referenceId = UUID.randomUUID();
                Observation resultObservation = new Observation();

                CodeableConcept name = FhirUtils.createCodeableConcept(LabResultsVistaToFhir.GRAMSTAIN_CODE, LabResultsVistaToFhir.GRAMSTAIN_DISPLAY, LabResultsVistaToFhir.GRAMSTAIN_SYSTEM, LabResultsVistaToFhir.GRAMSTAIN_DISPLAY);

                // create a reference to the contained resource
                ResourceReference resultReference = new ResourceReference();
                fhirDiagnosticReport.getResult().add(resultReference);
                resultReference.setReferenceSimple("#" + referenceId.toString());
                resultReference.setDisplaySimple(name.getTextSimple());
                resultObservation.setXmlId(referenceId.toString());
                resultObservation.setStatusSimple(Observation.ObservationStatus.final_);
                resultObservation.setReliabilitySimple(ObservationReliability.ok);
                resultObservation.setName(name);
                resultObservation.setValue(FhirUtils.createFhirString(gramStain.getResult()));
                fhirDiagnosticReport.getContained().add(resultObservation);
            }
    }

    /**
     * This method test creates an empty diagnostic report and transform organism
     */
    @Test
    public void testOrganism() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformOrganismResults(fhirDiagnosticReport, this.labResult);
        verifyTransformOrganism(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method verifies
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformOrganism(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("Code string should be 252390002", LabResultsVistaToFhir.ORGANISM_CODE);
        assertNotNull("Display text should be Culture and Susceptibility", LabResultsVistaToFhir.ORGANISM_DISPLAY);
        assertNotNull("Display text should equal http://snomed.org/sct", LabResultsVistaToFhir.ORGANISM_SYSTEM);

        for (Organism organism : labResult.getOrganisms()) {
            if (organism.getDrugs() != null) {
                for (Organism.Drugs drug : organism.getDrugs()) {
                    UUID referenceId = UUID.randomUUID();
                    Observation resultObservation = new Observation();

                    String sText = organism.getName() + " (" + organism.getQty() + ")" + " DRUG=" + drug.getName() + " INTERP=" + drug.getInterp() + " RESULT=" + drug.getResult();
                    assertNotNull("sText should not be null", sText);
                    CodeableConcept name = FhirUtils.createCodeableConcept(LabResultsVistaToFhir.ORGANISM_CODE, LabResultsVistaToFhir.ORGANISM_DISPLAY, LabResultsVistaToFhir.ORGANISM_SYSTEM, sText);

                    ResourceReference resultReference = new ResourceReference();

                    assertNotNull("", fhirDiagnosticReport.getResult().add(resultReference));
                    resultReference.setReferenceSimple("#" + referenceId.toString());
                    resultReference.setDisplaySimple(name.getTextSimple());
                    resultObservation.setXmlId(referenceId.toString());
                    resultObservation.setStatusSimple(Observation.ObservationStatus.final_);
                    resultObservation.setReliabilitySimple(ObservationReliability.ok);
                    resultObservation.setName(name);
                    fhirDiagnosticReport.getContained().add(resultObservation);
                }
            }
        }
    }

    /**
     * Verify that the text was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformText(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The text node should not have been null.", fhirDiagnosticReport.getText());
        assertEquals("The narrative status was incorrect.", NarrativeStatus.generated, fhirDiagnosticReport.getText().getStatusSimple());
        assertNotNull("The div node in the Text should not have been null.", fhirDiagnosticReport.getText().getDiv());
        assertNotNull("The div node text in the Text should not have been null.", fhirDiagnosticReport.getText().getDiv().allText());

        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Performing Lab"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Collected"));
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Report Released"));
        if (isNotNullish(labResult.getGroupUid())) {
            assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Accession"));
        }
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Test"));

        if (FhirUtils.getContainedResources(fhirDiagnosticReport, Observation.class).size() > 0) {
            assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Result"));
        }
        assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Performing Lab"));

        if (isNotNullish(labResult.getSpecimen())) {
            assertThat(fhirDiagnosticReport.getText().getDiv().allText(), containsString("Specimen"));
        }
    }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformServiceCategory(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The service category node should not have been null.", fhirDiagnosticReport.getServiceCategory());
     }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformStatus(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The status node should not have been null.", fhirDiagnosticReport.getStatusSimple());
        assertEquals("The status was incorrect.", DiagnosticReport.DiagnosticReportStatus.final_, fhirDiagnosticReport.getStatusSimple());
    }

    /**
     * Verify that the issuedDateTime was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformIssuedDateTime(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The Issued field should not have been null.", fhirDiagnosticReport.getIssuedSimple());
        SimpleDateFormat oHL7Format = new SimpleDateFormat("yyyyMMddHHmmss");

        Date issuedDate = FhirUtils.toCalender(fhirDiagnosticReport.getIssuedSimple()).getTime();

        String sDateTime = oHL7Format.format(issuedDate);
        assertTrue("The issued date/time was incorrect.", sDateTime.startsWith(labResult.getResulted()));
    }

    /**
     * Verify that the status was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformName(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {

        if (NullChecker.isNotNullish(labResult.getTypeName())) {
            assertEquals("Results name text is incorrect.", labResult.getTypeName(), fhirDiagnosticReport.getName().getTextSimple());
        } else if ((labResult != null) && (labResult.getResults() != null)
                && labResult.getResults().size() > 0
                && NullChecker.isNotNullish(labResult.getResults().get(0).getLocalTitle())) {
            assertEquals("Results name text is incorrect.", labResult.getResults().get(0).getLocalTitle(), fhirDiagnosticReport.getName().getTextSimple());
        } else {
            assertEquals("Results name text is incorrect.", LabResultsVistaToFhir.UNKNOWN_NAME, fhirDiagnosticReport.getName().getTextSimple());
        }

        // We need to verify that the codes are correct.   There are multiple codes that could be in the list.  They may be as follows:
        //    1.  VUID
        //    2.  TypeCode  (As a Report-name)
        //    3.  All of the items that were in the original codes array.
        //
        // We need to verify that we have them all.
        //------------------------------------------------------------------------------------------------------------------------------
        boolean bFoundVuid = false;
        boolean bFoundTypeCode = false;
        int iExtraCodesFound = 0;
        int iExtraCodesNeeded = 0;
        int iNumCodesNeeded = 0;
        if (isNotNullish(labResult.getVuid())) {
            iNumCodesNeeded++;
        }
        if (isNotNullish(labResult.getTypeCode())) {
            iNumCodesNeeded++;
        }
        if (isNotNullish(labResult.getCodesList())) {
            iNumCodesNeeded += labResult.getCodesList().size();
            iExtraCodesNeeded = labResult.getCodesList().size();
        }

        if (iNumCodesNeeded > 0) {
            assertTrue("name.coding should have had elements.", isNotNullish(fhirDiagnosticReport.getName().getCoding()));
            assertEquals("The number of expected name.coding array elements was wrong.", iNumCodesNeeded, fhirDiagnosticReport.getName().getCoding().size());
        }

        if (isNotNullish(fhirDiagnosticReport.getName().getCoding())) {
            for (Coding oCoding : fhirDiagnosticReport.getName().getCoding()) {
                if ((oCoding != null) && (oCoding.getCodeSimple() != null)) {
                    if (oCoding.getCodeSimple().equals(labResult.getVuid())) {
                        assertEquals("VUID code was incorrect.", labResult.getVuid(), oCoding.getCodeSimple());
                        assertEquals("VUID display text was incorrect.", labResult.getTypeName(), oCoding.getDisplaySimple());
                        assertEquals("VUID system was incorrect.", LabResultsVistaToFhir.VUID_SYSTEM, oCoding.getSystemSimple());
                        bFoundVuid = true;
                    } else if (oCoding.getCodeSimple().equals(labResult.getTypeCode())) {
                        assertEquals("TypeCode code was incorrect.", labResult.getTypeCode(), oCoding.getCodeSimple());
                        assertEquals("VUID display text was incorrect.", labResult.getTypeName(), oCoding.getDisplaySimple());
                        assertEquals("VUID system was incorrect.", LabResultsVistaToFhir.DIAGNOSTIC_REPORTS_SYSTEM, oCoding.getSystemSimple());
                        bFoundTypeCode = true;
                    } else if (isValidExtraCoding(labResult.getCodesList(), oCoding)) {
                        iExtraCodesFound++;
                    }
                }
            }
        }

        if (isNotNullish(labResult.getVuid())) {
            assertTrue("The VUID should have been in the name.coding array.", bFoundVuid);
        }

        if (isNotNullish(labResult.getTypeCode())) {
            assertTrue("The TypeCode should have been in the name.coding array.", bFoundTypeCode);
        }

        assertEquals("The number of extra codes in name.coding was incorrect.", iExtraCodesNeeded, iExtraCodesFound);

    }

    /**
     * This checks to see if the coding item is a transformed item in the codesList.  If it is it verifies that it is
     * created correctly.  If it is, then true is returned.  Otherwise false is returned.
     *
     * @param codesList The list of codes to check.
     * @param oCoding The coding item to be verified.
     * @return TRUE if the item represents one of the codes in the list.
     */
    private boolean isValidExtraCoding(List<TerminologyCode> codesList, Coding oCoding) {
        boolean bReturnResult = false;

        if ((isNullish(codesList)) && (oCoding == null)) {
            bReturnResult = true;
        } else if ((isNotNullish(codesList)) && (oCoding != null)) {
            for (TerminologyCode oCode : codesList) {
                if ((oCode != null) && (oCode.getCode().equals(oCoding.getCodeSimple()))) {
                    assertEquals("VUID code was incorrect.", oCode.getCode(), oCoding.getCodeSimple());
                    assertEquals("VUID display text was incorrect.", oCode.getDisplay(), oCoding.getDisplaySimple());
                    assertEquals("VUID system was incorrect.", oCode.getSystem(), oCoding.getSystemSimple());
                    bReturnResult = true;
                    break;
                }
            }
        }

        return bReturnResult;
    }

    /**
     * This method verifies the contents of the transformed lab result subject.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformSubject(LabResult labResult, DiagnosticReport fhirDiagnosticReport, ResourceReference patientReference) {
        assertNotNull("The subject should not have been null.", fhirDiagnosticReport.getSubject());
        assertEquals("The subject was not correct.", patientReference.getReferenceSimple(),
                fhirDiagnosticReport.getSubject().getReferenceSimple());
    }

    /**
     * This method verifies the contents of the transformed lab result report id.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformIdentifier(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The identifier node should not have been nullish.", fhirDiagnosticReport.getIdentifier());
        assertEquals("Identifier.system was incorrect.", AllergiesVistaToFhir.ALLERGY_IDENTIFIER_SYSTEM, fhirDiagnosticReport.getIdentifier().getSystemSimple());
        assertEquals("Identifier.value was incorrect.", labResult.getUid(), fhirDiagnosticReport.getIdentifier().getValueSimple());
    }


    /**
     * This method verifies that the Performer field was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformPerformer(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The Performer field should not have been null.", fhirDiagnosticReport.getPerformer());

        List<Organization> containedOrganizations = FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class);
        assertEquals("There should have been only one contained organization.", 1, containedOrganizations.size());
        Organization containedOrganization = containedOrganizations.get(0);

        assertTrue("The performer field should reference the contained resource.", fhirDiagnosticReport.getPerformer().getReferenceSimple().contains(containedOrganization.getXmlId()));

        assertNotNull(containedOrganization.getText());
        assertEquals(NarrativeStatus.generated, containedOrganization.getText().getStatusSimple());

        assertThat("The content of Organization.text should contain the organization's name.", containedOrganization.getText().getDiv().allText(), containsString(containedOrganization.getNameSimple()));

        if (labResult.getFacilityCode() != null) {
            assertEquals("Organization Should contain one identifier", containedOrganization.getIdentifier().size(), 1);
            assertEquals("Organization identifier should have facility-code for label", "facility-code", containedOrganization.getIdentifier().get(0).getLabelSimple());
            assertEquals("Organization identifier should have facility Code for value", labResult.getFacilityCode(), containedOrganization.getIdentifier().get(0).getValueSimple());
        }


        if (labResult.getComment().contains("Performing Lab")) {
            assertNotNull(containedOrganization.getAddress());
            assertEquals(1, containedOrganization.getAddress().size());

            Address address = containedOrganization.getAddress().get(0);
            assertNotNull(address.getLine());
            assertEquals(2, address.getLine().size());
            for (String_ line : address.getLine()) {
                assertThat(line.getValue(), not(startsWith(" ")));
            }
            assertNotNull(address.getCitySimple());
            assertNotNull(address.getStateSimple());
            assertNotNull(address.getZipSimple());

            assertThat("The lab address should be contained in the comment.", labResult.getComment(), containsString(address.getTextSimple()));
            assertThat("The lab display name should be contained in the comment.", labResult.getComment(), containsString(fhirDiagnosticReport.getPerformer().getDisplaySimple()));
        } else {
            assertTrue(isNullish(containedOrganization.getAddress()));
            assertEquals(labResult.getFacilityName(), containedOrganization.getNameSimple());
            assertEquals(labResult.getFacilityName(), fhirDiagnosticReport.getPerformer().getDisplaySimple());
        }
    }

    /**
     * Verify that the diagnosticDateTime was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformDiagnosticDateTime(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The diagnostic field should not have been null.", fhirDiagnosticReport.getDiagnostic());
        SimpleDateFormat oHL7Format = new SimpleDateFormat("yyyyMMddHHmmss");

        Date diagnosticDate = FhirUtils.toCalender((DateTime) fhirDiagnosticReport.getDiagnostic()).getTime();
        String sDateTime = oHL7Format.format(diagnosticDate);
        assertTrue("The diagnostic datetime was incorrect.", sDateTime.startsWith(labResult.getObserved()));
    }

    /**
     * Verify that the diagnositic results was transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformResults(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        assertNotNull("The results should not have been null.", fhirDiagnosticReport.getResult());
        assertNotNull("The results name should not have been null.", fhirDiagnosticReport.getName().getTextSimple());

        verifyTransformName(labResult, fhirDiagnosticReport);

    }


    /**
     * Verify that the results.result and contained Observation were transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformResultsResult(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {

        assertNotNull("The result field should not have been null.", fhirDiagnosticReport.getResult());

        List<Observation> containedObservations = FhirUtils.getContainedResources(fhirDiagnosticReport, Observation.class);
        assertEquals("There should have been only one contained Observation.", 1, containedObservations.size());
        Observation containedObservation = containedObservations.get(0);

        assertTrue("The result[0] field should reference the contained resource.", fhirDiagnosticReport.getResult().get(0).getReferenceSimple().contains(containedObservation.getXmlId()));

        assertNull(containedObservation.getText());
        assertNotNull(containedObservation.getName().getCoding());

        Coding containedObservationCoding = containedObservation.getName().getCoding().get(0);
        assertNotNull(containedObservationCoding.getCodeSimple());

        assertNotNull(containedObservationCoding.getDisplaySimple());
        assertEquals(labResult.getTypeName(), containedObservationCoding.getDisplaySimple());
        assertNotNull(containedObservationCoding);
        if (isNotNullish(labResult.getVuid())) {
            assertNotNull(containedObservationCoding.getSystemSimple());
            assertEquals(LabResultsVistaToFhir.VUID_SYSTEM, containedObservationCoding.getSystemSimple());
            assertEquals(labResult.getVuid(), containedObservationCoding.getCodeSimple());
        } else {
            assertNull(containedObservationCoding.getSystemSimple());
            assertEquals(labResult.getTypeName(), containedObservationCoding.getCodeSimple());
        }

        // Check contained[Observation].status
        assertNotNull(containedObservation.getStatusSimple());
        assertEquals(Observation.ObservationStatus.final_, containedObservation.getStatusSimple());

        if (isNotNullish(labResult.getHigh()) && NumberUtils.isNumber(labResult.getHigh())) {
            // Check values of:
            // contained[Observation].referenceRange.high.value
            // contained[Observation].referenceRange.high.units
            assertNotNull(containedObservation.getReferenceRange());
            assertEquals(1, containedObservation.getReferenceRange().size());
            Quantity high = containedObservation.getReferenceRange().get(0).getHigh();
            assertNotNull(high);
            assertEquals(new BigDecimal(labResult.getHigh()), high.getValueSimple());
            if (isNotNullish(labResult.getUnits())) {
                assertEquals(labResult.getUnits(), high.getUnitsSimple());
            } else {
                assertNull(high.getUnitsSimple());
            }
        }

        if (isNotNullish(labResult.getLow()) && NumberUtils.isNumber(labResult.getLow())) {
            // Check values of:
            // contained[Observation].referenceRange.low.value
            // contained[Observation].referenceRange.low.units
            assertNotNull(containedObservation.getReferenceRange());
            assertEquals(1, containedObservation.getReferenceRange().size());
            Quantity low = containedObservation.getReferenceRange().get(0).getLow();
            assertNotNull(low);
            assertEquals(new BigDecimal(labResult.getLow()), low.getValueSimple());
            if (isNotNullish(labResult.getUnits())) {
                assertEquals(labResult.getUnits(), low.getUnitsSimple());
            } else {
                assertNull(low.getUnitsSimple());
            }
        }

        // Check contained[Observation].value[Quantity].value
        // and contained[Observation].value[Quanitty].units
        if (isNotNullish(labResult.getResult())) {
            assertNotNull(containedObservation.getValue());

            assertThat(containedObservation.getValue(), either(instanceOf(Quantity.class)).or(instanceOf(String_.class)));

            if (containedObservation.getValue() instanceof Quantity) {
                Quantity result = (Quantity) containedObservation.getValue();
                assertNotNull(result.getValueSimple());
                assertEquals(new BigDecimal(labResult.getResult()), result.getValueSimple());
                if (isNotNullish(labResult.getUnits())) {
                    assertEquals(labResult.getUnits(), result.getUnitsSimple());
                } else {
                    assertNull(result.getUnitsSimple());
                }
            } else if (containedObservation.getValue() instanceof String_) {
                String_ result = (String_) containedObservation.getValue();
                assertNotNull(result.getValue());
                assertEquals(labResult.getResult(), result.getValue());
            }
        }

    }

    /**
     * Verify that the results.specimen and contained Specimen were transformed correctly.
     *
     * @param labResult The lab result to compare to.
     * @param fhirDiagnosticReport The DiagnosticReport being verified.
     */
    private void verifyTransformResultsSpecimen(LabResult labResult, DiagnosticReport fhirDiagnosticReport, VistaPatientIdentity vistaPatientIdentity) {

        // Check for:
        // contained[Specimen].id
        // contained[Specimen].text.status
        // contained[Specimen].text.div
        // contained[Specimen].type.text
        // contained[Specimen].subject.reference
        // contained[Specimen].collection.collectedTime
        // results.specimen.reference

        if (isNotNullish(labResult.getSpecimen()) && isNotNullish(labResult.getObserved())) {

            assertNotNull(fhirDiagnosticReport.getSpecimen());
            List<Specimen> containedSpecimens = FhirUtils.getContainedResources(fhirDiagnosticReport, Specimen.class);
            assertEquals("There should have been only one contained specimen.", 1, containedSpecimens.size());
            Specimen containedSpecimen = containedSpecimens.get(0);
            assertTrue(fhirDiagnosticReport.getSpecimen().get(0).getReferenceSimple().contains(containedSpecimen.getXmlId()));

            assertNull(containedSpecimen.getText());

            assertNotNull("The subject should not have been null.", containedSpecimen.getSubject());
            assertEquals("The subject was not correct.", LabResultsVistaToFhir.PATIENT_PREFIX + vistaPatientIdentity.getEnterprisePatientIdentifier() , containedSpecimen.getSubject().getReferenceSimple());

            assertNotNull(containedSpecimen.getType());
            assertNotNull(containedSpecimen.getType().getText());
            assertEquals(labResult.getSpecimen(), containedSpecimen.getType().getTextSimple());

            assertNotNull(containedSpecimen.getCollection());
            assertNotNull(containedSpecimen.getCollection().getCollected());
            try {
                String collectedTime = FhirUtils.extractFhirDateTimeValue((DateTime) containedSpecimen.getCollection().getCollected());
                assertEquals(FhirUtils.createFhirDateTimeString(labResult.getObserved()), collectedTime);
            } catch (ModelTransformException e) {
                e.printStackTrace();
                fail();
            }

            assertNull(containedSpecimen.getText());
        }

    }
    /**
     * This method tests the transformStatus method for null conditions
     */
    @Test
    public void testTransformNameNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        //--------------------------
        testObject.transformName(fhirDiagnosticReport, null);
        assertEquals("The name should have been the unknown value.", fhirDiagnosticReport.getName().getTextSimple(), LabResultsVistaToFhir.UNKNOWN_NAME);

        // Check for null Text
        //------------------------
        LabResult labResult = new LabResult();
        testObject.transformName(fhirDiagnosticReport, labResult);
        assertEquals("The name should have been the unknown value.", fhirDiagnosticReport.getName().getTextSimple(), LabResultsVistaToFhir.UNKNOWN_NAME);

    }

    /**
     * This method tests the transformStatus method for non-null conditions.
     */
    @Test
    public void testTransformNameValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformName(fhirDiagnosticReport, this.labResult);
        verifyTransformName(this.labResult, fhirDiagnosticReport);
    }

    /**
     * Initial Stub test make sure we got something back...
     */
    @Test
    public void testTransformNullTest() {

        // There are four different null tests that we need to check for.
        //-----------------------------------------------------------------
        try {
            // First Null - highest level
            //------------------------------
            List<DiagnosticReport> fhirDiagnosticReports = testObject.transform(null, null);
            assertTrue("The return result should have been nullish.", isNullish(fhirDiagnosticReports));

            // Second Null - the DiagnosticReport Class part is null within the object.
            //----------------------------------------------------------------
            VPRLabsRpcOutput labRpcOutput = new VPRLabsRpcOutput();
            fhirDiagnosticReports = testObject.transform(labRpcOutput, null);
            assertTrue("The return result should have been nullish.", isNullish(fhirDiagnosticReports));

            // Third Null - the DiagnosticReport array is null within the object.
            //---------------------------------------------------------
            labRpcOutput = new VPRLabsRpcOutput();
            labRpcOutput.setData(new VPRLabsRpcOutput.LabData());
            fhirDiagnosticReports = testObject.transform(labRpcOutput, null);
            assertTrue("The return result should have been nullish.", isNullish(fhirDiagnosticReports));

            // The fourth test - we need a special testSubject instance that we can mock out the
            // transformOneLabResult method so that it returns null.
            //------------------------------------------------------------------------------------
            LabResultsVistaToFhir testSubject2 = new LabResultsVistaToFhir() {
                @Override
                protected DiagnosticReport transformOneLabResult(LabResult labResult, VistaPatientIdentity oVistaPatientIdentity) {
                    return null;
                }
            };
            labRpcOutput = new VPRLabsRpcOutput();
            labRpcOutput.setData(new VPRLabsRpcOutput.LabData());
            LabResult labResult = new LabResult();
            labRpcOutput.getData().addItems(labResult);
//            labResult.setSummary("SomeSummaryData");
            fhirDiagnosticReports = testSubject2.transform(labRpcOutput, null);
            assertTrue("The return result should have been nullish.", isNullish(fhirDiagnosticReports));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests an overall transform containing two lab results.
     */
    @Test
    public void testTransformWithTwoLabResults() {
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        try {
            VPRLabsRpcOutput labsRpcOutput = LabResultsGenerator.createSampleVprLabsRpcOutput();
            LabResultsGenerator.addToLabResultsArray(1, labsRpcOutput);
            LabResultsGenerator.addToLabResultsArray(2, labsRpcOutput);

            List<DiagnosticReport> fhirDiagnosticReports = testObject.transform(labsRpcOutput, oPtIdentity);
            assertTrue("The return result should not have been nullish.", NullChecker.isNotNullish(fhirDiagnosticReports));
            assertEquals("There should have been two results returned.", 2, fhirDiagnosticReports.size());
            assertEquals("The two results should have been for the same patient.",
                    fhirDiagnosticReports.get(0).getSubject().getReferenceSimple(),
                    fhirDiagnosticReports.get(1).getSubject().getReferenceSimple());

        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }

    }

    /**
     * This method tests the case of passing in a null into the TransformOneLabResult method.
     */
    @Test
    public void testTransformOneLabResultNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = testObject.transformOneLabResult(null, null);
            assertNull("The response should have been null.", fhirDiagnosticReport);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
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
        assertEquals("", fhirDiagnosticReport.getText().getDiv().allText());

        fhirDiagnosticReport = testObject.transformOneLabResult(labResult, oPtIdentity);

        verifyTransformText(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method tests the transformStatus method for null conditions
     */
    @Test
    public void testTransformStatusNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        //--------------------------
        testObject.transformStatus(fhirDiagnosticReport, null);
        assertNull("The status should have been null.", fhirDiagnosticReport.getStatusSimple());

        // Check for null Text
        //------------------------
        LabResult labResult = new LabResult();
        testObject.transformStatus(fhirDiagnosticReport, labResult);
        assertNull("The status should have been null.", fhirDiagnosticReport.getStatusSimple());
    }

    /**
     * This method tests the transformStatus method for non-null conditions.
     */
    @Test
    public void testTransformStatusValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformStatus(fhirDiagnosticReport, this.labResult);
        verifyTransformStatus(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method tests the transformIssuedDateTime method for null conditions
     */
    @Test
    public void testTransformIssuedDateTimeNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            // Check for null
            //--------------------------
            testObject.transformIssuedDateTime(fhirDiagnosticReport, null);
            assertNull("The issued datetime should have been null.", fhirDiagnosticReport.getIssued());

            // Check for null Text
            //------------------------
            LabResult labResult = new LabResult();
            testObject.transformIssuedDateTime(fhirDiagnosticReport, labResult);
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
            testObject.transformIssuedDateTime(fhirDiagnosticReport, this.labResult);
            verifyTransformIssuedDateTime(this.labResult, fhirDiagnosticReport);
        } catch (ModelTransformException e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests transformServiceCategory method for null conditions.
     */
    @Test
    public void testTransformServiceCategoryNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

            // Check for null
            //-----------------------
            testObject.transformServiceCategory(fhirDiagnosticReport, null);
            assertNull("The subject node should have been null.", fhirDiagnosticReport.getServiceCategory());
        }  catch (Exception e) {
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
        testObject.transformServiceCategory(fhirDiagnosticReport, this.labResult);
        verifyTransformServiceCategory(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method tests transformSubject method for null conditions.
     */
    @Test
    public void testTransformSubjectNull() {
        try {
            DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

            // Check for null
            //-----------------------
            testObject.transformSubject(fhirDiagnosticReport, null);
            assertNull("The subject node should have been null.", fhirDiagnosticReport.getSubject());
        }  catch (Exception e) {
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
            ResourceReference patientReference = testObject.transformSubject(fhirDiagnosticReport, oPtIdentity);
            verifyTransformSubject(this.labResult, fhirDiagnosticReport, patientReference);
        }  catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }


    /**
     * This method tests the transformReportId method for null conditions
     */
    @Test
    public void testTransformReportIdNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        //--------------------------
        testObject.transformIdentifier(fhirDiagnosticReport, null);
        assertNull("The report id should have been null.", fhirDiagnosticReport.getIdentifier());

        // Check for null identifier
        //---------------------------
        LabResult labResult = new LabResult();
        testObject.transformIdentifier(fhirDiagnosticReport, labResult);
        assertNull("The report id should have been null.", fhirDiagnosticReport.getIdentifier());
    }

    /**
     * This method tests the transformReportId method for non-null conditions.
     */
    @Test
    public void testTransformReportIdValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformIdentifier(fhirDiagnosticReport, this.labResult);
        verifyTransformIdentifier(this.labResult, fhirDiagnosticReport);
    }

    @Test
    public void testCommentsRegularExpression() {
        Matcher matcher = testObject.getCommentPattern().matcher(labResult.getComment());

        assertTrue(matcher.matches());
        assertEquals(5, matcher.groupCount());

        List<String> nonEmptyCaptures = new ArrayList<String>();
        for (String groupName : new String[]{"comment", "providerName", "releasedDateTime", "labName", "labAddress" }) {
            String capture =  matcher.group(groupName);
            if (isNotNullish(capture)) {
                nonEmptyCaptures.add(capture);
            }
        }

        assertThat("Not the correct number of captures for " + labResult.getComment(), nonEmptyCaptures.size(), anyOf(equalTo(3), equalTo(4), equalTo(5)));

        assertNotNull(matcher.group("providerName"));
        assertNotNull(matcher.group("releasedDateTime"));

        if (labResult.getComment().contains("Performing Lab")) {
            assertNotNull(matcher.group("labName"));
            assertNotNull(matcher.group("labAddress"));
        }
    }

    @Test
    public void testAddressRegularExpression() {
        Matcher commentMatcher = testObject.getCommentPattern().matcher(labResult.getComment());

        assertTrue(commentMatcher.matches());
        assertEquals(commentMatcher.groupCount(), 5);

        if (labResult.getComment().contains("Performing Lab")) {
            assertNotNull(commentMatcher.group("labName"));
            assertNotNull(commentMatcher.group("labAddress"));

            Matcher addressMatcher = testObject.getAddressPattern().matcher(commentMatcher.group("labAddress"));
            assertTrue(addressMatcher.matches());
            assertEquals(4, addressMatcher.groupCount());

            List<String> nonEmptyCaptures = new ArrayList<String>();
            for (String groupName : new String[]{"line", "city", "stateAbbr", "zip" }) {
                String capture =  addressMatcher.group(groupName);
                if (isNotNullish(capture)) {
                    nonEmptyCaptures.add(capture);
                }
            }

            assertEquals(4, nonEmptyCaptures.size());
        }
    }



    /**
     * This method tests the transformPerformer method for null conditions
     */
    @Test
    public void testTransformPerformerNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        // Check for null
        //--------------------------
        testObject.transformPerformer(fhirDiagnosticReport, null);
        assertNull("The performer should have been null.", fhirDiagnosticReport.getPerformer());
        assertEquals("There should be no contained organization resources.", 0, FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class).size());

        // Check for null identifier
        //---------------------------
        LabResult labResult = new LabResult();
        testObject.transformPerformer(fhirDiagnosticReport, labResult);
        assertNull("The performer should have been null.", fhirDiagnosticReport.getPerformer());
        assertEquals("There should be no contained organization resources.", 0, FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class).size());

    }

    /**
     * This method tests the transformPerformer method for non-null conditions.
     */
    @Test
    public void testTransformPerformerValidValues() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        testObject.transformPerformer(fhirDiagnosticReport, this.labResult);
        verifyTransformPerformer(this.labResult, fhirDiagnosticReport);
    }

    /**
     * This method tests the transformDiagnosticDateTime method for null conditions
     */
    @Test
    public void testTransformDiagnosticDateTimeNull() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        try {
            // Check for null
            //--------------------------
            testObject.transformDiagnosticDateTime(fhirDiagnosticReport, null);
            assertNull("The diagnostic datetime should have been null.", fhirDiagnosticReport.getDiagnostic());

            // Check for null Text
            //------------------------
            LabResult labResult = new LabResult();
            testObject.transformDiagnosticDateTime(fhirDiagnosticReport, labResult);
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
            testObject.transformDiagnosticDateTime(fhirDiagnosticReport, this.labResult);
            verifyTransformDiagnosticDateTime(this.labResult, fhirDiagnosticReport);
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
        //--------------------------
        testObject.transformResults(fhirDiagnosticReport, null, null, null);
        assertEquals("The results should have been null.", fhirDiagnosticReport.getResult().size(), 0);

        // Check for null Text
        //------------------------
        LabResult labResult = new LabResult();
        testObject.transformResults(fhirDiagnosticReport, labResult, null, null);
        assertEquals("The results should have been null.", fhirDiagnosticReport.getResult().size(), 0);
    }

    /**
     * This method tests the transformResults method for non-null conditions.
     */
    @Test
    public void testTransformResultsValidValue() {
        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        VistaPatientIdentity oPtIdentity = VistaPatientIdentityGenerator.createSampleVistaPatientIdentity();

        ResourceReference subjectReference = testObject.transformSubject(fhirDiagnosticReport, oPtIdentity);
        ResourceReference specimenReference = testObject.transformSpecimen(labResult, fhirDiagnosticReport, subjectReference);
        CodeableConcept name = testObject.transformName(fhirDiagnosticReport, labResult);

        testObject.transformResults(fhirDiagnosticReport, this.labResult, specimenReference, name);
        verifyTransformResults(this.labResult, fhirDiagnosticReport);
        verifyTransformInterpretationCode(this.labResult, fhirDiagnosticReport);
        verifyTransformResultsResult(this.labResult, fhirDiagnosticReport);
        verifyTransformResultsSpecimen(this.labResult, fhirDiagnosticReport, oPtIdentity);
    }

    private void verifyTransformInterpretationCode(LabResult labResult, DiagnosticReport fhirDiagnosticReport) {
        //TODO

    }

}

final class VistaPatientIdentityGenerator {

    public static final String ENTERPRISE_PATIENT_IDENTIFIER = "3";
    public static final String PATIENT_ID = "30";
    public static final String LOCATION = "FACILITY1";

    private VistaPatientIdentityGenerator() { }

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
