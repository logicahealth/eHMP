/**
 *
 */
package us.vistacore.ehmp.model.vitals;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * This tests the Vitals class.
 *
 * @author Les.Westberg
 *
 */
public class VitalsTest {
    private Vitals testSubject = null;

    /**
     * This method is run before each test is run to set up state.
     *
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new Vitals();
    }

    /**
     * Test setting and getting the value from the SourceVistaSite property.
     *
     */
    @Test
    public void testSourceVistaSiteProperty() {
        testSubject.setSourceVistaSite("TheSite");
        assertEquals("The source vista site was incorrect.", "TheSite", testSubject.getSourceVistaSite());
    }

    /**
     * Test setting and getting the value from the facilityCode property.
     *
     */
    @Test
    public void testFacilityCodeProperty() {
        testSubject.setFacilityCode("TheFacilityCode");
        assertEquals("The facility code was incorrect.", "TheFacilityCode", testSubject.getFacilityCode());
    }

    /**
     * Test setting and getting the value from the FacilityName property.
     *
     */
    @Test
    public void testFacilityNameProperty() {
        testSubject.setFacilityName("TheFacilityName");
        assertEquals("The facility name was incorrect.", "TheFacilityName", testSubject.getFacilityName());
    }

    /**
     * Test setting and getting the value from the High property.
     *
     */
    @Test
    public void testHighProperty() {
        testSubject.setHigh("TheHigh");
        assertEquals("The High property was incorrect.", "TheHigh", testSubject.getHigh());
    }

    /**
     * Test setting and getting the value from the Kind property.
     *
     */
    @Test
    public void testKindProperty() {
        testSubject.setKind("TheKind");
        assertEquals("The kind property was incorrect.", "TheKind", testSubject.getKind());
    }

    /**
     * Test setting and getting the value from the LocalId property.
     *
     */
    @Test
    public void testLocalIdProperty() {
        testSubject.setLocalId("TheLocalId");
        assertEquals("The local Id property was incorrect.", "TheLocalId", testSubject.getLocalId());
    }

    /**
     * Test setting and getting the value from the LocationCode property.
     *
     */
    @Test
    public void testLocationCodeProperty() {
        testSubject.setLocationCode("TheLocationCode");
        assertEquals("The location code property was incorrect.", "TheLocationCode", testSubject.getLocationCode());
    }

    /**
     * Test setting and getting the value from the LocationName property.
     *
     */
    @Test
    public void testLocationNameProperty() {
        testSubject.setLocationName("TheLocationName");
        assertEquals("The location name property was incorrect.", "TheLocationName", testSubject.getLocationName());
    }

    /**
     * Test setting and getting the value from the Low property.
     *
     */
    @Test
    public void testLowProperty() {
        testSubject.setLow("TheLow");
        assertEquals("The low property was incorrect.", "TheLow", testSubject.getLow());
    }

    /**
     * Test setting and getting the value from the Observed property.
     *
     */
    @Test
    public void testObservedProperty() {
        testSubject.setObserved("TheObserved");
        assertEquals("The observed property was incorrect.", "TheObserved", testSubject.getObserved());
    }

    /**
     * Test setting and getting the value from the Result property.
     *
     */
    @Test
    public void testResultProperty() {
        testSubject.setResult("TheResult");
        assertEquals("The result property was incorrect.", "TheResult", testSubject.getResult());
    }

    /**
     * Test setting and getting the value from the Resulted property.
     *
     */
    @Test
    public void testResultedProperty() {
        testSubject.setResulted("TheResulted");
        assertEquals("The resulted property was incorrect.", "TheResulted", testSubject.getResulted());
    }

    /**
     * Test setting and getting the value from the Summary property.
     *
     */
    @Test
    public void testSummaryProperty() {
        testSubject.setSummary("TheSummary");
        assertEquals("The summary property was incorrect.", "TheSummary", testSubject.getSummary());
    }

    /**
     * Test setting and getting the value from the TypeCode property.
     *
     */
    @Test
    public void testTypeCodeProperty() {
        testSubject.setTypeCode("TheTypeCode");
        assertEquals("The type code property was incorrect.", "TheTypeCode", testSubject.getTypeCode());
    }

    /**
     * Test setting and getting the value from the TypeName property.
     *
     */
    @Test
    public void testTypeNameProperty() {
        testSubject.setTypeName("TheTypeName");
        assertEquals("The type name property was incorrect.", "TheTypeName", testSubject.getTypeName());
    }

    /**
     * Test setting and getting the value from the Uid property.
     *
     */
    @Test
    public void testUidProperty() {
        testSubject.setUid("TheUid");
        assertEquals("The uid property was incorrect.", "TheUid", testSubject.getUid());
    }

    /**
     * Test setting and getting the value from the Units property.
     *
     */
    @Test
    public void testUnitsProperty() {
        testSubject.setUnits("TheUnits");
        assertEquals("The units property was incorrect.", "TheUnits", testSubject.getUnits());
    }

}

