package us.vistacore.ehmp.model.vitals.transform;

import com.google.common.collect.Lists;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.Identifier.IdentifierUse;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Observation.ObservationReferenceRangeComponent;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceType;
import org.junit.Before;
import org.junit.Test;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.model.vitals.VPRVitalsRpcOutput;
import us.vistacore.ehmp.model.vitals.VPRVitalsRpcOutput.VitalsData;
import us.vistacore.ehmp.model.vitals.Vitals;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;
import us.vistacore.ehmp.util.VprExtractionUtils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static java.util.Arrays.asList;
import static org.junit.Assert.*;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

/**
 * This class is used to test the VitalsVistaToFhir class.
 *
 * @author Les.Westberg
 *
 */
public class VitalsVistaToFhirTest {

    private static final String API_VERSION = "1.0";
    private static final String UPDATED = "false";
    private static final int NUMBER_OF_TEST_ENTRIES = 5; // Should equal the number of items in each of the arrays below
    private static final String[] SOURCE_VISTA_SITE = {"SourceVistaSite", "SourceVistaSite1", "SourceVistaSite2", "SourceVistaSite2", "SourceVistaSite2"};
    private static final String[] FACILITY_CODE = {"FacilityCode", "FacilityCode1", "FacilityCode2", "FacilityCode2", "FacilityCode2"};
    private static final String[] FACILITY_NAME = {"FacilityName", "FacilityName1", "FacilityName2", "FacilityName2", "FacilityName2"};
    private static final String[] LOW_SYSTOLIC = {"100", "101", "102"};
    private static final String[] LOW_DIASTOLIC = {"60", "61", "62"};
    private static final String[] HIGH_SYSTOLIC = {"210", "211", "212"};
    private static final String[] HIGH_DIASTOLIC = {"110", "111", "112"};
    private static final String[] LOW = {LOW_SYSTOLIC[0] + "/" + LOW_DIASTOLIC[0],
                                         LOW_SYSTOLIC[1] + "/" + LOW_DIASTOLIC[1],
                                         LOW_SYSTOLIC[2] + "/" + LOW_DIASTOLIC[2],
                                         "1",
                                         "1000"};
    private static final String[] HIGH = {HIGH_SYSTOLIC[0] + "/" + HIGH_DIASTOLIC[0],
                                          HIGH_SYSTOLIC[1] + "/" + HIGH_DIASTOLIC[1],
                                          HIGH_SYSTOLIC[2] + "/" + HIGH_DIASTOLIC[2],
                                          "100",
                                          "100000"};
    private static final String[] KIND = {"Kind", "Kind1", "Kind2", "Kind2", "Kind2"};
    private static final String[] LOCAL_ID = {"LocalId", "LocalId1", "LocalId2", "LocalId2", "LocalId2"};
    private static final String[] LOCATION_CODE = {"LocationCode", "LocationCode1", "LocationCode2", "LocationCode2", "LocationCode2"};
    private static final String[] LOCATION_NAME = {"LocationName", "LocationName1", "LocationName2", "LocationName2", "LocationName2"};
    private static final String[] OBSERVED = {"20120805120008", "20120805120008", "2012-08-05T12:00:08", "2012-08-05T12:00:08", "2012-08-05T12:00:08"};
    private static final String[] OBSERVED_FHIR = {"2012-08-05T12:00:08", "2012-08-05T12:00:08", "2012-08-05T12:00:08", "2012-08-05T12:00:08", "2012-08-05T12:00:08"};
    private static final String[] RESULT = {"120/90", "200/10", "100/100", "22", "22"};
    private static final String[] RESULTED = {"20100805120008", "20100805120008", "20100805120008", "20100805120008", "20100805120008"};
    private static final String[] RESULTED_HL7 = {"20100805120008", "20100805120008", "20100805120008", "20100805120008", "20100805120008"};
    private static final String[] SUMMARY = {"Summary", "Summary1", "Summary2", "Summary3", "Summary4"};
    private static final String[] TYPE_CODE = {"TypeCode", "TypeCode1", "TypeCode2", "TypeCode2", "TypeCode2"};
    private static final String[] TYPE_NAME = {"BLOOD PRESSURE", "BLOOD PRESSURE", "BLOOD PRESSURE", "TEMPERATURE", "PAIN"};
    private static final String[] DFN = {"22", "222", "2222", "3333", "4444"};
    private static final String[] UID = {"urn:va:vital:B362:" + DFN[0] + ":33",
                                         "urn:va:vital:B362:" + DFN[1] + ":333",
                                         "urn:va:vital:B362:" + DFN[2] + ":3333",
                                         "urn:va:vital:B362:" + DFN[3] + ":3333",
                                         "urn:va:vital:B362:" + DFN[4] + ":333"};
    private static final String[] UNITS = {"Units", "Units1", "Units2", "Units2", "Units2"};
    private static final String[] QUALIFIERS_NAME = {"PEDIATRIC CUFF", "WRIST", "STANDING", "PALPATED", "ESTIMATED"};
    private static final String[] QUALIFIERS_VUID = {"4688671", "4688717", "4688707", "4688669", "4688653"};

    public static final String SYSTOLIC_REFERENCE_RANGE_CODE = "12929001";
    public static final String SYSTOLIC_REFERENCE_RANGE_DISPLAY_VALUE = "Normal systolic arterial pressure";
    public static final String SYSTOLIC_REFERENCE_RANGE_SYSTEM = "http://snomed.info/id";
    public static final String DIASTOLIC_REFERENCE_RANGE_CODE = "53813002";
    public static final String DIASTOLIC_REFERENCE_RANGE_DISPLAY_VALUE = "Normal diastolic arterial pressure";
    public static final String DIASTOLIC_REFERENCE_RANGE_SYSTEM = "http://snomed.info/id";
    private static final String[][] CODING_CODE = {{"Code"},
                                                   {"Code1"},
                                                   {"Code2A", "Code2B"},
                                                   {"Code3A"},
                                                   {"Code4A"} };
    private static final String[][] CODING_SYSTEM = {{"System"},
                                                     {"System1"},
                                                     {"System2A", "System2B"},
                                                     {"System3A"},
                                                     {"System4A"} };
    private static final String[][] CODING_DISPLAY = {{"Display"},
                                                      {"Display1"},
                                                      {"Display2A", "Display2B"},
                                                      {"Display3A"},
                                                      {"Display4A"} };


    VitalsVistaToFhir testSubject = null;


    /**
     * This method is called before each test is run.
     *
     * @throws Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new VitalsVistaToFhir();
    }

    /**
     * Create an instance of the VPR vitals that we can use to do the various transforms from.
     *
     * @return A sample vitals to use for transformation purposes.
     */
    private VPRVitalsRpcOutput createSampleVprVitalsRpcOutput() {
        VPRVitalsRpcOutput oVitalsOutput = new VPRVitalsRpcOutput();

        oVitalsOutput.setApiVersion(API_VERSION);
        oVitalsOutput.setData(new VitalsData());
        oVitalsOutput.getData().setUpdated(UPDATED);

        return oVitalsOutput;
    }

    /**
     * Verifies that we are checking vitals for valid instances that we create.  (This is just a check all.
     *
     * @param iIndex The index of the vitals results.
     * @return True if it is one that we have created.
     */
    private boolean indexInBounds(int iIndex) {
        return ((iIndex >= 0) && (iIndex < NUMBER_OF_TEST_ENTRIES));
    }

    /**
     * Create the set of codes to be included.
     * @param iIndex The index stating the version of the allergy to create.
     *
     * @return The set of codes to be added.
     */
    private List<TerminologyCode> createCodes(int iIndex) {
        List<TerminologyCode> oaCodes = new ArrayList<TerminologyCode>();

        if (indexInBounds(iIndex)) {
            for (int i = 0; i < CODING_CODE[iIndex].length; i++) {
                TerminologyCode oCode = new TerminologyCode();
                oCode.setCode(CODING_CODE[iIndex][i]);
                oCode.setSystem(CODING_SYSTEM[iIndex][i]);
                oCode.setDisplay(CODING_DISPLAY[iIndex][i]);
                oaCodes.add(oCode);
            }
        } else {
            oaCodes = null;
        }

        return oaCodes;
    }

    /**
     * Create a vitals object.
     *
     * @param iIndex The index stating the version of the vitals to create.
     * @return The vitals that was created.
     */
    private Vitals createVitals(int iIndex) {
        Vitals oVitals = new Vitals();

        if (indexInBounds(iIndex)) {
            oVitals.setSourceVistaSite(SOURCE_VISTA_SITE[iIndex]);
            oVitals.setFacilityCode(FACILITY_CODE[iIndex]);
            oVitals.setFacilityName(FACILITY_NAME[iIndex]);
            oVitals.setHigh(HIGH[iIndex]);
            oVitals.setKind(KIND[iIndex]);
            oVitals.setLocalId(LOCAL_ID[iIndex]);
            oVitals.setLocationCode(LOCATION_CODE[iIndex]);
            oVitals.setLocationName(LOCATION_NAME[iIndex]);
            oVitals.setLow(LOW[iIndex]);
            oVitals.setObserved(OBSERVED[iIndex]);
            oVitals.setResult(RESULT[iIndex]);
            oVitals.setResulted(RESULTED[iIndex]);
            oVitals.setSummary(SUMMARY[iIndex]);
            oVitals.setTypeCode(TYPE_CODE[iIndex]);
            oVitals.setTypeName(TYPE_NAME[iIndex]);
            oVitals.setUid(UID[iIndex]);
            oVitals.setUnits(UNITS[iIndex]);
            oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid(QUALIFIERS_NAME[iIndex], QUALIFIERS_VUID[iIndex])));
            oVitals.setCodesList(createCodes(iIndex));
        } else {
            oVitals = null;
        }

        return oVitals;
    }

    /**
     * This adds a vitals array for the specified index to the array list.  The index tells it which instance to add.
     *
     * @param iIndex The version of the Vitals to be added.
     * @param oVitalsOutput The object where the vitals should be added.
     */
    private void addToVitalsArray(int iIndex, VPRVitalsRpcOutput oVitalsOutput) {
        Vitals oVitals = createVitals(iIndex);
        if (oVitals != null) {
            oVitalsOutput.getData().addItems(oVitals);
        }
    }

    /**
     * Verify that the text was transformed correctly.
     *
     * @param iIndex The index of the vitals to compare to.
     * @param oFhirObservation The observation being verified.
     */
    private void verifyTransformText(int iIndex, Observation oFhirObservation) {
        assertNotNull("The text node should not have been null.", oFhirObservation.getText());
        assertEquals("The narrative status was incorrect.", NarrativeStatus.generated, oFhirObservation.getText().getStatusSimple());
        assertNotNull("The div node in the Text shofuld not have been null.", oFhirObservation.getText().getDiv());
        assertEquals("The summary was incorrect.", SUMMARY[iIndex], oFhirObservation.getText().getDiv().allText());
    }

    /**
     * This method checks that the values are correct.   If they pass the assertion than true is returned.
     *
     * @param oCoding The code to be checked.
     * @param sExpectedSystem The expected system value.
     * @param sExpectedCode The expected code value.
     * @param sExpectedDisplay The expected display value.
     * @return
     */
    private boolean isCodingEqualToValues(Coding oCoding, String sExpectedSystem, String sExpectedCode, String sExpectedDisplay) {
        boolean bReturnResult = false;

        if (oCoding != null) {
            if ((sExpectedSystem.equals(oCoding.getSystemSimple())) && (sExpectedCode.equals(oCoding.getCodeSimple())) && (sExpectedDisplay.equals(oCoding.getDisplaySimple()))) {
                bReturnResult = true;
            }
        }

        return bReturnResult;
    }

    /**
     * This method verifies the contents of the Name field within the Fhir Observation - after it has been transformed.
     *
     * @param iIndex The index of the Vitals result to be verified.
     * @param oFhirObservation The FHIR observation to be verified.
     */
    private void verifyTransformName(int iIndex, Observation oFhirObservation) {
        assertNotNull("The name node should not have been null.", oFhirObservation.getName());

        int iNumExpectedCodings = 1 + CODING_CODE[iIndex].length;
        assertEquals("The number of items in the array was incorrect.", iNumExpectedCodings, oFhirObservation.getName().getCoding().size());

        boolean bFoundVuid = false;
        HashSet<Integer> oFoundSet = new HashSet<Integer>();
        for (Coding oCoding : oFhirObservation.getName().getCoding()) {
            if (isCodingEqualToValues(oCoding, VitalsVistaToFhir.VUID_CODING_SYSTEM, TYPE_CODE[iIndex], TYPE_NAME[iIndex])) {
                bFoundVuid = true;
            } else {
                for (int i = 0; i < CODING_CODE[iIndex].length; i++) {
                    if (isCodingEqualToValues(oCoding, CODING_SYSTEM[iIndex][i], CODING_CODE[iIndex][i], CODING_DISPLAY[iIndex][i])) {
                        oFoundSet.add(new Integer(i));
                    }
                }
            }
        }

        // See if we found everything.
        //----------------------------
        assertTrue("VUID was not found.", bFoundVuid);
        assertEquals("Did not find all the terminology codes.", CODING_CODE[iIndex].length, oFoundSet.size());
        for (int i = 0; i < CODING_CODE[iIndex].length; i++) {
            assertTrue("Did not find one of the codes.", oFoundSet.contains(new Integer(i)));
        }

//        // Verify that the VUID is present
//        //---------------------------------
//        assertEquals("The coding system was incorrect.", VitalsVistaToFhir.VUID_CODING_SYSTEM, oFhirObservation.getName().getCoding().get(0).getSystemSimple());
//        assertEquals("The code was incorrect.", TYPE_CODE[iIndex], oFhirObservation.getName().getCoding().get(0).getCodeSimple());
//        assertEquals("The display was incorrect.", TYPE_NAME[iIndex], oFhirObservation.getName().getCoding().get(0).getDisplaySimple());
//
    }

    /**
     * This method verifies that the values related to transforming the result are correct.
     *
     * @param iIndex The index of the vitals to be verified.
     * @param oFhirObservation The FHIR observation that is being verified.
     */
    private void verifyTransformResult(int iIndex, Observation oFhirObservation) {
        assertNotNull("The value should not have been null.", oFhirObservation.getValue());
//        String_ valueQuantity = (String_)oFhirObservation.getValue();
//        assertEquals("The result was incorrect.", RESULT[iIndex], valueQuantity.getValueSimple().toPlainString());
//        assertEquals("The units were incorrect.", UNITS[iIndex], valueQuantity.getUnitsSimple());
    }

    /**
     * This method verifies that the IssuedDateTime field was transformed correctly.
     *
     * @param iIndex The index of the vitals result being tested.
     * @param oFhirObservation The result that was transformed.
     */
    private void verifyTransformIssuedDateTime(int iIndex, Observation oFhirObservation) {
        assertNotNull("The Issued field should not have been null.", oFhirObservation.getIssuedSimple());
        SimpleDateFormat oHL7Format = new SimpleDateFormat("yyyyMMddHHmmss");
        String sDateTime = oHL7Format.format(FhirUtils.toCalender(oFhirObservation.getIssuedSimple()).getTime());
        assertEquals("The issued date/time was incorrect.", RESULTED_HL7[iIndex], sDateTime);
    }

    /**
     * This method verifies the values in the Applies date time object,.
     *
     * @param iIndex The index of the vitals to use in the comparison.
     * @param oFhirObservation The FHIR observation that is being compared.
     */
    private void verifyTransformAppliesDateTime(int iIndex, Observation oFhirObservation) {
        assertNotNull("The result should not have been null.", oFhirObservation.getApplies());
        String sFhirDateTime = FhirUtils.extractFhirDateTimeValue(oFhirObservation.getApplies());
        assertEquals("The Applies date was incorrect.", OBSERVED_FHIR[iIndex], sFhirDateTime);
    }

    /**
     * This method verifies that the identifier fields were converted correctly.
     *
     * @param iIndex The index of the vitals being verified.
     * @param oFhirObservation The FHIR observation being verified.
     */
    private void verifyTransformIdentifier(int iIndex, Observation oFhirObservation) {
        assertNotNull("The identifier should not have been null.", oFhirObservation.getIdentifier());
        assertEquals("The use was not set correctly.", IdentifierUse.official, oFhirObservation.getIdentifier().getUseSimple());
        assertEquals("The identifier was not correct.", UID[iIndex], oFhirObservation.getIdentifier().getValueSimple());
    }

    private void verifyTransformReliability(int iIndex, Observation oFhirObservation) {
        assertNotNull("The reliability should not have been null.", oFhirObservation.getReliabilitySimple());
        assertEquals("The reliability should have been 'unknown'.", Observation.ObservationReliability.unknown, oFhirObservation.getReliabilitySimple());
    }

    private void verifyTransformStatus(int iIndex, Observation oFhirObservation) {
        assertNotNull("The status should not have been null.", oFhirObservation.getStatusSimple());
        assertEquals("The status should have been 'unknown'.", Observation.ObservationStatus.final_, oFhirObservation.getStatusSimple());
    }

    /**
     * This method verifies the contents of the transformed observation.
     *
     * @param iIndex The index of the vitals that is being verified.
     * @param oFhirObservation The transformed vitals that is being verified.
     */
    private void verifyTransformSubject(int iIndex, Observation oFhirObservation) {
        assertNotNull("The subjet should not have been null.", oFhirObservation.getSubject());
        assertEquals("The subject was not correct.", VprExtractionUtils.PATIENT_REFERENCE_PREFIX + DFN[iIndex], oFhirObservation.getSubject().getReferenceSimple());
    }

    /**
     * This method verifies that the Performer field was transformed correctly.
     *
     * @param iIndex The index of the vitals result being tested.
     * @param oFhirObservation The result that was transformed.
     */
    private void verifyTransformPerformer(int iIndex, Observation oFhirObservation) {
        assertNotNull("The Performer field should not have been null.", oFhirObservation.getPerformer());
        assertNotNull("The FHIR observation should have at least one contained resource (the performing organization).", oFhirObservation.getContained());
        assertNotNull("The FHIR observation should have at least one contained resource (the performing organization).", oFhirObservation.getContained().size() > 0);

        boolean atLeastOnContainedOrganizationResource = false;
        String resourceReferenceId = null;
        for (Resource containedResource : oFhirObservation.getContained()) {
            if (containedResource.getResourceType().equals(ResourceType.Organization)) {
                atLeastOnContainedOrganizationResource = true;
                assertEquals("The organization name was incorrect.", FACILITY_NAME[iIndex], ((Organization) containedResource).getNameSimple());
                assertEquals(FACILITY_CODE[iIndex], ((Organization) containedResource).getIdentifier().get(0).getValueSimple());
                assertEquals(VitalsVistaToFhir.FACILITY_CODE_LABEL, ((Organization) containedResource).getIdentifier().get(0).getLabelSimple());
                resourceReferenceId = containedResource.getXmlId();
            }
        }

        assertTrue("There should have been at least one contained Organziation resource.", atLeastOnContainedOrganizationResource);
        assertEquals("The organization name was incorrect.", FACILITY_NAME[iIndex], oFhirObservation.getPerformer().get(0).getDisplaySimple());
        assertTrue("The performer field should reference the contained resource.", oFhirObservation.getPerformer().get(0).getReferenceSimple().contains(resourceReferenceId));
    }

    private void verifyTransformCuffSize(int iIndex, Observation oFhirObservation) {
        if (VitalsVistaToFhir.CUFF_SIZE_CATEGORY_VUID.equals(testSubject.getCategoryVuid(QUALIFIERS_VUID[iIndex]))) {
            assertNotNull(oFhirObservation.getExtensions());
            assertNotNull(oFhirObservation.getExtension(VitalsVistaToFhir.CUFF_SIZE_EXTENSION_URL));
            assertEquals("Name is not correct.", QUALIFIERS_NAME[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.CUFF_SIZE_EXTENSION_URL).getValue()).getDisplaySimple());
            assertEquals("VUID is not correct.", QUALIFIERS_VUID[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.CUFF_SIZE_EXTENSION_URL).getValue()).getCodeSimple());
            assertEquals("System is not correct.", VitalsVistaToFhir.VUID_CODING_SYSTEM, ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.CUFF_SIZE_EXTENSION_URL).getValue()).getSystemSimple());
        }
    }

    private void verifyTransformBodySite(int iIndex, Observation oFhirObservation) {
        if (VitalsVistaToFhir.LOCATION_CATEGORY_VUID.equals(testSubject.getCategoryVuid(QUALIFIERS_VUID[iIndex]))) {
            assertNotNull(oFhirObservation.getBodySite());
            assertEquals("Name is not correct.", QUALIFIERS_NAME[iIndex], oFhirObservation.getBodySite().getCoding().get(0).getDisplaySimple());
            assertEquals("VUID is not correct.", QUALIFIERS_VUID[iIndex], oFhirObservation.getBodySite().getCoding().get(0).getCodeSimple());
            assertEquals("System is not correct.", VitalsVistaToFhir.VUID_CODING_SYSTEM, oFhirObservation.getBodySite().getCoding().get(0).getSystemSimple());
        }
    }

    private void verifyTransformPosition(int iIndex, Observation oFhirObservation) {
        if (VitalsVistaToFhir.POSITION_CATEGORY_VUID.equals(testSubject.getCategoryVuid(QUALIFIERS_VUID[iIndex]))) {
            assertNotNull(oFhirObservation.getExtensions());
            assertNotNull(oFhirObservation.getExtension(VitalsVistaToFhir.POSITION_EXTENSION_URL));
            assertEquals("Name is not correct.", QUALIFIERS_NAME[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.POSITION_EXTENSION_URL).getValue()).getDisplaySimple());
            assertEquals("VUID is not correct.", QUALIFIERS_VUID[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.POSITION_EXTENSION_URL).getValue()).getCodeSimple());
            assertEquals("System is not correct.", VitalsVistaToFhir.VUID_CODING_SYSTEM, ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.POSITION_EXTENSION_URL).getValue()).getSystemSimple());
        }
    }

    private void verifyTransformMethod(int iIndex, Observation oFhirObservation) {
        if (VitalsVistaToFhir.METHOD_CATEGORY_VUID.equals(testSubject.getCategoryVuid(QUALIFIERS_VUID[iIndex]))) {
            assertNotNull(oFhirObservation.getMethod());
            assertEquals("Name is not correct.", QUALIFIERS_NAME[iIndex], oFhirObservation.getMethod().getCoding().get(0).getDisplaySimple());
            assertEquals("VUID is not correct.", QUALIFIERS_VUID[iIndex], oFhirObservation.getMethod().getCoding().get(0).getCodeSimple());
            assertEquals("System is not correct.", VitalsVistaToFhir.VUID_CODING_SYSTEM, oFhirObservation.getMethod().getCoding().get(0).getSystemSimple());
        }
    }

    private void verifyTransformQuality(int iIndex, Observation oFhirObservation) {
        if (VitalsVistaToFhir.QUALITY_CATEGORY_VUID.equals(testSubject.getCategoryVuid(QUALIFIERS_VUID[iIndex]))) {
            assertNotNull(oFhirObservation.getExtensions());
            assertNotNull(oFhirObservation.getExtension(VitalsVistaToFhir.QUALITY_EXTENSION_URL));
            assertEquals("Name is not correct.", QUALIFIERS_NAME[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.QUALITY_EXTENSION_URL).getValue()).getDisplaySimple());
            assertEquals("VUID is not correct.", QUALIFIERS_VUID[iIndex], ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.QUALITY_EXTENSION_URL).getValue()).getCodeSimple());
            assertEquals("System is not correct.", VitalsVistaToFhir.VUID_CODING_SYSTEM, ((Coding) oFhirObservation.getExtension(VitalsVistaToFhir.QUALITY_EXTENSION_URL).getValue()).getSystemSimple());
        }
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
            List<Observation> oaFhirObservation = testSubject.transform(null);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirObservation));

            // Second Null - the Vitals Class part is null within the object.
            //----------------------------------------------------------------
            VPRVitalsRpcOutput oVprVitalsRpcOutput = new VPRVitalsRpcOutput();
            oaFhirObservation = testSubject.transform(oVprVitalsRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirObservation));

            // Third Null - the Vitals array is null within the object.
            //---------------------------------------------------------
            oVprVitalsRpcOutput = new VPRVitalsRpcOutput();
            oVprVitalsRpcOutput.setData(new VitalsData());
            oaFhirObservation = testSubject.transform(oVprVitalsRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirObservation));

            // The fourth test - we need a special testSubject instance that we can mock out the
            // transformOneVitalResult method so that it returns null.
            //------------------------------------------------------------------------------------
            VitalsVistaToFhir testSubject2 = new VitalsVistaToFhir() {
                @Override
                protected Observation transformOneVitalsResult(Vitals oVitals) {
                    return null;
                }
            };
            oVprVitalsRpcOutput = new VPRVitalsRpcOutput();
            oVprVitalsRpcOutput.setData(new VitalsData());
            Vitals oVitals = new Vitals();
            oVprVitalsRpcOutput.getData().addItems(oVitals);
            oVitals.setSummary("SomeSummaryData");
            oaFhirObservation = testSubject2.transform(oVprVitalsRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirObservation));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests an overall transform containing two vitals results.
     */
    @Test
    public void testTransformWithTwoVitals() throws ModelTransformException {

        VPRVitalsRpcOutput oVitalsOutput = createSampleVprVitalsRpcOutput();
        addToVitalsArray(3, oVitalsOutput);
        addToVitalsArray(4, oVitalsOutput);
        List<Observation> oaFhirObservation = testSubject.transform(oVitalsOutput);
        assertTrue("The return result should not have been nullish.", isNotNullish(oaFhirObservation));
        assertEquals("There should have been two results returned.", 2, oaFhirObservation.size());

        boolean bFound3 = false;
        boolean bFound4 = false;

        for (Observation oFhirObservation : oaFhirObservation) {
            int iIndex = 0;
            if (SUMMARY[3].equals(oFhirObservation.getText().getDiv().allText())) {
                bFound3 = true;
                iIndex = 3;
            } else if (SUMMARY[4].equals(oFhirObservation.getText().getDiv().allText())) {
                bFound4 = true;
                iIndex = 4;
            } else {
                fail("An unexpected observation was found.");
            }

            verifyTransformText(iIndex, oFhirObservation);
            verifyTransformName(iIndex, oFhirObservation);
            verifyTransformResult(iIndex, oFhirObservation);
            verifyTransformAppliesDateTime(iIndex, oFhirObservation);
            verifyTransformIssuedDateTime(iIndex, oFhirObservation);
            verifyTransformIdentifier(iIndex, oFhirObservation);
            verifyTransformReliability(iIndex, oFhirObservation);
            verifyTransformStatus(iIndex, oFhirObservation);
            verifyTransformSubject(iIndex, oFhirObservation);
            verifyTransformReferenceRange(iIndex, oFhirObservation);
            verifyTransformCuffSize(iIndex, oFhirObservation);
            verifyTransformBodySite(iIndex, oFhirObservation);
            verifyTransformPosition(iIndex, oFhirObservation);
            verifyTransformMethod(iIndex, oFhirObservation);
            verifyTransformQuality(iIndex, oFhirObservation);

        }

        assertTrue("Failed to find first vitals observation.", bFound3);
        assertTrue("Failed to find second vitals observation.", bFound4);

    }

    /**
     * This method tests the case of passing in a null into the TransformOneVitalsResult method.
     */
    @Test
    public void testTransformOneVitalsResultNull() throws ModelTransformException {
        Observation oFhirObservation = testSubject.transformOneVitalsResult(null);
        assertNull("The response should have been null.", oFhirObservation);
    }


    /**
     * This method tests the transformText method for null conditions
     */
    @Test
    public void testTransformTextNull() {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformText(oFhirObservation, null);
        assertNull("The text node should have been null.", oFhirObservation.getText());

        // Check for null Summary
        //------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformText(oFhirObservation, oVitals);
        assertNull("The text node should have been null.", oFhirObservation.getText());
    }

    /**
     * This method tests the transformText method for non-null conditions.
     */
    @Test
    public void testTransformTextValidValues() {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);

        testSubject.transformText(oFhirObservation, oVitals);
        verifyTransformText(1, oFhirObservation);
    }

    /**
     * This method tests transformName method for null conditions.
     */
    @Test
    public void testTransformNameNull() {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformName(oFhirObservation, null);
        assertNull("The name node should have been null.", oFhirObservation.getName());

        // Check for null typeCode and typeName
        //-------------------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformName(oFhirObservation, oVitals);
        assertNull("The name node should have been null.", oFhirObservation.getName());
    }

    /**
     * This method tests the transformName method for non-null conditions.
     */
    @Test
    public void testTransformNameValidValues() {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);

        testSubject.transformName(oFhirObservation, oVitals);
        verifyTransformName(1, oFhirObservation);
    }

    /**
     * This method tests transformResult method for null conditions.
     */
    @Test
    public void testTransformResultNull() throws ModelTransformException {

        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            Observation oFhirObservation = new Observation();
            Vitals oVitals = createVitals(i);

            // Check for null vitals
            //-----------------------
            testSubject.transformName(oFhirObservation, oVitals);
            testSubject.transformResult(oFhirObservation, null);
            assertNull("The result node and component observations should have been null.", oFhirObservation.getValue());

            // Check for null result
            //----------------------
            testSubject.transformResult(oFhirObservation, oVitals);
            assertTrue("The result or should be non-null/non-empty.", (oFhirObservation.getValue() != null));
        }
    }

    /**
     * This method tests the transformResult method for non-null conditions.
     */
    @Test
    public void testTransformResultValidValues() throws ModelTransformException {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformName(oFhirObservation, oVitals);
        testSubject.transformResult(oFhirObservation, oVitals);
        verifyTransformResult(1, oFhirObservation);
    }

    /**
     * This method tests the transformResult method exception case.
     */
    @Test
    public void testTransformResultBeforeTransformName() {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);

        try {
            testSubject.transformResult(oFhirObservation, oVitals);
            fail("ModelTransformException should have been thrown.");
        } catch (ModelTransformException mte) {
            // It is expected that we get this exception - do nothing.
//            mte.printStackTrace();
        }
    }


    /**
     * This method tests transformAppliesDateTime method for null conditions.
     */
    @Test
    public void testTransformAppliesDateTimeNull() throws ModelTransformException {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformAppliesDateTime(oFhirObservation, null);
        assertNull("The applies node should have been null.", oFhirObservation.getApplies());

        // Check for null result
        //----------------------
        Vitals oVitals = new Vitals();
        testSubject.transformAppliesDateTime(oFhirObservation, oVitals);
        assertNull("The applies node should have been null.", oFhirObservation.getApplies());
    }

    /**
     * This method tests the transformAppliesDateTime method for non-null conditions.
     */
    @Test
    public void testTransformAppliesDateTimeValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformAppliesDateTime(oFhirObservation, oVitals);
        verifyTransformAppliesDateTime(1, oFhirObservation);
    }

    /**
     * This method tests transformIssuedDateTime method for null conditions.
     */
    @Test
    public void testTransformIssuedDateTimeNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformIssuedDateTime(oFhirObservation, null);
        assertNull("The issued node should have been null.", oFhirObservation.getIssuedSimple());

        // Check for null resulted
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformIssuedDateTime(oFhirObservation, oVitals);
        assertNull("The issued node should have been null.", oFhirObservation.getIssuedSimple());
    }

    /**
     * This method tests the transformIssuedDateTime method for non-null conditions.
     */
    @Test
    public void testTransformIssuedDateTimeValidValues() throws ModelTransformException {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformIssuedDateTime(oFhirObservation, oVitals);
        verifyTransformIssuedDateTime(1, oFhirObservation);
    }

    /**
     * This method tests transformIdentifier method for null conditions.
     */
    @Test
    public void testTransformIdentifierNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformIdentifier(oFhirObservation, null);
        assertNull("The identifier node should have been null.", oFhirObservation.getIdentifier());

        // Check for null resulted
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformIdentifier(oFhirObservation, oVitals);
        assertNull("The identifier node should have been null.", oFhirObservation.getIdentifier());
    }

    /**
     * This method tests the transformIdentifier method for non-null conditions.
     */
    @Test
    public void testTransformIdentifierValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformIdentifier(oFhirObservation, oVitals);
        verifyTransformIdentifier(1, oFhirObservation);
    }


    /**
     * This method tests transformSubject method for null conditions.
     */
    @Test
    public void testTransformSubjectNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformSubject(oFhirObservation, null);
        assertNull("The subject node should have been null.", oFhirObservation.getSubject());

        // Check for null UID
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformSubject(oFhirObservation, oVitals);
        assertNull("The identifier node should have been null.", oFhirObservation.getSubject());

        // Check for UID which does not contain enough tokens
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setUid("urn:va:domain");
        testSubject.transformSubject(oFhirObservation, oVitals);
        assertNull("The identifier node should have been null.", oFhirObservation.getSubject());

        // Check for UID which does not contain the DFN token
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setUid("urn:va:domain:site::ien");
        testSubject.transformSubject(oFhirObservation, oVitals);
        assertNull("The identifier node should have been null.", oFhirObservation.getSubject());
    }

    /**
     * This method tests the transformSubject method for non-null conditions.
     */
    @Test
    public void testTransformSubjectValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformSubject(oFhirObservation, oVitals);
        verifyTransformSubject(1, oFhirObservation);
    }


    /**
     * This method tests the transformReferenceRange method exception case.
     */
    @Test
    public void testTransformReferenceRangeBeforeTransformName() {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);

        try {
            testSubject.transformReferenceRange(oFhirObservation, oVitals);
            fail("ModelTransformException should have been thrown.");
        } catch (ModelTransformException mte) {
            // it is expected that we get this exception.
            //-------------------------------------------
//            mte.printStackTrace();
        }
    }

    /**
     * This method tests transformReferenceRange method for null conditions.
     */
    @Test
    public void testTransformReferenceRangeNull() throws Exception {
        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            Observation oFhirObservation = new Observation();

            // Check for null vitals
            //-----------------------
            testSubject.transformName(oFhirObservation, createVitals(i));
            testSubject.transformReferenceRange(oFhirObservation, null);
            assertTrue("The reference range node should have been nullish.", NullChecker.isNullish(oFhirObservation.getReferenceRange()));

            // Check for null Low & High
            //---------------------------
            Vitals oVitals = new Vitals();
            testSubject.transformIdentifier(oFhirObservation, oVitals);
            assertTrue("The reference range node should have been nullish.", NullChecker.isNullish(oFhirObservation.getReferenceRange()));
        }
    }

    /**
     * This method tests the transformReferenceRange method for non-null conditions.
     */
    @Test
    public void testTransformReferenceRangeValidValues() throws Exception {
        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            Observation oFhirObservation = new Observation();
            Vitals oVitals = createVitals(i);
            testSubject.transformName(oFhirObservation, oVitals);
            testSubject.transformReferenceRange(oFhirObservation, oVitals);
            verifyTransformReferenceRange(i, oFhirObservation);
        }
    }

    /**
     * This method tests the transformPerformer method for non-null conditions.
     */
    @Test
    public void testTransformPerformerValidValues() {
        try {
            Observation oFhirObservation = new Observation();
            Vitals oVitals = createVitals(1);
            testSubject.transformPerformer(oFhirObservation, oVitals);
            verifyTransformPerformer(1, oFhirObservation);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    @Test
    public void testTransformPeformerNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformPerformer(oFhirObservation, null);
        assertTrue("There should be no performers.", oFhirObservation.getPerformer().size() == 0);

        // Check for null UID
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformPerformer(oFhirObservation, oVitals);
        assertTrue("There should be no performers.", oFhirObservation.getPerformer().size() == 0);

        // Check for UID which does not contain enough tokens
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setFacilityName("SOMEPLACE");
        testSubject.transformPerformer(oFhirObservation, oVitals);
        assertTrue("There should be no performers.", oFhirObservation.getPerformer().size() == 0);

        // Check for UID which does not contain the DFN token
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setFacilityCode("SOMEWHERE");
        testSubject.transformPerformer(oFhirObservation, oVitals);
        assertTrue("There should be no performers.", oFhirObservation.getPerformer().size() == 0);
    }


    @Test
    public void testTransformCuffSizeNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformCuffSize(oFhirObservation, null);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for null qualifiers
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformCuffSize(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for cuff size when qualifier doesn't have VUIDs
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid("SM ADULT CUFF", "LOCAL")));
        testSubject.transformCuffSize(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);
    }

    @Test
    public void testTransformCuffSizeValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(0);
        testSubject.transformCuffSize(oFhirObservation, oVitals);
        verifyTransformCuffSize(0, oFhirObservation);
    }


    @Test
    public void testTransformBodySiteNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformBodySite(oFhirObservation, null);
        assertNull(oFhirObservation.getBodySite());

        // Check for null qualifiers
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformBodySite(oFhirObservation, oVitals);
        assertNull(oFhirObservation.getBodySite());

        // Check for body site size when qualifier doesn't have VUIDs
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid("SOME LOCATION", "LOCAL")));
        testSubject.transformBodySite(oFhirObservation, oVitals);
        assertNull(oFhirObservation.getBodySite());
    }

    @Test
    public void testTransformBodySiteValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(1);
        testSubject.transformBodySite(oFhirObservation, oVitals);
        verifyTransformBodySite(1, oFhirObservation);
    }

    @Test
    public void testTransformPositionNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformPosition(oFhirObservation, null);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for null UID
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformPosition(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for position size when qualifier doesn't have VUIDs
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid("SOME POSITION", "LOCAL")));
        testSubject.transformPosition(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);
    }

    @Test
    public void testTransformPositionValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(2);
        testSubject.transformPosition(oFhirObservation, oVitals);
        verifyTransformPosition(2, oFhirObservation);
    }

    @Test
    public void testTransformMethodNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformMethod(oFhirObservation, null);
        assertNull(oFhirObservation.getMethod());

        // Check for null qualifiers
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformMethod(oFhirObservation, oVitals);
        assertNull(oFhirObservation.getMethod());

        // Check for body site size when qualifier doesn't have VUIDs
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid("SOME LOCATION", "LOCAL")));
        testSubject.transformMethod(oFhirObservation, oVitals);
        assertNull(oFhirObservation.getMethod());
    }

    @Test
    public void testTransformMethodValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(3);
        testSubject.transformMethod(oFhirObservation, oVitals);
        verifyTransformMethod(3, oFhirObservation);
    }


    @Test
    public void testTransformQualityNull() throws Exception {
        Observation oFhirObservation = new Observation();

        // Check for null vitals
        //-----------------------
        testSubject.transformQuality(oFhirObservation, null);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for null qualifiers
        //-------------------------
        Vitals oVitals = new Vitals();
        testSubject.transformQuality(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);

        // Check for cuff size when qualifier doesn't have VUIDs
        //----------------------------------------------------
        oVitals = new Vitals();
        oVitals.setQualifiers(Lists.newArrayList(new Vitals.NamedVuid("SOME QUALITY", "LOCAL")));
        testSubject.transformQuality(oFhirObservation, oVitals);
        assertTrue("There should be no extensions.", oFhirObservation.getExtensions().size() == 0);
    }

    @Test
    public void testTransformQualityValidValues() throws Exception {
        Observation oFhirObservation = new Observation();
        Vitals oVitals = createVitals(4);
        testSubject.transformQuality(oFhirObservation, oVitals);
        verifyTransformQuality(4, oFhirObservation);
    }


    /**
     * This verifies the contents of the reference range transformations.
     *
     * @param iIndex The index of the vitals being verified.
     * @param oFhirObservation The FhirObservation being verified.
     */
    private void verifyTransformReferenceRange(int iIndex, Observation oFhirObservation) {
        assertNotNull("Reference Range should not have been null.", oFhirObservation.getReferenceRange());
        assertTrue("There should have been at least one entry in the reference range.", oFhirObservation.getReferenceRange().size() > 0);

        boolean bFoundSystolic = false;
        boolean bFoundDiastolic = false;

        for (ObservationReferenceRangeComponent oRefRange : oFhirObservation.getReferenceRange()) {
            assertNotNull("The meaning node shoould not have been null.", oRefRange.getMeaning());
            assertNotNull("The meaning - coding node should not have been null.", oRefRange.getMeaning().getCoding());
            assertEquals("There should have only been one coding object.", 1, oRefRange.getMeaning().getCoding().size());
            assertTrue("The code should not have been nullish.", isNotNullish(oRefRange.getMeaning().getCoding().get(0).getCodeSimple()));
            Coding oCoding = oRefRange.getMeaning().getCoding().get(0);
            if (SYSTOLIC_REFERENCE_RANGE_CODE.equals(oCoding.getCodeSimple())) {
                assertEquals("Systolic Display was not correct.", SYSTOLIC_REFERENCE_RANGE_DISPLAY_VALUE, oCoding.getDisplaySimple());
                assertEquals("Systolic System was not correct.", SYSTOLIC_REFERENCE_RANGE_SYSTEM, oCoding.getSystemSimple());
                assertNotNull("Systolic Low should not have been null.", oRefRange.getLow());
                assertNotNull("Systolic Low value should not have been null.", oRefRange.getLow().getValueSimple());
                assertEquals("Systolic Low value was not correct.", LOW_SYSTOLIC[iIndex], oRefRange.getLow().getValueSimple().toString());
                assertEquals("Ststolic low units was not correct.", UNITS[iIndex], oRefRange.getLow().getUnitsSimple());
                assertNotNull("Systolic High should not have been null.", oRefRange.getHigh());
                assertNotNull("Systolic High value should not have been null.", oRefRange.getHigh().getValueSimple());
                assertEquals("Systolic High value was not correct.", HIGH_SYSTOLIC[iIndex], oRefRange.getHigh().getValueSimple().toString());
                assertEquals("Ststolic High units was not correct.", UNITS[iIndex], oRefRange.getHigh().getUnitsSimple());
                bFoundSystolic = true;
            } else if (DIASTOLIC_REFERENCE_RANGE_CODE.equals(oCoding.getCodeSimple())) {
                assertEquals("Diastolic Display was not correct.", DIASTOLIC_REFERENCE_RANGE_DISPLAY_VALUE, oCoding.getDisplaySimple());
                assertEquals("Diastolic System was not correct.", DIASTOLIC_REFERENCE_RANGE_SYSTEM, oCoding.getSystemSimple());
                assertNotNull("Diastolic Low should not have been null.", oRefRange.getLow());
                assertNotNull("Diastolic Low value should not have been null.", oRefRange.getLow().getValueSimple());
                assertEquals("Diastolic Low value was not correct.", LOW_DIASTOLIC[iIndex], oRefRange.getLow().getValueSimple().toString());
                assertEquals("Diastolic low units was not correct.", UNITS[iIndex], oRefRange.getLow().getUnitsSimple());
                assertNotNull("Diastolic High should not have been null.", oRefRange.getHigh());
                assertNotNull("Diastolic High value should not have been null.", oRefRange.getHigh().getValueSimple());
                assertEquals("Diastolic High value was not correct.", HIGH_DIASTOLIC[iIndex], oRefRange.getHigh().getValueSimple().toString());
                assertEquals("Diastolic High units was not correct.", UNITS[iIndex], oRefRange.getHigh().getUnitsSimple());
                bFoundDiastolic = true;
            } else {
                // found a non Blood Pressure reference value
                assertNotNull(oCoding.getDisplaySimple());
                assertTrue(isNotNullish(oCoding.getSystemSimple()));
                assertNotNull("Low should not have been null.", oRefRange.getLow());
                assertNotNull("Low value should not have been null.", oRefRange.getLow().getValueSimple());
                assertEquals("Low value was not correct.", LOW[iIndex], oRefRange.getLow().getValueSimple().toString());
                assertEquals("low units was not correct.", UNITS[iIndex], oRefRange.getLow().getUnitsSimple());
                assertNotNull("High should not have been null.", oRefRange.getHigh());
                assertNotNull("High value should not have been null.", oRefRange.getHigh().getValueSimple());
                assertEquals("High value was not correct.", HIGH[iIndex], oRefRange.getHigh().getValueSimple().toString());
                assertEquals("High units was not correct.", UNITS[iIndex], oRefRange.getHigh().getUnitsSimple());
            }
        }  // for (ObservationReferenceRangeComponent oRefRange : oFhirObservation.getReferenceRange())

        if (bFoundDiastolic) {
            assertTrue("Failed to find the systolic blood pressure.", bFoundSystolic);
        }
        if (bFoundSystolic) {
            assertTrue("Failed to find the diasolic blood pressure.", bFoundDiastolic);
        }
    }

    @Test
    public void testSplitBloodPressure() throws ModelTransformException {

        for (Vitals vitals : asList(createVitals(0), createVitals(1), createVitals(2))) {
            Observation combinedObservation =  testSubject.transformOneVitalsResult(vitals);
            List<Observation> bpObservations = VitalsVistaToFhir.splitBloodPressure(combinedObservation);

            assertEquals(2, bpObservations.size());

            Observation systolicObservation = bpObservations.get(0);
            Observation diastolicObservation = bpObservations.get(1);

            assertEquals(1, systolicObservation.getName().getCoding().size());
            assertEquals(1, diastolicObservation.getName().getCoding().size());
            assertEquals("8480-6", systolicObservation.getName().getCoding().get(0).getCodeSimple());
            assertEquals("8462-4", diastolicObservation.getName().getCoding().get(0).getCodeSimple());

            assertTrue(systolicObservation.getValue() instanceof Quantity);
            assertTrue(diastolicObservation.getValue() instanceof Quantity);
            assertEquals(vitals.getResult().split("/")[0], ((Quantity) systolicObservation.getValue()).getValueSimple().toPlainString());
            assertEquals(vitals.getResult().split("/")[1], ((Quantity) diastolicObservation.getValue()).getValueSimple().toPlainString());
            assertEquals("mm[Hg]", ((Quantity) systolicObservation.getValue()).getUnitsSimple());
            assertEquals("mm[Hg]", ((Quantity) diastolicObservation.getValue()).getUnitsSimple());

            assertEquals(1, systolicObservation.getReferenceRange().size());
            assertEquals(1, systolicObservation.getReferenceRange().size());
            assertEquals("12929001", systolicObservation.getReferenceRange().get(0).getMeaning().getCoding().get(0).getCodeSimple());
            assertEquals("53813002", diastolicObservation.getReferenceRange().get(0).getMeaning().getCoding().get(0).getCodeSimple());
            assertEquals(vitals.getHigh().split("/")[0], systolicObservation.getReferenceRange().get(0).getHigh().getValueSimple().toPlainString());
            assertEquals(vitals.getHigh().split("/")[1], diastolicObservation.getReferenceRange().get(0).getHigh().getValueSimple().toPlainString());
            assertEquals(vitals.getLow().split("/")[0], systolicObservation.getReferenceRange().get(0).getLow().getValueSimple().toPlainString());
            assertEquals(vitals.getLow().split("/")[1], diastolicObservation.getReferenceRange().get(0).getLow().getValueSimple().toPlainString());

            assertEquals(vitals.getUnits(), systolicObservation.getReferenceRange().get(0).getHigh().getUnitsSimple());
            assertEquals(vitals.getUnits(), systolicObservation.getReferenceRange().get(0).getLow().getUnitsSimple());
            assertEquals(vitals.getUnits(), diastolicObservation.getReferenceRange().get(0).getHigh().getUnitsSimple());
            assertEquals(vitals.getUnits(), diastolicObservation.getReferenceRange().get(0).getLow().getUnitsSimple());

            assertEquals(combinedObservation.getPerformer().size(), systolicObservation.getPerformer().size());
            assertEquals(combinedObservation.getPerformer().size(), diastolicObservation.getPerformer().size());

            assertEquals(combinedObservation.getExtensions(), systolicObservation.getExtensions());
            assertEquals(combinedObservation.getExtensions(), diastolicObservation.getExtensions());

            assertEquals(combinedObservation.getContained(), systolicObservation.getContained());
            assertEquals(combinedObservation.getContained(), diastolicObservation.getContained());
        }

    }

    @Test
    public void testGetCategoryVuid() {
        assertEquals(VitalsVistaToFhir.CUFF_SIZE_CATEGORY_VUID, testSubject.getCategoryVuid("4688705"));
        assertEquals(VitalsVistaToFhir.LOCATION_CATEGORY_VUID, testSubject.getCategoryVuid("4688717"));
        assertEquals(VitalsVistaToFhir.CUFF_SIZE_CATEGORY_VUID, testSubject.getCategoryVuid("4688661"));
        assertEquals(null, testSubject.getCategoryVuid("123456789"));
        assertEquals(null, testSubject.getCategoryVuid("LOCAL"));
    }

}

