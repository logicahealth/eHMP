package us.vistacore.ehmp.util;

import us.vistacore.ehmp.model.transform.ModelTransformException;

import com.google.gson.JsonElement;

import java.math.BigDecimal;
import java.util.StringTokenizer;

public final class VprExtractionUtils {
    public static final int DFN_TOKEN_INDEX = 4;  // cardinal position of the DFN/IEN in the UID string segments
    public static final String PATIENT_REFERENCE_PREFIX = "Patient/";
    public static final String VUID_PREFIX = "urn:va:vuid:";

    private VprExtractionUtils() { }

    /**
     * This method returns the Subject reference by extracting it from the structured UID.  Note that the UID is expected
     * to be in the following format: urn:va:<domain>:<sitehash>:<dfn>:<ien>
     *
     * @param sUid The UID value
     * @return The subject reference value created from the DFN in the UID.
     */
    public static String extractSubjectReferenceFromUid(String sUid) {
        String sSubjectReference = null;

        if (NullChecker.isNotNullish(sUid)) {
            String[] saToken = sUid.split(":");
            if ((saToken.length > DFN_TOKEN_INDEX) && (NullChecker.isNotNullish(saToken[DFN_TOKEN_INDEX]))) {
                sSubjectReference = PATIENT_REFERENCE_PREFIX + saToken[DFN_TOKEN_INDEX];
            }
        }

        return sSubjectReference;
    }

    /**
     * This method extracts the VUID value from a URN that contains the VUID.  If the VUID does not exist
     * then null is returned.  The URN is in the form of: "urn:va:vuid:99999".  This routine will handle
     * various null cases:  sUrnVuid = null, or sUrnVuid = "urn:uid:vuid:", or sUrnVuid = "".  All of these
     * will return null.
     *
     * @param sUrnVuid The URN containing a VUID.  It will be in the format of:  "urn:va:vuid:99999".
     * @return The actual VUID value.
     */
    public static String extractVuid(String sUrnVuid) {
        String sVuid = null;

        if (NullChecker.isNotNullish(sUrnVuid)) {
            if (sUrnVuid.startsWith(VUID_PREFIX)) {
                if (sUrnVuid.length() > VUID_PREFIX.length()) {
                    sVuid = sUrnVuid.substring(VUID_PREFIX.length());
                }
            } else {
                sVuid = sUrnVuid;
            }
        }

        return sVuid;
    }

    /**
     * If a string is a composite of a number and text, this method will extract the number.  Note that if
     * the string is made up of multiple number tokens it will throw an exception.
     *
     * @param sText The text to be parsed.
     * @return The numeric digits.
     * @throws ModelTransformException This exception is thrown if the string is made up of multiple
     *                                 number tokens and does not contain a single number.
     */
    public static BigDecimal extractNumber(String sText) throws ModelTransformException {
        BigDecimal oNumericValue = null;

        if (NullChecker.isNotNullish(sText)) {
//            String saToken[] = sText.trim().split("[a-zA-Z /-*&()^%$#@!~+={}:;<>,?\\|'\"]+"); // Please note a space is there after Z
            String[] saToken = sText.trim().split("[a-zA-Z /\\-\\&\\(\\)\\^\\%\\$#@!~\\+\\=\\{\\}:;<>,?\\|'\"\\*\\\\\\[\\]]+"); // Please note a space is there after Z

            // Note that this split will leave empty tokens each time it finds a match to the reg expresson,
            // unless those matches are at the end.  It will remove those.  Thus our token array will contain
            // numbers and empty strings.   If we get exactly one number token, we are good.  If we get more
            // than one, then we need to throw an exception.
            //------------------------------------------------------------------------------------------------
            int iNumValues = 0;
            int iIndexOfNum = -1;
            for (int i = 0; i < saToken.length; i++) {
                if (saToken[i].length() > 0) {
                    iIndexOfNum = i;
                    iNumValues++;
                }
            }

            if (iNumValues > 1) {
                throw new ModelTransformException("The string value '" + sText + "' contained more than one numeric value.  This routine cannot be used for this.");
            }

            if (iIndexOfNum >= 0) {
                oNumericValue = new BigDecimal(saToken[iIndexOfNum]);
            }
        }

        return oNumericValue;
    }

    /**
     * If a string is a composite of a number and text, this method will extract the text.  Note that if
     * the string is made up of multiple text tokens it will concatenate them together separated by a space.
     *
     * @param sText The text to be parsed.
     * @return The text without any numbers.
     * @throws ModelTransformException This exception is thrown if the string is made up of multiple
     *                                 number tokens and does not contain a single number.
     */
    public static String extractNonNumericValues(String sText) {
        String sReturnText = null;

        if (NullChecker.isNotNullish(sText)) {
            String[] saToken = sText.trim().split("[0-9.]+"); // Please note a space is there after Z

            // Note that this split will leave empty tokens each time it finds a match to the reg expresson,
            // unless those matches are at the end.  It will remove those.  Thus our token array will contain
            // strings without numbers and empty strings.   We will concatenate them together with a separating
            // space and return the String without the numbers.
            //------------------------------------------------------------------------------------------------
            StringBuffer sbReturnText = new StringBuffer();
            for (int i = 0; i < saToken.length; i++) {
                if (saToken[i].length() > 0) {
                    if (sbReturnText.length() > 0) {
                        sbReturnText.append(" ");
                    }
                    sbReturnText.append(saToken[i].trim());
                }
            }

            if (sbReturnText.length() > 0) {
                sReturnText = sbReturnText.toString();
            } else {
                sReturnText = "";
            }

        }

        return sReturnText;
    }

    public static String extractIcnFromDemographicsJson(JsonElement patientData) {
        JsonElement summary = patientData.getAsJsonObject().getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject().get("summary");
        StringTokenizer summaryTokens = new StringTokenizer(summary.toString(), " \t\n\r\f{}[]");
        while (summaryTokens.hasMoreTokens()) {
            String token = summaryTokens.nextToken();
            if (token.contains("V")) {
                return (token.split("V")[0]);
            }
        }
        return null;
    }

}
