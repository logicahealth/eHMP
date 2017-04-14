package gov.va.hmp.healthtime.format;

import gov.va.hmp.healthtime.PointInTime;
import gov.va.hmp.healthtime.Precision;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.DateTimeFormatterBuilder;

/**
 *  Class for returning RFC822 Date Time Format "dd MMM yyyy hh:mm:ss" ;
 */
public class RFC822DateTimeFormat {

    private static DateTimeFormatter d, dt;

    public static DateTimeFormatter date() {
        if (d == null) {
            d = DateTimeFormat.forPattern("dd MMM yyyy");
        }
        return d;
    }


    /**
     *  Returns an RFC822 Date Time Format "dd MMM yyyy hh:mm:ss" which is agnostic of timezone
     */
    public static DateTimeFormatter dateTime() {
        if (dt == null) {
            dt = new DateTimeFormatterBuilder()
            .appendPattern("dd MMM yyyy hh:mm:ss")
//                    .appendLiteral(' ')
//                    .appendTimeZoneOffset("", false, 2, 2)
            .toFormatter();
        }
        return dt;
    }

    public static DateTimeFormatter forPointInTime(PointInTime t) {
        return forPrecision(t.getPrecision());
    }

    public static DateTimeFormatter forPrecision(Precision p) {
        switch (p) {
        case MILLISECOND:
            return dateTime();
        case SECOND:
            return dateTime();
        case MINUTE:
            return dateTime();
        case HOUR:
            return date();
        case DATE:
            return date();
        case MONTH:
            return date();
        default:
            return date();
        }
    }
}
