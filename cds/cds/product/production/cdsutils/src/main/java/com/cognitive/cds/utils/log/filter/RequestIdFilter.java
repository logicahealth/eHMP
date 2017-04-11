/**
 * 
 */
package com.cognitive.cds.utils.log.filter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

/**
 * Set MDC  X-Request-ID and SessionID
 * Nov 22, 2016
 * 
 */
public class RequestIdFilter implements Filter {

	private static final Logger LOG = LoggerFactory.getLogger(RequestIdFilter.class);
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
		try{
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			MDC.put("requestId", StringUtils.defaultIfEmpty(httpRequest.getHeader("X-Request-ID"), ""));			
			MDC.put("sid", StringUtils.defaultIfEmpty(httpRequest.getSession().getId(), ""));			
			MDC.put("hostname", StringUtils.defaultIfEmpty(hostname, ""));
			MDC.put("context", StringUtils.defaultIfEmpty(httpRequest.getContextPath(), " ").substring(1));
		}
		catch(Exception e) {
			LOG.error(e.getMessage(), e);
		}
		chain.doFilter(request, response);
	}

	@Override
	public void destroy() {
	}

}
