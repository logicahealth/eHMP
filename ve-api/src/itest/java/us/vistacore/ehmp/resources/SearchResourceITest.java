package us.vistacore.ehmp.resources;

import com.google.common.collect.ImmutableList;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.spi.inject.SingletonTypeInjectableProvider;
import io.dropwizard.auth.Auth;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.eclipse.jetty.server.Response;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.authentication.User;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.Provider;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;

@RunWith(Parameterized.class)
public class SearchResourceITest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]> builder()
                .add(new Object[] { "EIGHT", Response.SC_OK, 76 })
                .add(new Object[] { "BOGUSNAME", Response.SC_OK, 0 })
                .add(new Object[] { "", Response.SC_BAD_REQUEST, -1 })
                .add(new Object[] { "q", Response.SC_BAD_REQUEST, -1 })
                .build();
    }

    /**
     * Parameterized instance variables
     */
    private String name;
    private int expectedStatusCode;
    private int expectedTotalItems;

    public SearchResourceITest(String name, int expectedStatusCode, int expectedTotalItems) {
        this.name = name;
        this.expectedStatusCode = expectedStatusCode;
        this.expectedTotalItems = expectedTotalItems;
    }

    private static List<ResourceTestRule> rtrList;

    @Before
    public void setup() throws UnsupportedEncodingException {
        rtrList = new ArrayList<ResourceTestRule>();
        rtrList.add(RESOURCES);
        if (ITestUtils.isVe2Up()) {
            rtrList.add(RESOURCES_2);
        }
    }

    @After
    public void tearDown() {
        rtrList.clear();
    }

    /**
     * Setup for REST Resource under test
     */
    @ClassRule public static final ResourceTestRule RESOURCES = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration(), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    /**
     * Provider classes for JAX-RS Context injection
     */
    @Provider
    public static class UriInfoResolver extends SingletonTypeInjectableProvider<Context, UriInfo> {
        public UriInfoResolver() {
            super(UriInfo.class, null);
        }
    }

    @Provider
    public static class HttpHeadersResolver extends SingletonTypeInjectableProvider<Context, HttpHeaders> {
        public HttpHeadersResolver() {
            super(HttpHeaders.class, null);
        }
    }

    @Provider
    public static class HttpServletRequestResolver extends SingletonTypeInjectableProvider<Context, HttpServletRequest> {
        public HttpServletRequestResolver() {
            super(HttpServletRequest.class, null);
        }
    }

    @Provider
    public static class AuthResolver extends SingletonTypeInjectableProvider<Auth, User> {
        public AuthResolver() {
            super(User.class, new User("accessCode", "verifyCode", "siteCode", "divisionCode"));
        }
    }

    @Test
    public void testFindPatientsByFullnameSearch() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource("/vpr/search/patient?fullName=" + this.name).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), expectedStatusCode, response.getStatus());
            if (expectedTotalItems >= 0) {
                try {
                    assertThat(response.getEntity(String.class), containsString("\"totalItems\":" + expectedTotalItems));
                } catch (AssertionError e) {
                    ITestUtils.fail(i + 1, e);
                }
            }
        }
    }

}
