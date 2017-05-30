package gov.va;

import java.security.acl.Group;
import java.util.Map;

import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.login.LoginException;

import org.jboss.security.SimpleGroup;
import org.jboss.security.SimplePrincipal;
import org.jboss.security.auth.spi.UsernamePasswordLoginModule;

public class CustomLogin extends UsernamePasswordLoginModule {
	
	private static String EHMP_USER_ROLE = "Administrators";
	private static String REST_ALL_USER_ROLE = "rest-all";

	@SuppressWarnings("rawtypes")
	public void initialize(Subject subject, CallbackHandler callbackHandler,
			Map sharedState, Map options) {

		super.initialize(subject, callbackHandler, sharedState, options);
	}

	/**
	 * (required) The UsernamePasswordLoginModule modules compares the result of
	 * this method with the actual password.
	 */
	@Override
	protected String getUsersPassword() throws LoginException {
		String[] userAndPass = super.getUsernameAndPassword();

		String usernameAndSite;
		String password;
		if (userAndPass.length == 2) {
			usernameAndSite = userAndPass[0];
			password = userAndPass[1];
		} else {
			throw new LoginException(
					"Unable to retrieve username and/or password");
		}

		if ("".equalsIgnoreCase(password)) {
			throw new LoginException("Empty password received");
		}

		if ("".equalsIgnoreCase(usernameAndSite)) {
			throw new LoginException("Empty username received");
		}

		String[] split;
		if (usernameAndSite.contains(";")) {
			split = usernameAndSite.split(";");

			if (split.length != 2) {
				throw new LoginException("Invalid username or site received");
			}
		} else {
			throw new LoginException("No site or seperator received");
		}

		return password;
	}

	/**
	 * (optional) Override if you want to change how the password are compared
	 * or if you need to perform some conversion on them.
	 */
	@Override
	protected boolean validatePassword(String inputPassword,
			String expectedPassword) {
//		System.out.format("CustomLogin: Ignoring password and allowing login: %s\n", inputPassword);
		return true;
	}

	/**
	 * (required) The groups of the user, there must be at least one group
	 * called "Roles" (though it likely can be empty) containing the roles the
	 * user has.
	 */
	@Override
	protected Group[] getRoleSets() throws LoginException {
		System.out.println("CustomLogin: Getting roles");
		SimpleGroup group = new SimpleGroup("Roles");
		try {
			group.addMember(new SimplePrincipal(EHMP_USER_ROLE));
			group.addMember(new SimplePrincipal(REST_ALL_USER_ROLE));			
		} catch (Exception e) {
			throw new LoginException("Failed to create group member for "
					+ group);
		}
		return new Group[] { group };
	}

}
