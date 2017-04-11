package us.vistacore.ehmp.model.labresults.transform;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.labresults.LabResult;
import us.vistacore.ehmp.model.labresults.LabResult.GramStain;
import us.vistacore.ehmp.model.labresults.LabResult.Organism;
import us.vistacore.ehmp.model.labresults.LabResult.Organism.Drugs;
import us.vistacore.ehmp.model.labresults.LabResult.Results;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.junit.Assert.fail;


/**
 * Static data generator
 */
public final class LabResultsGenerator {

    private static final String API_VERSION = "1.01";
    private static final String UPDATED = "false";
    private static final int NUMBER_OF_TEST_ENTRIES = 4; // Should equal the number of items in each of the arrays below
    private static final String[] SOURCE_VISTA_SITE = {"SourceVistaSite", "SourceVistaSite1", "SourceVistaSite2", "SourceVistaSite3"};
    private static final String[] BACT_REMARKS = {"PROVIDER NOTIFIED", "NO GROWTH", "Wrong patient accessioned. Disregard this report.", "NO GROWTH IN 5 MINUTES"};
    private static final String[] CATEGORY_CODE = {"urn:va:lab-category:CH", "urn:va:lab-category:CH", "urn:va:lab-category:CH", "urn:va:lab-category:CH"};
    private static final String[] CATEGORY_NAME = {"CategoryName", "CategoryName1", "CategoryName3", "Laboratory"};
    private static final String[] COMMENT = {
        "<comment> Ordering Provider: <provider_name> Report Released Date/Time: Sep 17, 1999@11:30\r\n Performing Lab: <name-of-lab>\r\n<line> <city>, ST 12180-0097\r\n ",
        "Ordering Provider: <provider_name> Report Released Date/Time: Sep 17, 1999@11:30:00\r\n Performing Lab: <name-of-lab>\r\nVA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097\r\n ",
        "TEST Ordering Provider: Thirtynine Radtech Report Released Date/Time: Sep 17, 1999@11:30\r\n Performing Lab: ALBANY VA MEDICAL CENTER\r\n                VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097\r\n ",
        "Ordering Provider comment Ordering Provider: Onehundredninetyone Provider Report Released Date/Time: Feb 24, 1998@11:59\r\n ",
         "Ordering Provider: Onehundredsixteen Vehu Report Released Date/Time: Mar 17, 2005@03:36\r\n Performing Lab: ALBANY VA MEDICAL CENTER\r\n                VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097\r\n ",
    };
    private static final String[] DISPLAY_NAME = {"DisplayName", "DisplayName1", "GLUCLOSE", ""};
    private static final String[] DISPLAY_ORDER = {"998.0000431", "24.3", "998.000043", "1"};
    private static final String[] FACILITY_CODE = {"FacilityCode", "FacilityCode1", "FacilityCode2", "FacilityCode3"};
    private static final String[] FACILITY_NAME = {"FacilityName", "FacilityName1", "FacilityName2", "FacilityName3"};
    private static final String[] GRAM_STAIN_RESULT = {"GRAM POSITIVE COCCI", "GRAM NEGATIVE RODS", "GRAM POSITIVE COCCI", "GRAM NEGATIVE RODS"};
    private static final String[] GROUP_NAME = {"CH 1234 4", "CH 1234 4", "CH 1234 4", "CH 1234 4"};
    private static final String[] GROUP_UID = {"GroupUid", "GroupUid1", "GroupUid2", "urn:va:B362:1:accession:CH;7009081.887161"};
    private static final String[] HIGH = {"0", "1", "2", ""};
    private static final String[] INTERPRETATION_CODE = {"urn:hl7:observation-interpretation:L", "urn:hl7:observation-interpretation:HH", "", "urn:hl7:observation-interpretation:H"};
    private static final String[] INTERPRETATION_NAME = {"InterpretationName", "InterpretationName1", "", "High"};
    private static final String[] LAB_ORDER_ID = {"OrderId", "OrderId1", "OrderId2", "1234"};
    private static final String[] LOCAL_ID = {"LocalId", "LocalId1", "LocalId2", "CH;7009081.887161;1"};
    private static final String[] LOW = {"0", "1", "2", ""};
    private static final String[] OBSERVED = {"199206271200", "199206281201", "19920629090000", "19920630120001"};
    private static final String[] ORDERUID = {"urn:va:B362:1:order:9572", "urn:va:B362:1:order:8502", "urn:va:B362:1:order:8377", "urn:va:B362:1:order:8377"};
    private static final String[] ORGANISM_NAME = {"PARAGONIMUS WESTERMANII", "ESCHERICHIA COLI", "STAPHYLOCOCCUS AUREUS", "STAPHYLOCOCCUS AUREUS"};
    private static final String[] ORGANISM_QTY = {">15,000/ML", ">10,000/MML", ">12,000/MML", ">8,000/MML"};
    private static final String[] ORGANISM_DRUGS_INTERP = {"R", "S", "R", "S"};
    private static final String[] ORGANISM_DRUGS_NAME = {"GENTAMICIN", "TETRACYCLINE", "CAR", "TOBRMCN"};
    private static final String[] ORGANISM_DRUGS_RESULT = {"R", "S", "R", "S"};
    private static final String[] ORGANISM_DRUGS_RESTRICT = {"R", "R", "R", "R"};
    private static final String[] ORGANIZER_TYPE = {"accession", "accession2", "accession3", "accession3"};
    private static final String[] RESULT = {"0", "000.1", "10000000.0", "NEG"};
    private static final String[] RESULTED = {"199206271200", "199206281201", "19920629090000", "19920630120001"};
    private static final String[] RESULTS_LOCAL_TITLE = {"LR SURGICAL PATHOLOGY REPORT", "LR ELECTRON MICROSCOPY REPORT", "LR MICROBIOLOGY REPORT", "LR MICROBIOLOGY REPORT"};
    private static final String[] RESULTS_NATIONAL_TITLE = {"LABORATORY NOTE", "LABORATORY NOTE2", "LABORATORY NOTE3", "LABORATORY NOTE3"};
    private static final String[] RESULTS_RESULT_UID = {"urn:va:B362:1:tiu:SP;7149897", "urn:va:B362:1:tiu:CY;7039673", "urn:va:B362:1:tiu:EM;7109668.99997", "urn:va:B362:1:tiu:EM;7109668.99997"};
    private static final String[] RESULTS_UID = {"MI;7109279.8866", "urn:va:B362:1:lab:SP;7149897;0", "urn:va:B362:1:lab:EM;7109668.99998;0", "urn:va:B362:1:lab:EM;7109668.99998;0"};
    private static final String[] SAMPLE = {"Sample", "Sample1", "Sample2", ""};
    private static final String[] SPECIMEN = {"Specimen", "Specimen1", "Specimen2", ""};
    private static final String[] STATUS_CODE = {"urn:va:lab-status:completed", "urn:va:lab-status:completed", "urn:va:lab-status:completed", "urn:va:lab-status:completed"};
    private static final String[] STATUS_NAME = {"completed", "completed", "completed", "completed"};
    private static final String[] SUMMARY = {"PROTIME (PLASMA) 15.4<em>H</em> SEC.", "AMYLASE (SERUM) 111<em>H</em> IU/L", "PROTIME (PLASMA) 13.3 SEC.", "PTT (PLASMA) 24.3 SEC."};
    private static final String[] TYPE_CODE = {"TypeCode", "TypeCode1", "", "urn:lnc:2344-0"};
    private static final String[] TYPE_ID = {"TypeId", "TypeId1", "", "175"};
    private static final String[] TYPE_NAME = {"TypeName", "TypeName1", "", "GLUCOSE"};
    private static final String[] DFN = {"22", "222", "2222", "22222" };
    private static final String[] UID = {"urn:va:domain:site:" + DFN[0] + ":" + LOCAL_ID[0],
            "urn:va:domain:site:" + DFN[1] + ":" + LOCAL_ID[1],
            "urn:va:domain:site:" + DFN[2] + ":" + LOCAL_ID[2],
            "urn:va:domain:site:" + DFN[3] + ":" + LOCAL_ID[3]};
    private static final String[] UNITS = {"Units", "Units1", "", "mg/dL"};
    @SuppressWarnings("unused")
    private static final String[] URINESCREEN = {"Negative", "Positive", "Negative", "Positive"};
    private static final String[] VUID = {"Vuid", "Vuid1", "urn:vuid:4665449", "urn:vuid:"};
    private static final String[][] CODING_CODE = {{"Code"},
                                                   {"Code1"},
                                                   {"Code2A", "Code2B"},
                                                   {"Code3A"} };
    private static final String[][] CODING_SYSTEM = {{"System"},
                                                     {"System1"},
                                                     {"System2A", "System2B"},
                                                     {"System3A"} };
    private static final String[][] CODING_DISPLAY = {{"Display"},
                                                      {"Display1"},
                                                      {"Display2A", "Display2B"},
                                                      {"Display3A"} };

    private LabResultsGenerator() { }

    /**
     * Create an instance of the VPR lab results that we can use to do the various transforms from.
     * @return A sample lab results object to use for transformation purposes.
     */
    protected static VPRLabsRpcOutput createSampleVprLabsRpcOutput() {
        VPRLabsRpcOutput labsRpcOutput = new VPRLabsRpcOutput();
        labsRpcOutput.setApiVersion(API_VERSION);
        labsRpcOutput.setData(new VPRLabsRpcOutput.LabData());
        labsRpcOutput.getData().setUpdated(UPDATED);
        return labsRpcOutput;
    }


    /**
     * Verifies that we are checking lab results for valid instances that we create.  (This is just a check all.)
     *
     * @param iIndex The index of the lab results.
     * @return True if it is one that we have created.
     */
    private static boolean indexInBounds(int iIndex) {
        return ((iIndex >= 0) && (iIndex < NUMBER_OF_TEST_ENTRIES));
    }

    /**
     * Create the set of codes to be included.
     * @param iIndex The index stating the version of the allergy to create.
     *
     * @return The set of codes to be added.
     */
    private static List<TerminologyCode> createCodes(int iIndex) {
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
     * Create a VPR lab result object.
     *
     * @param iIndex The index stating the version of the lab to create.
     * @return The lab that was created.
     */
    private static LabResult createLabResult(int iIndex) {
        LabResult labResult = new LabResult();

        if (indexInBounds(iIndex)) {
            labResult.setSourceVistaSite(SOURCE_VISTA_SITE[iIndex]);
            labResult.setBactRemarks(BACT_REMARKS[iIndex]);
            labResult.setCategoryCode(CATEGORY_CODE[iIndex]);
            labResult.setCategoryName(CATEGORY_NAME[iIndex]);
            labResult.setComment(COMMENT[iIndex]);
            labResult.setDisplayName(DISPLAY_NAME[iIndex]);
            labResult.setDisplayOrder(DISPLAY_ORDER[iIndex]);
            labResult.setFacilityCode(FACILITY_CODE[iIndex]);
            labResult.setFacilityName(FACILITY_NAME[iIndex]);
            labResult.addGramStain(getGramStain(iIndex));
            labResult.setGroupName(GROUP_NAME[iIndex]);
            labResult.setGroupUid(GROUP_UID[iIndex]);
            labResult.setHigh(HIGH[iIndex]);
            labResult.setInterpretationCode(INTERPRETATION_CODE[iIndex]);
            labResult.setInterpretationName(INTERPRETATION_NAME[iIndex]);
            labResult.setLabOrderId(LAB_ORDER_ID[iIndex]);
            labResult.setLocalId(LOCAL_ID[iIndex]);
            labResult.setLow(LOW[iIndex]);
            labResult.setObserved(OBSERVED[iIndex]);
            labResult.setOrderUid(ORDERUID[iIndex]);
            labResult.addOrganism(new Organism(ORGANISM_NAME[iIndex], ORGANISM_QTY[iIndex], addDrugs()));
            labResult.setOrganismQty(ORGANISM_QTY[iIndex]);
            labResult.setOrganizerType(ORGANIZER_TYPE[iIndex]);
            labResult.setResult(RESULT[iIndex]);
            labResult.setResulted(RESULTED[iIndex]);
            labResult.addResults(new Results(RESULTS_LOCAL_TITLE[iIndex], RESULTS_NATIONAL_TITLE[iIndex], RESULTS_RESULT_UID[iIndex], RESULTS_UID[iIndex]));
            labResult.setSample(SAMPLE[iIndex]);
            labResult.setSpecimen(SPECIMEN[iIndex]);
            labResult.setStatusCode(STATUS_CODE[iIndex]);
            labResult.setStatusName(STATUS_NAME[iIndex]);
            labResult.setSummary(SUMMARY[iIndex]);
            labResult.setTypeCode(TYPE_CODE[iIndex]);
            labResult.setTypeId(TYPE_ID[iIndex]);
            labResult.setTypeName(TYPE_NAME[iIndex]);
            labResult.setUid(UID[iIndex]);
            labResult.setUnits(UNITS[iIndex]);
            labResult.setVuid(VUID[iIndex]);
            labResult.setCodesList(createCodes(iIndex));
        } else {
            fail("index was " + iIndex + ". Maximum value is " + (NUMBER_OF_TEST_ENTRIES - 1));
        }
        return labResult;
    }

    private static GramStain getGramStain(int iIndex) {
        GramStain gramStain = new GramStain(GRAM_STAIN_RESULT[iIndex]);
        return gramStain;
    }

    /**
     * This adds an lab result array for the specified index to the array list.  The index tells it which instance to add.
     *
     * @param iIndex The version of the lab result to be added.
     * @param labsRpcOutput The object where the labs result should be added.
     */
    protected static void addToLabResultsArray(int iIndex, VPRLabsRpcOutput labsRpcOutput) {
        LabResult labResult = createLabResult(iIndex);
        if (labResult != null) {
            labsRpcOutput.getData().addItems(labResult);
        }
    }

    private static List<Drugs> addDrugs() {
        List<Drugs> drugList = new ArrayList<Drugs>();
        for (int i = 0; i < ORGANISM_DRUGS_INTERP.length; i++) {
            Drugs drugs =  new Drugs(ORGANISM_DRUGS_INTERP[i], ORGANISM_DRUGS_NAME[i], ORGANISM_DRUGS_RESULT[i], ORGANISM_DRUGS_RESTRICT[i]);
            drugList.add(drugs);
        }
        return drugList;
    }

    public static Collection<Object[]> create() {
        List<Object[]> data = new ArrayList<Object[]>();
        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            data.add(new Object[]{createLabResult(i), DFN[i]});
        }
        return data;
    }
}
