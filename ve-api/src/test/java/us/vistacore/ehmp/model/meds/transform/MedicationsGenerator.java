package us.vistacore.ehmp.model.meds.transform;

/**
 * This class represents the generator of dummy data for med
 * @author josephg
 */
import static org.junit.Assert.fail;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.Fills;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.MedicationData;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.meds.Products;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class MedicationsGenerator {

    private static final String API_VERSION = "1.02";
    private static final String UPDATED = "false";
    private static final int NUMBER_OF_TEST_ENTRIES = 4;
    private static final String[] UID = {"urn:va:med:B362:274:8191", "urn:va:med:B362:737:10764", "urn:va:med:B362:737:9711", "urn:va:med:B362:737:9534"};
    private static final String[] SUMMARY = {"ASCORBIC ACID 250MG TAB (UNRELEASED)\n TAKE 1 TWICE A DAY", "HEPARIN INJ,SOLN INJ,SOLN (PENDING)\n Give: ", "CIMETIDINE TAB TAB (PENDING)\n Give: ", "ACETAMINOPHEN TAB TAB (PENDING)\n Give: "};
    private static final String[] PID = {"B362;274", "B362;737", "B362;737", "B362;737"};
    private static final String[] FACILITY_CODE = {"500", "998", "998", "998"};
    private static final String[] FACILITY_NAME = {"CAMP MASTER", "ABILENE (CAA)", "ABILENE (CAA)", "ABILENE (CAA)"};
    private static final String[] LOCAL_ID = {"401570;O", "1299P;I", "1064P;I", "1029P;I"};
    private static final String[] PRODUCT_FORM_NAME = {"TAB", "INJ,SOLN", "TAB", "TAB"};
    private static final String[] SIG = {"TAKE 1 TWICE A DAY", "Give", "Give", "Give"};
    private static final String[] PATIENT_INSTRUCTION = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] OVERALL_START = {"19980910", "199910211500", "199904010833", "199903021120"};
    private static final String[] OVERALL_STOP = {"19990911", "199910211500", "199904010833", "199903021120"};
    private static final String[] STOPPED = {"19990911", "20000318", "20000308", "20000318"};
    private static final String[] MED_STATUS = {"urn:sct:73425007", "urn:sct:73425007", "urn:sct:73425007", "urn:sct:73425007"};
    private static final String[] MED_STATUS_NAME = {"not active", "not active", "not active", "not active"};
    private static final String[] MEDTYPE = {"urn:sct:73639000", "urn:sct:105903003", "urn:sct:105903003", "urn:sct:105903003"};
    private static final String[] VATYPE = {"O", "I", "V", "N"};
    private static final String[] VASTATUS = {"UNRELEASED", "PENDING", "PENDING", "PENDING"};
    private static final String[] SUPPLY = {"true", "false", "false", "false"};
    private static final String[] PRODUCTS_SUMMARY = {"MedicationProduct{uid='null'}", "MedicationProduct{uid='null'}", "MedicationProduct{uid='null'}", "MedicationProduct{uid='null'}"};
    private static final String[] PRODUCTS_INGREDIENT_CODE = {"urn:va:vuid:4017536", "urn:va:vuid:4018538", "urn:va:vuid:4018845", "urn:va:vuid:4017513"};
    private static final String[] PRODUCTS_INGREDIENT_CODE_NAME = {"ASCORBIC ACID", "HEPARIN", "CIMETIDINE", "ACETAMINOPHEN"};
    private static final String[] PRODUCTS_INGREDIENT_NAME = {"ASCORBIC ACID TAB", "HEPARIN INJ,SOLN", "CIMETIDINE TAB", "ACETAMINOPHEN TAB"};
    private static final String[] PRODUCTS_DRUG_CLASS_CODE = {"urn:vadc:VT400", "urn:vadc:BL110", "urn:vadc:GA301", "urn:vadc:CN103"};
    private static final String[] PRODUCTS_DRUG_CLASS_NAME = {"VITAMIN C", "ANTICOAGULANTS", "HISTAMINE ANTAGONISTS", "NON-OPIOID ANALGESICS"};
    private static final String[] PRODUCTS_SUPPLIED_CODE = {"urn:va:vuid:4005767", "urn:va:vuid:4001353", "urn:va:vuid:4006818", "urn:va:vuid:4007158"};
    private static final String[] PRODUCTS_SUPPLIED_NAME = {"ASPIRIN 325MG BUFFERED TAB", "HEPARIN NA 10000UNT/ML INJ", "CIMETIDINE 200MG TAB", "ACETAMINOPHEN 325MG TAB"};
    private static final String[] PRODUCTS_INGREDIENT_ROLE = {"urn:sct:410942007", "urn:sct:410942007", "urn:sct:410942007", "urn:sct:410942007"};
    private static final String[] PRODUCTS_STRENGTH = {"250 MG", "10000 UNIT/ML", "200 MG", "325 MG"};
    private static final String[] PRODUCTS_INGREDIENT_RXN_CODE = {"urn:rxnorm:1151", "urn:rxnorm:5224", "urn:rxnorm:2541", "urn:rxnorm:161"};
    private static final String[] DOSAGES_SUMMARY = {"MedicationDose{uid='null'}", "MedicationDose{uid='null'}", "MedicationDose{uid='null'}", "MedicationDose{uid='null'}"};
    private static final String[] DOSAGES_DOSE = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_UNITS = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_ROUTE_NAME = {"PO", "IM", "TID", "PO"};
    private static final String[] DOSAGES_SCHEDULE_NAME = {"Q24HR", "ONCE", "3ID", "Q4H"};
    private static final String[] DOSAGES_SCHEDULE_TYPE = {"CONTINUOUS", "ONE-TIME", "CONTINUOUS", "CONTINUOUS"};
    private static final String[] DOSAGES_START = {"199904291300", "199904291402", "199901291300", "199808260900"};
    private static final String[] DOSAGES_STOP = {"199905140000", "199905061500", "199902130000", "199809100000"};
    private static final String[] DOSAGES_RELATIVE_START = {"0", "0", "0", "0"};
    private static final String[] DOSAGES_RELATIVE_STOP = {"0", "0", "0", "0"};
    private static final String[] DOSAGES_SCHEDULE_FREQ = {"40320", "20820", "240", "40320"};
    private static final String[] DOSAGES_START_DATE_STRING = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_STOP_DATE_STRING = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_COMPLEX_DURATION = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_DOSE_VAL = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] DOSAGES_IV_RATE = {"", "", "", ""};
    private static final String[] DOSAGES_ADMIN_TIMES = {"", "", "", ""};
    private static final String[] DOSAGES_DURATION = {"", "", "", ""};
    private static final String[] DOSAGES_RELATED_ORDER = {"", "", "", ""};
    private static final String[] DOSAGES_COMPLEX_CONJUNCTION = {"", "", "", ""};
    private static final String[] ORDERS_SUMMARY = {"MedicationOrder{uid='null'}", "MedicationOrder{uid='null'}", "MedicationOrder{uid='null'}", "MedicationOrder{uid='null'}"};
    private static final String[] ORDERS_ORDER_UID = {"urn:va:order:B362:737:10763", "urn:va:order:B362:737:10764", "urn:va:order:B362:737:9711", "urn:va:order:B362:737:9534"};
    private static final String[] ORDERS_PRESCRIPTION_ID = {"800003", "100001593", "100001550", "800003"};
    private static final String[] ORDERS_ORDERED = {"199910211500", "199910211500", "199904010833", "199903021120"};
    private static final String[] ORDERS_PROVIDER_UID = {"urn:va:user:B362:10958", "urn:va:user:B362:10958", "urn:va:user:B362:10958", "urn:va:user:B362:10958"};
    private static final String[] ORDERS_PROVIDER_NAME = {"WARDCLERK,FIFTYTHREE", "WARDCLERK,FIFTYTHREE", "WARDCLERK,FIFTYTHREE", "WARDCLERK,FIFTYTHREE"};
    private static final String[] ORDERS_PHARMACIST_UID = {"urn:va:user:B362:11733", "urn:va:user:B362:11733", "urn:va:user:B362:11733", "urn:va:user:B362:11733"};
    private static final String[] ORDERS_PHARMACIST_NAME = {"RADTECH,SEVENTEEN", "PROGRAMMER,TWENTYEIGHT", "PROGRAMMER,TWENTYEIGHT", "PROGRAMMER,TWENTYEIGHT"};
    private static final String[] ORDERS_FILL_COST = {"0.3", "13.52", "3.15", "13.52"};
    private static final String[] ORDERS_LOCATION_NAME = {"MIKE'S IP WARD", "MIKE'S IP WARD", "MIKE'S IP WARD", "MIKE'S IP WARD"};
    private static final String[] ORDERS_LOCATION_UID = {"urn:va:location:B362:117", "urn:va:location:B362:117", "urn:va:location:B362:117", "urn:va:location:B362:117"};
    private static final String[] ORDERS_QUANTITY_ORDERED = {"60", "40", "90", "40"};
    private static final String[] ORDERS_DAYS_SUPPLY = {"31", "10", "30", "10"};
    private static final String[] ORDERS_FILLS_ALLOWED = {"5", "5", "5", "5"};
    private static final String[] ORDERS_FILLS_REMAINING = {"5", "5", "5", "5"};
    private static final String[] ORDERS_VA_ROUTING = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] ORDERS_SUCCESSOR = {"urn:va:med:B362:274:9798", "urn:va:med:B362:274:9798", "urn:va:med:B362:274:9798", "urn:va:med:B362:274:9798"};
    private static final String[] ORDERS_PREDECESSOR = {"urn:va:med:B362:274:9789", "urn:va:med:B362:274:9789", "urn:va:med:B362:274:9789", "urn:va:med:B362:274:9789"};
    private static final String[] FILLS_SUMMARY = {"MedicationFill{uid='null'}", "MedicationFill{uid='null'}", "MedicationFill{uid='null'}", "MedicationFill{uid='null'}"};
    private static final String[] FILLS_DISPENSE_DATE = {"19980910", "19980910", "19971209", "19980910"};
    private static final String[] FILLS_RELEASE_DATE = {"19980910", "19980910", "19971209", "19980910"};
    private static final String[] FILLS_QUANTITY_DISPENSED = {"60", "40", "90", "60"};
    private static final String[] FILLS_DAYS_SUPPLY_DISPENSED = {"31", "10", "30", "31"};
    private static final String[] FILLS_ROUTING = {"W", "W", "W", "W"};
    private static final String[] FILLS_PARTIAL = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] LAST_FILLED = {"19980910", "19980910", "19971209", "19980910"};
    private static final String[] QUALIFIED_NAME = {"ASPIRIN CAP,ORAL", "HEPARIN INJ,SOLN", "CIMETIDINE TAB", "ACETAMINOPHEN TAB"};
    @SuppressWarnings("unused") private static final String[] ADMINISTRATIONS = {"N/A", "N/A", "N/A", "N/A"};
    @SuppressWarnings("unused") private static final String[] RXN_CODES = {"urn:vandf:4017536", "urn:ndfrt:N0000000002", "urn:ndfrt:N0000007676", "urn:ndfrt:N0000185640"};
    private static final String[] UNITS = {"N/A", "N/A", "N/A", "N/A"};
    private static final String[] KIND = {"Medication, Inpatient", "Medication, Inpatient", "Medication, Inpatient", "Medication, Inpatient"};
    private static final String[] IMO = {"false", "false", "true", "false"};
    private static final String[] NAME = {"ASPIRIN CAP,ORAL", "HEPARIN INJ,SOLN", "CIMETIDINE TAB", "ACETAMINOPHEN TAB"};
    private static final String[] TYPE = {"Prescription", "Prescription", "Prescription", "Prescription"};
    public static final String[][] CODING_CODE = {{"Code"}, {"Code1"}, {"Code2A", "Code2B"}, {"Code3A"}};
    public static final String[][] CODING_SYSTEM = {{"System"}, {"System1"}, {"System2A", "System2B"}, {"System3A"}};
    public static final String[][] CODING_DISPLAY = {{"Display"}, {"Display1"}, {"Display2A", "Display2B"}, {"Display3A"}};
    private static final String[] DFN = {"22", "222", "2222", "22222" };

    private MedicationsGenerator() {
    }

    protected static VPRMedicationsRpcOutput createSampleVprMedicationsRpcOutput() {
        final VPRMedicationsRpcOutput medicationsRpcOutput = new VPRMedicationsRpcOutput();
        medicationsRpcOutput.setApiVersion(API_VERSION);
        medicationsRpcOutput.setData(new MedicationData());
        medicationsRpcOutput.getData().setUpdated(UPDATED);
        return medicationsRpcOutput;
    }

    private static boolean indexInBounds(final int iIndex) {
        return ((iIndex >= 0) && (iIndex < NUMBER_OF_TEST_ENTRIES));
    }

    /**
     * Create the set of codes to be included.
     *
     * @param iIndex The index stating the version of the allergy to create.
     *
     * @return The set of codes to be added.
     */
    private static List<TerminologyCode> createCodes(final int iIndex) {
        List<TerminologyCode> oaCodes = new ArrayList<TerminologyCode>();
        if (indexInBounds(iIndex)) {
            for (int i = 0; i < CODING_CODE[iIndex].length; i++) {
                final TerminologyCode oCode = new TerminologyCode();
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

    private static MedResult createMedicationResult(final int iIndex) {
        final MedResult medicationResult = new MedResult();
        if (indexInBounds(iIndex)) {
            medicationResult.setUid(UID[iIndex]);
            medicationResult.setSummary(SUMMARY[iIndex]);
            medicationResult.setPid(PID[iIndex]);
            medicationResult.setFacilityCode(FACILITY_CODE[iIndex]);
            medicationResult.setFacilityName(FACILITY_NAME[iIndex]);
            medicationResult.setLocalId(LOCAL_ID[iIndex]);
            medicationResult.setProductFormName(PRODUCT_FORM_NAME[iIndex]);
            medicationResult.setSig(SIG[iIndex]);
            medicationResult.setPatientInstruction(PATIENT_INSTRUCTION[iIndex]);
            medicationResult.setOverallStart(OVERALL_START[iIndex]);
            medicationResult.setOverallStop(OVERALL_STOP[iIndex]);
            medicationResult.setStopped(STOPPED[iIndex]);
            medicationResult.setMedStatus(MED_STATUS[iIndex]);
            medicationResult.setMedStatusName(MED_STATUS_NAME[iIndex]);
            medicationResult.setMedType(MEDTYPE[iIndex]);
            medicationResult.setVaType(VATYPE[iIndex]);
            medicationResult.setVaStatus(VASTATUS[iIndex]);
            medicationResult.setSupply(SUPPLY[iIndex]);
            medicationResult.addProducts(new Products(PRODUCTS_SUMMARY[iIndex], PRODUCTS_INGREDIENT_CODE[iIndex], PRODUCTS_INGREDIENT_CODE_NAME[iIndex], PRODUCTS_INGREDIENT_NAME[iIndex], PRODUCTS_DRUG_CLASS_CODE[iIndex], PRODUCTS_DRUG_CLASS_NAME[iIndex], PRODUCTS_SUPPLIED_CODE[iIndex], PRODUCTS_SUPPLIED_NAME[iIndex], PRODUCTS_INGREDIENT_ROLE[iIndex], PRODUCTS_STRENGTH[iIndex], PRODUCTS_INGREDIENT_RXN_CODE[iIndex]));
            medicationResult.addDosages(new Dosages(DOSAGES_SUMMARY[iIndex], DOSAGES_DOSE[iIndex], DOSAGES_UNITS[iIndex], DOSAGES_ROUTE_NAME[iIndex], DOSAGES_SCHEDULE_NAME[iIndex], DOSAGES_SCHEDULE_TYPE[iIndex], DOSAGES_START[iIndex], DOSAGES_STOP[iIndex], DOSAGES_RELATIVE_START[iIndex], DOSAGES_RELATIVE_STOP[iIndex], DOSAGES_SCHEDULE_FREQ[iIndex], DOSAGES_START_DATE_STRING[iIndex], DOSAGES_STOP_DATE_STRING[iIndex], DOSAGES_COMPLEX_DURATION[iIndex], DOSAGES_DOSE_VAL[iIndex], DOSAGES_IV_RATE[iIndex], DOSAGES_ADMIN_TIMES[iIndex], DOSAGES_DURATION[iIndex], DOSAGES_RELATED_ORDER[iIndex], DOSAGES_COMPLEX_CONJUNCTION[iIndex]));
            medicationResult.addOrders(new Orders(ORDERS_SUMMARY[iIndex], ORDERS_ORDER_UID[iIndex], ORDERS_PRESCRIPTION_ID[iIndex], ORDERS_ORDERED[iIndex], ORDERS_PROVIDER_UID[iIndex], ORDERS_PROVIDER_NAME[iIndex], ORDERS_PHARMACIST_UID[iIndex], ORDERS_PHARMACIST_NAME[iIndex], ORDERS_FILL_COST[iIndex], ORDERS_LOCATION_NAME[iIndex], ORDERS_LOCATION_UID[iIndex], ORDERS_QUANTITY_ORDERED[iIndex], ORDERS_DAYS_SUPPLY[iIndex], ORDERS_FILLS_ALLOWED[iIndex], ORDERS_FILLS_REMAINING[iIndex], ORDERS_VA_ROUTING[iIndex], ORDERS_SUCCESSOR[iIndex], ORDERS_PREDECESSOR[iIndex]));
            medicationResult.addFills(new Fills(FILLS_SUMMARY[iIndex], FILLS_DISPENSE_DATE[iIndex], FILLS_RELEASE_DATE[iIndex], FILLS_QUANTITY_DISPENSED[iIndex], FILLS_DAYS_SUPPLY_DISPENSED[iIndex], FILLS_ROUTING[iIndex], FILLS_PARTIAL[iIndex]));
            medicationResult.setLastFilled(LAST_FILLED[iIndex]);
            medicationResult.setQualifiedName(QUALIFIED_NAME[iIndex]);
            medicationResult.setUnits(UNITS[iIndex]);
            medicationResult.setKind(KIND[iIndex]);
            medicationResult.setImo(IMO[iIndex]);
            medicationResult.setName(NAME[iIndex]);
            medicationResult.setType(TYPE[iIndex]);
            medicationResult.setCodesList(createCodes(iIndex));
        } else {
            fail("index was " + iIndex + ". Maximum value is " + (NUMBER_OF_TEST_ENTRIES - 1));
        }
        return medicationResult;
    }

    /**
     * This adds an medication result array for the specified index to the array list. The index tells it which instance to add.
     *
     * @param iIndex The version of the medication result to be added.
     * @param labsRpcOutput The object where the labs result should be added.
     */
    protected static void addToMedicationResultsArray(final int iIndex, final VPRMedicationsRpcOutput medicationsRpcOutput) {
        final MedResult medicationResult = createMedicationResult(iIndex);
        if (medicationResult != null) {
            medicationsRpcOutput.getData().addItems(medicationResult);
        }
    }

    public static Collection<Object[]> create() {
        final List<Object[]> data = new ArrayList<Object[]>();
        for (int i = 0; i < NUMBER_OF_TEST_ENTRIES; i++) {
            data.add(new Object[] {createMedicationResult(i), DFN[i]});
        }
        return data;
    }
}
