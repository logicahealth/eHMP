package vistacore.jds;

import java.util.concurrent.ConcurrentHashMap;

import org.jboss.logging.Logger;


public class MockJDSStore {
	
	private static final Logger LOGGER = Logger.getLogger(MockJDSStore.class);
	private static final ConcurrentHashMap<String,String> STORE = new ConcurrentHashMap<>(); 

	
	public static final String getValue(String key) {
		String value = STORE.get(key);
		LOGGER.debug(String.format("Returning value for key: %s = %s",key,value));
		return value;
	}
	
	public static final void setValue(String key, String value) {
		LOGGER.debug(String.format("Setting value for key: %s = %s",key,value));
		STORE.put(key, value);
	}
	
}
