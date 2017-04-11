package us.vistacore.ehmp.authentication;

import io.dropwizard.auth.AuthenticationException;
import us.vistacore.aps.VistaConfiguration;



public interface VistaAccountVerifierI {

    /**
     * Test the username, siteCode, password against Vista and return a VistaUser if
     * the information is valid or null if it is not. In the case that a invalid siteCode
     * is passed, the implementation should treat that as an invalid login.
     *
     * @param vistaConfiguration the vista server to authenticate against
     * @param accessCode the username/accesscode
     * @param verifyCode the password/verifycode
     * @param siteCode the sitecode/facilitycod
     
     * @return An instance of LeiprUser or null of the authentication failed
     */
    User authenticate(VistaConfiguration vistaConfiguration, String accessCode, String verifyCode, String siteCode) throws AuthenticationException;

    /**
     * If user authentication information is cached, clear it when this method is called.
     */
    void clearCache();
}
