/*
 *
 */

package us.vistacore.mockssoi;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/**
 * The Class MockSSOiController.
 */
@Controller
public class MockSSOiController {

	/** The Constant logger. */
	static final Logger LOGGER = LoggerFactory.getLogger(MockSSOiController.class);

	/** The json users url. */
	@Value("${mockssoi.usersUrl}")
	private String usersUrl;

	/** The err msg. */
	public String errMsg = "";

	@PostConstruct
	public void showStarted() {
		LOGGER.info("MockSSOi Servlet started");
	}

	/**
	 * Index request mapping.
	 *
	 * @param map
	 *            - model map to hold attributes
	 * @return the login view (login.jsp)
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String index(final ModelMap map) {
		if (StringUtils.isNotEmpty(errMsg)) {
			map.addAttribute("errMsg", errMsg);
		}
		return "login";
	}

	/**
	 * Login POST method that will validate the username/password and if valid, add a cookie containing the users json attributes and redirect to the targetURL. If there are no
	 * users, or the username/password is invalid, redirect back to index with an appropriate message.
	 *
	 * @param req
	 *            - the HttpServletRequest
	 * @param resp
	 *            - the HttpServletResponse
	 * @param map
	 *            - model map to hold attributes
	 * @return the redirect to either the TargetURL or back to the index with an error message
	 */
	@RequestMapping(value = "/login", method = RequestMethod.POST)
	public String login(final HttpServletRequest req, final HttpServletResponse resp, final ModelMap map) {

		final String username = StringUtils.defaultString(req.getParameter("username"));
		final String pwd = StringUtils.defaultString(req.getParameter("pwd"));
		final String targetURL = StringUtils.defaultString(req.getParameter("targetURL"));

		String view = "";
		errMsg = "";

		final MockUser user = getUser(username);
		if (user != null) {
			if (validate(user, pwd)) {
				view = "redirect:" + targetURL;
				resp.addCookie(getCookie(user));
				resp.addHeader("Access-Control-Allow-Origin", "*");
			} else {
				errMsg = "Invalid login/password";
				view = String.format("redirect:/?TARGET=%s&loginError", targetURL);
			}
		} else {
			errMsg = "mock user not found";
			view = String.format("redirect:/?TARGET=%s&loginError", targetURL);
		}

		return view;
	}

	/**
	 * Validates the username/password.
	 *
	 * @param user
	 *            - the user to validate
	 * @param pwd
	 *            - the password to validate
	 * @return true, if successful
	 */
	private boolean validate(final MockUser user, final String pwd) {
		if (user == null || StringUtils.isBlank(pwd)) {
			return false;
		}

		return user.getPwd().equalsIgnoreCase(pwd);
	}

	/**
	 * Load users json file.
	 *
	 * @return the list of MockUsers from the json file
	 */
	private List<MockUser> loadUsers() {
		List<MockUser> users = new ArrayList<MockUser>();

		if (StringUtils.isBlank(usersUrl)) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("Error loading mockssoi-users.json : usersUrl blank, check mockssoi.properties file.");
			}
		} else {
			final String url = usersUrl;

			try {
				final String json = IOUtils.toString(new URL(url));
				if (StringUtils.isNotBlank(json)) {
					final Gson gson = new Gson();
					users = gson.fromJson(json, new TypeToken<List<MockUser>>() {
					}.getType());
				}
			} catch (final IOException e) {
				if (LOGGER.isErrorEnabled()) {
					LOGGER.error(String.format("Error loading mockssoi-users.json : %s", e.getMessage()));
				}
			}
		}

		return users;
	}

	/**
	 * Creates a cookie holding the users json attributes.
	 *
	 * @param user
	 *            - the user to
	 * @return the cookie containing the user json attributes
	 */
	private Cookie getCookie(final MockUser user) {
		final Gson gson = new Gson();
		final Cookie cookie = new Cookie("mockssoi", gson.toJson(user, MockUser.class));
		cookie.setPath("/");
		cookie.setMaxAge(60 * 15); // 15 minutes
		cookie.setSecure(true);
		return cookie;
	}

	/**
	 * Gets the user object for the provided username.
	 *
	 * @param username
	 *            - the username to find
	 * @return the user object
	 */
	private MockUser getUser(final String username) {
		final List<MockUser> users = loadUsers();
		final MockUser user = CollectionUtils.find(users, o->o.getUsername().equalsIgnoreCase(username));
		return user;
	}
}
