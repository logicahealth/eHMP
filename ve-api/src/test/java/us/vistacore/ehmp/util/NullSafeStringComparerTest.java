package us.vistacore.ehmp.util;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class NullSafeStringComparerTest {

    @Test
    public void compareSame() {
        assertTrue(NullSafeStringComparer.areEqual("x", "x"));
    }

    @Test
    public void compareDifferent() {
        assertFalse(NullSafeStringComparer.areEqual("x", "y"));
    }

    @Test
    public void compareDifferentCase() {
        assertFalse(NullSafeStringComparer.areEqual("x", "X"));
    }

    @Test
    public void compareFirstNull() {
        assertFalse(NullSafeStringComparer.areEqual(null, "x"));
    }

    @Test
    public void compareSecondNull() {
        assertFalse(NullSafeStringComparer.areEqual("x", null));
    }

    @Test
    public void compareNulls() {
        assertTrue(NullSafeStringComparer.areEqual(null, null));
    }

    @Test
    public void compareNotEqualOnSame() {
        assertFalse(NullSafeStringComparer.areNotEqual("x", "x"));
    }

    @Test
    public void compareNotEqualOnDifferent() {
        assertTrue(NullSafeStringComparer.areNotEqual("x", "y"));
    }
}
