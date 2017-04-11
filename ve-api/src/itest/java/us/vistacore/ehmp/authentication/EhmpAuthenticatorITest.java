package us.vistacore.ehmp.authentication;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import us.vistacore.ehmp.ITestUtils;

import com.google.common.base.Optional;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;

import org.junit.Test;

public class EhmpAuthenticatorITest {

    private final Authenticator<BasicCredentials, User> authenticator = new EhmpAuthenticator(ITestUtils.getVistaConfigurationDispenser(), ITestUtils.getApsConfiguration());

    @Test
    public void testValidAuthentication() throws AuthenticationException {
        Optional<User> authenticationResponse = authenticator.authenticate(new BasicCredentials("9E7A;pu1234", "pu1234!!"));
        assertTrue(authenticationResponse.isPresent());
        User user = authenticationResponse.get();

        assertEquals("9E7A", user.getSiteCode());
        assertEquals("500", user.getDivisionCode());
        assertEquals("pu1234", user.getAccessCode());
        assertEquals("pu1234!!", user.getVerifyCode());
        assertEquals("true", user.getCprsCorTabAccess());
        assertEquals("false", user.getCprsRptTabAccess());
    }

    @Test
    public void testNonCprsUserAuthentication() throws AuthenticationException {
        Optional<User> authenticationResponse = authenticator.authenticate(new BasicCredentials("9E7A;lu1234", "lu1234!!"));
        assertTrue(authenticationResponse.isPresent());
        User user = authenticationResponse.get();

        assertEquals("9E7A", user.getSiteCode());
        assertEquals("lu1234", user.getAccessCode());
        assertEquals("lu1234!!", user.getVerifyCode());
        assertEquals("false", user.getCprsCorTabAccess());
        assertEquals("false", user.getCprsRptTabAccess());
    }

    @Test
    public void testBadSite() throws AuthenticationException {
        assertFalse(authenticator.authenticate(new BasicCredentials("notasite;pu1234", "pu1234!!")).isPresent());
    }

    @Test
    public void testBadAccessCode() throws AuthenticationException {
        assertFalse(authenticator.authenticate(new BasicCredentials("9E7A;badaccesscode", "pu1234!!")).isPresent());
    }

    @Test
    public void testBadVerifyCode() throws AuthenticationException {
        assertFalse(authenticator.authenticate(new BasicCredentials("9E7A;pu1234", "badverifycode")).isPresent());
    }

}
