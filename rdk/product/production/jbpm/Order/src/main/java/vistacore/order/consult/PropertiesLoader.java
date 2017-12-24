package vistacore.order.consult;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.jboss.logging.Logger;

/*
 * PropertiesLoader can use a properties file placed on the classpath
 * For deployment put the consult-timers.properties file in
 * business-central.war/WEB-INF/classes 
 * and make sure it is jboss readable
 * 
 * Currently no consult-timers.properties file is made available
 */
public class PropertiesLoader {
	private static final Logger LOGGER = Logger.getLogger(PropertiesLoader.class);
	private static final String CONSULT_TIMER_CONFIG = "consult-timers.properties";

	protected static String getConsultTimersProperty(String key, String defaultValue) {
		LOGGER.debug("PropertiesLoader.getConsultTimersProperty: entering method");
		return PropertiesInnerLoader.getProperty(CONSULT_TIMER_CONFIG, key, defaultValue); 
	}

	
	/**
	 * Inner class to remain static when dealing with the properties
	 */
	private static final class PropertiesInnerLoader {
		private static final Properties timerProperties = new Properties();
		private static final Logger LOGGER = Logger.getLogger(PropertiesInnerLoader.class);
		static {
			try(InputStream in = PropertiesInnerLoader.class.getClassLoader().getResourceAsStream(CONSULT_TIMER_CONFIG);) {
				if(in==null){
					LOGGER.debug(String.format("Property file not found; %s ", CONSULT_TIMER_CONFIG));
				}
				else {
					LOGGER.debug(String.format("Loading Properties files; %s ", CONSULT_TIMER_CONFIG));
					timerProperties.load(in);
				}
			} catch (IOException e) {
				LOGGER.error(String.format("Exception when Loading %s Properties files; %s ", CONSULT_TIMER_CONFIG, e.getMessage()), e);
			}
		}

		/**
		 * Pulls a property from the properties or returns the default value
		 * @return String
		 */
		public static final String getProperty(String property_file_name, String prop, String defaultValue) {
			return timerProperties.getProperty(prop, defaultValue);
		}

	}
}
