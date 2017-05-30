package vistacore.order.consult;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Properties;

import org.jboss.logging.Logger;


public class PropertiesLoader {
	//We tried many things to get the properties files to load from the file system.
	//All of the solutions would work in Eclipse, but none of these worked running in JBPM on the VM.
	//The problem is the properties file could not be found.  This was due to the fact that
	//the system could never figure out where it was being loaded from in the JBPM VM:
	//
	//All of these would return null (it couldn't even load itself).
	//PropertiesLoader.class.getProtectionDomain().getCodeSource().getLocation()
	//PropertiesLoader.class.getResource(PropertiesLoader.class)
	//PropertiesLoader.class.getResource("")
	//PropertiesLoader.class.getResourceAsStream("timer.properties")
	//
	//We finally found that the System property for this process called "user.home" would allow us to load a Java properties file from here: "/home/jboss"
	//FYI - the user.home directory for this process is different than the HOME directory in the Environment Variables.
	//
	//For more reference, I tried everything (all variations) to load the jar from this web page.
	//http://stackoverflow.com/questions/320542/how-to-get-the-path-of-a-running-jar-file
	//It just doesn't know where it's loaded from so none of the options at that link work.
	//
	//If you print this statement out (showing where the current thread thinks its resources are):
	//Thread.currentThread().getContextClassLoader().getResource("")
	//You get this output
	//file:/opt/jboss/modules/system/layers/base/org/jboss/as/ejb3/main/timers/
	//This is where you add extension drivers to jboss. So, it appears that jboss thinks this (Order) jar is an extension, not a project.
	//
	//So far, the best solution is to use "user.home" and override properties by putting the file in there.
	private static final Logger LOGGER = Logger.getLogger(PropertiesLoader.class);
	protected static String getConsultTimersProperty(String key, String defaultValue) {
		LOGGER.debug("PropertiesLoader.getConsultTimersProperty: entering method");
		String propertiesFileName = "consult-timers.properties";
		String path = "";
		Properties prop = new Properties();
		
		FileInputStream file = null;

		try {
			path = System.getProperty("user.home");
			LOGGER.debug("PropertiesLoader.getConsultTimersProperty: user.home: " + path);
			
			String fileNameAndPath = Paths.get(path, propertiesFileName).toString();
			LOGGER.debug("PropertiesLoader.getConsultTimersProperty: fileNameAndPath: " + fileNameAndPath);
			
			file = new FileInputStream(fileNameAndPath);
			
			prop.load(file);
			
			String retvalue = prop.getProperty(key);
			LOGGER.debug("PropertiesLoader.getConsultTimersProperty: '" + key + "' properties file value '" + retvalue + "'");
			
			return retvalue;
		} catch (FileNotFoundException e) {
			LOGGER.info("PropertiesLoader.getConsultTimersProperty: Going to use the defaultValue as we could not find '" + propertiesFileName + "' at the following location: " + path, e);
		} catch (IOException e) {
			LOGGER.error("PropertiesLoader.getConsultTimersProperty: An unexpected condition has happened with IO: " + e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error("PropertiesLoader.getConsultTimersProperty: An unexpected condition has happened: " + e.getMessage(), e);
		}
		finally {
			if (file != null) {
				try {file.close();} catch (IOException e) {
					LOGGER.error("PropertiesLoader.getConsultTimersProperty: An unexpected condition has happened closing IO: " + e.getMessage());
				}
			}
		}

		LOGGER.debug("PropertiesLoader.getConsultTimersProperty: '" + key + "' not found in properties file, returning default value '" + defaultValue + "'");
		return defaultValue;
	}
}
