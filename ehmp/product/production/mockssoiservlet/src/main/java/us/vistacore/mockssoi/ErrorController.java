/*
 *
 */

package us.vistacore.mockssoi;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * The Class ErrorController.
 */
@Controller
public class ErrorController {

	/** The Constant logger. */
	static final Logger LOGGER = LoggerFactory.getLogger(ErrorController.class);


	/**
	 * Index request mapping.
	 *
	 * @param map
	 *            - model map to hold attributes
	 * @return the login view (login.jsp)
	 */
	@RequestMapping(value = "/dumpheaders", method = RequestMethod.GET)
	public String dumpHeaders(final HttpServletRequest req, final ModelMap map) {
		
		Map<String, String> headers = getHeadersInfo(req);
		map.addAttribute("headers", headers);		
		return "dumpheaders";
	}
	
	//get request headers
	  private Map<String, String> getHeadersInfo(final HttpServletRequest request) {

		Map<String, String> map = new TreeMap<String, String>();

		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String key = (String) headerNames.nextElement();
			String value = request.getHeader(key);
			map.put(key, value);
		}		

		return map;
	  }

}
