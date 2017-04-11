/**
 * 
 */
package com.cognitive.cds.utils.log.filter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

/**
 * Set MDC  X-Request-ID and SessionID
 * Nov 22, 2016
 * 
 */
public class CDSDashboardRequestIdFilter implements Filter {

	private static final Logger LOG = LoggerFactory.getLogger(CDSDashboardRequestIdFilter.class);
	//"2016-10-19T17:38:29.089Z"
	public static final DateTimeFormatter DATEFORMATTER = DateTimeFormatter.ISO_INSTANT;
	private static String hostname;

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		if(hostname==null) {
			try {
				InetAddress localHost = InetAddress.getLocalHost();
				hostname = localHost.getHostName();
			} catch (UnknownHostException e) {
				LOG.error("LocalHost could not be resolved to an address.",e );
			}
		}
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException 
	{
		HttpServletResponseWrapper wrapper = new HttpServletResponseWrapper((HttpServletResponse)response);
		try{
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			String requestId = httpRequest.getHeader("X-Request-ID");
			String msg = "INCOMING REQUEST:";
			if(StringUtils.isEmpty(requestId)) {
				requestId = generateRequestId();
				wrapper.addHeader("X-Request-ID", requestId);
				msg = "SERVICE REQUEST:";
			}

	        Set<String> keys = new HashSet<String>(); 
	        	put(keys, "dateTime", DATEFORMATTER.format(Instant.now()), true);
	            put(keys, "address", httpRequest.getRequestURL().toString(), true);
	            put(keys, "httpMethod", httpRequest.getMethod(), true);
	            put(keys, "path", getPathAndQueryInfo(httpRequest.getRequestURL().toString()), true);
	            put(keys, "requestId", StringUtils.defaultIfEmpty(requestId, ""), false);			
	            put(keys, "sid", StringUtils.defaultIfEmpty(httpRequest.getSession().getId(), ""), false);			
	            put(keys, "hostname", StringUtils.defaultIfEmpty(hostname, "cdsdashboard"), false);
	            put(keys, "context", StringUtils.defaultIfEmpty(httpRequest.getContextPath(), " ").substring(1), false);
			
			LOG.info(msg);
            for (String key : keys) {
                MDC.remove(key);
            }

		}
		catch(Exception e) {
			LOG.error(e.getMessage(), e);
		}
		finally {
			chain.doFilter(request, wrapper);
		}
	}

	@Override
	public void destroy() {
	}

	
	private static Pattern pathMatch = Pattern.compile("http://.*?/.*?(/.*)");
	/**
	 * Takes a String with a format of http://10.0.2.2:8080/cds-results-service/cds/invokeRules?query=default&param=0
	 * and returns the path and query - /cds/invokeRules?query=default&param=0
	 * @param address
	 * @return
	 */
	private String getPathAndQueryInfo(String url) {
		try {
			Matcher match = pathMatch.matcher(url);
			if(match.find()) {
				return StringUtils.defaultIfEmpty(match.group(1),"");
			}
		}
		catch(Exception e) {
			LOG.error(e.getMessage(), e);
		}
		return "";
	}
	
    private void put(Set<String> keys, String key, String value, boolean addToKeys) {
        if (value != null) {
            MDC.put(key, value);
            if( addToKeys) {
            	keys.add(key);
            }
        }
    }

    private String generateRequestId() {
    	return UUID.randomUUID().toString();
    }
}
