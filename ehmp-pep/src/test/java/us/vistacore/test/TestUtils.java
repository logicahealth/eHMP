package us.vistacore.test;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.ehmp.authorization.PEPUser;

public final class TestUtils {

    private TestUtils() { }

    public static ApsConfiguration getApsConfiguration() {
        return new ApsConfiguration("bogushost", "bogusport", "10000", "600", ";", "bogususer", "boguspass");
    }

    public static PEPUser getPEPUser() {
        PEPUser answer = new PEPUser();
        answer.setAccessCode("pu1234");
        answer.setSiteCode("B362");
        answer.setVerifyCode("pu1234!!");
        answer.setCprsCorTabAccess("false");
        answer.setCprsRptTabAccess("false");
        return answer;
    }

}
