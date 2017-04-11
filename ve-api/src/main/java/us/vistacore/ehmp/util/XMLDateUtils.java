package us.vistacore.ehmp.util;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import javax.xml.datatype.DatatypeConfigurationException;
import java.util.Date;

public final class XMLDateUtils {

    private XMLDateUtils() { }

    /**
     * Returns an ISO8601 string representation of a Date
     * @param date a Date object
     * @return a String in ISO8601 datetime format
     */
    public static String toXML(Date date) {
        String xmlDateTime = "";
        if (date != null) {
            DateTime dateTime = new DateTime(date, DateTimeZone.UTC);
            xmlDateTime = dateTime.toString();
        }
        return xmlDateTime;
    }

    /**
     * Returns a Date object from an ISO8601 datetime string
     * @param sXmlDateTime a String in ISO8601 datetime format
     * @return a Date object
     */
    public static Date fromXML(String sXmlDateTime) throws DatatypeConfigurationException {
        Date date = null;
        DateTime dateTime = null;
        if (NullChecker.isNotNullish(sXmlDateTime)) {
            dateTime = new DateTime(sXmlDateTime);
            date = dateTime.toDate();
        }
        return date;
    }

    public static Date getUTCDate() {
        DateTime dateTime = new DateTime(DateTimeZone.UTC);
        return dateTime.toDate();
    }
}
