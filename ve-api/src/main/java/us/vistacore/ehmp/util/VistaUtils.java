package us.vistacore.ehmp.util;


import org.apache.commons.lang.time.DateUtils;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import static us.vistacore.ehmp.util.NullChecker.isNullish;

/**
 * @author seth.gainey
 */
public final class VistaUtils {

    /**
     * see history of unique FileMan date format at http://www.hardhats.org/history/hardhats.html
     */
    private static final int TIMSON_MAGIC_NUMBER = 17000000;

    private static final String[] ACCEPTED_FORMATS = {"yyyyMMdd", "yyyyMMddH", "yyyyMMddHH", "yyyyMMddHHmm", "yyyyMMddHHmmss", "yyyyMMdd.H", "yyyyMMdd.HH", "yyyyMMdd.HHmm", "yyyyMMdd.HHmmss"};

    private static final int DATE_LENGTH = 7;

    private VistaUtils() { }

    /**
     * Returns a Calendar representation of an internal VistA (i.e., "Timson") formatted date string
     * @param fmDatetime a 5 to 14 digit VistA date string in the format yyyyMMdd[HH[mm[ss]]]
     * @return a Calendar object, or {@code null}
     */
    public static Calendar fmDatetimeToDateDate(String fmDatetime) throws ParseException {
        if (isNullish(fmDatetime)) {
            return null;
        }
        Calendar calendar = GregorianCalendar.getInstance();
        Date date = DateUtils.parseDateStrictly(fmDatetimeToDateString(fmDatetime), ACCEPTED_FORMATS);
        calendar.setTime(date);
        return calendar;
    }

    private static String fmDatetimeToDateString(String fmDatetime) {
        int date = Integer.parseInt(fmDatetime.substring(0, DATE_LENGTH)) + TIMSON_MAGIC_NUMBER;
        if (fmDatetime.length() == DATE_LENGTH) {
            return Integer.toString(date);
        } else {
            return Integer.toString(date)  + fmDatetime.substring(DATE_LENGTH);
        }
    }
}
