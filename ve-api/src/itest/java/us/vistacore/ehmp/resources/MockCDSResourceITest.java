package us.vistacore.ehmp.resources;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;

import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.authentication.User;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.spi.inject.SingletonTypeInjectableProvider;

import io.dropwizard.auth.Auth;
import io.dropwizard.testing.junit.ResourceTestRule;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.Provider;

import org.eclipse.jetty.server.Response;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

@RunWith(Parameterized.class)
@Ignore("CDS/HDR is currently disabled.")
public class MockCDSResourceITest {

    /**
     * Static data for Parameterized JUnit Test
     */
    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        Builder<Object[]> builder = ImmutableList.<Object[]> builder();
        for (int i = 0; i < patients.length; i++) {
            for (int j = 0; j < domains.length; j++) {
                builder.add(new Object[] { i, j });
            }
        }
        return builder.build();
    }

    private static final String patients[] = { "10105V001065", "10106V187557" };
    private static final String domains[] = { "allergy", "appointment", "consult", "cpt", "document", "education", "exam", "factor", "image",
        "immunization", "lab", "mh", "order", "pov", "problem", "procedure", "skin", "surgery", "visit", "vital" };

    /**
     * Injected instance variables for Parameterized JUnit Test
     */
    private int patientIndex;
    private int domainIndex;

    public MockCDSResourceITest(int patientIndex, int domainIndex) {
        this.patientIndex = patientIndex;
        this.domainIndex = domainIndex;
    }

    private static final int goodRequestExpectedStatus = Response.SC_OK;
    private static final int badRequestExpectedStatus = Response.SC_BAD_REQUEST;

    private static final String mockCDSFacilityName = "CDS DATA";
    private static final String mockCDSSiteCode = "0CD5";

    private static final String CPRSUSER_SITECODE = "9E7A";
    private static final String CPRSUSER_DIVISIONCODE = "500";
    private static final String CPRSUSER_ACCESSCODE = "pu1234";
    private static final String CPRSUSER_VERIFYCODE = "pu1234!!";

    private static final String CLIENT = "dummyClient";

    private static List<ResourceTestRule> vprResourceList;

    @Before
    public void setup() throws UnsupportedEncodingException {
        vprResourceList = new ArrayList<ResourceTestRule>();
        vprResourceList.add(VPR_RESOURCES);
        if (ITestUtils.isVe2Up()) {
            vprResourceList.add(VPR_RESOURCES_2);
        }
    }

    @After
    public void tearDown() {
        vprResourceList.clear();
    }

    /**
     * Setup for REST Resource under test
     */
    @ClassRule public static final ResourceTestRule VPR_RESOURCES = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration(), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule VPR_RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new VprResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule MOCK_CDS_RESOURCES = ResourceTestRule.builder()
            .addResource(new MockCDSResource())
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
            super(User.class, new User(CPRSUSER_ACCESSCODE, CPRSUSER_VERIFYCODE, CPRSUSER_SITECODE, CPRSUSER_DIVISIONCODE, "true", "true"));
        }
    }

    @Test
    public void testMockDataInResponse() {
        for (int i = 0; i < vprResourceList.size(); i++) {
            ClientResponse response = vprResourceList.get(i).client().resource(VprResource.CONTEXT + "/" + patients[patientIndex] + "/" + domains[domainIndex]).get(ClientResponse.class);
            // Verify that the response is OK.
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, response.getStatus());

            // Verify that the response contains a record with mock CDS data.
            String responseMessage = response.getEntity(String.class);
            assertThat(responseMessage, containsString(mockCDSFacilityName));
            assertThat(responseMessage, containsString(mockCDSSiteCode));
        }
    }

    protected static String buildUrl(String patient, String domain, String client) {
        return "/repositories.domain.ext/fpds/GenericObservationRead1/GENERIC_VISTA_LIST_DATA_FILTER/"
                + patient + "/"
                + domain + "/"
                + "?clientName=" + client;
    }

    @Test
    public void testGoodRequest() {
        ClientResponse response = MOCK_CDS_RESOURCES.client().resource(buildUrl(patients[patientIndex], domains[domainIndex], CLIENT)).get(ClientResponse.class);
        assertEquals(goodRequestExpectedStatus, response.getStatus());
    }

    @Test
    public void testBadRequest() {
        // Hack to make this only run once:
        if ((patientIndex == 0) && (domainIndex == 0)) {
            ClientResponse response = MOCK_CDS_RESOURCES.client().resource(buildUrl("bogusPatient", "bogusDomain", CLIENT)).get(ClientResponse.class);
            assertEquals(badRequestExpectedStatus, response.getStatus());
        }
    }

}
