package vistacore.order.discharge;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.json.JSONException;
import org.junit.Test;

import vistacore.order.discharge.util.StopCodeUtil;

public class StopCodeUtilJUnitTest {

	@Test
	public void validateCaseOneCases() throws JSONException {
		assertTrue(StopCodeUtil.isStopCodeTerminal("170", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("171", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("172", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("173", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("174", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("175", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("176", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("177", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("178", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("156", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("157", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("322", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("323", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("326", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("338", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("350", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("531", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("348", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("704", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("534", "10"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("539", "10"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "107"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "107"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "115"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "115"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "152"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "152"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "311"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "311"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "333"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "333"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "334"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "334"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "999"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "999"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "474"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "474"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "430"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "430"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "328"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "328"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "321"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "321"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "329"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "329"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("170", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("171", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("172", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("173", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("174", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("175", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("176", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("177", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("178", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("156", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("157", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("322", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("323", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("326", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("338", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("350", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("531", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("348", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("704", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("534", "435"));
		assertFalse(StopCodeUtil.isStopCodeTerminal("539", "435"));

	}

	@Test
	public void validateCaseTwoCases() throws JSONException {
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "179"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "322"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "323"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "350"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "531"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "348"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "704"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "534"));
		assertTrue(StopCodeUtil.isStopCodeTerminal("1", "539"));

		assertFalse(StopCodeUtil.isStopCodeTerminal("1", "1"));
	}

	@Test
	public void validateCaseThreeCases() throws JSONException {
		assertTrue(StopCodeUtil.isStopCodeTerminal("224", "323"));
	}

	@Test
	public void validateCaseFourCases() throws JSONException {
		assertTrue(StopCodeUtil.isStopCodeTerminal("326", "350"));
	}

	@Test
	public void validateCaseFiveCases() throws JSONException {
		assertTrue(StopCodeUtil.isStopCodeTerminal("527", "534"));
	}

    @Test
    public void validateCaseFiveCasesAsInteger() throws JSONException {
        assertTrue(StopCodeUtil.isStopCodeTerminal(527, 534));
    }

	@Test
	public void validateDomainParsing() throws JSONException {
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:179"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:322"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:323"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:350"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:531"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:348"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:704"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:534"));
        assertTrue(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:539"));

        assertFalse(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", "urn:va:stop-code:1"));
	}

    @Test
    public void isStopCodeTerminalAcceptsNulls() throws JSONException {
        assertFalse(StopCodeUtil.isStopCodeTerminal("urn:va:stop-code:1", null));
        assertFalse(StopCodeUtil.isStopCodeTerminal(null, "urn:va:stop-code:1"));

        assertFalse(StopCodeUtil.isStopCodeTerminal(1, null));
        assertFalse(StopCodeUtil.isStopCodeTerminal(1, null));
    }

    @Test
    public void isStopCodeTerminalAcceptsMalformedStrings() throws JSONException {
        assertFalse(StopCodeUtil.isStopCodeTerminal("this should be null", null));
        assertFalse(StopCodeUtil.isStopCodeTerminal(null, "1.9"));
    }

}