package us.vistacore.ehmp.util;

import org.junit.Test;

import javax.xml.datatype.DatatypeConfigurationException;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import static org.junit.Assert.*;

/**
 * This class tests the methods of the XMLDateUtils class.
 *
 * @author Josh.Bell
 *
 */
public class XMLDateUtilsTest {

    /**
     * This method tests the fromXML method.
     */
    @Test
    public void testFromXML() {
        try {
            assertNull("The Date should have been null.", XMLDateUtils.fromXML(null));
        } catch (DatatypeConfigurationException e1) {
            e1.printStackTrace();
            fail("An unexpected exception occurred.");
        }

        try {
            assertNull("The Date should have been null.", XMLDateUtils.fromXML(""));
        } catch (DatatypeConfigurationException e1) {
            e1.printStackTrace();
            fail("An unexpected exception occurred.");
        }

        try {
            @SuppressWarnings("unused")
            Date dateTime = XMLDateUtils.fromXML("abc");
            fail("We should have received a IllegalArgumentException.");
        } catch (IllegalArgumentException de) {
            // We expect this. So no failure.
        } catch (Exception e) {
            e.printStackTrace();
            fail("An unexpected exception occurred.");
        }
    }

    /**
     * This method tests the toXML method.
     */
    @Test
    public void testToXML() {
        assertEquals("The XML Date should have been empty string.", "", XMLDateUtils.toXML(null));
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        calendar.setTimeInMillis(0);
        assertEquals("The XML Date should have been 1970-01-01T00:00:00.000Z", "1970-01-01T00:00:00.000Z", XMLDateUtils.toXML(calendar.getTime()));
    }

}
