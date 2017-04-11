package us.vistacore.ehmp.util;

import org.junit.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * This will test the NullChecker class.
 *
 * @author Les.Westberg
 *
 */
public class NullCheckerTest {

    /**
     * This tests the method that looks for a nullish string.
     */
    @Test
    public void testIsNullishString() {
        assertTrue("Value should have been true.", NullChecker.isNullish(""));
        assertTrue("Value should have been true.", NullChecker.isNullish((String) null));
        assertFalse("The value should have been false.", NullChecker.isNullish("This is a test."));
    }

    /**
     * This tests the method that looks for a NotNullish string.
     */
    @Test
    public void testIsNotNullishString() {
        assertFalse("Value should have been false.", NullChecker.isNotNullish(""));
        assertFalse("Value should have been false.", NullChecker.isNotNullish((String) null));
        assertTrue("The value should have been true.", NullChecker.isNotNullish("This is a test."));
    }

    /**
     * This tests the method that looks for a nullish List.
     */
    @Test
    public void testIsNullishList() {
        List<String> oaNullList = null;
        List<String> oaEmptyList = new ArrayList<String>();
        List<String> oaHasElementList = new ArrayList<String>();
        oaHasElementList.add("AnElement");

        assertTrue("Value should have been true.", NullChecker.isNullish(oaNullList));
        assertTrue("Value should have been true.", NullChecker.isNullish(oaEmptyList));
        assertFalse("The value should have been false.", NullChecker.isNullish(oaHasElementList));
    }

    /**
     * This tests the method that looks for a NotNullish List.
     */
    @Test
    public void testIsNotNullishList() {
        List<String> oaNullList = null;
        List<String> oaEmptyList = new ArrayList<String>();
        List<String> oaHasElementList = new ArrayList<String>();
        oaHasElementList.add("AnElement");

        assertFalse("Value should have been false.", NullChecker.isNotNullish(oaNullList));
        assertFalse("Value should have been false.", NullChecker.isNotNullish(oaEmptyList));
        assertTrue("The value should have been true.", NullChecker.isNotNullish(oaHasElementList));
    }

    /**
     * This tests the method that looks for a Nullish Collection.
     */
    @Test
    public void testIsNullishCollection() {
        Set<String> osNullList = null;
        Set<String> osEmptyList = new HashSet<String>();
        Set<String> osHasElementList = new HashSet<String>();
        osHasElementList.add("AnElement");

        assertTrue("Value should have been true.", NullChecker.isNullish(osNullList));
        assertTrue("Value should have been true.", NullChecker.isNullish(osEmptyList));
        assertFalse("The value should have been false.", NullChecker.isNullish(osHasElementList));
    }

    /**
     * This tests the method that looks for a NotNullish Collection.
     */
    @Test
    public void testIsNotNullishCollection() {
        Set<String> osNullList = null;
        Set<String> osEmptyList = new HashSet<String>();
        Set<String> osHasElementList = new HashSet<String>();
        osHasElementList.add("AnElement");

        assertFalse("Value should have been false.", NullChecker.isNotNullish(osNullList));
        assertFalse("Value should have been false.", NullChecker.isNotNullish(osEmptyList));
        assertTrue("The value should have been true.", NullChecker.isNotNullish(osHasElementList));
    }

    /**
     * This tests the method that looks for a Nullish Map.
     */
    @Test
    public void testIsNullishMap() {
        Map<String, String> omNullList = null;
        Map<String, String> omEmptyList = new HashMap<String, String>();
        Map<String, String> omHasElementList = new HashMap<String, String>();
        omHasElementList.put("TheName", "AnElement");

        assertTrue("Value should have been true.", NullChecker.isNullish(omNullList));
        assertTrue("Value should have been true.", NullChecker.isNullish(omEmptyList));
        assertFalse("The value should have been false.", NullChecker.isNullish(omHasElementList));
    }

    /**
     * This tests the method that looks for a NotNullish Map.
     */
    @Test
    public void testIsNotNullishMap() {
        Map<String, String> omNullList = null;
        Map<String, String> omEmptyList = new HashMap<String, String>();
        Map<String, String> omHasElementList = new HashMap<String, String>();
        omHasElementList.put("TheName", "AnElement");

        assertFalse("Value should have been false.", NullChecker.isNotNullish(omNullList));
        assertFalse("Value should have been false.", NullChecker.isNotNullish(omEmptyList));
        assertTrue("The value should have been true.", NullChecker.isNotNullish(omHasElementList));
    }

}
