package us.vistacore.vxsync.mvi;

import static org.junit.Assert.*;

import javax.xml.stream.XMLStreamException;

import org.junit.Test;

public class MviDemographicsTest {

	private MviDemographics demoGraphics = new MviDemographics();

	@Test
	public void isValidInputTest() throws Exception {
		// Only set first Name, the validation should fail
		demoGraphics.setFirstName("TESTF");
		assertFalse(demoGraphics.isValidInput());
		// Now set the last name, should still false
		demoGraphics.setLastName("TESTL");
		assertFalse(demoGraphics.isValidInput());
		// Now set the SSN, should be true now
		demoGraphics.setSSN("111111234");
		assertTrue(demoGraphics.isValidInput());
		// Now set the birth date to be invalid format
		demoGraphics.setBirthDate("19653107"); //invalid month
		assertNull(demoGraphics.getBirthDate());

		demoGraphics.setBirthDate("19650935"); //invalid day
		assertNull(demoGraphics.getBirthDate());

		demoGraphics.setBirthDate("12171985"); // Not in the right format, should be yyyyMMdd
		assertNull(demoGraphics.getBirthDate());

		demoGraphics.setBirthDate("19670701"); // Right format
		assertTrue(demoGraphics.isValidInput());
	}

}