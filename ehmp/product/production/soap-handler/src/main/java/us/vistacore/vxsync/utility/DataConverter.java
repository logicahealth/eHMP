package us.vistacore.vxsync.utility;

import org.codehaus.jettison.mapped.Configuration;
import org.codehaus.jettison.mapped.MappedXMLOutputFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLEventWriter;
import javax.xml.stream.XMLInputFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.*;

public class DataConverter {

	private static final Logger logger = LoggerFactory.getLogger(DataConverter.class);

	public static String convertXMLtoJSON(String xml) throws Exception {
		XMLInputFactory factory = XMLInputFactory.newInstance();
		factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
		factory.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
		XMLEventReader reader = factory.createXMLEventReader(new StringReader(xml));
		ByteArrayOutputStream arrayStream = new ByteArrayOutputStream();
		Configuration config = new Configuration();
		config.setIgnoreNamespaces(true);
		config.setSupressAtAttributes(true);
		XMLEventWriter writer = new MappedXMLOutputFactory(config)
				.createXMLEventWriter(arrayStream);
		writer.add(reader);
		writer.close();
		reader.close();
		String json = new String(arrayStream.toByteArray(), "UTF-8");
		return json;
	}

	/*
	@param Object o - Accepts the object to be converted to JSON format
	@return String json - returns the json format of the object.
	 */
	public static String convertObjectToJSON(Object o) {
		try {
			ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
			String json = ow.writeValueAsString(o);
			return json;
		}
		catch (JsonProcessingException e) {
			logger.error("Error Converting oject to JSON", e);
		}
		return null;
	}



	public static String convertFileToJSON(String args) throws Exception {
		String xml;
		xml = null;
		if (args != null && args.length() > 0)
		{
			File file = new File(args);
			try (FileInputStream fis = new FileInputStream(file)) {
				byte[] data = new byte[(int) file.length()];
				int bytes = fis.read(data);
				fis.close();
				if (bytes != -1) {
					xml = new String(data, "UTF-8");
				}
			} catch (Exception e) {
				logger.error("Error converting file to JSON", e);
				return null;
			}
		} else {
			xml = "<root>No file parameter was found in DataConverter.convertFileToJSON().  This is sample XML.</root>";
		}
		return (convertXMLtoJSON(xml));
	}

	public static boolean isValidJSON(String mayBeJSON) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			JsonNode json = mapper.readTree(mayBeJSON);
			return true;
		} catch (IOException e) {
		}
		return false;
	}
}