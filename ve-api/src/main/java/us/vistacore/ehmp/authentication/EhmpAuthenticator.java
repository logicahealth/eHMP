package us.vistacore.ehmp.authentication;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfiguration;
import us.vistacore.aps.VistaConfigurationDispenser;
import us.vistacore.ehmp.authentication.impl.VistaAccountVerifierSoap;

import com.google.common.base.Optional;

public class EhmpAuthenticator implements Authenticator<BasicCredentials, User> {

    private static Logger logger = LoggerFactory.getLogger(EhmpAuthenticator.class);
    private VistaConfigurationDispenser vistaConfigurations;
    private VistaAccountVerifierI fhirAccountVerifier;
    private String delimiter;

    public EhmpAuthenticator(VistaConfigurationDispenser vistaConfigurations, ApsConfiguration apsConfig) {
        this.fhirAccountVerifier = new VistaAccountVerifierSoap(apsConfig);
        this.delimiter = apsConfig.getUserDelimiter();
        this.vistaConfigurations = vistaConfigurations;
    }

    /**
     * This method tests the user credentials with an implementation of the FhirAccountVerifierI
     * interface. Since Vista authentication requires 3 pieces of information (user, site code,
     * and password), the user and site code are contained in the BasicCredentials username field
     * with the DELIMITER separator between them. This method extracts the user and site code from
     * the BasicCredentials username field and then calls the authenticate() method of the
     * VistaAccountVerifierI implementation.
     *
     * Upon successful authentication, this method will return an instance of Optional<User> by
     * calling Optional.of(). A failed authentication means this method returns Optional.absent()
     */
    @Override
    public Optional<User> authenticate(BasicCredentials credentials) throws AuthenticationException {
        if (credentials == null || credentials.getUsername() == null || credentials.getPassword() == null || !credentials.getUsername().contains(delimiter)) {
            return Optional.absent();
        }

        String[] userName = credentials.getUsername().split(delimiter);
        String siteCode = userName.length > 0 ? userName[0] : null;
        String accessCode = userName.length > 1 ? userName[1] : null;
        String verifyCode = credentials.getPassword();

        User fhirUser = null;

        VistaConfiguration config = vistaConfigurations.bySiteCode(siteCode);

        if (config != null) {
            logger.debug("authenticating for accessCode=" + accessCode + " siteCode=" + siteCode);
            fhirUser = fhirAccountVerifier.authenticate(config, accessCode, verifyCode, siteCode);
        }

        if (fhirUser != null) {
            logger.debug("authenticating for accessCode=" + accessCode + " siteCode=" + siteCode + " PASSED");
            return Optional.of(fhirUser);
        } else {
            logger.debug("authenticating for accessCode=" + accessCode + " siteCode=" + siteCode + " FAILED");
            return Optional.absent();
        }
    }

}
