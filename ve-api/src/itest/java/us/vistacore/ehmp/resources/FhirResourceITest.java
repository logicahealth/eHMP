package us.vistacore.ehmp.resources;

import com.google.common.collect.ImmutableList;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.spi.inject.SingletonTypeInjectableProvider;
import io.dropwizard.auth.Auth;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.apache.commons.lang.WordUtils;
import org.eclipse.jetty.server.Response;
import org.hl7.fhir.instance.formats.JsonParser;
import org.hl7.fhir.instance.formats.Parser;
import org.hl7.fhir.instance.formats.ParserBase;
import org.hl7.fhir.instance.formats.XmlParser;
import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AtomEntry;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Patient;
import org.hl7.fhir.instance.model.Resource;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.model.transform.FhirToJson;
import us.vistacore.ehmp.util.FhirUtils;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.Provider;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.fest.assertions.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * A test class for {@link FhirResource}.
 *
 * This test creates a JAX-RS resource under test in a Jersey Container {@see JerseyTest}, then executes each test case with the supplied parameters from {@link #data()}.
 *
 * See DropWizard testing examples at https://github.com/dropwizard/dropwizard/blob/master/docs/source/manual/testing.rst
 *
 * @author seth.gainey
 */
@RunWith(Parameterized.class)
public class FhirResourceITest<T extends Resource> {

    /**
     * Injected instance variables for Parameterized JUnit Test
     */
    private final String resourceEndpoint;
    private String icnSearchPath;
    @SuppressWarnings("unused") private final VprDomain vprDomain;
    private final Class<T> resourceClass;
    private String resourceId;

    private static final String PATIENT_ID = "10108V420871";
    private static final String SENSITIVE_PATIENT_ID = "9E7A;20";
    private static final String BAD_PATIENT_ID = "BADPID";

    private static final String SITECODE = "9E7A";
    private static final String DIVISIONCODE = "500";
    
    private static final String CPRSUSER_ACCESSCODE = "pu1234";
    private static final String CPRSUSER_VERIFYCODE = "pu1234!!";

    private static final String NONCPRSUSER_ACCESSCODE = "lu1234";
    private static final String NONCPRSUSER_VERIFYCODE = "lu1234!!";

    public FhirResourceITest(String resourceEndpoint, String icnSearchPath, VprDomain vprDomain, Class<T> resourceClass, String resourceId) {
        this.resourceEndpoint = resourceEndpoint;
        this.icnSearchPath = icnSearchPath;
        this.vprDomain = vprDomain;
        this.resourceClass = resourceClass;
        this.resourceId = resourceId;
    }

    /**
     * Static data generator for Parameterized JUnit Test
     */
    @Parameterized.Parameters
    public static Collection<Object[]>data() {
        return ImmutableList.<Object[]>builder()
                .add(new Object[] { "/fhir/adverseReaction", "subject.identifier", VprDomain.ALLERGY, AdverseReaction.class, null })
                .add(new Object[] { "/fhir/diagnosticReport", "subject.identifier", VprDomain.LAB, DiagnosticReport.class, null })
                .add(new Object[] { "/fhir/observation", "subject.identifier", VprDomain.VITAL, Observation.class, null })
                .add(new Object[] { "/fhir/patient", "identifier", VprDomain.PATIENT, Patient.class, "urn:va:pt-select:9E7A:100022:100022" })
                .build();
    }

    /**
     * Setup for REST Resource under test
     */
    @ClassRule public static final ResourceTestRule RESOURCES = ResourceTestRule.builder()
            .addResource(new FhirResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration(), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new FhirResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule NONCPRSUSER_RESOURCES = ResourceTestRule.builder()
            .addResource(new FhirResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration(), ITestUtils.getPEP()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(NonCprsAuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule NONCPRSUSER_RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new FhirResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2), ITestUtils.getPEP()))
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

    @Test
    public void testResponse() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse responseWithoutSearch = rtrList.get(i).client().resource(this.resourceEndpoint).get(ClientResponse.class);
            ClientResponse responseWithSearch = rtrList.get(i).client().resource(this.resourceEndpoint + "/_search").get(ClientResponse.class);

            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, responseWithoutSearch.getStatus());
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, responseWithSearch.getStatus());
        }
    }

    @Test
    public void testResponseNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse response = nonCprsRtrList.get(i).client().resource(this.resourceEndpoint + "?" + icnSearchPath + "=" + PATIENT_ID).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, response.getStatus());
        }
    }

    @Test
    public void testResourceNameCaseInsensitivity() {
        String[] segments = this.resourceEndpoint.split("/");
        String uppercaseEndpoint = "/" + segments[1] + "/" + WordUtils.capitalize(this.resourceEndpoint.split("/")[2]);
        for (int i = 0; i < rtrList.size(); i++) {
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, rtrList.get(i).client().resource(uppercaseEndpoint).get(ClientResponse.class).getStatus());
        }
    }

    @Test
    public void testMimeType() {
        for (int i = 0; i < rtrList.size(); i++) {
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint).get(ClientResponse.class).getType());
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "/_search").get(ClientResponse.class).getType());

            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.XML_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=xml").get(ClientResponse.class).getType());
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.XML_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "/_search?_format=xml").get(ClientResponse.class).getType());

            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json").get(ClientResponse.class).getType());
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "/_search?_format=json").get(ClientResponse.class).getType());
        }
    }

    @Test
    public void testMimeTypeEquivalency() {
        for (int i = 0; i < rtrList.size(); i++) {
            for (String format : new String[] { FhirResource.JSON_MIMETYPES[2] }) {
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=" + format.replace("+", "%2B")).get(ClientResponse.class).getType());
            }

            for (String format : FhirResource.XML_MIMETYPES) {
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.XML_FEED_FHIR_MIMETYPE), rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=" + format.replace("+", "%2B")).get(ClientResponse.class).getType());
            }
        }
    }

    @Test
    public void testFeedNameSearch() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json&" + icnSearchPath + "=" + PATIENT_ID).get(ClientResponse.class);
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), feed);
            try {
                assertThat(feed.getTitle()).contains(resourceClass.getSimpleName() + " with");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testFeedNameNotSearch() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json").get(ClientResponse.class);
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), feed);
            try {
                assertThat(feed.getTitle()).startsWith("All");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testFeedEquivalency() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse xmlResponse = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=xml").get(ClientResponse.class);
            AtomFeed xmlFeed = xmlToAtomFeed(xmlResponse.getEntityInputStream());

            ClientResponse jsonResponse = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json").get(ClientResponse.class);
            AtomFeed jsonFeed = jsonToAtomFeed(jsonResponse.getEntityInputStream());

            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), xmlFeed);
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), jsonFeed);
            try {
                assertThat(xmlFeed).isNotEqualTo(jsonFeed);
                assertThat(xmlFeed).isLenientEqualsToByAcceptingFields(jsonFeed, "title", "authorName", "authorUri");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testFeedDates() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json").get(ClientResponse.class);
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), feed.getUpdated());
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), feed.getUpdated().toCalendar());
            assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), FhirUtils.toCalender(feed.getUpdated()));
        }
    }

    @Test
    public void testRelativeLinks() {
        String searchParameters = "?_format=json";
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + searchParameters).get(ClientResponse.class);
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            for (AtomEntry<?> entry : feed.getEntryList()) {
                assertNotNull(ITestUtils.getVeInstanceMessage(i + 1), entry.getId());
                try {
                    assertThat(entry.getId()).doesNotContain(searchParameters);
                } catch (AssertionError e) {
                    ITestUtils.fail(i + 1, e);
                }
            }
        }
    }

    @Test
    public void testGetByResourceId() {
        if (this.resourceId != null) {
            for (int i = 0; i < rtrList.size(); i++) {
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.XML_FHIR_MIMETYPE), rtrList.get(i).client().resource("/fhir/Patient/@" + resourceId + "&_format=xml").get(ClientResponse.class).getType());
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FHIR_MIMETYPE), rtrList.get(i).client().resource("/fhir/Patient/@" + resourceId + "&_format=json").get(ClientResponse.class).getType());
                assertEquals(ITestUtils.getVeInstanceMessage(i + 1), MediaType.valueOf(FhirResource.JSON_FHIR_MIMETYPE), rtrList.get(i).client().resource("/fhir/Patient/@" + resourceId).get(ClientResponse.class).getType());
            }
        }
    }

    @Test
    public void testGetBadPid() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?" + icnSearchPath + "=" + BAD_PATIENT_ID).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, response.getStatus());
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            System.out.println(FhirToJson.transform(feed, true));
        }
    }

    @Test
    public void testGetBadPidNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse response = nonCprsRtrList.get(i).client().resource(this.resourceEndpoint + "?" + icnSearchPath + "=" + BAD_PATIENT_ID).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, response.getStatus());
        }
    }

    @Test
    public void testSensitivePatient() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?" + icnSearchPath + "=" + SENSITIVE_PATIENT_ID).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_TEMPORARY_REDIRECT, response.getStatus());
        }
    }

    @Test
    public void testSensitivePatientNonCprs() {
        for (int i = 0; i < nonCprsRtrList.size(); i++) {
            ClientResponse response = nonCprsRtrList.get(i).client().resource(this.resourceEndpoint + "?" + icnSearchPath + "=" + SENSITIVE_PATIENT_ID).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_FORBIDDEN, response.getStatus());
        }
    }

    @Test
    @Ignore("Temporary method for testing end-to-end functionality")
    public void testEndToEnd() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse response = rtrList.get(i).client().resource(this.resourceEndpoint + "?_format=json&" + icnSearchPath + "=" + PATIENT_ID).get(ClientResponse.class);
            AtomFeed feed = jsonToAtomFeed(response.getEntityInputStream());
            System.out.println(FhirToJson.transform(feed, true));
        }
    }

    private static AtomFeed xmlToAtomFeed(InputStream input) {
        Parser parser = new XmlParser();
        ParserBase.ResourceOrFeed resourceOrFeed = null;
        try {
            resourceOrFeed = parser.parseGeneral(input);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return resourceOrFeed.getFeed();
    }

    private static AtomFeed jsonToAtomFeed(InputStream input) {
        Parser parser = new JsonParser();
        ParserBase.ResourceOrFeed resourceOrFeed = null;
        try {
            resourceOrFeed = parser.parseGeneral(input);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return resourceOrFeed.getFeed();
    }

}
