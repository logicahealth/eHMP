package us.vistacore.ehmp.model.transform;

import com.google.gson.JsonElement;
import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AtomEntry;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.Observation;
import org.junit.Test;
import us.vistacore.ehmp.util.NullChecker;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

/**
 * This class is used to test the VitalsFhirToJson class.
 *
 * @author Les.Westberg and Kyle.Marchant
 *
 */
public class FhirToJsonTest {

    /**
     * Initial Stub test make sure we got empty Json String back
     */
    @Test
    public void testTransformObservationStub() {
        Observation oFhirObservation = new Observation();
        String sFhirJson = "";
        try {
            sFhirJson = FhirToJson.transform(oFhirObservation);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirJson));
            System.out.println("JSON Output: " + sFhirJson);
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }

    /**
     * Initial Stub test make sure we got empty Json String back
     */
    @Test
    public void testTransformAdverseReactionStub() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        String sFhirJson = "";
        try {
            sFhirJson = FhirToJson.transform(oFhirAllergy);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirJson));
            System.out.println("JSON Output: " + sFhirJson);
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }

    /**
     * Initial Stub test make sure we got empty JsonElement back
     */
    @Test
    public void testTransformObservationJsonElementStub() {
        Observation oFhirObservation = new Observation();
        String sFhirJson = "";
        JsonElement oJsonElement = null;
        try {
            oJsonElement = FhirToJson.transformToJsonElement(oFhirObservation);
            assertNotNull("JSON element should not have been null.", oJsonElement);
            sFhirJson = oJsonElement.toString();
            assertTrue("The value should not have been the nullish.", NullChecker.isNotNullish(sFhirJson));
            System.out.println("JSON Output: " + sFhirJson);
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }

    /**
     * Initial Stub test make sure we got empty JsonElement back
     */
    @Test
    public void testTransformAdverseReactionJsonElementStub() {
        AdverseReaction oFhirAllergy = new AdverseReaction();
        String sFhirJson = "";
        JsonElement oJsonElement = null;
        try {
            oJsonElement = FhirToJson.transformToJsonElement(oFhirAllergy);
            assertNotNull("JSON element should not have been null.", oJsonElement);
            sFhirJson = oJsonElement.toString();
            assertTrue("The value should not have been the nullish.", NullChecker.isNotNullish(sFhirJson));
            System.out.println("JSON Output: " + sFhirJson);
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }

    @Test
    public void testTransformAtomFeed() {
        AtomFeed atomFeed = new AtomFeed();
        AtomEntry<Observation> atomEntry = new AtomEntry<Observation>();
        atomEntry.setResource(new Observation());
        atomFeed.getEntryList().add(atomEntry);
        String sFhirJson = "";
        try {
            sFhirJson = FhirToJson.transform(atomFeed, true);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirJson));
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }


}
