package us.vistacore.ehmp.model.allergies.transform;

import com.google.common.collect.Lists;
import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AdverseReaction.AdverseReactionExposureComponent;
import org.hl7.fhir.instance.model.AdverseReaction.AdverseReactionSymptomComponent;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Identifier.IdentifierUse;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Substance;
import org.junit.Before;
import org.junit.Test;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.allergies.AllergiesResult;
import us.vistacore.ehmp.model.allergies.Product;
import us.vistacore.ehmp.model.allergies.Reaction;
import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput;
import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput.AllergiesData;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;
import us.vistacore.ehmp.util.VprExtractionUtils;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

/**
 * This class tests the AllergiesVistaToFhir class.
 *
 * @author Les.Westberg
 *
 */
public class AllergiesVistaToFhirTest {
    private static final String API_VERSION = "1.0";
    private static final String UPDATED = "false";
    private static final int NUMBER_OF_TEST_ENTRIES = 4; // Should equal the number of items in each of the arrays below
    private static final String[] SOURCE_VISTA_SITE = {"SourceVistaSite", "SourceVistaSite1", "SourceVistaSite2", "SourceVistaSite3"};
    private static final String[] ENTERED = {"19920627", "19920628", "19920629090000", "19920630"};
    private static final String[] ENTERED_FHIR = {"1992-06-27", "1992-06-28", "1992-06-29T09:00:00", "1992-06-30"};
    private static final String[] FACILITY_CODE = {"FacilityCode", "FacilityCode1", "FacilityCode2", "FacilityCode3"};
    private static final String[] FACILITY_NAME = {"FacilityName", "FacilityName1", "FacilityName2", "FacilityName3"};
    private static final boolean[] HISTORICAL = {true, true, false, true};
    private static final String[] KIND = {"Kind1", "Kind1", "Kind2", "Kind3"};
    private static final String[] LOCAL_ID = {"LocalId", "LocalId1", "LocalId2", "LocalId3"};
    private static final String[] REFERENCE = {"Reference", "Reference1", "Reference2", "Reference3"};
    private static final String[] SUMMARY = {"Summary", "Summary1", "Summary2", "Summary3"};
    private static final String[] DFN = {"22", "222", "2222", "22222" };
    private static final String[] UID = {"urn:va:art:B362:" + DFN[0] + ":33",
                                         "urn:va:art:B362:" + DFN[1] + ":333",
                                         "urn:va:art:B362:" + DFN[2] + ":3333",
                                         "urn:va:art:B362:" + DFN[3] + ":33333"};
    private static final String[] VERIFIED = {"20100805120008", "20100805120008", "20100805130008", "20100805140008"};
    private static final String[] ORIGINATOR_NAME = {"ONE,PRACTITIONER", "TWO,PRACTITIONER", "THREE,PRACTITIONER", "FOUR,PRACTITIONER"};
    private static final String[] ORIGINATION_DATETIME = {"20100806120008", "20100806120008", "20100806130008", "20100806140008"};
    private static final String[] ALLERGY_TYPE = {"DRUG", "DRUG", "FOOD", "OTHER"};
    private static final String[] MECHANISM = {"Nature", "Nature1", "Nature2", "Nature3"};
    private static final String[] REACTION_DATETIME = {"20100807120008", "20100807120008", "20100807130008", "20100807140008"};
    private static final String[] SEVERITY = {"MILD", "MILD", "MODERATE", "SEVERE"};
    @SuppressWarnings("unused")
    private static final String[] COMMENTS = {"Comment", "Comment1", "Comment2", "Comment3" };
    private static final String[][] PRODUCT_NAME = {{"Product"},
                                                    {"Product1"},
                                                    {"Product2A"},
                                                    {"Product3A"} };
    private static final String[][] PRODUCT_VUID = {{"urn:va:vuid:ProductVuid"},
                                                    {"urn:va:vuid:ProductVuid1"},
                                                    {"urn:va:vuid:ProductVuid2A"},
                                                    {"urn:va:vuid:ProductVuid3A"} };
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
    private static final String[][] REACTION_NAME = {{"Reaction"},
                                                     {"Reaction1"},
                                                     {"Reaction2A", "Reaction2B"},
                                                     {"Reaction3A"} };
    private static final String[][] REACTION_VUID = {{"urn:va:vuid:ReactionVuid"},
                                                     {"urn:va:vuid:ReactionVuid1"},
                                                     {"urn:va:vuid:ReactionVuid2A", "urn:va:vuid:"},
                                                     {"urn:va:vuid:ReactionVuid3A"} };
    private static final String[][] REACTION_REFERENCE = {{"ReactionRef"},
                                                          {"ReactionRef1"},
                                                          {"ReactionRef2A", "ReactionRef2B"},
                                                          {"ReactionRef3A"} };

    private AllergiesVistaToFhir testSubject = null;

    /**
     * This method is run before each test is run to set up state.
     *
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new AllergiesVistaToFhir();
    }

    /**
     * Create an instance of the VPR allergies that we can use to do the various transforms from.
     *
     * @return A sample allergies object to use for transformation purposes.
     */
    private VPRAllergiesRpcOutput createSampleVprAllergiesRpcOutput() {
        VPRAllergiesRpcOutput oAllergiesOutput = new VPRAllergiesRpcOutput();

        oAllergiesOutput.setApiVersion(API_VERSION);
        oAllergiesOutput.setData(new AllergiesData());
        oAllergiesOutput.getData().setUpdated(UPDATED);

        return oAllergiesOutput;
    }

    /**
     * Verifies that we are checking allergies for valid instances that we create.  (This is just a check all.)
     *
     * @param iIndex The index of the allergies results.
     * @return True if it is one that we have created.
     */
    private boolean indexInBounds(int iIndex) {
        return ((iIndex >= 0) && (iIndex < NUMBER_OF_TEST_ENTRIES));
    }

    /**
     * Create the array of products for the Allergy result associated with that index value.
     *
     * @param iIndex The index stating the version of the allergy to create.
     * @return The products for that allergy.
     */
    private List<Product> createProducts(int iIndex) {
        List<Product> oaProduct = new ArrayList<Product>();

        if (indexInBounds(iIndex)) {
            for (int i = 0; i < PRODUCT_NAME[iIndex].length; i++) {
                Product oProduct = new Product();
                oProduct.setProductsName(PRODUCT_NAME[iIndex][i]);
                oProduct.setProductsVuid(PRODUCT_VUID[iIndex][i]);
                oaProduct.add(oProduct);
            }
        } else {
            oaProduct = null;
        }

        return oaProduct;
    }

    /**
     * Create the array of Reactions for the Allergy result associated with that index value.
     *
     * @param iIndex The index stating the version of the allergy to create.
     * @return The Reactions for that allergy.
     */
    private List<Reaction> createReactions(int iIndex) {
        List<Reaction> oaReaction = new ArrayList<Reaction>();

        if (indexInBounds(iIndex)) {
            for (int i = 0; i < REACTION_NAME[iIndex].length; i++) {
                Reaction oReaction = new Reaction();
                oReaction.setReactionsName(REACTION_NAME[iIndex][i]);
                oReaction.setReactionsVuid(REACTION_VUID[iIndex][i]);
                oReaction.setReference(REACTION_REFERENCE[iIndex][i]);
                oaReaction.add(oReaction);
            }
        } else {
            oaReaction = null;
        }

        return oaReaction;
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
     * Create a allergy result object.
     *
     * @param iIndex The index stating the version of the allergy to create.
     * @return The allergy that was created.
     */
    private AllergiesResult createAllergy(int iIndex) {
        AllergiesResult oAllergy = new AllergiesResult();

        if (indexInBounds(iIndex)) {
            oAllergy.setSourceVistaSite(SOURCE_VISTA_SITE[iIndex]);
            oAllergy.setEntered(ENTERED[iIndex]);
            oAllergy.setFacilityCode(FACILITY_CODE[iIndex]);
            oAllergy.setFacilityName(FACILITY_NAME[iIndex]);
            oAllergy.setHistorical(HISTORICAL[iIndex]);
            oAllergy.setKind(KIND[iIndex]);
            oAllergy.setLocalId(LOCAL_ID[iIndex]);
            oAllergy.setProductsList(createProducts(iIndex));
            oAllergy.setCodesList(createCodes(iIndex));
            oAllergy.setReactionsList(createReactions(iIndex));
            oAllergy.setReference(REFERENCE[iIndex]);
            oAllergy.setSummary(SUMMARY[iIndex]);
            oAllergy.setUid(UID[iIndex]);
            oAllergy.setVerified(VERIFIED[iIndex]);
            oAllergy.setOriginatorName(ORIGINATOR_NAME[iIndex]);
            oAllergy.setOriginationDatetime(ORIGINATION_DATETIME[iIndex]);
            oAllergy.setAllergyType(ALLERGY_TYPE[iIndex]);
            oAllergy.setMechanism(MECHANISM[iIndex]);
            oAllergy.setObservations(Lists.newArrayList(new AllergiesResult.AllergyObservation(REACTION_DATETIME[iIndex], SEVERITY[iIndex])));
        } else {
            oAllergy = null;
        }

        return oAllergy;
    }

    /**
     * This adds an allergy result array for the specified index to the array list.  The index tells it which instance to add.
     *
     * @param iIndex The version of the allergy result to be added.
     * @param oAllergiesOutput The object where the allergy result should be added.
     */
    private void addToAllergiesArray(int iIndex, VPRAllergiesRpcOutput oAllergiesOutput) {
        AllergiesResult oAllergy = createAllergy(iIndex);
        if (oAllergy != null) {
            oAllergiesOutput.getData().addItems(oAllergy);
        }
    }

    /**
     * Verify that the text was transformed correctly.
     *
     * @param iIndex The index of the allergy result to compare to.
     * @param oFhirAllergy The observation being verified.
     */
    private void verifyTransformText(int iIndex, AdverseReaction oFhirAllergy) {
        assertNotNull("The text node should not have been null.", oFhirAllergy.getText());
        assertEquals("The narrative status was incorrect.", NarrativeStatus.generated, oFhirAllergy.getText().getStatusSimple());
        assertNotNull("The div node in the Text shofuld not have been null.", oFhirAllergy.getText().getDiv());
        assertEquals("The summary was incorrect.", SUMMARY[iIndex], oFhirAllergy.getText().getDiv().allText());
    }

    /**
     * Verify that the identifier was transformed correctly.
     *
     * @param iIndex The index of the allergy result to compare to.
     * @param oFhirAllergy The observation being verified.
     */
    private void verifyTransformIdentifier(int iIndex, AdverseReaction oFhirAllergy) {
        assertTrue("The identifier node should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getIdentifier()));
        assertEquals("There should have been one identifier in the list.", 1, oFhirAllergy.getIdentifier().size());
        Identifier oIdentifier = oFhirAllergy.getIdentifier().get(0);
        assertEquals("Identifier.use was incorrect.", IdentifierUse.official, oIdentifier.getUseSimple());
        assertEquals("Identifier.system was incorrect.", AllergiesVistaToFhir.ALLERGY_IDENTIFIER_SYSTEM, oIdentifier.getSystemSimple());
        assertEquals("Identifier.value was incorrect.", UID[iIndex], oIdentifier.getValueSimple());
    }

    /**
     * This method verifies the contents of the transformed allergy subject.
     *
     * @param iIndex The index of the allergy that is being verified.
     * @param oFhirAllergy The transformed allergy that is being verified.
     */
    private void verifyTransformSubject(int iIndex, AdverseReaction oFhirAllergy) {
        assertNotNull("The subject should not have been null.", oFhirAllergy.getSubject());
        assertEquals("The subject was not correct.", VprExtractionUtils.PATIENT_REFERENCE_PREFIX + DFN[iIndex], oFhirAllergy.getSubject().getReferenceSimple());
    }

    /**
     * This method verifies the contents of the transformed allergy DidNotOccurFlag.
     *
     * @param i The index of the allergy that is being verified.
     * @param oFhirAllergy The transformed allergy that is being verified.
     */
    private void verifyTransformDidNotOccurFlag(int i, AdverseReaction oFhirAllergy) {
        // Currently this is always set to false.
        assertFalse("DidNotOccurFlag should be false.", oFhirAllergy.getDidNotOccurFlagSimple());
    }

    /**
     * This verifies that the coding array contains the given code in one of its elements.
     *
     * @param oaCoding The coding array
     * @param sCode The code that should exist in the array.
     * @param sSystem The system associated with that code.
     * @param sDisplay The display associated with that code.
     */
    private void verifyContainsCode(List<Coding> oaCoding, String sCode, String sSystem, String sDisplay) {
        boolean bFound = false;
        for (Coding oCoding : oaCoding) {
            if ((oCoding != null)
                    && (NullChecker.isNotNullish(oCoding.getCodeSimple()))
                    && (oCoding.getCodeSimple().equals(sCode))) {
                assertEquals("The coding code was incorrect.", sCode, oCoding.getCodeSimple());
                assertEquals("The coding system was incorrect.", sSystem, oCoding.getSystemSimple());
                assertEquals("The coding display was incorrect.", sDisplay, oCoding.getDisplaySimple());
                bFound = true;
                break;
            }
        }

        assertTrue("The coding item was not found.", bFound);

    }

    /**
     * This method verifies that a single instance of a summary is correctly instantiated.
     *
     * @param iIndex The index of the allergy to be verified.
     * @param oSubstance The substance information being verified.
     * @param sProductUrnVuid The VUID of the product.
     * @param sProductName The name of the product.
     * @param sSummary The summary information.
     * @param codingDisplay The code display list for this substance
     * @param codingSystem The code system list for this substance
     * @param codingCode The code list for this substance
     * @param bContainedSummary TRUE if the substance should have contained the summary information.
     */
    private void verifySingleSubstance(int iIndex, Substance oSubstance, String sProductUrnVuid, String sProductName, String sSummary,
                                       String[][] codingCode, String[][] codingSystem, String[][] codingDisplay, boolean bContainedSummary) {
        assertTrue("The xmlId should not have been nullish.", NullChecker.isNotNullish(oSubstance.getXmlId()));
        assertNotNull("Type should not have been null.", oSubstance.getType());
        assertEquals("Product name was missing from the substance.", sProductName, oSubstance.getType().getTextSimple());

        int iNumCodes = codingCode[iIndex].length;
        String sProductVuid = VprExtractionUtils.extractVuid(sProductUrnVuid);
        if (NullChecker.isNotNullish(sProductVuid)) {
            iNumCodes++;
        }
        if (iNumCodes > 0) {
            assertTrue("The coding object should not have been nullish.", NullChecker.isNotNullish(oSubstance.getType().getCoding()));
            assertEquals("The number of codes in the substance was not correct.", iNumCodes, oSubstance.getType().getCoding().size());
            verifyContainsCode(oSubstance.getType().getCoding(), sProductUrnVuid, AllergiesVistaToFhir.SUBSTANCE_SYSTEM, sProductName);
            for (int i = 0; i < codingCode[iIndex].length; i++) {
                verifyContainsCode(oSubstance.getType().getCoding(), codingCode[iIndex][i], codingSystem[iIndex][i], codingDisplay[iIndex][i]);
            }
        } else {
            assertTrue("The coding object should have been nullish.", NullChecker.isNullish(oSubstance.getType().getCoding()));
        }

        if (bContainedSummary) {
            assertNotNull("The text node should not have been null.", oSubstance.getText());
            assertEquals("Text.status was incorrect.", NarrativeStatus.generated, oSubstance.getText().getStatusSimple());
            assertNotNull("Text.status.div should not have been null.", oSubstance.getText().getDiv());
            assertEquals("Summary information in the substance was incorrect.", sSummary, oSubstance.getText().getDiv().allText());
        }
    }

    /**
     * Verify that the substance information was transformed correctly.
     *
     * @param iIndex The index of the allergy result to compare to.
     * @param oFhirAllergy The observation being verified.
     * @param bContainedSummary TRUE if the source information contained the summary data.
     */
    private void verifyTransformSubstance(int iIndex, AdverseReaction oFhirAllergy, boolean bContainedSummary) {
        assertTrue("The contained node should not have been null.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        int numberOfContainedResources = PRODUCT_NAME[iIndex].length;
        if (oFhirAllergy.getRecorder() != null) {
            numberOfContainedResources++;
        }
        assertEquals("There was an incorrect number of contained items.", numberOfContainedResources, oFhirAllergy.getContained().size());

        String sReferenceId1 = "";
        int iNumExposures = 0;

        if (PRODUCT_NAME[iIndex].length == 1) {
            Substance oSubstance = (Substance) oFhirAllergy.getContained().get(0);
            verifySingleSubstance(iIndex, oSubstance, PRODUCT_VUID[iIndex][0], PRODUCT_NAME[iIndex][0], SUMMARY[iIndex],
                                  CODING_CODE, CODING_SYSTEM, CODING_DISPLAY, bContainedSummary);
            sReferenceId1 = oSubstance.getXmlId();
            iNumExposures = 1;
        } else if (PRODUCT_NAME[iIndex].length == 2) {
            // It turns out that we have found that allergies
            fail("Allergies should not have more than one PRODUCT.");
        }

        // Verify that we got the correct number of exposures.
        //-------------------------------------------------------
        assertTrue("The exposure information should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getExposure()));
        assertEquals("The number of exposures was incorrect.", iNumExposures, oFhirAllergy.getExposure().size());

        if (iNumExposures == 1) {
            assertNotNull("Exposure substance should not have been null.", oFhirAllergy.getExposure().get(0).getSubstance());
            assertEquals("The resource reference for the exposure substance was incorrect.",
                         FhirUtils.createLocalResourceReferenceAnchorString(sReferenceId1),
                         oFhirAllergy.getExposure().get(0).getSubstance().getReferenceSimple());
        } else if (iNumExposures == 2) {
            // It turns out that we have found that allergies
            fail("Allergies should not have more than one exposure.");
        }
    }

    /**
     * Verify that the entered date time was transformed correctly.
     *
     * @param iIndex The index of the allergy to verify.
     * @param oFhirAllergy The FHIR allergy being verified.
     */
    private void verifyTransformEnteredDatetime(int iIndex, AdverseReaction oFhirAllergy) {
        assertTrue("There should have been an extension in the list of extensions.", NullChecker.isNotNullish(oFhirAllergy.getExtensions()));
        Extension oExtension = FhirUtils.findExtension(oFhirAllergy.getExtensions(), AllergiesVistaToFhir.EXT_URL_ENTERED_DATETIME);
        assertNotNull("The extension should not have been null.", oExtension);
        assertEquals("The URL of the extension was not correct.", AllergiesVistaToFhir.EXT_URL_ENTERED_DATETIME, oExtension.getUrlSimple());
        String sFhirDateTime = FhirUtils.extractFhirDateTimeValue(oExtension.getValue());
        assertEquals("", ENTERED_FHIR[iIndex], sFhirDateTime);
    }

    private void verifyTransformDate(int iIndex, AdverseReaction oFhirAllergy) throws ModelTransformException {
        assertNotNull("The date should not have been null.", oFhirAllergy.getDate());
        assertEquals("The date was not correct.", FhirUtils.createFhirDateTimeString(REACTION_DATETIME[iIndex]), oFhirAllergy.getDateSimple().toString());
    }

    /**
     * This method verifies that a single instance of a symptom is correctly instantiated.
     *
     * @param iIndex The index of the allergy to be verified.
     * @param oSymptom The symptom information being verified.
     * @param sReactionUrnVuid The VUID of the reaction.
     * @param sReactionName The name of the reaction.
     */
    private void verifySingleSymptom(int iIndex, AdverseReactionSymptomComponent oSymptom, String sReactionUrnVuid, String sReactionName) {
        assertNotNull("The symptom should not have been null.", oSymptom);
        assertNotNull("The symptom code should not have been null.", oSymptom.getCode());
        assertEquals("The text value was incorrect.", sReactionName, oSymptom.getCode().getTextSimple());
        String sReactionVuid = VprExtractionUtils.extractVuid(sReactionUrnVuid);
        if (sReactionVuid != null) {
            assertTrue("The coding object should not have been nullish.", NullChecker.isNotNullish(oSymptom.getCode().getCoding()));
            assertEquals("There should only be one coding object in the list.", 1, oSymptom.getCode().getCoding().size());
            Coding oCoding = oSymptom.getCode().getCoding().get(0);
            assertEquals("The coding display was incorrect.", sReactionName, oCoding.getDisplaySimple());
            assertEquals("The coding code was incorrect.", sReactionUrnVuid, oCoding.getCodeSimple());
            assertEquals("The coding system was incorrect.", AllergiesVistaToFhir.SYMPTOM_SYSTEM, oCoding.getSystemSimple());
        } else {
            assertTrue("The coding object should not have existed.", NullChecker.isNullish(oSymptom.getCode().getCoding()));
        }
    }

    /**
     * Verify that the symptom information was transformed correctly.
     *
     * @param iIndex The index of the allergy result to compare to.
     * @param oFhirAllergy The observation being verified.
     */
    private void verifyTransformSymptoms(int iIndex, AdverseReaction oFhirAllergy) {
        assertTrue("The symptom node should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getSymptom()));
        assertEquals("There was an incorrect number of symptom items.", REACTION_NAME[iIndex].length, oFhirAllergy.getSymptom().size());

        // We have two cases:  One where we have one product and one where we have two products.  Depending on which allergy we are verifying.
        //------------------------------------------------------------------------------------------------------------------------------------
        if (REACTION_NAME[iIndex].length == 1) {
            AdverseReactionSymptomComponent oSymptom = oFhirAllergy.getSymptom().get(0);
            verifySingleSymptom(iIndex, oSymptom, REACTION_VUID[iIndex][0], REACTION_NAME[iIndex][0]);
        } else if (REACTION_NAME[iIndex].length == 2) {
            boolean bFound1 = false;
            boolean bFound2 = false;
            for (AdverseReactionSymptomComponent oSymptom : oFhirAllergy.getSymptom()) {
                assertNotNull("Symptom Code should not have been null.", oSymptom.getCode());
                if (REACTION_NAME[iIndex][0].equals(oSymptom.getCode().getTextSimple())) {
                    verifySingleSymptom(iIndex, oSymptom, REACTION_VUID[iIndex][0], REACTION_NAME[iIndex][0]);
                    bFound1 = true;
                } else if (REACTION_NAME[iIndex][1].equals(oSymptom.getCode().getTextSimple())) {
                    verifySingleSymptom(iIndex, oSymptom, REACTION_VUID[iIndex][1], REACTION_NAME[iIndex][1]);
                    bFound2 = true;
                } else {
                    fail("A symptom existed that was not expected.");
                }
            }
            assertTrue("The first symptom was not found in the contained list.", bFound1);
            assertTrue("The second symptom was not found in the contained list.", bFound2);
        }
    }

    private void verifyTransformReactionNature(int iIndex, AdverseReaction oFhirAllergy) {
        assertTrue("There should have been an extension in the list of extensions.", NullChecker.isNotNullish(oFhirAllergy.getExtensions()));
        Extension oExtension = FhirUtils.findExtension(oFhirAllergy.getExtensions(), AllergiesVistaToFhir.EXT_URL_REACTION_NATURE);
        assertNotNull("The extension should not have been null.", oExtension);
        assertEquals("The URL of the extension was not correct.", AllergiesVistaToFhir.EXT_URL_REACTION_NATURE, oExtension.getUrlSimple());
        String value = FhirUtils.extractFhirStringValue(oExtension.getValue());
        assertEquals("", MECHANISM[iIndex].toLowerCase(), value);
    }

    private void verifyTransformRecorder(int iIndex, AdverseReaction oFhirAllergy) {
        assertTrue("There should have been one contained practitioner resource.", NullChecker.isNotNullish(FhirUtils.getContainedResources(oFhirAllergy, Practitioner.class)));
        Practitioner practitioner = FhirUtils.getContainedResources(oFhirAllergy, Practitioner.class).get(0);
        assertEquals(ORIGINATOR_NAME[iIndex], practitioner.getName().getTextSimple());
        assertEquals(oFhirAllergy.getRecorder().getReferenceSimple(), "#" + practitioner.getXmlId());
    }

    private void verifyTransformSeverity(int iIndex, AdverseReaction oFhirAllergy) {
        assertEquals(1, oFhirAllergy.getSymptom().size());
        for (AdverseReactionSymptomComponent adverseReactionSymptomComponent : oFhirAllergy.getSymptom()) {
            assertEquals(AllergiesVistaToFhir.SEVERITY_MAP.get(SEVERITY[iIndex]), adverseReactionSymptomComponent.getSeveritySimple());
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
            List<AdverseReaction> oaFhirAllergy = testSubject.transform(null);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirAllergy));

            // Second Null - the Allergy Class part is null within the object.
            //----------------------------------------------------------------
            VPRAllergiesRpcOutput oVprAllergiesRpcOutput = new VPRAllergiesRpcOutput();
            oaFhirAllergy = testSubject.transform(oVprAllergiesRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirAllergy));

            // Third Null - the Allergy array is null within the object.
            //---------------------------------------------------------
            oVprAllergiesRpcOutput = new VPRAllergiesRpcOutput();
            oVprAllergiesRpcOutput.setData(new AllergiesData());
            oaFhirAllergy = testSubject.transform(oVprAllergiesRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirAllergy));

            // The fourth test - we need a special testSubject instance that we can mock out the
            // transformOneAllergyResult method so that it returns null.
            //------------------------------------------------------------------------------------
            AllergiesVistaToFhir testSubject2 = new AllergiesVistaToFhir() {
                @Override
                protected AdverseReaction transformOneAllergyResult(AllergiesResult oAllergy) {
                    return null;
                }
            };
            oVprAllergiesRpcOutput = new VPRAllergiesRpcOutput();
            oVprAllergiesRpcOutput.setData(new AllergiesData());
            AllergiesResult oAllergy = new AllergiesResult();
            oVprAllergiesRpcOutput.getData().addItems(oAllergy);
            oAllergy.setSummary("SomeSummaryData");
            oaFhirAllergy = testSubject2.transform(oVprAllergiesRpcOutput);
            assertTrue("The return result should have been nullish.", NullChecker.isNullish(oaFhirAllergy));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests an overall transform containing two allergies results.
     */
    @Test
    public void testTransformWithTwoAllergies() {
        try {
            VPRAllergiesRpcOutput oAllergiesOutput = createSampleVprAllergiesRpcOutput();
            addToAllergiesArray(1, oAllergiesOutput);
            addToAllergiesArray(2, oAllergiesOutput);
            List<AdverseReaction> oaFhirAllergy = testSubject.transform(oAllergiesOutput);
            assertTrue("The return result should not have been nullish.", NullChecker.isNotNullish(oaFhirAllergy));
            assertEquals("There should have been two results returned.", 2, oaFhirAllergy.size());

            boolean bFound1 = false;
            boolean bFound2 = false;

            for (AdverseReaction oFhirAllergy : oaFhirAllergy) {
                int iIndex = 0;
                if (SUMMARY[1].equals(oFhirAllergy.getText().getDiv().allText())) {
                    bFound1 = true;
                    iIndex = 1;
                } else if (SUMMARY[2].equals(oFhirAllergy.getText().getDiv().allText())) {
                    bFound2 = true;
                    iIndex = 2;
                } else {
                    fail("An unexpected observation was found.");
                }

                verifyTransformText(iIndex, oFhirAllergy);
                verifyTransformSubstance(iIndex, oFhirAllergy, true);
                verifyTransformIdentifier(iIndex, oFhirAllergy);
                verifyTransformSubject(iIndex, oFhirAllergy);
                verifyTransformDidNotOccurFlag(iIndex, oFhirAllergy);
                verifyTransformEnteredDatetime(iIndex, oFhirAllergy);
                verifyTransformSymptoms(iIndex, oFhirAllergy);
                verifyTransformReactionNature(iIndex, oFhirAllergy);
                verifyTransformRecorder(iIndex, oFhirAllergy);
                verifyTransformDate(iIndex, oFhirAllergy);
            }

            assertTrue("Failed to find first allergy result.", bFound1);
            assertTrue("Failed to find second allergy result.", bFound2);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }

    }

    /**
     * This method tests the case of passing in a null into the TransformOneAllergyResult method.
     */
    @Test
    public void testTransformOneAllergyResultNull() {
        try {
            AdverseReaction oFhirAllergy = testSubject.transformOneAllergyResult(null);
            assertNull("The response should have been null.", oFhirAllergy);
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
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergy
        //--------------------------
        testSubject.transformText(oFhirAllergy, null);
        assertNull("The text node should have been null.", oFhirAllergy.getText());

        // Check for null Text
        //------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformText(oFhirAllergy, oAllergy);
        assertNull("The text node should have been null.", oFhirAllergy.getText());
    }

    /**
     * This method tests the transformText method for non-null conditions.
     */
    @Test
    public void testTransformTextValidValues() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);

        testSubject.transformText(oFhirAllergy, oAllergy);
        verifyTransformText(1, oFhirAllergy);
    }

    /**
     * This method tests the transformSubstance method for null conditions
     */
    @Test
    public void testTransformSubstanceNull() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergy
        //--------------------------
        testSubject.transformSubstance(oFhirAllergy, null);
        assertTrue("The contained node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getContained()));
        assertTrue("The exposure node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getExposure()));

        // Check for null Products
        //------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformSubstance(oFhirAllergy, oAllergy);
        assertTrue("The contained node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getContained()));
        assertTrue("The exposure node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getExposure()));

        // Check for null Product in the list
        //-----------------------------------
        oAllergy = new AllergiesResult();
        oAllergy.addProducts(null);
        testSubject.transformSubstance(oFhirAllergy, oAllergy);
        assertTrue("The contained node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getContained()));
        assertTrue("The exposure node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getExposure()));

        // Check for Product that contains no product name.
        //--------------------------------------------------
        oAllergy = new AllergiesResult();
        oAllergy.addProducts(new Product());
        testSubject.transformSubstance(oFhirAllergy, oAllergy);
        assertTrue("The contained node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getContained()));
        assertTrue("The exposure node which contains substance should have been null.", NullChecker.isNullish(oFhirAllergy.getExposure()));

    }

    /**
     * This method tests the transformSubstance method for non-null conditions.
     */
    @Test
    public void testTransformSubstanceValidValues() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Test condition where the FhirAllergy is empty (i.e. has no existing exposure or substance information.
        // There are two conditional branches to test here:
        //     Branch 1:  Summary contains data.
        //     Branch 2:  Summary contains no data.
        //----------------------------------------------------------------------------------------------------------

        // Test Branch 1
        //---------------
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformSubstance(oFhirAllergy, oAllergy);
        verifyTransformSubstance(1, oFhirAllergy, true);

        // Test Branch 2
        //---------------
        oAllergy = createAllergy(1);
        oAllergy.setSummary(null);
        testSubject.transformSubstance(oFhirAllergy, oAllergy);
        verifyTransformSubstance(1, oFhirAllergy, false);

    }

    /**
     * This method tests the removal of existing substances from the FHIR Allergy "Contained" array list.
     */
    @Test
    public void testRemoveFhirAllergyExistingSubstances() {
        // Branch test:  FhirAllergy = null - does nothing - no errors.
        //-------------------------------------------------------------
        testSubject.removeExistingSubstances(null);

        // Branch test: Substances are null - does nothing - no errors.
        //--------------------------------------------------------------
        AdverseReaction oFhirAllergy = new AdverseReaction();
        testSubject.removeExistingSubstances(oFhirAllergy);
        assertTrue("The 'contained' array list should have been nullish.", NullChecker.isNullish(oFhirAllergy.getContained()));

        // Branch test: Contained list has null entry.
        //--------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        oFhirAllergy.getContained().add(null);
        testSubject.removeExistingSubstances(oFhirAllergy);
        assertTrue("The 'contained' array list should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        assertEquals("There should have been on entry in the contained array.", 1, oFhirAllergy.getContained().size());
        assertNull("The element in the 'contained' array list should have been null.", oFhirAllergy.getContained().get(0));

        // Branch test:  Removal of only "Substance" resources.
        //-------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        Substance oSubstance = new Substance();
        oFhirAllergy.getContained().add(oSubstance);
        Location oLocation = new Location();
        oFhirAllergy.getContained().add(oLocation);
        oSubstance = new Substance();
        oFhirAllergy.getContained().add(oSubstance);
        testSubject.removeExistingSubstances(oFhirAllergy);
        assertTrue("The contained array list should have had some items.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        assertEquals("There should have only been one item left in the contained array list.", 1, oFhirAllergy.getContained().size());
        assertTrue("The remaining item should have been the location resource.", oFhirAllergy.getContained().get(0) instanceof Location);

        // Branch test:  Contained array contains non-substance resources only - nothing should be removed.
        //--------------------------------------------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        oLocation = new Location();
        oFhirAllergy.getContained().add(oLocation);
        oLocation = new Location();
        oFhirAllergy.getContained().add(oLocation);
        testSubject.removeExistingSubstances(oFhirAllergy);
        assertTrue("The contained array list should have had some items.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        assertEquals("There should have only been one item left in the contained array list.", 2, oFhirAllergy.getContained().size());

    }

    /**
     * This method tests the removal of existing exposures from the FHIR Allergy "exposure" array list.
     */
    @Test
    public void testRemoveFhirAllergyExistingExposure() {
        // Branch test:  FhirAllergy = null - does nothing - no errors.
        //-------------------------------------------------------------
        testSubject.removeExistingExposures(null);

        // Branch test: Exposures are null - does nothing - no errors.
        //--------------------------------------------------------------
        AdverseReaction oFhirAllergy = new AdverseReaction();
        testSubject.removeExistingExposures(oFhirAllergy);
        assertTrue("The 'exposure' array list should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExposure()));

        // Branch test: Contained list has null entry.
        //--------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        oFhirAllergy.getExposure().add(null);
        testSubject.removeExistingExposures(oFhirAllergy);
        assertTrue("The 'contained' array list should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getExposure()));
        assertEquals("There should have been on entry in the contained array.", 1, oFhirAllergy.getExposure().size());
        assertNull("The element in the 'contained' array list should have been null.", oFhirAllergy.getExposure().get(0));

        // Branch test:  Removal of only "Substance" resources from the exposure list.
        //-----------------------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        // Substance exposure.
        //--------------------
        AdverseReactionExposureComponent oExposureComponent = new AdverseReactionExposureComponent();
        oExposureComponent.setSubstance(new ResourceReference());
        oFhirAllergy.getExposure().add(oExposureComponent);
        // Non-Substance exposure.
        //------------------------
        oExposureComponent = new AdverseReactionExposureComponent();
        oFhirAllergy.getExposure().add(oExposureComponent);
        // Substance exposure.
        //--------------------
        oExposureComponent = new AdverseReactionExposureComponent();
        oExposureComponent.setSubstance(new ResourceReference());
        oFhirAllergy.getExposure().add(oExposureComponent);
        testSubject.removeExistingExposures(oFhirAllergy);
        assertTrue("The exposure array list should have had some items.", NullChecker.isNotNullish(oFhirAllergy.getExposure()));
        assertEquals("There should have only been one item left in the exposure array list.", 1, oFhirAllergy.getExposure().size());
        assertNull("The remaining item should have been a substance.", oFhirAllergy.getExposure().get(0).getSubstance());

        // Branch test:  Exposure array contains non-substance resources only - nothing should be removed.
        //--------------------------------------------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        oExposureComponent = new AdverseReactionExposureComponent();
        oFhirAllergy.getExposure().add(oExposureComponent);
        oExposureComponent = new AdverseReactionExposureComponent();
        oFhirAllergy.getExposure().add(oExposureComponent);
        testSubject.removeExistingExposures(oFhirAllergy);
        assertTrue("The exposure array list should have had some items.", NullChecker.isNotNullish(oFhirAllergy.getExposure()));
        assertEquals("There should have only been one item left in the exposure array list.", 2, oFhirAllergy.getExposure().size());

    }

    /**
     * This method tests the transformIdentifier method for null conditions
     */
    @Test
    public void testTransformIdentifierNull() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergy
        //--------------------------
        testSubject.transformIdentifier(oFhirAllergy, null);
        assertTrue("The identifier node should have been nullish.", NullChecker.isNullish(oFhirAllergy.getIdentifier()));

        // Check for null identifier
        //---------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformIdentifier(oFhirAllergy, oAllergy);
        assertTrue("The identifier node should have been nullish.", NullChecker.isNullish(oFhirAllergy.getIdentifier()));
    }

    /**
     * This method tests the transformIdentifier method for non-null conditions.
     */
    @Test
    public void testTransformIdentifierValidValues() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);

        testSubject.transformIdentifier(oFhirAllergy, oAllergy);
        verifyTransformIdentifier(1, oFhirAllergy);
    }

    /**
     * This method tests transformSubject method for null conditions.
     */
    @Test
    public void testTransformSubjectNull() {
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();

            // Check for null allergies
            //-----------------------
            testSubject.transformSubject(oFhirAllergy, null);
            assertNull("The subject node should have been null.", oFhirAllergy.getSubject());

            // Check for null UID
            //-------------------------
            AllergiesResult oAllergy = new AllergiesResult();
            testSubject.transformSubject(oFhirAllergy, oAllergy);
            assertNull("The subject node should have been null.", oFhirAllergy.getSubject());

            // Check for UID which does not contain enough tokens
            //----------------------------------------------------
            oAllergy = new AllergiesResult();
            oAllergy.setUid("urn:va:11");
            testSubject.transformSubject(oFhirAllergy, oAllergy);
            assertNull("The subject node should have been null.", oFhirAllergy.getSubject());

            // Check for UID which does not contain the DFN token
            //----------------------------------------------------
            oAllergy = new AllergiesResult();
            oAllergy.setUid("urn:va:domain:site::22");
            testSubject.transformSubject(oFhirAllergy, oAllergy);
            assertNull("The subject node should have been null.", oFhirAllergy.getSubject());
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
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();
            AllergiesResult oAllergy = createAllergy(1);
            testSubject.transformSubject(oFhirAllergy, oAllergy);
            verifyTransformSubject(1, oFhirAllergy);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * Test the transformDidNotOccurFlag method.
     */
    @Test
    public void testTransformDidNotOccurFlag() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformDidNotOccurFlag(oFhirAllergy, oAllergy);
        verifyTransformDidNotOccurFlag(1, oFhirAllergy);
    }

    /**
     * This method tests transformEnteredDatetime method for null conditions.
     */
    @Test
    public void testTransformEnteredDatetimeNull() {
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();

            // Check for null allergies
            //-----------------------
            testSubject.transformEnteredDatetime(oFhirAllergy, null);
            assertTrue("The extensions array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExtensions()));

            // Check for null Entered value.
            //-------------------------------
            AllergiesResult oAllergy = new AllergiesResult();
            testSubject.transformEnteredDatetime(oFhirAllergy, oAllergy);
            assertTrue("The extensions array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExtensions()));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformEnteredDatetime method for non-null conditions.
     */
    @Test
    public void testTransformEnteredDatetimeValidValues() {
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();
            AllergiesResult oAllergy = createAllergy(1);
            testSubject.transformEnteredDatetime(oFhirAllergy, oAllergy);
            verifyTransformEnteredDatetime(1, oFhirAllergy);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests transformSymptoms method for null conditions.
     */
    @Test
    public void testTransformSymptomsNull() {
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();

            // Check for null allergies
            //-----------------------
            testSubject.transformSymptoms(oFhirAllergy, null);
            assertTrue("The symptoms array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getSymptom()));

            // Check for null reaction value.
            //-------------------------------
            AllergiesResult oAllergy = new AllergiesResult();
            testSubject.transformSymptoms(oFhirAllergy, oAllergy);
            assertTrue("The symptoms array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getSymptom()));

            // Check for when there is a null reaction in the reaction list.
            //---------------------------------------------------------------
            oAllergy = new AllergiesResult();
            oAllergy.addReactions(null);
            testSubject.transformSymptoms(oFhirAllergy, oAllergy);
            assertTrue("The symptoms array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getSymptom()));

            // Test with no VUID and no Reaction Name
            //----------------------------------------
            oAllergy = new AllergiesResult();
            oAllergy.addReactions(new Reaction());
            testSubject.transformSymptoms(oFhirAllergy, oAllergy);
            assertTrue("The symptoms array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getSymptom()));
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    /**
     * This method tests the transformSymptoms method for non-null conditions.
     */
    @Test
    public void testTransformSymptomsValidValues() {
        try {
            AdverseReaction oFhirAllergy = new AdverseReaction();
            // Use allergy 2 because it has two reactions - one with a null VUID and one with a valid VUID
            //---------------------------------------------------------------------------------------------
            AllergiesResult oAllergy = createAllergy(2);
            testSubject.transformSymptoms(oFhirAllergy, oAllergy);
            verifyTransformSymptoms(2, oFhirAllergy);
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.   Message: " + e.getMessage());
        }
    }

    @Test
    public void testTransformReactionNatureNull() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergies
        //-----------------------
        testSubject.transformReactionNature(oFhirAllergy, null);
        assertTrue("The extensions array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExtensions()));

        // Check for null Entered value.
        //-------------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformReactionNature(oFhirAllergy, oAllergy);
        assertTrue("The extensions array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExtensions()));
    }

    @Test
    public void testTransformReactionNatureValidValues() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformReactionNature(oFhirAllergy, oAllergy);
        verifyTransformReactionNature(1, oFhirAllergy);
    }

    @Test
    public void testRemoveExistingRecorder() throws Exception {
        // Branch test:  FhirAllergy = null - does nothing - no errors.
        //-------------------------------------------------------------
        testSubject.removeExistingRecorder(null);

        // Branch test: recorder is null - does nothing - no errors.
        //--------------------------------------------------------------
        AdverseReaction oFhirAllergy = new AdverseReaction();
        testSubject.removeExistingRecorder(oFhirAllergy);
        assertTrue("The 'contained' array list should have been nullish.", NullChecker.isNullish(oFhirAllergy.getContained()));

        // Branch test: Contained list has null entry.
        //--------------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        oFhirAllergy.getContained().add(null);
        testSubject.removeExistingRecorder(oFhirAllergy);
        assertTrue("The 'contained' array list should not have been nullish.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        assertEquals("There should have been on entry in the contained array.", 1, oFhirAllergy.getContained().size());
        assertNull("The element in the 'contained' array list should have been null.", oFhirAllergy.getContained().get(0));

        // Branch test:  Removal of only "Practicioner" resources.
        //-------------------------------------------------------
        oFhirAllergy = new AdverseReaction();
        Practitioner practitioner = new Practitioner();
        practitioner.setXmlId("1234");
        oFhirAllergy.getContained().add(practitioner);
        Location oLocation = new Location();
        oLocation.setXmlId("5678");
        oFhirAllergy.getContained().add(oLocation);
        oFhirAllergy.setRecorder(FhirUtils.createResourceReferenceAnchor("1234"));

        testSubject.removeExistingRecorder(oFhirAllergy);
        assertTrue("The contained array list should have had some items.", NullChecker.isNotNullish(oFhirAllergy.getContained()));
        assertEquals("There should have only been one item left in the contained array list.", 1, oFhirAllergy.getContained().size());
        assertTrue("The remaining item should have been the location resource.", oFhirAllergy.getContained().get(0) instanceof Location);
    }

    @Test
    public void testTransformRecorderNull() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergies
        //-----------------------
        testSubject.transformRecorder(oFhirAllergy, null);
        assertTrue("The extensions array should have been nullish.", NullChecker.isNullish(oFhirAllergy.getExtensions()));

        // Check for null value.
        //-------------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformRecorder(oFhirAllergy, oAllergy);
        assertNull(oFhirAllergy.getRecorder());
    }

    @Test
    public void testTransformRecorderValidValues() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformRecorder(oFhirAllergy, oAllergy);
        verifyTransformRecorder(1, oFhirAllergy);
    }

    @Test
    public void testTransformDateNull() throws ModelTransformException {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Check for null allergies
        //-----------------------
        testSubject.transformDate(oFhirAllergy, null);
        assertNull("The extensions array should have been nullish.", oFhirAllergy.getDate());

        // Check for null Entered value.
        //-------------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformDate(oFhirAllergy, oAllergy);
        assertNull("The extensions array should have been nullish.", oFhirAllergy.getDate());
    }

    @Test
    public void testTransformDateValidValues() throws ModelTransformException {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformDate(oFhirAllergy, oAllergy);
        verifyTransformDate(1, oFhirAllergy);
    }

    @Test
    public void testTransformSeverityNull() throws ModelTransformException {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        testSubject.transformSymptoms(oFhirAllergy, createAllergy(1));

        // Check for null allergies
        //-----------------------
        testSubject.transformSymptomSeverity(oFhirAllergy, null);
        for (AdverseReactionSymptomComponent adverseReactionSymptomComponent : oFhirAllergy.getSymptom()) {
            assertNull("The severity should have been nullish.", adverseReactionSymptomComponent.getSeverity());
        }

        // Check for null Entered value.
        //-------------------------------
        AllergiesResult oAllergy = new AllergiesResult();
        testSubject.transformSymptoms(oFhirAllergy, createAllergy(1));
        testSubject.transformSymptomSeverity(oFhirAllergy, oAllergy);
        for (AdverseReactionSymptomComponent adverseReactionSymptomComponent : oFhirAllergy.getSymptom()) {
            assertNull("The severity should have been nullish.", adverseReactionSymptomComponent.getSeverity());
        }
    }

    @Test
    public void testTransformSeverityValidValues() throws ModelTransformException {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        AllergiesResult oAllergy = createAllergy(1);
        testSubject.transformSymptoms(oFhirAllergy, oAllergy);
        testSubject.transformSymptomSeverity(oFhirAllergy, oAllergy);
        verifyTransformSeverity(1, oFhirAllergy);
    }



}
