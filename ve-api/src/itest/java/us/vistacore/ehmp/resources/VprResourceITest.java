package us.vistacore.ehmp.resources;

import com.google.common.collect.ImmutableList;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
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
import us.vistacore.ehmp.model.VprDomain;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.Provider;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;

@RunWith(Parameterized.class)
public class VprResourceITest {

    /**
     * Injected instance variables for Parameterized JUnit Test
     */
    private String pid;
    private VprDomain vprDomain;
    private int expectedStatus;
    private String uid;

    private static final String ORDER_UID = "urn:va:order:9E7A:3:15815";
    
    private static final String SITECODE = "9E7A";
    private static final String DIVISIONCODE = "500";
    
    private static final String CPRSUSER_ACCESSCODE = "pu1234";
    private static final String CPRSUSER_VERIFYCODE = "pu1234!!";

    private static final String NONCPRSUSER_ACCESSCODE = "lu1234";
    private static final String NONCPRSUSER_VERIFYCODE = "lu1234!!";

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

    @ClassRule public static final ResourceTestRule NONCPRSUSER_RESOURCES = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration(), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(NonCprsAuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule NONCPRSUSER_RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(NonCprsAuthResolver.class)
            .build();

    private static List<ResourceTestRule> rtrList;
    private static List<ResourceTestRule> nonCprsRtrList;

    @Before
    public void setup() {
        Hystrix.reset();
        HystrixRequestContext.initializeContext();

        rtrList = new ArrayList<ResourceTestRule>();
        rtrList.add(RESOURCES);

        nonCprsRtrList = new ArrayList<ResourceTestRule>();
        nonCprsRtrList.add(NONCPRSUSER_RESOURCES);

        if (ITestUtils.isVe2Up()) {
            rtrList.add(RESOURCES_2);
            nonCprsRtrList.add(NONCPRSUSER_RESOURCES_2);
        }
    }

    @After
    public void teardown() {
        rtrList.clear();
        nonCprsRtrList.clear();
    }

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
            super(User.class, new User(CPRSUSER_ACCESSCODE, CPRSUSER_VERIFYCODE, SITECODE, DIVISIONCODE, "true", "true"));
        }
    }

    @Provider
    public static class NonCprsAuthResolver extends SingletonTypeInjectableProvider<Auth, User> {
        public NonCprsAuthResolver() {
            super(User.class, new User(NONCPRSUSER_ACCESSCODE, NONCPRSUSER_VERIFYCODE, SITECODE, DIVISIONCODE, "false", "false"));
        }
    }

    /**
     * Static data generator for Parameterized JUnit Test
     */
    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]> builder()
                .add(new Object[] { "10108V420871", VprDomain.ALLERGY, "", Response.SC_OK })
                .add(new Object[] { SITECODE + ";20", VprDomain.ALLERGY, "", Response.SC_TEMPORARY_REDIRECT })
                .add(new Object[] { "10108V420871", VprDomain.ORDER, ORDER_UID, Response.SC_OK})
                .build();
    }

    // Test URLs for web resource endpoints
    private String testFoundResponseTestUrl;
    private String breakGlassResponseTestUrl;
    private String badDomainResponseTestUrl;
    private String badPidResponseTestUrl;
    private String labsByOrderUidResponseTestUrl;
    private String labsByOrderUidBadResponseTestUrl;

    public VprResourceITest(String pid, VprDomain vprDomain, String uid, int expectedStatus) {
        this.pid = pid;
        this.vprDomain = vprDomain;
        this.expectedStatus = expectedStatus;
        this.uid = uid;

        this.buildTestUrls();
    }

    private void buildTestUrls() {
        testFoundResponseTestUrl = VprResource.CONTEXT + "/" + pid + "/" + vprDomain.getId();
        breakGlassResponseTestUrl = VprResource.CONTEXT + "/" + pid + "/" + vprDomain.getId() + "?_ack=true";
        badDomainResponseTestUrl = VprResource.CONTEXT + "/" + pid + "/" + "NotARealDomain";
        badPidResponseTestUrl = VprResource.CONTEXT + "/" + "BAD_PID" + "/" + vprDomain.getId();
        labsByOrderUidResponseTestUrl = VprResource.CONTEXT + "/" + pid + "/labs/" + uid;
        labsByOrderUidBadResponseTestUrl = VprResource.CONTEXT + "/" + pid + "/labs/BAD_UID";
    }   

    @Test
    public void testFoundResponse() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse authorizedResponse = rtrList.get(i).client().resource(testFoundResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), expectedStatus, authorizedResponse.getStatus());
        }
    }

    @Test
    public void testFoundResponseNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse nonauthorizedResponse = nonCprsRtrList.get(i).client().resource(testFoundResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, nonauthorizedResponse.getStatus());
        }
    }

    @Test
    public void testBreakGlassResponse() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse authorizedResponse = rtrList.get(i).client().resource(breakGlassResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, authorizedResponse.getStatus());
        }
    }

    @Test
    public void testBreakGlassResponseNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse nonauthorizedResponse = nonCprsRtrList.get(i).client().resource(breakGlassResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, nonauthorizedResponse.getStatus());
        }
    }

    @Test
    public void testBadDomainResponse() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse authorizedResponse = rtrList.get(i).client().resource(badDomainResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, authorizedResponse.getStatus());
        }
    }

    @Test
    public void testBadDomainResponseNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse nonauthorizedResponse = nonCprsRtrList.get(i).client().resource(badDomainResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, nonauthorizedResponse.getStatus());
        }
    }

    @Test
    public void testBadPidResponse() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse authorizedResponse = rtrList.get(i).client().resource(badPidResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, authorizedResponse.getStatus());
        }
    }

    @Test
    public void testBadPidResponseNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse nonauthorizedResponse = nonCprsRtrList.get(i).client().resource(badPidResponseTestUrl).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, nonauthorizedResponse.getStatus());
        }
    }

    /**
     * Test for {@link VprResource#getJdsLabsByOrderUid(User, HttpHeaders, HttpServletRequest, UriInfo, String, String, boolean)}
     * <br><br>
     * This test tests a successful case.
     */
    @Test
    public void testLabsByOrderUidResponse() {
        if (vprDomain == VprDomain.ORDER) {
            for (int i = 0; i < rtrList.size(); i++) {
                ClientResponse authorizedResponse = rtrList.get(i).client().resource(labsByOrderUidResponseTestUrl).get(ClientResponse.class);
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), expectedStatus, authorizedResponse.getStatus());

                String responseMessage = authorizedResponse.getEntity(String.class);
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;4"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;3"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;2"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;5"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;6"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;7"));
                assertThat(responseMessage, containsString("urn:va:lab:9E7A:3:CH;6949681.984076;8"));
            }
        }
    }

    /**
     * Test for {@link VprResource#getJdsLabsByOrderUid(User, HttpHeaders, HttpServletRequest, UriInfo, String, String, boolean)}
     * <br><br>
     * This test tests the case where a bad UID is provided.
     */
    @Test
    public void testLabsByOrderUidResponseBadOrderUid() {
        if (vprDomain == VprDomain.ORDER) {
            for (int i = 0; i < rtrList.size(); i++) {
                ClientResponse authorizedResponse = rtrList.get(i).client().resource(labsByOrderUidBadResponseTestUrl).get(ClientResponse.class);
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, authorizedResponse.getStatus());

                String responseMessage = authorizedResponse.getEntity(String.class);
                assertThat(responseMessage, containsString("pid " + pid + " does not exist or order uid BAD_UID does not exsit"));
            }
        }
    }

    /**
     * Test for {@link VprResource#getJdsLabsByOrderUid(User, HttpHeaders, HttpServletRequest, UriInfo, String, String, boolean)}
     * <br><br>
     * This test tests a forbidden authorization.
     */
    @Test
    public void testLabsByOrderUidResponseNonCprs() {
        if (vprDomain == VprDomain.ORDER) {
            for (int i = 0; i < rtrList.size(); i++) {
                ClientResponse authorizedResponse = nonCprsRtrList.get(i).client().resource(labsByOrderUidResponseTestUrl).get(ClientResponse.class);
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, authorizedResponse.getStatus());
            }
        }
    }
}
