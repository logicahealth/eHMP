package us.vistacore.vxsync.dod;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.datatype.DatatypeConfigurationException;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 * JMeadows QueryBean Builder.
 */
public abstract class AbstractJMeadowsQueryBuilder {
    protected static final Logger LOG = LoggerFactory.getLogger(AbstractJMeadowsQueryBuilder.class);

    /**
     * QueryBean parameter enumeration. For use with validateQueryBean helper method
     */
    public static enum QueryBeanParams {
        USER, PATIENT, RECORD_SITE_CODE, ITEM_ID, DATE_RANGE, STATUS, ACTIVE
    }

    protected Integer active;
    protected Calendar endDate;
    protected String itemId;
    protected Integer max;
    protected String recordSiteCode;
    protected String sortBy;
    protected Calendar startDate;
    protected String status;
    protected String requestingAppName;

    public AbstractJMeadowsQueryBuilder() {
        this.requestingAppName = "eHMP";
    }

    public abstract AbstractJMeadowsQueryBuilder patient(Object patient);

    public abstract AbstractJMeadowsQueryBuilder user(Object user);

    /**
     * Builds JMeadowsQuery Bean comprised of builder fields.
     *
     * @return JMeadows query bean
     */
    public abstract Object build();

    public AbstractJMeadowsQueryBuilder active(Integer active) {
        this.active = active;
        return this;
    }

    public AbstractJMeadowsQueryBuilder endDate(Calendar endDate) {
        this.endDate = endDate;
        return this;
    }

    public AbstractJMeadowsQueryBuilder itemId(String itemId) {
        this.itemId = itemId;
        return this;
    }

    public AbstractJMeadowsQueryBuilder max(Integer max) {
        this.max = max;
        return this;
    }

    public AbstractJMeadowsQueryBuilder recordSiteCode(String recordSiteCode) {
        this.recordSiteCode = recordSiteCode;
        return this;
    }

    public AbstractJMeadowsQueryBuilder sortBy(String sortBy) {
        this.sortBy = sortBy;
        return this;
    }

    public AbstractJMeadowsQueryBuilder startDate(Calendar startDate) {
        this.startDate = startDate;
        return this;
    }

    public AbstractJMeadowsQueryBuilder status(String status) {
        this.status = status;
        return this;
    }

    /**
     * Converts a Calendar instance into a XMLGregorianCalendar representation.
     *
     * @param cal Calendar to convert.
     * @return XMLGregorianCalendar instance.
     */
    protected XMLGregorianCalendar toXMLGregorianCalendar(Calendar cal) {
        if (cal == null) return null;

        XMLGregorianCalendar xmlCal = null;

        GregorianCalendar gregorianCalendar = new GregorianCalendar();
        gregorianCalendar.setTime(cal.getTime());

        try {
            xmlCal = DatatypeFactory.newInstance().newXMLGregorianCalendar(gregorianCalendar);
        } catch (DatatypeConfigurationException e) {
            LOG.error(e.getMessage(), e);
        }

        return xmlCal;
    }

    /**
     * Pushes the Calendar's time to 12:00AM (00:00:00) of the given date MM/DD/YYYY.
     * Please note a new Calendar instance is not returned, this method will write over the Calendar parameter's time
     *
     * @param cal
     * @return Calendar pushed to start of day
     */
    protected Calendar pushCalendarToStartOfDay(Calendar cal) {
        Calendar cal2 = Calendar.getInstance();
        cal2.setTimeInMillis(cal.getTimeInMillis());
        cal2.set(Calendar.HOUR_OF_DAY, 00);
        cal2.set(Calendar.MINUTE, 00);
        cal2.set(Calendar.SECOND, 00);

        cal = cal2;

        return cal;
    }

    /**
     * Pushes the Calendar's time to 11:59PM (23:59:59) of the given date MM/DD/YYYY.
     * Please note a new Calendar instance is not returned, this method will write over the Calendar parameter's time
     *
     * @param cal
     * @return Calendar pushed to end of day
     */
    protected Calendar pushCalendarToEndOfDay(Calendar cal) {
        Calendar cal2 = Calendar.getInstance();
        cal2.setTimeInMillis(cal.getTimeInMillis());
        cal2.set(Calendar.HOUR_OF_DAY, 23);
        cal2.set(Calendar.MINUTE, 59);
        cal2.set(Calendar.SECOND, 59);

        cal = cal2;

        return cal;
    }
}


