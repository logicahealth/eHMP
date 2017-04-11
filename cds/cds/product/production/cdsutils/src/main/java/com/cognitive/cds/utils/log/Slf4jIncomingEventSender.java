package com.cognitive.cds.utils.log;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;
import org.apache.cxf.ext.logging.event.LogEvent;
import org.apache.cxf.ext.logging.event.LogEventSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

/**
 * A class which outputs MDC log formats with the appropriate event type 
 *
 */
public class Slf4jIncomingEventSender implements LogEventSender {
	
	private static final Logger LOG = LoggerFactory.getLogger(Slf4jIncomingEventSender.class);
	
	//"2016-10-19T17:38:29.089Z"
	public static final DateTimeFormatter DATEFORMATTER = DateTimeFormatter.ISO_INSTANT;

	@Override
    public void send(LogEvent event) {
        Set<String> keys = new HashSet<String>(); 
        try {
        	put(keys, "dateTime", DATEFORMATTER.format(Instant.now()));
            put(keys, "address", event.getAddress());
            put(keys, "httpMethod", event.getHttpMethod());
            put(keys, "path", getPathAndQueryInfo(event));
            
            switch( event.getType() ) {
	            case REQ_IN  :  LOG.info("INCOMING REQUEST:"); break;
	            case REQ_OUT  : put(keys, "path", event.getAddress());
	            				LOG.info("OUTGOING REQUEST:"); break;
	            case RESP_IN  : LOG.info("INCOMING RESPONSE:");break;
	            case RESP_OUT  : LOG.info("OUTGOING RESPONSE:"); break;
	            case FAULT_IN  : LOG.info("INCOMING FAULT:"); break;
	            case FAULT_OUT  : LOG.info("OUTGOING FAULT:"); break;
	            default : LOG.info("UNKNOWN TYPE:"); break;
            }
        } finally {
            for (String key : keys) {
                MDC.remove(key);
            }
        }
        
    }


	private Pattern pathMatch = Pattern.compile("http://.*?/.*?(/.*)");
	/**
	 * Takes a String with a format of http://10.0.2.2:8080/cds-results-service/cds/invokeRules?query=default&param=0
	 * and returns the path and query - /cds/invokeRules?query=default&param=0
	 * @param address
	 * @return
	 */
	private String getPathAndQueryInfo(LogEvent event) {
		try {
			String address = event.getAddress();
			if( address != null ) {
				Matcher match = pathMatch.matcher(address);
				if(match.find()) {
					return StringUtils.defaultIfEmpty(match.group(1),"");
				}
			}
			else {
				return "MessageId = "+event.getMessageId();
			}
		}
		catch(Exception e) {
			LOG.error(e.getMessage()+" for MessageId : "+event.getMessageId(), e);
		}
		return "";
	}
	
    private void put(Set<String> keys, String key, String value) {
        if (value != null) {
            MDC.put(key, value);
            keys.add(key);
        }
    }

}
