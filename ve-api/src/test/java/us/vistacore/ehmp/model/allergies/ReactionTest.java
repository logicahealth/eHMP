package us.vistacore.ehmp.model.allergies;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

/**
 * This tests the Allergies Reaction class.
 *
 * @author Les.Westberg
 *
 */
public class ReactionTest {
    private static final String REFERENCE_VALUE = "TheReferenceValue";
    private static final String REACTION_VUID_VALUE = "TheReactionVuid";
    private static final String REACTION_NAME_VALUE = "TheReactionName";
    Reaction testSubject = null;

    /**
     * This method is run before each test is run to set up state.
     *
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new Reaction();
    }

    /**
     * This method tests the ReactionsName property.
     */
    @Test
    public void testReactionsName() {
        testSubject.setReactionsName(REACTION_NAME_VALUE);
        assertEquals("The reactionsName property failed.", REACTION_NAME_VALUE, testSubject.getReactionsName());
    }

    /**
     * This method tests the ReactionsVuid property.
     */
    @Test
    public void testReactionsVuid() {
        testSubject.setReactionsVuid(REACTION_VUID_VALUE);
        assertEquals("The reactionsVuid property failed.", REACTION_VUID_VALUE, testSubject.getReactionsVuid());
    }

    /**
     * This method tests the reference property.
     */
    @Test
    public void testReference() {
        testSubject.setReference(REFERENCE_VALUE);
        assertEquals("The reference property failed.", REFERENCE_VALUE, testSubject.getReference());
    }

    /**
     * This method tests setting all properties and verifying that they are set correctly.  It
     * makes sure that each property stands alone.  (No method property misusing another properties
     * underlying storage field.)
     */
    @Test
    public void testAllProperties() {
        testSubject.setReactionsName(REACTION_NAME_VALUE);
        testSubject.setReactionsVuid(REACTION_VUID_VALUE);
        testSubject.setReference(REFERENCE_VALUE);
        assertEquals("ReactionsName failed.", REACTION_NAME_VALUE, testSubject.getReactionsName());
        assertEquals("ReactionsVuid failed.", REACTION_VUID_VALUE, testSubject.getReactionsVuid());
        assertEquals("Reference failed.", REFERENCE_VALUE, testSubject.getReference());
    }

}
