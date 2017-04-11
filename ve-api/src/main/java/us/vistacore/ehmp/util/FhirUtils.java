package us.vistacore.ehmp.util;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.hl7.fhir.instance.formats.JsonParser;
import org.hl7.fhir.instance.formats.Parser;
import org.hl7.fhir.instance.model.BackboneElement;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Decimal;
import org.hl7.fhir.instance.model.Duration;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.HumanName;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.String_;
import org.hl7.fhir.instance.model.Type;
import org.hl7.fhir.utilities.xhtml.NodeType;
import org.hl7.fhir.utilities.xhtml.XhtmlNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.model.transform.ModelTransformException;

import java.beans.Expression;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.UUID;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

/**
 * This is a set of utilities that help with working with FHIR objects.
 *
 * @author Seth Gainey
 * @author Les.Westberg
 */

public final class FhirUtils {

    private static Logger logger = LoggerFactory.getLogger(FhirUtils.class);

    public static final String REG_EXP_HL7V2_DATE_FORMAT = "^([1-9][0-9]{7})$";
    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS_INTERNAL = "([1-9][0-9]{11})";
    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS = "^" + REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS_INTERNAL + "$";
    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_INTERNAL = "([1-9][0-9]{13})";
    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS = "^" + REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_INTERNAL + "$";
    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_COMBINED = "^" + REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS_INTERNAL
                                                                             + "|"
                                                                             + REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_INTERNAL
                                                                             + "$";
//    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_AND_TIMEZONE_INTERNAL = "([1-9][0-9]{13})[\\+\\-][0-9]{4}";
//    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_AND_TIMEZONE = "^" + REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_AND_TIMEZONE_INTERNAL + "$";
//    public static final String REG_EXP_HL7V2_DATE_TIME_FORMAT_COMBINED = "^" + REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS_INTERNAL + "|" +
//                                                                               REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_INTERNAL + "|" +
//                                                                               REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS_AND_TIMEZONE_INTERNAL + "$";
    public static final String REG_EXP_FHIR_DATE = "-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?";
    public static final String REG_EXP_FHIR_DATE_TIME = "-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?|(24:00:00(\\.0+)?))(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?";
    public static final String RESOURCE_REFERENCE_ANCHOR_PREFIX = "#";

    private FhirUtils() {
    }

    /**
     * Return a SimpleDateFormat object for dates.
     *
     * @return The SimpleDateFormat to transform dates.
     */
    private static SimpleDateFormat getFhirDateFormatter() {
        return new SimpleDateFormat("yyyy-MM-dd");
    }

    /**
     * Return a simple date formatter to handle dates and times.
     *
     * @return The simple date formatter to handle dates and times.
     */
    private static SimpleDateFormat getFhirDateTimeFormatter() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
    }

    /**
     * Returns a FHIR Resource for a given JSON String or {@code null} if the string is empty or invalid
     */
    public static <T extends Resource> T jsonToResource(String string) {
        T resource = null;
        if (string != null) {
            try {
                resource = FhirUtils.jsonToResource(IOUtils.toInputStream(string, "UTF-8"));
            } catch (IOException e) {
                logger.error(e.getMessage());
            }
        }
        return resource;
    }

    /**
     * Returns a FHIR Resource for a given JSON InputStream or {@code null} if the input is empty or invalid
     *
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    public static <T extends Resource> T jsonToResource(InputStream input) throws IOException {
        T resource = null;
        if ((input != null) && (input.available() > 0)) {
            Parser parser = new JsonParser();
            try {
                resource = (T) parser.parse(input);
            } catch (Exception e) {
                logger.error("Failed to parse resource.  Error: " + e.getMessage(), e);
            }
        }
        return resource;
    }

    /**
     * Creates a narrative with a single XHTML div node
     *
     * @param status Status of narrative
     * @param content Text content of div node
     * @return Narrative
     */
    public static Narrative createNarrative(NarrativeStatus status, String content) {
        Narrative narrative = new Narrative();
        narrative.setStatusSimple(status);
        XhtmlNode node = createDivNode(content);
        narrative.setDiv(node);
        return narrative;
    }

    /**
     * This method creates a "Div" node.
     *
     * @param content The value to place in the node.
     * @return The node that was created.
     */
    public static XhtmlNode createDivNode(String content) {
        XhtmlNode node = new XhtmlNode(NodeType.Element);
        node.setName("div");
        node.addText(content);
        return node;
    }

    /**
     * This method creates a Coding object from the given information.
     *
     * @param sCode The code to put into the object.
     * @param sDisplay The display text for the code.
     * @param sSystemUri The Coding scheme/System URI
     * @return The coding object.
     */
    public static Coding createCoding(String sCode, String sDisplay, String sSystemUri) {
        Coding oCoding = new Coding();
        oCoding.setCodeSimple(sCode);
        oCoding.setDisplaySimple(sDisplay);
        oCoding.setSystemSimple(sSystemUri);
        return oCoding;
    }

    /**
     * This method creates a codeable concept with given list of coding objects.
     *
     * @param oaCoding The list of coding objects to place in the codeable concept.
     * @return The codeable concept created.
     */
    public static CodeableConcept createCodeableConcept(List<Coding> oaCoding) {
        CodeableConcept oCodeableConcept = new CodeableConcept();

        if (NullChecker.isNotNullish(oaCoding)) {
            oCodeableConcept.getCoding().addAll(oaCoding);
        }

        return oCodeableConcept;
    }

    /**
     * This method creates a codeable concept with given coding object.
     *
     * @param oCoding The coding to place in the codeable concept.
     * @return The codeable concept created.
     */
    public static CodeableConcept createCodeableConcept(Coding oCoding) {
        CodeableConcept oCodeableConcept = new CodeableConcept();

        if (oCoding != null) {
            oCodeableConcept.getCoding().add(oCoding);
        }

        return oCodeableConcept;
    }

    /**
     * This method creates a codeable concept with given coding values.
     *
     * @param sCode The code to put into the object.
     * @param sDisplay The display text for the code.
     * @param sSystemUri The Coding scheme/System URI
     * @return The codeable concept created.
     */
    public static CodeableConcept createCodeableConcept(String sCode, String sDisplay, String sSystemUri) {
        Coding oCoding = createCoding(sCode, sDisplay, sSystemUri);
        return createCodeableConcept(oCoding);
    }

    /**
     * This method creates a codeable concept with given coding values.
     *
     * @param sCode The code to put into the object.
     * @param sDisplay The display text for the code.
     * @param sSystemUri The Coding scheme/System URI
     * @param sText The text value associated with this codeable concept
     * @return The codeable concept created.
     */
    public static CodeableConcept createCodeableConcept(String sCode, String sDisplay, String sSystemUri, String sText) {
        CodeableConcept oCodeableConcept = createCodeableConcept(sCode, sDisplay, sSystemUri);
        oCodeableConcept.setTextSimple(sText);
        return oCodeableConcept;
    }

    /**
     * This method creates a codeable concept with given coding values.
     *
     * @param sText The text to put into the object.
     * @return The codeable concept created.
     */
    public static CodeableConcept createCodeableConcept(String sText) {
        CodeableConcept oCodeableConcept = new CodeableConcept();
        oCodeableConcept.setTextSimple(sText);
        return oCodeableConcept;
    }

    /**
     * FHIR has a separate string type called {@link String_} that derives from a class called {@link Type}. This method helps to create one of those strings.
     *
     * @param sValue The value to be placed in the string.
     * @return The FHIR version of a String.
     */
    public static String_ createFhirString(String sValue) {
        String_ oFhirString = new String_();
        oFhirString.setValue(sValue);
        return oFhirString;
    }

    /**
     * Extract the value from a Fhir {@link String_} value.
     *
     * @param sFhirValue The FHIR form of a string value.
     * @return The string value contained within the FHIR string.
     */
    public static String extractFhirStringValue(String_ sFhirValue) {
        String sValue = null;
        if (sFhirValue != null) {
            sValue = sFhirValue.getValue();
        }

        return sValue;
    }

    /**
     * This verifies that the value is a string type and if it is, it extracts the actual value from the string.
     *
     * @param oValue The FHIR string value.
     * @return The value contained within the FHIR string value.
     */
    public static String extractFhirStringValue(Type oValue) {
        String sValue = null;
        if (oValue instanceof String_) {
            sValue = ((String_) oValue).getValue();
        }
        return sValue;
    }

    /**
     * This checks the date to see if it is in HL7 2.x format. For our purposes we will allow the following valid HL7 formats:
     *
     *  yyyyMMdd
     *  yyyyMMddHHmm
     *  yyyyMMddHHmmss
     *  yyyyMMddHHmmss[+/-]zzzz
     *
     * @param sDateTime
     * @return
     */
    public static boolean isHL7V2DateFormat(String sDateTime) {
        boolean bResult = false;

        if (sDateTime != null) {
            bResult = sDateTime.matches(REG_EXP_HL7V2_DATE_FORMAT);
        }
        return bResult;
    }

    /**
     * This checks the date to see if it is in HL7 2.x format. For our purposes we will allow the following valid HL7 formats:
     *
     *  yyyyMMddHHmm
     *  yyyyMMddHHmmss
     *  yyyyMMddHHmmss[+/-]zzzz
     *
     * @param sDateTime
     * @return
     */
    public static boolean isHL7V2DateTimeFormat(String sDateTime) {
        boolean bResult = false;

        if (sDateTime != null) {
            bResult = sDateTime.matches(REG_EXP_HL7V2_DATE_TIME_FORMAT_COMBINED);
        }
        return bResult;
    }

    /**
     * This checks to see of the date is in a FHIR date format.
     *
     * @param sDate The date to be checked.
     * @return TRUE if the date is in FHIR date format.
     */
    public static boolean isFhirDateFormat(String sDate) {
        boolean bResult = false;

        if (sDate != null) {
            bResult = sDate.matches(REG_EXP_FHIR_DATE);
        }

        return bResult;
    }

    /**
     * This checks to see of the date is in a FHIR date and time format.
     *
     * @param sDateTime The date/time to be checked.
     * @return TRUE if the date is in FHIR date format.
     */
    public static boolean isFhirDateTimeFormat(String sDateTime) {
        boolean bResult = false;

        if (sDateTime != null) {
            bResult = sDateTime.matches(REG_EXP_FHIR_DATE_TIME);
        }

        return bResult;
    }

    /**
     * This method transforms an HL7DateTime to a FHIR Date Time string.
     *
     * @param sHL7DateTime The Date/Time in HL7 format.
     * @return The FHIR version of the Date/Time
     * @throws ModelTransformException This exception is thrown if there is a problem transforming the date/time.
     */
    public static String transformHL7V2DateTimeToFhirDateTime(String sHL7DateTime) throws ModelTransformException {
        String sFhirDateTime = "";

        if (isHL7V2DateTimeFormat(sHL7DateTime)) {
            SimpleDateFormat oHL7V2Format = null;
            SimpleDateFormat oFhirFormat = null;

            // We need to figure out which time format we have....
            // -----------------------------------------------------
            if (sHL7DateTime.matches(REG_EXP_HL7V2_DATE_TIME_FORMAT_NO_SECONDS)) {
                oHL7V2Format = new SimpleDateFormat("yyyyMMddHHmm");
                oFhirFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:00");
            } else if (sHL7DateTime.matches(REG_EXP_HL7V2_DATE_TIME_FORMAT_WITH_SECONDS)) {
                oHL7V2Format = new SimpleDateFormat("yyyyMMddHHmmss");
                oFhirFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            }

            if (oHL7V2Format != null) {
                try {
                    Date dtValue = oHL7V2Format.parse(sHL7DateTime);
                    sFhirDateTime = oFhirFormat.format(dtValue);
                } catch (Exception e) {
                    String sMessage = "Failed to transform an HL7 V2 Date to a FHIR Date format. Date value: " + sHL7DateTime + ".";
                    throw new ModelTransformException(sMessage, e);
                }
            }
        }

        return sFhirDateTime;
    }

    /**
     * This method transforms an HL7Date to a FHIR Date Time string.
     *
     * @param sHL7Date The Date/Time in HL7 format.
     * @return The FHIR format of the date.
     * @throws ModelTransformException
     */
    public static String transformHL7V2DateToFhirDateTime(String sHL7Date) throws ModelTransformException {
        String sFhirDateTime = "";

        if (isHL7V2DateFormat(sHL7Date)) {
            SimpleDateFormat oHL7V2Format = new SimpleDateFormat("yyyyMMdd");
            SimpleDateFormat oFhirFormat = new SimpleDateFormat("yyyy-MM-dd");
            try {
                Date dtValue = oHL7V2Format.parse(sHL7Date);
                sFhirDateTime = oFhirFormat.format(dtValue);
            } catch (Exception e) {
                String sMessage = "Failed to transform an HL7 V2 Date to a FHIR Date format. Date value: " + sHL7Date + ".";
                throw new ModelTransformException(sMessage, e);
            }
        }

        return sFhirDateTime;
    }

    /**
     * This method creates a FHIR DateTime string from the given string date.
     *
     * @param sDateTime The String form of the date and time to be loaded. It should be in one of two forms: 2005-07-19T08:01:09 or 2005-07-19
     * @return The date time in FHIR format.
     * @throws ModelTransformException This is thrown if there is a problem transforming the date/time.
     */
    public static String createFhirDateTimeString(String sDateTime) throws ModelTransformException {

        String sFhirDateTime = null;

        if (NullChecker.isNotNullish(sDateTime)) {
            if ((isFhirDateFormat(sDateTime)) || (isFhirDateTimeFormat(sDateTime))) {
                sFhirDateTime = sDateTime;
            } else if (isHL7V2DateFormat(sDateTime)) {
                sFhirDateTime = transformHL7V2DateToFhirDateTime(sDateTime);
            } else if (isHL7V2DateTimeFormat(sDateTime)) {
                sFhirDateTime = transformHL7V2DateTimeToFhirDateTime(sDateTime);
            } else {
                String sMessage = "Currently this only supports HL7 V2 and FHIR formats.  DateTime: " + sDateTime;
                throw new ModelTransformException(sMessage);
            }
        }

        return sFhirDateTime;
    }

    /**
     * This method creates a FHIR DateTime object from the given string date.
     *
     * @param sDateTime The String form of the date and time to be loaded. It should be in one of two forms: 2005-07-19T08:01:09 or 2005-07-19
     * @return
     * @throws ModelTransformException This is thrown if there is a problem transforming the date/time.
     */
    public static DateTime createFhirDateTime(String sDateTime) throws ModelTransformException {
        DateTime oDateTime = null;

        if (NullChecker.isNotNullish(sDateTime)) {
            String sFhirDateTime = createFhirDateTimeString(sDateTime);
            if (NullChecker.isNotNullish(sFhirDateTime)) {
                oDateTime = new DateTime();
                DateAndTime dateAndTime = null;
                try {
                    dateAndTime = new DateAndTime(sFhirDateTime);
                } catch (ParseException e) {
                    logger.warn("error parsing date/time", e);
                }
                oDateTime.setValue(dateAndTime);
            }
        }

        return oDateTime;
    }

    /**
     * This converts a date from a FHIR date time format to a java.util.date form.
     *
     * @param sFhirDateTime The FHIR date time string.
     * @return The Date/Time in java.util.date form.
     * @throws ModelTransformException Thrown if the date cannot be transformed.
     */
    public static Date transformFhirDateTimeToDate(String sFhirDateTime) throws ModelTransformException {
        Date dtDateTime = null;

        if (NullChecker.isNotNullish(sFhirDateTime)) {
            SimpleDateFormat oFormat = null;
            if (isFhirDateFormat(sFhirDateTime)) {
                oFormat = new SimpleDateFormat("yyyy-MM-dd");
            } else if (isFhirDateTimeFormat(sFhirDateTime)) {
                oFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            }

            if (oFormat != null) {
                try {
                    dtDateTime = oFormat.parse(sFhirDateTime);
                } catch (Exception e) {
                    String sMessage = "Failed to parse the FHIR date time.  Message: " + e.getMessage();
                    throw new ModelTransformException(sMessage, e);
                }
            }
        }

        return dtDateTime;
    }

    /**
     * This method creates a FHIR DateTime object from the given string date.
     *
     * @param sDateTime The String form of the date and time to be loaded. It should be in one of two forms: 2005-07-19T08:01:09 or 2005-07-19
     * @return The calendar representation of the date/time value.
     * @throws ModelTransformException This is thrown if there is a problem transforming the date/time.
     */
    public static Calendar createCalendarDateTime(String sDateTime) throws ModelTransformException {
        Calendar oCalDateTime = null;

        if (NullChecker.isNotNullish(sDateTime)) {
            String sFhirDateTime = createFhirDateTimeString(sDateTime);
            Date dtFhirDateTime = transformFhirDateTimeToDate(sFhirDateTime);
            if (dtFhirDateTime != null) {
                oCalDateTime = Calendar.getInstance();
                oCalDateTime.clear();
                oCalDateTime.setTime(dtFhirDateTime);
            }
        }

        return oCalDateTime;
    }

    /**
     * This method creates a FHIR DateTime object from the given date.
     *
     * @param dtDate The date to be placed into the FHIR date time.
     * @return The FHIR date time.
     * @throws ModelTransformException This is thrown if there is a problem transforming the date/time.
     */
    public static DateTime createFhirDateTime(java.util.Date dtDate) {
        DateTime oDateTime = null;

        if (dtDate != null) {
            oDateTime = new DateTime();
            SimpleDateFormat oFhirFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            String sFhirDateTime = oFhirFormat.format(dtDate);

            DateAndTime dateAndTime = null;
            try {
                dateAndTime = new DateAndTime(sFhirDateTime);
            } catch (ParseException e) {
                logger.warn("error parsing date/time", e);
            }

            oDateTime.setValue(dateAndTime);
        }

        return oDateTime;
    }

    /**
     * This method creates a FHIR DateTime object from the given date.
     *
     * @param oCalDate The date to be placed into the FHIR date time.
     * @return The FHIR date time.
     * @throws ModelTransformException This is thrown if there is a problem transforming the date/time.
     */
    public static DateTime createFhirDateTime(Calendar oCalDate) {
        DateTime oDateTime = null;
        if (oCalDate != null) {
            oDateTime = createFhirDateTime(oCalDate.getTime());
        }
        return oDateTime;
    }

    /**
     * Extract the date time string from a Fhir Date Time object.
     *
     * @param oFhirDateTime The FHIR form of a date time value.
     * @return The date time string within the FHIR date time value.
     */
    public static String extractFhirDateTimeValue(DateTime oFhirDateTime) {
        String sDateTime = null;
        if (oFhirDateTime != null && oFhirDateTime.getValue() != null && oFhirDateTime.getValue() != null) {
            if (hasTime(oFhirDateTime)) {
                sDateTime = getFhirDateTimeFormatter().format(toCalender(oFhirDateTime).getTime());
            } else {
                sDateTime = getFhirDateFormatter().format(toCalender(oFhirDateTime).getTime());
            }
        }

        return sDateTime;
    }

    public static Calendar toCalender(DateTime dateTime) {
        if (dateTime != null) {
            return toCalender(dateTime.getValue());
        } else {
            return null;
        }
    }

    public static Calendar toCalender(DateAndTime dateAndTime) {
        if (dateAndTime != null) {
            Calendar calendar = GregorianCalendar.getInstance();
            calendar.clear();
            calendar.set(dateAndTime.getYear(),
                         dateAndTime.getMonth() - 1,
                         dateAndTime.getDay());
            if (hasTime(dateAndTime)) {
                calendar.set(Calendar.HOUR, dateAndTime.getHour());
                calendar.set(Calendar.MINUTE, dateAndTime.getMinute());
                calendar.set(Calendar.SECOND, dateAndTime.getSecond());
            }
            return calendar;
        } else {
            return null;
        }
    }

    private static boolean hasTime(DateTime dateTime) {
        if (dateTime != null) {
            return hasTime(dateTime.getValue());
        } else {
            return false;
        }
    }

    private static boolean hasTime(DateAndTime dateAndTime) {
        return (dateAndTime != null
        && (dateAndTime.getHour() != 0 || dateAndTime.getMinute() != 0 || dateAndTime.getSecond() != 0));
    }

    /**
     * This verifies that the value is a DateTime type and if it is, it extracts the actual date time value from the string.
     *
     * @param oValue The FHIR date time value.
     * @return The date time string value contained within the FHIR date time object.
     */
    public static String extractFhirDateTimeValue(Type oValue) {
        String sDateTime = null;
        if ((oValue != null) && (oValue instanceof DateTime)) {
            DateTime dateTime = ((DateTime) oValue);
            sDateTime = extractFhirDateTimeValue(dateTime);
        }
        return sDateTime;
    }

    /**
     * Create an instance of the quantity with the given string value and units. Note that the value must be able to be converted into a Decimal value
     *
     * @param oValue A string representation of the value.
     * @param sUnits The units to associate with the quantity.
     * @return The quantity object that was created, or null if both sValue and sUnits are null/empty.
     * @throws java.lang.NumberFormatException if {@code sValue} is not parseable as a {@code BigDecimal}
     */
    public static Quantity createQuantity(BigDecimal oValue, String sUnits) {
        Quantity oQuantity = new Quantity();
        boolean bHaveData = false;

        if (oValue != null) {
            oQuantity.setValueSimple(oValue);
            bHaveData = true;
        }

        if (NullChecker.isNotNullish(sUnits)) {
            oQuantity.setUnitsSimple(sUnits);
            bHaveData = true;
        }

        if (bHaveData) {
            return oQuantity;
        } else {
            return null;
        }
    }

    /**
     * Create an instance of the quantity with the given string value and units. Note that the value must be able to be converted into a Decimal value
     *
     * @param sValue A string representation of the value.
     * @param sUnits The units to associate with the quantity.
     * @return The quantity object that was created, or null if both sValue and sUnits are null/empty.
     * @throws java.lang.NumberFormatException if {@code sValue} is not parseable as a {@code BigDecimal}
     */
    public static Quantity createQuantity(String sValue, String sUnits) throws NumberFormatException {
        BigDecimal oBigDecimalValue = null;
        if (NullChecker.isNotNullish(sValue)) {
            oBigDecimalValue = new BigDecimal(sValue);
        }
        return createQuantity(oBigDecimalValue, sUnits);
    }

    /**
     * Create a Quantity with the given value, units, and extension.
     *
     * @param oValue The value for the quantity.
     * @param sUnits The units for the quantity.
     * @param oExtension The extension to add into the quantity.
     * @return The Quantity that was created.
     */
    public static Quantity createQuantity(BigDecimal oValue, String sUnits, Extension oExtension) {
        Quantity oQuantity = createQuantity(oValue, sUnits);

        if (oExtension != null) {
            if (oQuantity == null) {
                oQuantity = new Quantity();
            }
            oQuantity.getExtensions().add(oExtension);
        }

        return oQuantity;
    }

    /**
     * This method creates a ResourceReference containing a reference to an external resource. Note that since this is external, this will NOT add '#' to the beginning of the ID.
     *
     * @param sResourceReferenceId The ID of the resource.
     * @return The Resource object for this ID.
     */
    public static ResourceReference createResourceReferenceExternal(String sResourceReferenceId) {
        ResourceReference oResourceReference = null;

        if (NullChecker.isNotNullish(sResourceReferenceId)) {
            oResourceReference = new ResourceReference();
            oResourceReference.setReferenceSimple(sResourceReferenceId);
        }

        return oResourceReference;
    }

    /**
     * This method creates a ResourceReference containing a reference to an external resource. Note that since this is external, this will NOT add '#' to the beginning of the ID.
     *
     * @param sResourceReferenceId The ID of the resource.
     * @return The Resource object for this ID.
     */
    public static ResourceReference createResourceReferenceExternal(String sResourceReferenceId, String display) {
        ResourceReference oResourceReference = null;

        if (NullChecker.isNotNullish(sResourceReferenceId)) {
            oResourceReference = new ResourceReference();
            oResourceReference.setReferenceSimple(sResourceReferenceId);
            if (isNotNullish(display)) {
                oResourceReference.setDisplaySimple(display);
            }
        }

        return oResourceReference;
    }

    /**
     * This method creates a ResourceReference containing the an anchor link to the specified Reference Id.
     * An anchor reference is a reference to a resource in the contained array.
     * It will prepend "#" to the ID to signify that it is in the contained array.
     *
     * @param sResourceReferenceId The ID of the resource.
     * @return The Resource object for this ID.
     */
    public static ResourceReference createResourceReferenceAnchor(String sResourceReferenceId) {
        return createResourceReferenceAnchor(sResourceReferenceId, null);
    }

    /**
     * This method creates a ResourceReference containing the an anchor link to the specified Reference Id.
     * An anchor reference is a reference to a resource in the contained array.
     * It will prepend "#" to the ID to signify that it is in the contained array.
     *
     * @param sResourceReferenceId The ID of the resource.
     * @param display the display text for the reference
     * @return The Resource object for this ID.
     */
    public static ResourceReference createResourceReferenceAnchor(String sResourceReferenceId, String display) {
        ResourceReference oResourceReference = null;

        if (NullChecker.isNotNullish(sResourceReferenceId)) {
            oResourceReference = new ResourceReference();
            String sLocalAnchor = createLocalResourceReferenceAnchorString(sResourceReferenceId);
            oResourceReference.setReferenceSimple(sLocalAnchor);
            if (isNotNullish(display)) {
                oResourceReference.setDisplaySimple(display);
            }
        }

        return oResourceReference;
    }

    /**
     * This method annotates a resource Id to create a local resource reference anchor for that ID.
     *
     * @param sResourceReferenceId The identifier for a resource.
     * @return The local anchor for that resource ID.
     */
    public static String createLocalResourceReferenceAnchorString(String sResourceReferenceId) {
        String sLocalAnchor = null;
        if (NullChecker.isNotNullish(sResourceReferenceId)) {
            sLocalAnchor = RESOURCE_REFERENCE_ANCHOR_PREFIX + sResourceReferenceId;
        }
        return sLocalAnchor;
    }

    /**
     * One call to optionally generate an identifier, add the resource to the parent's contained list, and return a reference
     * @param parentContainer  the resource to add the child as a contained resource
     * @param childResource the resource to create a reference to
     * @return the reference for the child resource
     */
    public static ResourceReference createLocalResourceReference(Resource parentContainer, Resource childResource) {

        String referenceId = null;

        //Locate or create/set referenceId
        if (childResource.getXmlId() == null) {
            referenceId = UUID.randomUUID().toString();
            childResource.setXmlId(referenceId);
        } else {
            referenceId = childResource.getXmlId();
        }

        parentContainer.getContained().add(childResource);

        return createResourceReferenceAnchor(referenceId);
    }

    /**
     * This method removes all extensions from the list that contain the given URL as the extension URL.
     *
     * @param oaExtension The list of extensions.
     * @param sExtUrl The URL that identifies the extensions to be removed.
     */
    public static void removeExtensions(List<Extension> oaExtension, String sExtUrl) {
        if ((NullChecker.isNotNullish(sExtUrl)) && (NullChecker.isNotNullish(oaExtension))) {
            List<Extension> oaExtToRemove = new ArrayList<Extension>();
            for (Extension oExtension : oaExtension) {
                if ((oExtension != null) && (sExtUrl.equals(oExtension.getUrlSimple()))) {
                    oaExtToRemove.add(oExtension);
                }
            }

            if (NullChecker.isNotNullish(oaExtToRemove)) {
                for (Extension oExtToRemove : oaExtToRemove) {
                    oaExtension.remove(oExtToRemove);
                }
            }
        }
    }

    /**
     * This method creates an extension for the specified URL with the given coding value.
     *
     * @param sUrl The URL for the extension
     * @param oCoding The coding value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, Coding oCoding) {
        Extension oExtension = null;
        if (NullChecker.isNotNullish(sUrl)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            oExtension.setValue(oCoding);
        }

        return oExtension;

    }

    /**
     * This method creates an extension for the specified URL with the given string value.
     *
     * @param sUrl The URL for the extension
     * @param sValue The string value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, String sValue) {
        Extension oExtension = null;
        if (NullChecker.isNotNullish(sUrl)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            oExtension.setValue(createFhirString(sValue));
        }

        return oExtension;

    }

    /**
     * This method creates an extension for the specified URL with the given DateTime value.
     *
     * @param sUrl The URL for the extension
     * @param oDateTime The string value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, DateTime oDateTime) {
        Extension oExtension = null;
        if (NullChecker.isNotNullish(sUrl)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            oExtension.setValue(oDateTime);
        }

        return oExtension;

    }

    /**
     * This method creates an extension for the specified URL with the given DateTime value.
     *
     * @param sUrl The URL for the extension
     * @param oDecimalValue The BigDecimal value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, BigDecimal oDecimalValue) {
        Extension oExtension = null;
        if ((NullChecker.isNotNullish(sUrl)) && (oDecimalValue != null)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            Decimal oDecimal = new Decimal();
            oDecimal.setValue(oDecimalValue);
            oExtension.setValue(oDecimal);
        }

        return oExtension;
    }

    /**
     * This method creates an extension for the specified URL with the given DateTime value.
     *
     * @param sUrl The URL for the extension
     * @param oQuantity The quantity value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, Quantity oQuantity) {
        Extension oExtension = null;
        if ((NullChecker.isNotNullish(sUrl)) && (oQuantity != null)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            oExtension.setValue(oQuantity);
        }

        return oExtension;
    }

    /**
     * This method creates an extension for the specified URL with the given DateTime value.
     *
     * @param sUrl The URL for the extension
     * @param oIntegerValue The string value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, Integer oIntegerValue) {
        Extension oExtension = null;
        if ((NullChecker.isNotNullish(sUrl)) && (oIntegerValue != null)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            org.hl7.fhir.instance.model.Integer oHL7Integer = new org.hl7.fhir.instance.model.Integer();
            oHL7Integer.setValue(oIntegerValue.intValue());
            oExtension.setValue(oHL7Integer);
        }

        return oExtension;
    }

    /**
     * This method creates an extension for the specified URL with the given Boolean value.
     *
     * @param sUrl The URL for the extension
     * @param booleanValue The value for the extension.
     * @return The extension that was created.
     */
    public static Extension createExtension(String sUrl, Boolean booleanValue) {
        Extension oExtension = null;
        if ((NullChecker.isNotNullish(sUrl)) && (booleanValue != null)) {
            oExtension = new Extension();
            oExtension.setUrlSimple(sUrl);
            org.hl7.fhir.instance.model.Boolean hl7BooleanValue = new org.hl7.fhir.instance.model.Boolean();
            hl7BooleanValue.setValue(booleanValue);
            oExtension.setValue(hl7BooleanValue);
        }
        return oExtension;
    }

    /**
     * Return the first occurrence of the extension that contains the given URL.
     *
     * @param oaExtension The list of extensions.
     * @param sExtUrl The URL of the extension that we are looking for.
     * @return The first extension found with this URL.
     */
    public static Extension findExtension(List<Extension> oaExtension, String sExtUrl) {
        Extension oExtResult = null;

        if ((NullChecker.isNotNullish(oaExtension)) && (NullChecker.isNotNullish(sExtUrl))) {
            for (Extension oExtension : oaExtension) {
                if ((oExtension != null) && (sExtUrl.equals(oExtension.getUrlSimple()))) {
                    oExtResult = oExtension;
                    break;
                }
            }
        }
        return oExtResult;
    }

    /**
     * Returns a list of contained resources of the specified type, or an empty list
     *
     * @param resource the resource from which to return contained resources
     * @param type the type of contained resource to return
     * @return list of resources or empty list
     */
    public static <T extends Resource> List<T> getContainedResources(Resource resource, Class<T> type) {
        return Lists.newArrayList(Iterables.filter(resource.getContained(), type));
    }

    /**
     * Return the resource with the specified resource ID. Note that the resource ID could be the raw ID or a FHIR internal resource tag (that is prefixed with a '#' character.
     *
     * @param oResource The resource whose contained array will be searched
     * @param sResourceId The ID of the resource being searched for.
     * @return The resource that matched the search criteria.
     */
    public static Resource getContainedResource(Resource oResource, String sResourceId) {
        Resource oFoundResource = null;

        if ((NullChecker.isNotNullish(sResourceId))) {
            String sSearchId = "";
            if (sResourceId.startsWith("#")) {
                sSearchId = sResourceId.substring(1);
            } else {
                sSearchId = sResourceId;
            }

            if ((oResource != null) && (NullChecker.isNotNullish(oResource.getContained()))) {
                for (Resource oContainedResource : oResource.getContained()) {
                    if (sSearchId.equals(oContainedResource.getXmlId())) {
                        oFoundResource = oContainedResource;
                        break;
                    }
                }
            }
        }

        return oFoundResource;
    }

    /**
     * Return the resource with the specified resource ID. Note that the resource ID could be the raw ID or a FHIR internal resource tag (that is prefixed with a '#' character.
     *
     * @param oResource The resource whose contained array will be searched
     * @param sResourceId The ID of the resource being searched for.
     * @param oClass The type of class that the resource should be.
     * @return The resource that matched the search criteria.
     */
    @SuppressWarnings("unchecked")
    public static <T extends Resource> T getContainedResource(Resource oResource, String sResourceId, Class<T> oClass) {
        Resource oFoundResource = getContainedResource(oResource, sResourceId);
        if (oClass.isInstance(oFoundResource)) {
            return (T) oFoundResource;
        } else {
            return null;
        }
    }

    /**
     * Return the resource with the specified resource ID. Note that the resource ID could be the raw ID or a FHIR internal resource tag (that is prefixed with a '#' character.
     *
     * @param oResource The resource whose contained array will be searched
     * @param oResRef The resource reference containing the ID of the resource being searched for.
     * @param oClass The type of class that the resource should be.
     * @return The resource that matched the search criteria.
     */
    public static <T extends Resource> T getContainedResource(Resource oResource, ResourceReference oResRef, Class<T> oClass) {
        if (oResRef != null) {
            return getContainedResource(oResource, oResRef.getReferenceSimple(), oClass);
        } else {
            return null;
        }
    }

    /**
     * This method creates an identifier using the given system and identifier values.
     *
     * @param sSystem The system for the identifier.
     * @param sIdentifier The identifier.
     * @return The Identifier that is being returned.
     */
    public static Identifier createIdentifier(String sSystem, String sIdentifier) {
        Identifier oIdentifier = null;

        if (NullChecker.isNotNullish(sIdentifier)) {
            oIdentifier = new Identifier();

            if (NullChecker.isNotNullish(sSystem)) {
                oIdentifier.setSystemSimple(sSystem);
            }

            oIdentifier.setValueSimple(sIdentifier);
        }

        return oIdentifier;

    }

    /**
     * Create a practitioner with the given information. Note that there must be a code or a name for the practitioner to be created.
     *
     * @param sPractitionerId The ID for the practitioner.
     * @param sPractitionerIdSystem The System to associate with the practitioner ID.
     * @param sPractitionerName The name of the practitioner.
     * @param sOrgId The internally generated organization ID.
     * @param sLocId The internally generated location ID.
     * @param sHl7RoleCode The HL7 code for the role of this practitioner.
     * @param sHl7RoleCodeSystem The coding system to associate with the role.
     * @param sHl7RoleDisplay The HL7 text for the role of this practitioner.
     * @return The Practitioner that was created.
     */
    public static Practitioner createPractitionerResource(String sPractitionerId, String sPractitionerIdSystem, String sPractitionerName,
                                                          String sOrgId, String sLocId, String sHl7RoleCode, String sHl7RoleCodeSystem,
                                                          String sHl7RoleDisplay) {
        // If we do not have an ID or Name - get out of here.
        // ---------------------------------------------------
        if ((NullChecker.isNullish(sPractitionerId)) && (NullChecker.isNullish(sPractitionerName))) {
            return null;
        }

        Practitioner oPractitioner = new Practitioner();

        UUID oReferenceId = UUID.randomUUID();
        oPractitioner.setXmlId(oReferenceId.toString());

        if (NullChecker.isNotNullish(sPractitionerId)) {
            Identifier oIdentifier = new Identifier();
            if (NullChecker.isNotNullish(sPractitionerIdSystem)) {
                oIdentifier.setSystemSimple(sPractitionerIdSystem);
            }
            oIdentifier.setValue(FhirUtils.createFhirString(sPractitionerId));
            oPractitioner.getIdentifier().add(oIdentifier);
        }

        if (NullChecker.isNotNullish(sPractitionerName)) {
            HumanName oHumanName = new HumanName();
            oHumanName.setTextSimple(sPractitionerName);
            oPractitioner.setName(oHumanName);
        }

        if (NullChecker.isNotNullish(sOrgId)) {
            ResourceReference oOrgRef = new ResourceReference();
            oOrgRef.setReferenceSimple("#" + sOrgId);
            oPractitioner.setOrganization(oOrgRef);
        }

        if (NullChecker.isNotNullish(sLocId)) {
            ResourceReference oLocRef = new ResourceReference();
            oLocRef.setReferenceSimple("#" + sLocId);
            oPractitioner.getLocation().add(oLocRef);
        }

        if ((NullChecker.isNotNullish(sHl7RoleCode)) || (NullChecker.isNotNullish(sHl7RoleDisplay))) {
            CodeableConcept oRoleConcept = FhirUtils.createCodeableConcept(sHl7RoleCode, sHl7RoleDisplay, sHl7RoleCodeSystem);
            oPractitioner.getRole().add(oRoleConcept);
        }

        return oPractitioner;
    }

    /**
     * This method creates an organization with the given information.
     *
     * @param sOrganizationId The ID of the organization.
     * @param sOrganizationIdSystem The system URL for the organization ID
     * @param sOrganizationName The name of the organization.
     * @return
     */
    public static Organization createOrganizationResource(String sOrganizationId, String sOrganizationIdSystem, String sOrganizationName) {
        // If we do not have an ID or name, get out of here.
        // ---------------------------------------------------
        if ((NullChecker.isNullish(sOrganizationId)) && (NullChecker.isNullish(sOrganizationName))) {
            return null;
        }

        Organization oOrg = new Organization();
        UUID oReferenceId = UUID.randomUUID();
        String sOrgRefId = oReferenceId.toString();
        oOrg.setXmlId(sOrgRefId);

        if (NullChecker.isNotNullish(sOrganizationId)) {
            Identifier oOrgIdentifier = new Identifier();
            if (NullChecker.isNotNullish(sOrganizationIdSystem)) {
                oOrgIdentifier.setSystemSimple(sOrganizationIdSystem);
            }
            oOrgIdentifier.setValueSimple(sOrganizationId);
            oOrg.getIdentifier().add(oOrgIdentifier);
        }

        if (NullChecker.isNotNullish(sOrganizationName)) {
            oOrg.setNameSimple(sOrganizationName);
        }

        return oOrg;
    }

    /**
     * This method creates an Location with the given information.
     *
     * @param sLocationId The ID of the Location.
     * @param sLocationIdSystem The system URL for the Location ID
     * @param sLocationName The name of the Location.
     * @return
     */
    public static Location createLocationResource(String sLocationId, String sLocationIdSystem, String sLocationName) {
        // If we do not have an ID or name, get out of here.
        // ---------------------------------------------------
        if ((NullChecker.isNullish(sLocationId)) && (NullChecker.isNullish(sLocationName))) {
            return null;
        }

        Location oLoc = new Location();
        UUID oReferenceId = UUID.randomUUID();
        String sLocRefId = oReferenceId.toString();
        oLoc.setXmlId(sLocRefId);

        if (NullChecker.isNotNullish(sLocationId)) {
            Identifier oLocIdentifier = new Identifier();
            if (NullChecker.isNotNullish(sLocationIdSystem)) {
                oLocIdentifier.setSystemSimple(sLocationIdSystem);
            }
            oLocIdentifier.setValueSimple(sLocationId);
            oLoc.setIdentifier(oLocIdentifier);
        }

        if (NullChecker.isNotNullish(sLocationName)) {
            oLoc.setNameSimple(sLocationName);
        }

        return oLoc;
    }

    /**
     * Return the reference ID in the given Resource Reference
     *
     * @param oResourceReference The resource reference object.
     * @return The resource reference ID if it exists.
     */
    public static String getReferenceId(ResourceReference oResourceReference) {
        String sResourceRefId = null;

        if ((oResourceReference != null) && (NullChecker.isNotNullish(oResourceReference.getReferenceSimple()))) {
            if (oResourceReference.getReferenceSimple().startsWith("#")) {
                sResourceRefId = oResourceReference.getReferenceSimple().substring(1);
            } else {
                sResourceRefId = oResourceReference.getReferenceSimple();
            }
        }

        return sResourceRefId;
    }

    /**
     * Return the reference ID in the first element of the given Resource Reference array.
     *
     * @param oaResourceReference The array of resource reference objects.
     * @return The resource reference ID of the first element if it exists.
     */
    public static String getReferenceId(List<ResourceReference> oaResourceReference) {
        String sResourceRefId = null;

        if ((oaResourceReference != null) && (NullChecker.isNotNullish(oaResourceReference))) {
            sResourceRefId = getReferenceId(oaResourceReference.get(0));
        }

        return sResourceRefId;
    }

    /**
     * This method will create a Duration object with the given values.
     *
     * @param oValue The value to place in the duration.
     * @param sSystem The system that scopes the code.
     * @param sCode The code associated with this duration.
     * @param sUnits The units associated with this duration.
     * @return The Duration object that was created.
     */
    public static Duration createDuration(BigDecimal oValue, String sSystem, String sCode, String sUnits) {
        Duration oDuration = null;

        if (oValue != null) {
            oDuration = new Duration();
            oDuration.setValueSimple(oValue);

            if (NullChecker.isNotNullish(sSystem)) {
                oDuration.setSystemSimple(sSystem);
            }

            if (NullChecker.isNotNullish(sCode)) {
                oDuration.setCodeSimple(sCode);
            }

            if (NullChecker.isNotNullish(sUnits)) {
                oDuration.setUnitsSimple(sUnits);
            }
        }

        return oDuration;

    }

    /**
     * This returns an HL7 Period with the given start time, end time, and if present an extension.
     *
     * @param oStartTime The start time to place in the period object.
     * @param oEndTime The end time to place in the period object.
     * @param oExtension The extension to place in the period object.
     * @return The HL7 FHIR period object that was created.
     */
    public static Period createPeriod(Calendar oStartTime, Calendar oEndTime, Extension oExtension) {
        Period oHL7Period = new Period();
        boolean bHaveData = false;

        if (oStartTime != null) {
            DateTime oStartDateTime = createFhirDateTime(oStartTime);
            oHL7Period.setStart(oStartDateTime);
            bHaveData = true;
        }

        if (oEndTime != null) {
            DateTime oEndDateTime = createFhirDateTime(oEndTime);
            oHL7Period.setEnd(oEndDateTime);
            bHaveData = true;
        }

        if (oExtension != null) {
            oHL7Period.getExtensions().add(oExtension);
            bHaveData = true;
        }

        if (bHaveData) {
            return oHL7Period;
        } else {
            return null;
        }
    }

    /**
     * This returns an HL7 Period with the given start time, end time, and if present an extension.
     *
     * @param oStartTime The start time to place in the period object.
     * @param oEndTime The end time to place in the period object.
     * @return The HL7 FHIR period object that was created.
     */
    public static Period createPeriod(Calendar oStartTime, Calendar oEndTime) {
        return createPeriod(oStartTime, oEndTime, null);
    }

    /**
     * Finds an {@link Identifier} with the proper {@link Identifier#label}.
     *
     * @param ids The {@link Collection} of {@link Identifier} objects to search.
     * @param label The value of the label of the desired {@link Identifier}.
     * @return The {@link Identifier#value} of the {@link Identifier} with the desired {@Identifier#label}, or null if no such Identifier is found.
     */
    public static String findIdentifierByLabel(Collection<Identifier> ids, String label) {
        if ((NullChecker.isNullish(label)) || (NullChecker.isNullish(ids))) {
            return null;
        }

        for (Identifier i : ids) {
            if (label.equalsIgnoreCase(i.getLabelSimple())) {
                return i.getValueSimple();
            }
        }

        return null;
    }

    /**
     * Utility to add an extension to a resource based on a bean and a Set of fields
     * @param element the element to add the extension to
     * @param bean the bean to get the value from
     * @param urlPrefix the url prefix to use in the extension
     * @param fieldNames the Iterable set of fields in the bean
     */
    public static void addExtensionsFromBeanProperties(BackboneElement element, Object bean, String urlPrefix, Iterable<String> fieldNames) {

        // standard lab extensions
        for (String fieldName : fieldNames) {
            String fieldValue = (String) getBeanPropertyValue(bean, fieldName);
            if (isNotNullish(fieldValue)) {
                Extension oExtension = new Extension();
                oExtension.setUrlSimple(urlPrefix + fieldName);
                oExtension.setValue(FhirUtils.createFhirString(fieldValue));
                element.getExtensions().add(oExtension);
            }
        }

    }

    /**
     * Gets a filed value from any type of bean using reflection
     * @param bean the Object to get the value from
     * @param propertyName the name of the bean field
     * @return null if error, else the value
     */
    public static Object getBeanPropertyValue(Object bean, String propertyName) {
        try {
            String getterName = "get" + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);
            Expression expr = new Expression(bean, getterName, new Object[0]);
            expr.execute();
            return expr.getValue();
        } catch (NoSuchMethodException e) {
            logger.info(e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }

        return null;
    }


    /**
     * Transfer contained resources.
     *
     * @param source the source
     * @param target the target
     */
    public static void transferContained(Resource source, Resource target) {
        target.getContained().addAll(source.getContained());
        source.getContained().clear();
    }


    /**
     * <p>Convert a <code>String</code> to a <code>BigDecimal</code>.</p>
     *
     * <p>Returns <code>null</code> if the string is <code>null</code>.</p>
     *
     * @param str  a <code>String</code> to convert, may be null
     * @return converted <code>BigDecimal</code> or null if decimal cannot be parsed
     * @throws NumberFormatException if the value cannot be converted
     */
    public static BigDecimal createBigDecimal(String str) {
        if (str != null) {
            if (!NumberUtils.isNumber(str.trim())) {
                return null;
            }
            return NumberUtils.createBigDecimal(str.trim());
        }
        return null;
    }
}
