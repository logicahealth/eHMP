package vistacore.jbpm.utils.logging.listener;

import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;

import org.jboss.logging.Logger;
import org.jboss.logging.MDC;

import vistacore.jbpm.utils.logging.RequestMessageType;

public class LoggingServletRequestListener implements ServletRequestListener {
	private static final Logger LOGGER = Logger.getLogger(LoggingServletRequestListener.class);
	
	@Override
	public void requestDestroyed(ServletRequestEvent sre) {
		LOGGER.info(MDC.get("context").toString() + " " +  RequestMessageType.OUTGOING_RESPONSE + " ENDOF " + MDC.get("requestInfo"));
	}

	@Override
	public void requestInitialized(ServletRequestEvent sre) {
		// Auto-generated method stub
	}

}
