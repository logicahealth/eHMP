package us.vistacore.vxsync.mvi;

import static org.junit.Assert.*;

import javax.xml.stream.XMLStreamException;
import javax.xml.soap.SOAPMessage;
import org.junit.Test;
import us.vistacore.vxsync.config.MviConfiguration;

public class Mvi1305MessageTest {

	@Test
	public void mvi1305SoapMessageTest() throws Exception {
		MviDemographics demographics = new MviDemographics();
		demographics.setFirstName("PATIENT");
		demographics.setLastName("EDIPIONLY");
		demographics.setSSN("111111234");
		demographics.setBirthDate("19671011");
		assertTrue(demographics.isValidInput());
		MessageBuilder msgBuilder = new MessageBuilder();
		MviConfiguration mviConf = new MviConfiguration();
		mviConf.setProcessingCode("T");
		msgBuilder.setConfiguration(mviConf);
		MviSoapConnection mviConn = new MviSoapConnection();
		SOAPMessage soapMsg = mviConn.makeSOAPMessage(msgBuilder.getAttendedSearch(demographics));
		assertNotNull(soapMsg);
		String soapText = mviConn.prettyPrintSOAPMessage(soapMsg);
		assertNotNull(soapText);
		assertTrue(soapText.contains("PATIENT"));
		assertTrue(soapText.contains("EDIPIONLY"));
		assertTrue(soapText.contains("111111234"));
		assertTrue(soapText.contains("19671011"));
	}
}