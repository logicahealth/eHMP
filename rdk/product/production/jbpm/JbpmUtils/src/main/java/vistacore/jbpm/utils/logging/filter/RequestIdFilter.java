package vistacore.jbpm.utils.logging.filter;

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
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.commons.lang3.StringUtils;
import org.jboss.logging.Logger;
import org.jboss.logging.MDC;

import vistacore.jbpm.utils.logging.RequestMessageType;

public class RequestIdFilter implements Filter {

	private static String hostname;
	private static final Logger LOGGER = Logger.getLogger(RequestIdFilter.class);

	@Override
	public void destroy() {
		// Auto-generated method stub
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
			throws IOException, ServletException 
	{
		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper((HttpServletResponse)response);
		try{
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			MDC.put("requestId", StringUtils.defaultIfBlank(httpRequest.getHeader("X-Request-ID"), "undefined"));			
			MDC.put("sid", StringUtils.defaultIfBlank(httpRequest.getHeader("X-Session-ID"), "undefined"));			
			MDC.put("hostname", StringUtils.defaultIfBlank(hostname, "undefined"));
			String context = StringUtils.defaultIfEmpty(httpRequest.getContextPath(), " ").substring(1);
			MDC.put("context", context);
			String requestInfo = httpRequest.getMethod() + " " + httpRequest.getRequestURI();
			MDC.put("requestInfo", requestInfo);
			

			responseWrapper.addHeader("X-Request-ID", MDC.get("requestId").toString());
			responseWrapper.addHeader("X-Session-ID", MDC.get("sid").toString());

			LOGGER.info(String.format("%s  %s STARTOF %s", context, RequestMessageType.INCOMING_REQUEST, requestInfo));
		}
		catch(Exception e) {
			LOGGER.error(e.getMessage(), e);
		}
		chain.doFilter(request, responseWrapper);
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
		if(hostname==null) {
			try {
				InetAddress localHost = InetAddress.getLocalHost();
				hostname = localHost.getHostName();
			} catch (UnknownHostException e) {
				LOGGER.error("LocalHost could not be resolved to an address.", e);
			}
		}
	}

}
