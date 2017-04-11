package us.vistacore.ehmp.resources;

import static org.fest.assertions.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.command.StatusCommand;
import us.vistacore.ehmp.command.SyncCommand;

import ch.qos.logback.classic.Level;

import com.google.common.collect.ImmutableList;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
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
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

@RunWith(Parameterized.class)
public class AdminResourceITest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]> builder()
                .add(new Object[] { "10104V248233" })
                .add(new Object[] { "9E7A;2" })
                .add(new Object[] { "9E7A;737" })
                .build();
    }

    /**
     * Parameterized instance variables
     */
    private String pid;

    public AdminResourceITest(String pid) {
        this.pid = pid;
    }

    private static List<ResourceTestRule> rtrList;

    @Before
    public void setup() throws UnsupportedEncodingException {
        ITestUtils.setLoggingLevel(Level.ALL);
        Hystrix.reset();
        HystrixRequestContext.initializeContext();

        clearPatientAndCheckSyncStatus(1);

        rtrList = new ArrayList<ResourceTestRule>();
        rtrList.add(RESOURCES);

        if (ITestUtils.isVe2Up()) {
            rtrList.add(RESOURCES_2);
            clearPatientAndCheckSyncStatus(2);
        }
    }

    private void clearPatientAndCheckSyncStatus(int veInstance) {
        // clear patient
        new SyncCommand(ITestUtils.getUser(), ITestUtils.getHmpConfiguration(veInstance), ITestUtils.getJdsConfiguration(veInstance), this.pid, true).execute();

        // check that syncStatus is not found
        assertNull(StatusCommand.getSyncStatus(ITestUtils.getJdsConfiguration(veInstance), this.pid));
    }

    @After
    public void tearDown() {
        rtrList.clear();
        HystrixRequestContext.getContextForCurrentThread().shutdown();
    }

    /**
     * Setup for REST Resource under test
     */
    @ClassRule public static final ResourceTestRule RESOURCES = ResourceTestRule.builder()
            .addResource(new AdminResource(ITestUtils.getHmpConfiguration(), ITestUtils.getJdsConfiguration()))
            .addFeature(ResourceConfig.FEATURE_MATCH_MATRIX_PARAMS, true)
            .addProvider(UriInfoResolver.class)
            .addProvider(HttpServletRequestResolver.class)
            .addProvider(HttpHeadersResolver.class)
            .addProvider(AuthResolver.class)
            .build();

    @ClassRule public static final ResourceTestRule RESOURCES_2 = ResourceTestRule.builder()
            .addResource(new AdminResource(ITestUtils.getHmpConfiguration(2), ITestUtils.getJdsConfiguration(2)))
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
            super(User.class, ITestUtils.getUser());
        }
    }

    @Test
    public void testStatus() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse statusResponse = rtrList.get(i).client().resource("/admin/sync/" + this.pid).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, statusResponse.getStatus());
        }
    }

    @Test
    public void testSync() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse syncResponse = rtrList.get(i).client().resource("/admin/sync/" + this.pid).put(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_CREATED, syncResponse.getStatus());
            try {
                assertThat(syncResponse.getEntity(String.class)).containsIgnoringCase("syncComplete");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }

            ClientResponse statusResponse = rtrList.get(i).client().resource("/admin/sync/" + this.pid).get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, statusResponse.getStatus());
        }
    }

    @Test
    public void testUnsync() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse unsyncResponse = rtrList.get(i).client().resource("/admin/sync/" + this.pid).delete(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, unsyncResponse.getStatus());
            try {
                assertThat(unsyncResponse.getEntity(String.class)).containsIgnoringCase("unsynced");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testBadPidStatus() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse syncResponse = rtrList.get(i).client().resource("/admin/sync/" + "BAD_PID").get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, syncResponse.getStatus());
        }
    }

    @Test
    public void testBadPidSync() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse syncResponse = rtrList.get(i).client().resource("/admin/sync/" + "BAD_PID").put(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, syncResponse.getStatus());
            try {
                assertThat(syncResponse.getEntity(String.class)).containsIgnoringCase("not a valid pid");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testBadPidUnsync() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse unsyncResponse = rtrList.get(i).client().resource("/admin/sync/" + "BAD_PID").delete(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_NOT_FOUND, unsyncResponse.getStatus());
            try {
                assertThat(unsyncResponse.getEntity(String.class)).containsIgnoringCase("not a valid pid");
            } catch (AssertionError e) {
                ITestUtils.fail(i + 1, e);
            }
        }
    }

    @Test
    public void testOperationalStatus() {
        for (int i = 0; i < rtrList.size(); i++) {
            ClientResponse status = rtrList.get(i).client().resource("/admin/sync/operational").get(ClientResponse.class);
            assertEquals(ITestUtils.getVeInstanceMessage(i + 1), Response.SC_OK, status.getStatus());
        }
    }

}
