package us.vistacore.ehmp.model.allergies;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.hl7.fhir.instance.model.AdverseReaction.ReactionSeverity;
import org.junit.Test;

/**
 * This class tests the AllergySeverityMap class
 *
 */
public class AllergySeverityMapTest {
    /**
     * Test for null values.
     */
    @Test
    public void testNullValues() {
        ReactionSeverity oFhirSeverity = AllergySeverityMap.getFhirSeverity(null);
        assertNull("The response should have been null.", oFhirSeverity);
    }

    /**
     * Test all mapping values to be sure it produces the correct mapping.
     */
    @Test
    public void testValidValues() {
        ReactionSeverity oFhirSeverity;

        oFhirSeverity = AllergySeverityMap.getFhirSeverity("Severe");
        assertEquals("The mapping for 'Severe' was incorrect.", ReactionSeverity.severe, oFhirSeverity);

        oFhirSeverity = AllergySeverityMap.getFhirSeverity("Moderate");
        assertEquals("The mapping for 'Moderate' was incorrect.", ReactionSeverity.moderate, oFhirSeverity);

        oFhirSeverity = AllergySeverityMap.getFhirSeverity("Mild");
        assertEquals("The mapping for 'Mild' was incorrect.", ReactionSeverity.minor, oFhirSeverity);


        // Now verify ones that does not map - correctly return null
        //-----------------------------------------------------------------
        oFhirSeverity = AllergySeverityMap.getFhirSeverity("UNKNOWN");
        assertNull("The mapping for 'UNKNOWN' was incorrect.", oFhirSeverity);


    }
}
