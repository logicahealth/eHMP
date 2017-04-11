package us.vistacore.ehmp.model.transform;

import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AtomEntry;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.Observation;
import org.junit.Test;
import us.vistacore.ehmp.util.NullChecker;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * This class is used to test the VitalsFhirToXML class.
 *
 * @author Kyle.Marchant, Les.Westberg
 *
 */
public class FhirToXMLTest {

    /**
     * Initial Stub test make sure we got XML String ...
     */
    @Test
    public void testTransformStubObservation() {
        Observation oFhirObservation = new Observation();

        String sFhirXml = "";
        try {
            sFhirXml = FhirToXML.transform(oFhirObservation);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirXml));
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to XML.  Message: " + e.getMessage());
        }
    }

    /**
     * Initial Stub test make sure we got XML String ...
     */
    @Test
    public void testTransformStubAdverseReaction() {
        AdverseReaction oFhirAllergy = new AdverseReaction();

        String sFhirXml = "";
        try {
            sFhirXml = FhirToXML.transform(oFhirAllergy);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirXml));
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to XML.  Message: " + e.getMessage());
        }
    }


    @Test
    public void testTransformAtomFeed() {
        AtomFeed atomFeed = new AtomFeed();
        AtomEntry<Observation> atomEntry = new AtomEntry<Observation>();
        atomEntry.setResource(new Observation());
        atomFeed.getEntryList().add(atomEntry);
        String sFhirXml = "";
        try {
            sFhirXml = FhirToXML.transform(atomFeed, true);
            assertTrue("The value should not have been nullish.", NullChecker.isNotNullish(sFhirXml));
        } catch (Exception e) {
            e.printStackTrace();
            fail("Failed to serialize to JSON.  Message: " + e.getMessage());
        }
    }



}
