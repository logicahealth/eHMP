package us.vistacore.ehmp.model.radiology.transform;

import static org.junit.Assert.fail;

import us.vistacore.ehmp.model.radiology.Providers;
import us.vistacore.ehmp.model.radiology.RadiologyResult;
import us.vistacore.ehmp.model.radiology.VPRRadiologyRpcOutput;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class RadiologyResultsGenerator {
    private static final String API_VERSION = "1.01";
    private static final String UPDATED = "false";
    private static final int NUMBER_OF_TEST_ENTRIES = 4; // Should equal the number of items in each of the arrays below

    private static final String[] UID = {"urn:va:image:B362:1:7039491.8876-1", "urn:va:image:B362:5:7059375.9074-1", "urn:va:image:B362:9:7059571.9054-1", "urn:va:image:B362:8:7008784.8989-1" };
    private static final String[] SUMMARY = {"PROTIME (PLASMA) 15.4<em>H</em> SEC.", "AMYLASE (SERUM) 111<em>H</em> IU/L", "DUPLEX SCAN OF EXTRACRANIAL ARTERIES; COMPLETE BILATERAL STUDY", "UROGRAPHY (PYELOGRAPHY), INTRAVENOUS, WITH OR WITHOUT KUB, WITH OR WITHOUT TOMOGRAPH"};
    private static final String[] PID = {"B362;1", "B362;5", "B362;9", "10110"};
    private static final String[] KIND = {"Imaging", "Imaging", "Imaging", "Imaging" };
    private static final String[] LOCAL_ID = {"7039491.8876-1", "7059375.9074-1", "7059571.9054-1", "7018790.8861-1"};
    private static final String[] FACILITY_CODE = {"500", "500", "500", "998" };
    private static final String[] FACILITY_NAME = {"CAMP MASTER", "CAMP MASTER", "CAMP MASTER", "ABILENE (CAA)"};
    private static final String[] TYPE_NAME = {"RADIOLOGIC EXAMINATION, WRIST; 2 VIEWS", "RADIOLOGIC EXAMINATION, ABDOMEN; SINGLE ANTEROPOSTERIOR VIEW", "RADIOLOGIC EXAMINATION, ANKLE; 2 VIEWS", "DUPLEX SCAN OF EXTRACRANIAL ARTERIES; COMPLETE BILATERAL STUDY"};
    private static final String[] DATE_TIME = {"199605081123", "199406240925", "199404280945", "199812091138" };
    private static final String[] CATEGORY = {"RA", "RA", "RA", "RA" };
    private static final String[] IMAGING_TYPE_UID = {"urn:va:imaging-Type:GENERAL RADIOLOGY", "urn:va:imaging-Type:GENERAL RADIOLOGY", "urn:va:imaging-Type:GENERAL RADIOLOGY", "urn:va:imaging-Type:VASCULAR LAB"};
    private static final String[] LOCATION_UID = {"urn:va:location:B362:40", "urn:va:location:B362:40", "urn:va:location:B362:40", "urn:va:location:B362:271"};
    private static final String[] HAS_IMAGES = {"false", "false", "false", "false" };
    private static final String[] IMAGE_LOCATION = {"RADIOLOGY MAIN FLOOR", "RADIOLOGY MAIN FLOOR", "RADIOLOGY MAIN FLOOR", "VASCULAR RADIOLOGY"};
    private static final String[] STATUS_NAME = {"COMPLETE", "COMPLETE", "COMPLETE", "COMPLETE"};
    private static final String[] NAME = {"WRIST 2 VIEWS", "ABDOMEN 1 VIEW", "ANKLE 2 VIEWS", "VAS-CAROTID DUPLEX SCAN"};
    private static final String[] LOCATION_NAME = {"RADIOLOGY MAIN FLOOR", "RADIOLOGY MAIN FLOOR", "RADIOLOGY MAIN FLOOR", "VASCULAR RADIOLOGY"};
    private static final String[] CASE = {"37", "1", "42", "11" };
    private static final String[] PROVIDERS_SUMMARY = {"ProcedureProvider{uid='null'}", "ProcedureProvider{uid='null'}", "ProcedureProvider{uid='null'}", "ProcedureProvider{uid='null'}"};
    private static final String[] PROVIDERS_PROVIDER_NAME = {"PROVIDER,FIFTY", "PROVIDER,FIFTY", "PROGRAMMER,TWENTY", "PROVIDER,TWOHUNDREDNINETYSEVEN"};
    private static final String[] PROVIDERS_PROVIDER_DISPLAY_NAME = {"Provider,Fifty", "Provider,Fifty", "Programmer,Twenty", "Provider,Twohundredninetyseven"};
    private static final String[] PROVIDERS_PROVIDER_UID = {"urn:va:user:B362:1595", "urn:va:user:B362:1595", "urn:va:user:B362:755", "urn:va:user:B362:11712"};
    @SuppressWarnings("unused") private static final String[] RESULTS_UID = {"urn:va:document:B362:1:7039491.8876-1", "urn:va:document:B362:5:7059375.9074-1", "urn:va:document:B362:9:7059571.9054-1", "urn:va:document:B362:8:7018790.8861-1" };
    @SuppressWarnings("unused") private static final String[] RESULTS_SUMMARY = {"ProcedureResult{uid='urn:va:document:B362:1:7039491.8876-1'}", "ProcedureResult{uid='urn:va:document:B362:5:7059375.9074-1'}", "ProcedureResult{uid='urn:va:document:B362:9:7059571.9054-1'}", "ProcedureResult{uid='urn:va:document:B362:8:7018790.8861-1'}"};
    @SuppressWarnings("unused") private static final String[] RESULTS_LOCAL_TITLE = {"WRIST 2 VIEWS", "ABDOMEN 1 VIEW", "ANKLE 2 VIEWS", "VAS-CAROTID DUPLEX SCAN"};
    private static final String[] VERIFIED = {"true", "true", "true", "true" };
    @SuppressWarnings("unused") private static final String[] DIAGNOSISES_CODE = {"NORMAL", "NORMAL", "NORMAL", "NORMAL"};
    @SuppressWarnings("unused") private static final String[] DIAGNOSISES_PRIMARY = {"true", "true", "true", "true"};
    private static final String[] ORDER_UID = {"", "", "", "urn:va:order:B362:8:8723"};
    private static final String[] ORDER_NAME = {"", "", "", "VAS-CAROTID DUPLEX SCAN"};
    private static final String[] INTERPRETATION = {"ABNORMAL", "", "ABNORMAL", ""};
    private static final String[] ENCOUNTER_UID = {"", "", "urn:va:visit:B362:9:232", ""};
    private static final String[] ENCOUNTER_NAME = {"", "", "RADIOLOGY MAIN FLOOR Apr 28, 1994", ""};

    private RadiologyResultsGenerator() {
    }

    /**
     * Create an instance of the VPR radiology results that we can use to do the various transforms from.
     *
     * @return A sample radiology results object to use for transformation purposes.
     */
    protected static VPRRadiologyRpcOutput createSampleVprRadiologyRpcOutput() {
        VPRRadiologyRpcOutput radsRpcOutput = new VPRRadiologyRpcOutput();
        radsRpcOutput.setApiVersion(API_VERSION);
        radsRpcOutput.setData(new VPRRadiologyRpcOutput.RadiologyData());
        radsRpcOutput.getData().setUpdated(UPDATED);
        return radsRpcOutput;
    }

    /**
     * Verifies that we are checking radiology results for valid instances that we create. (This is just a check all.)
     *
     * @param iIndex The index of the radiology results.
     * @return True if it is one that we have created.
     */
    private static boolean indexInBounds(int iIndex) {
        return ((iIndex >= 0) && (iIndex < NUMBER_OF_TEST_ENTRIES));
    }

    /**
     * Create a VPR lab result object.
     *
     * @param iIndex The index stating the version of the lab to create.
     * @return The lab that was created.
     */
    private static RadiologyResult createRadiologyResult(int iIndex) {
        RadiologyResult radResult = new RadiologyResult();

        if (indexInBounds(iIndex)) {
            radResult.setUid(UID[iIndex]);
            radResult.setSummary(SUMMARY[iIndex]);
            radResult.setPid(PID[iIndex]);
            radResult.setKind(KIND[iIndex]);
            radResult.setLocalId(LOCAL_ID[iIndex]);
            radResult.setFacilityCode(FACILITY_CODE[iIndex]);
            radResult.setFacilityName(FACILITY_NAME[iIndex]);
            radResult.setTypeName(TYPE_NAME[iIndex]);
            radResult.setDateTime(DATE_TIME[iIndex]);
            radResult.setCategory(CATEGORY[iIndex]);
            radResult.setImagingTypeUid(IMAGING_TYPE_UID[iIndex]);
            radResult.setLocationUid(LOCATION_UID[iIndex]);
            radResult.setHasImages(HAS_IMAGES[iIndex]);
            radResult.setImageLocation(IMAGE_LOCATION[iIndex]);
            radResult.setStatusName(STATUS_NAME[iIndex]);
            radResult.setName(NAME[iIndex]);
            radResult.setLocationName(LOCATION_NAME[iIndex]);
            radResult.setCaseId(CASE[iIndex]);
            radResult.addProviders(new Providers(PROVIDERS_SUMMARY[iIndex], PROVIDERS_PROVIDER_NAME[iIndex], PROVIDERS_PROVIDER_DISPLAY_NAME[iIndex], PROVIDERS_PROVIDER_UID[iIndex]));
            radResult.setVerified(VERIFIED[iIndex]);
            radResult.setOrderUid(ORDER_UID[iIndex]);
            radResult.setOrderName(ORDER_NAME[iIndex]);
            radResult.setInterpretation(INTERPRETATION[iIndex]);
            radResult.setEncounterUid(ENCOUNTER_UID[iIndex]);
            radResult.setEncounterName(ENCOUNTER_NAME[iIndex]);
        } else {
            fail("index was " + iIndex + ". Maximum value is " + (NUMBER_OF_TEST_ENTRIES - 1));
        }
        return radResult;
    }

    /**
     * This adds an lab result array for the specified index to the array list. The index tells it which instance to add.
     *
     * @param iIndex The version of the lab result to be added.
     * @param labsRpcOutput The object where the labs result should be added.
     */
    protected static void addToRadiologyResultsArray(int iIndex, VPRRadiologyRpcOutput radsRpcOutput) {
        RadiologyResult radResult = createRadiologyResult(iIndex);
        if (radResult != null) {
            radsRpcOutput.getData().addItems(radResult);
        }
    }

    public static Collection<Object[]> create() {
        List<Object[]> data = new ArrayList<Object[]>();
        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            data.add(new Object[] {createRadiologyResult(i)});
        }
        return data;
    }
}
