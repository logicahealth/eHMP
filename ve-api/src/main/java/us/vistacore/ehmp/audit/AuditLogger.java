package us.vistacore.ehmp.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.util.NullChecker;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.UriInfo;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

public final class AuditLogger {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogger.class);
    private static final String CRLF = System.getProperty("line.separator");

    /**
     * Private constructor for static utility class
     */
    private AuditLogger() { }

    public enum LogCategory {
        AUDIT
    }

    /**
     * This method logs the given information to the Audit log file.
     *
     * @param sRemoteHost The remote host DNS name or IP address.
     * @param sRemoteLoginName The user login on the remote system.
     * @param sLocalLoginName The user login on the local system.
     * @param sHttpRequestLine The HTTP URL that was used to request this data.
     * @param iHttpStatusCode The Status code that was returned in response to this request.
     * @param responseMessageSize The Size of the message that was returned.
     * @param pid The PID if the request was specific to a patient.
     * @param dataDomain The type of data requested.
     * @param eLogCategory The category of log message.
     * @param additionalMessage An additional message to be output.
     */
    public static void log(String sRemoteHost, String sRemoteLoginName, String sLocalLoginName, String sHttpRequestLine, int iHttpStatusCode, int responseMessageSize,
                           String pid, String dataDomain, LogCategory eLogCategory, String additionalMessage) {
        String sTempRemoteLoginName = sRemoteLoginName;
        if (NullChecker.isNullish(sRemoteLoginName)) {
            sTempRemoteLoginName = "-";
        }

        String sTempLocalLoginName = sLocalLoginName;
        if (NullChecker.isNullish(sLocalLoginName)) {
            sTempLocalLoginName = "-";
        }

        Date dtNow = new Date();
        SimpleDateFormat oFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss,SSS");

        String sTempPid = pid;
        if (NullChecker.isNullish(pid)) {
            sTempPid = "-";
        }

        String sTempDataDomain = dataDomain;
        if (NullChecker.isNullish(dataDomain)) {
            sTempDataDomain = "-";
        }

        LOGGER.info(AuditAppenderFactory.AUDIT_MARKER, sRemoteHost + " "
                + sTempRemoteLoginName + " "
                + sTempLocalLoginName + " "
                + "[" + oFormat.format(dtNow) + "]" + " "
                + "\"" + sHttpRequestLine + "\"" + " "
                + iHttpStatusCode + " "
                + responseMessageSize + " "
                + sTempPid + " "
                + sTempDataDomain + " "
                + eLogCategory.toString() + " "
                + "\"" + additionalMessage + "\"");
    }

    /**
     * Create an audit log message from the given content.
     *
     * @param user The user information.
     * @param httpServletRequest
     * @param httpStatusCode The Status code that is being returned.
     * @param responseMessageSize The size of the response message being returned.
     * @param eLogCategory The category of this log message.
     * @param additionalMessage any additional Message
     * @param pid The patient ID
     * @param dataDomain The type of data being requested
     */
    public static void log(User user, HttpServletRequest httpServletRequest, int httpStatusCode, int responseMessageSize,
                           LogCategory eLogCategory, String additionalMessage, String pid, String dataDomain) {

        String sRemoteHost = "";
        String sRemoteUser = "";
        String sLocalLoginName = "";
        if (httpServletRequest != null) {
            sRemoteHost = httpServletRequest.getRemoteHost();
            sRemoteUser = httpServletRequest.getRemoteUser();
        }

        if (user != null) {
            sLocalLoginName = user.getAccessCode();
        }

        String sRequestURLInfo = formatRequestURLInfo(httpServletRequest);

        log(sRemoteHost, sRemoteUser, sLocalLoginName, sRequestURLInfo, httpStatusCode, responseMessageSize, pid, dataDomain, eLogCategory, additionalMessage);
    }


    /**
     * Create an audit log message from the given content.
     *
     * @param user The user information.
     * @param httpHeaders The http headers.
     * @param httpServletRequest
     * @param uriInfo URL information.
     * @param httpStatusCode The Status code that is being returned.
     * @param responseMessageSize The size of the response message being returned.
     * @param eLogCategory The category of this log message.
     * @param additionalMessage any additional Message
     * @param pid The patient ID
     * @param ack The acknowledgment (break the glass) flag.
     */
    public static void log(User user, HttpHeaders httpHeaders, HttpServletRequest httpServletRequest, UriInfo uriInfo, int httpStatusCode, int responseMessageSize,
                           LogCategory eLogCategory, String additionalMessage, String pid, boolean ack) {

        LOGGER.debug(AuditAppenderFactory.AUDIT_MARKER, additionalMessage + CRLF
                + "  " + "httpStatus: " + httpStatusCode + CRLF
                + "  " + "responseMessageSize: " + responseMessageSize + CRLF
                + "  " + "logCategory: " + eLogCategory + CRLF
                + "  " + "pid: " + pid + CRLF
                + "  " + "ack: " + ack + CRLF
                + formatCommonParams(user, httpHeaders, httpServletRequest, uriInfo));
        log(user, httpServletRequest, httpStatusCode, responseMessageSize, eLogCategory, additionalMessage, pid, null);
    }

    /**
     * Create an audit log message from the given content.
     *
     * @param user The user information.
     * @param httpHeaders The http headers.
     * @param httpServletRequest
     * @param uriInfo URL information.
     * @param httpStatusCode The Status code that is being returned.
     * @param responseMessageSize The size of the response message being returned.
     * @param eLogCategory The category of this log message.
     * @param additionalMessage any additional Message
     * @param pid The patient ID
     * @param dataDomain The search domain
     * @param searchText The search text
     * @param ack The acknowledgment (break the glass) flag.
     */
    public static void log(User user, HttpHeaders httpHeaders, HttpServletRequest httpServletRequest, UriInfo uriInfo, int httpStatusCode, int responseMessageSize,
                           LogCategory eLogCategory, String additionalMessage, String pid, String dataDomain, String searchText, boolean ack) {
        LOGGER.debug(AuditAppenderFactory.AUDIT_MARKER, additionalMessage + CRLF
                + "  " + "httpStatus: " + httpStatusCode + CRLF
                + "  " + "responseMessageSize: " + responseMessageSize + CRLF
                + "  " + "logCategory: " + eLogCategory + CRLF
                + "  " + "pid: " + pid + CRLF
                + "  " + "searchText: " + searchText + CRLF
                + "  " + "dataDomain: " + dataDomain + CRLF
                + "  " + "ack: " + ack + CRLF
                + formatCommonParams(user, httpHeaders, httpServletRequest, uriInfo));
        log(user, httpServletRequest, httpStatusCode, responseMessageSize, eLogCategory, additionalMessage, pid, dataDomain);
    }

    /**
     * Create an audit log message from the given content.
     *
     * @param user The user information.
     * @param httpHeaders The http headers.
     * @param httpServletRequest
     * @param httpStatusCode The Status code that is being returned.
     * @param responseMessageSize The size of the response message being returned.
     * @param eLogCategory The category of this log message.
     * @param additionalMessage any additional Message
     * @param uriInfo URL information.
     * @param pid The patient ID
     * @param dataDomain The domain being searched for
     * @param ack The acknowledgment (break the glass) flag.
     */
    public static void log(User user, HttpHeaders httpHeaders, HttpServletRequest httpServletRequest, UriInfo uriInfo, int httpStatusCode, int responseMessageSize,
                           LogCategory eLogCategory, String additionalMessage, String pid, String dataDomain, boolean ack) {
        LOGGER.debug(AuditAppenderFactory.AUDIT_MARKER, additionalMessage + CRLF
                + "  " + "httpStatus: " + httpStatusCode + CRLF
                + "  " + "responseMessageSize: " + responseMessageSize + CRLF
                + "  " + "logCategory: " + eLogCategory + CRLF
                + "  " + "pid: " + pid + CRLF
                + "  " + "dataDomain: " + dataDomain + CRLF
                + "  " + "ack: " + ack + CRLF
                + formatCommonParams(user, httpHeaders, httpServletRequest, uriInfo));
        log(user, httpServletRequest, httpStatusCode, responseMessageSize, eLogCategory, additionalMessage, pid, dataDomain);
    }

    /**
     * Create an audit log message from the given content.
     *
     * @param user The user information.
     * @param httpHeaders The http headers.
     * @param httpServletRequest
     * @param uriInfo URL information.
     * @param httpStatusCode The Status code that is being returned.
     * @param responseMessageSize The size of the response message being returned.
     * @param eLogCategory The category of this log message.
     * @param additionalMessage any additional Message
     * @param fullName The full name of the patient
     * @param count
     * @param skip
     * @param resultsRecordType
     */
    public static void log(User user, HttpHeaders httpHeaders, HttpServletRequest httpServletRequest, UriInfo uriInfo, int httpStatusCode, int responseMessageSize,
                    LogCategory eLogCategory, String additionalMessage, String dataDomain, String fullName, int count, int skip, String resultsRecordType) {
        LOGGER.debug(AuditAppenderFactory.AUDIT_MARKER, additionalMessage + CRLF
                + "  " + "httpStatus: " + httpStatusCode + CRLF
                + "  " + "responseMessageSize: " + responseMessageSize + CRLF
                + "  " + "logCategory: " + eLogCategory + CRLF
                + "  " + "fullName: " + fullName + CRLF
                + "  " + "count: " + count + CRLF
                + "  " + "skip: " + skip + CRLF
                + "  " + "resultsRecordType: " + resultsRecordType + CRLF
                + formatCommonParams(user, httpHeaders, httpServletRequest, uriInfo));
        log(user, httpServletRequest, httpStatusCode, responseMessageSize, eLogCategory, additionalMessage, null, dataDomain);
    }

    /**
     * This method formats the URL in the following way:  <method> <URI>?<queryString> <protocol>
     *
     * @param httpServletRequest
     * @return The
     */
    private static String formatRequestURLInfo(HttpServletRequest httpServletRequest) {
        String sRequestURLInfo = "";

        if (httpServletRequest != null) {
            String sFullURL = httpServletRequest.getRequestURI();
            if (NullChecker.isNotNullish(httpServletRequest.getQueryString())) {
                sFullURL = httpServletRequest.getRequestURI() + "?" + httpServletRequest.getQueryString();
            }
            sRequestURLInfo = httpServletRequest.getMethod() + " "
                    + sFullURL + " "
                    + httpServletRequest.getProtocol();
        }

        return sRequestURLInfo;
    }

    /**
     * Return a string output containing the contents of the common parameters.
     *
     * @param user The user information.
     * @param httpHeaders The http headers.
     * @param httpServletRequest
     * @param uriInfo URL information.
     * @return The string containing the contents of the parameters.
     */
    private static String formatCommonParams(User user, HttpHeaders httpHeaders, HttpServletRequest httpServletRequest, UriInfo uriInfo) {
        return formatUserInfoFull(user, "  ") + CRLF
                + formatHttpHeadersFull(httpHeaders, "  ") + CRLF
                + formatHttpServletRequestFull(httpServletRequest, "  ") + CRLF
                + formatUriInfoFull(uriInfo, "  ") + CRLF;
    }


    /**
     * Return the list of strings as a string where each string is on its own line.
     *
     * @param oaString The list of strings
     * @param sPrefixChars The prefix to put in front of each string.
     * @return The formatted string.
     */
    private static String formatStringList(List<String> oaString, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (NullChecker.isNotNullish(oaString)) {
            int i = 0;
            for (String oValue : oaString) {
                sbResponse.append(sPrefixChars + "[" + i + "]: " + oValue + CRLF);
                i++;
            }
        }

        return sbResponse.toString();
    }

    /**
     * Return the list of strings as a string where each string is on its own line.
     *
     * @param oaString The list of strings
     * @param sPrefixChars The prefix to put in front of each string.
     * @return The formatted string.
     */
    private static String formatStringList(String[] oaString, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (oaString != null) {
            int i = 0;
            for (String oValue : oaString) {
                sbResponse.append(sPrefixChars + "[" + i + "]: " + oValue + CRLF);
                i++;
            }
        }

        return sbResponse.toString();
    }

    /**
     * Return the list of strings as a string where each string is on its own line.
     *
     * @param multiMapString The map of strings
     * @param sPrefixChars The prefix to put in front of each string.
     * @return The formatted string.
     */
    private static String formatStringMultivaluedMap(MultivaluedMap<String, String> multiMapString, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (NullChecker.isNotNullish(multiMapString)) {
            for (String sKey : multiMapString.keySet()) {
                sbResponse.append(sPrefixChars + sKey + ":" + CRLF + formatStringList(multiMapString.get(sKey), sPrefixChars + "  ") + CRLF);
            }
        }

        return sbResponse.toString();
    }

    /**
     * Return the list of strings as a string where each string is on its own line.
     *
     * @param mapStringList The map of strings
     * @param sPrefixChars The prefix to put in front of each string.
     * @return The formatted string.
     */
    private static String formatStringMapToStringList(Map<String, String[]> mapStringList, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (NullChecker.isNotNullish(mapStringList)) {
            for (String sKey : mapStringList.keySet()) {
                sbResponse.append(sPrefixChars + sKey + ":" + CRLF + formatStringList(mapStringList.get(sKey), sPrefixChars + "  ") + CRLF);
            }
        }

        return sbResponse.toString();
    }

    /**
     * This places the data from the UriInfo object into a string.  Each line is prefixed by the prefix chars.
     *
     * @param uriInfo The uri info.
     * @param sPrefixChars The prefix characters to prepend to each line.
     * @return The string that was created.
     */
    private static String formatUriInfoFull(UriInfo uriInfo, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (uriInfo != null) {
            sbResponse.append(sPrefixChars + "UriInfo:" + CRLF);
            sbResponse.append(sPrefixChars + "  " + "path: " + uriInfo.getPath() + CRLF);
            if (uriInfo.getAbsolutePath() != null) {
                sbResponse.append(sPrefixChars + "  " + "absolutePath: " + uriInfo.getAbsolutePath().toASCIIString() + CRLF);
            } else {
                sbResponse.append(sPrefixChars + "  " + "absolutePath: null" + CRLF);
            }

            if (uriInfo.getBaseUri() != null) {
                sbResponse.append(sPrefixChars + "  " + "baseUri: " + uriInfo.getBaseUri().toASCIIString() + CRLF);
            } else {
                sbResponse.append(sPrefixChars + "  " + "baseUri: null" + CRLF);
            }
            sbResponse.append(sPrefixChars + "  " + "pathParmeters: " + CRLF + formatStringMultivaluedMap(uriInfo.getPathParameters(), sPrefixChars + "    ") + CRLF);
            sbResponse.append(sPrefixChars + "  " + "queryParmeters: " + CRLF + formatStringMultivaluedMap(uriInfo.getQueryParameters(), sPrefixChars + "    ") + CRLF);

            if (uriInfo.getRequestUri() != null) {
                sbResponse.append(sPrefixChars + "  " + "requestUri: " + uriInfo.getRequestUri().toASCIIString() + CRLF);
            } else {
                sbResponse.append(sPrefixChars + "  " + "requestUri: null" + CRLF);
            }
        } else {
            sbResponse.append(sPrefixChars + "UriInfo: null" + CRLF);
        }

        return sbResponse.toString();
    }


    /**
     * This places the data from the http servlet request object into a string.  Each line is prefixed by the prefix chars.
     *
     * @param httpServletRequest The HTTP servlet request information.
     * @param sPrefixChars The prefix characters to prepend to each line.
     * @return The string that was created.
     */
    private static String formatHttpServletRequestFull(HttpServletRequest httpServletRequest, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (httpServletRequest != null) {
            sbResponse.append(sPrefixChars + "HttpServletRequest:" + CRLF);
            sbResponse.append(sPrefixChars + "  " + "remoteAddr: " + httpServletRequest.getRemoteAddr() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "remoteHost: " + httpServletRequest.getRemoteHost() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "remotePort: " + httpServletRequest.getRemotePort() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "remoteUser: " + httpServletRequest.getRemoteUser() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "requestedSessionId: " + httpServletRequest.getRequestedSessionId() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "requestURI: " + httpServletRequest.getRequestURI() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "requestURL: " + httpServletRequest.getRequestURL() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "contentType: " + httpServletRequest.getContentType() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "contextPath: " + httpServletRequest.getContextPath() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "localAddr: " + httpServletRequest.getLocalAddr() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "localName: " + httpServletRequest.getLocalName() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "localPort: " + httpServletRequest.getLocalPort() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "method: " + httpServletRequest.getMethod() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "pathInfo: " + httpServletRequest.getPathInfo() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "pathTranslated: " + httpServletRequest.getPathTranslated() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "protocol: " + httpServletRequest.getProtocol() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "queryString: " + httpServletRequest.getQueryString() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "scheme: " + httpServletRequest.getScheme() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "serverName: " + httpServletRequest.getServerName() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "serverPort: " + httpServletRequest.getServerPort() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "servletPath: " + httpServletRequest.getServletPath() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "parameters: " + CRLF + formatStringMapToStringList(httpServletRequest.getParameterMap(), sPrefixChars + "    ") + CRLF);
        } else {
            sbResponse.append(sPrefixChars + "HttpServletRequest: null" + CRLF);
        }

        return sbResponse.toString();
    }

    /**
     * This places the data from the http headers object into a string.  Each line is prefixed by the prefix chars.
     *
     * @param httpHeaders The HTTP headers information.
     * @param sPrefixChars The prefix characters to prepend to each line.
     * @return The string that was created.
     */
    private static String formatHttpHeadersFull(HttpHeaders httpHeaders, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (httpHeaders != null) {
            sbResponse.append(sPrefixChars + "HttpHeaders:" + CRLF);
            sbResponse.append(sPrefixChars + "  " + "requestHeaders: " + CRLF + formatStringMultivaluedMap(httpHeaders.getRequestHeaders(), sPrefixChars + "    ") + CRLF);
        } else {
            sbResponse.append(sPrefixChars + "HttpHeaders: null" + CRLF);
        }

        return sbResponse.toString();
    }

    /**
     * This places the data from the user object into a string.  Each line is prefixed by the prefix chars.
     *
     * @param user The user information.
     * @param sPrefixChars The prefix characters to prepend to each line.
     * @return The string that was created.
     */
    private static String formatUserInfoFull(User user, String sPrefixChars) {
        StringBuffer sbResponse = new StringBuffer();

        if (user != null) {
            sbResponse.append(sPrefixChars + "User:" + CRLF);
            sbResponse.append(sPrefixChars + "  " + "accessCode: " + user.getAccessCode() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "verifyCode: " + user.getVerifyCode() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "siteCode: " + user.getSiteCode() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "cprsCorTabAccess: " + user.getCprsCorTabAccess() + CRLF);
            sbResponse.append(sPrefixChars + "  " + "cprsRptTabAccess: " + user.getCprsRptTabAccess() + CRLF);
        } else {
            sbResponse.append(sPrefixChars + "User: null" + CRLF);
        }

        return sbResponse.toString();
    }
}
