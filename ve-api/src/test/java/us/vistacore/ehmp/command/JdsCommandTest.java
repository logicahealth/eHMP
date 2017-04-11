package us.vistacore.ehmp.command;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.io.Resources;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.netflix.config.ConfigurationManager;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;

import org.hamcrest.Matchers;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import rx.Observable;
import rx.util.functions.Action1;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;

@RunWith(Parameterized.class)
public class JdsCommandTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() throws IOException {
        return ImmutableList.<Object[]>builder()
            .add(new Object[]{toText("vpr_json/lab_10108V420871.json"), VprDomain.LAB})
            .add(new Object[]{toText("vpr_json/patient_10108V420871.json"), VprDomain.PATIENT})
            .build();
    }

    /**
     * parameterized members
     */
    private final String json;
    private final VprDomain vprDomain;

    /**
     * Object under test
     */
    private JdsCommand command;

    public JdsCommandTest(String json, VprDomain vprDomain) {
        this.json = json;
        this.vprDomain = vprDomain;
    }

    @Before
    public void prepareForTest() throws CommandException {
        // we must call this to simulate a new request lifecycle running and clearing caches
        HystrixRequestContext.initializeContext();

        // create test object
        this.command = spy(new JdsCommand(new JdsConfiguration(), "1234", vprDomain));
        doReturn(new Gson().fromJson(json, JsonElement.class)).when(this.command).run();
    }

    @After
    public void cleanup() {
        // instead of storing the reference from initialize we'll just get the current state and shutdown
        if (HystrixRequestContext.getContextForCurrentThread() != null) {
            // it could have been set NULL by the test
            HystrixRequestContext.getContextForCurrentThread().shutdown();
        }

        // force properties to be clean as well
        ConfigurationManager.getConfigInstance().clear();
    }

    @Test
    public void testCommandSettings()  {
        assertThat(command.getCommandGroup(), is(JdsCommand.GROUP_KEY));
        assertThat(command.getCommandKey(), is(JdsCommand.COMMAND_KEY));
    }

    @Test
    public void testSynchronous() {
        assertNotNull(command);
        JsonElement result = command.execute();
        assertNotNull(result);
        assertFalse(command.isFailedExecution());
    }

    @Test(expected = IllegalStateException.class)
    public void testDoubleExecution() {
        command.execute();
        command.execute();  // second command execution should throw IllegalStateException
    }

    @Test
    public void testAsynchronousInline() throws Exception {
        try {
            JsonElement result = command.queue().get();
            assertThat(result, is(instanceOf(JsonElement.class)));
            assertFalse(command.isFailedExecution());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            fail();
        }
    }

    @Test
    public void testAsynchronousFuture() throws ExecutionException, InterruptedException {
        Future<JsonElement> resultFuture = command.queue();

        assertNotNull(resultFuture);
        assertFalse(resultFuture.isCancelled());

        JsonElement result = resultFuture.get();
        assertTrue(command.isExecutionComplete());
        assertThat(result, is(Matchers.instanceOf(JsonElement.class)));
    }

    @Test
    public void testSynchronousObservable() {
        Observable<JsonElement> resultObservable = command.observe();
        JsonElement result = resultObservable.toBlockingObservable().single();
        assertThat(result, is(new JsonParser().parse(this.json)));
    }

    @Test
    public void testAsynchronousObservable() throws InterruptedException {
        Observable<JsonElement> resultObservable = command.observe();
        final List<JsonElement> called = new ArrayList<>();
        final CountDownLatch latch = new CountDownLatch(1);

        // non-blocking callback subscription
        resultObservable.subscribe(new Action1<JsonElement>() {

            // ActionN ignores failures.
            // Use Observer<T> for more versbose callbacks
            @Override
            public void call(JsonElement jsonElement) {
                called.add(jsonElement);
                latch.countDown();
            }
        });

        // Wait until latch counts to 0, or until 10 seconds are up
        latch.await(10, TimeUnit.SECONDS);
        assertThat(latch.getCount(), is(0L));
        assertThat(called.get(0), is(new JsonParser().parse(this.json)));
    }


    @Test(expected = IllegalArgumentException.class)
    public void testNullSite() {
        new JdsCommand(null, "1234", VprDomain.ALLERGY);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testNullClient() {
        new JdsCommand(new JdsConfiguration(), null, VprDomain.ALLERGY);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testNullResultsType() {
        new JdsCommand(new JdsConfiguration(), "1234", null);
    }

    /**
     * Test for {@link JdsCommand#getLabUids(String)}
     * <br><br>
     * This test tests for the case where a list of lab UIDs is returned given
     * an order JSON.
     *
     * @throws IOException
     */
    @Test
    public void testGetLabUidsListOfUidsReturn() throws IOException {
        String orderJson = toText("vpr_json/order_9E7A-10108.json");
        List<String> result = JdsCommand.getLabUids(orderJson);
        List<String> expectedResults = new ArrayList<String>(Arrays.asList("urn:va:lab:9E7A:3:CH;6949681.984076;4", "urn:va:lab:9E7A:3:CH;6949681.984076;3", "urn:va:lab:9E7A:3:CH;6949681.984076;2", "urn:va:lab:9E7A:3:CH;6949681.984076;5", "urn:va:lab:9E7A:3:CH;6949681.984076;6", "urn:va:lab:9E7A:3:CH;6949681.984076;7", "urn:va:lab:9E7A:3:CH;6949681.984076;8"));
        assertEquals(expectedResults, result);
    }

    /**
     * Test for {@link JdsCommand#getLabUids(String)}
     * <br><br>
     * This test tests for the case where an empty list is returned if no data
     * elements exist.
     */
    @Test
    public void testGetLabUidsNoDataElementEmptyListReturn() {
        String orderJson = "{}";
        List<String> result = JdsCommand.getLabUids(orderJson);
        List<String> expectedResults = new ArrayList<String>();
        assertEquals(expectedResults, result);
    }

    /**
     * Test for {@link JdsCommand#getLabUids(String)}
     * <br><br>
     * This test tests for the case where an empty list is returned if no items
     * elements exist.
     */
    @Test
    public void testGetLabUidsNoItemsElementEmptyListReturn() {
        String orderJson = "{\"data\": {}}";
        List<String> result = JdsCommand.getLabUids(orderJson);
        List<String> expectedResults = new ArrayList<String>();
        assertEquals(expectedResults, result);
    }

    /**
     * Test for {@link JdsCommand#getLabUids(String)}
     * <br><br>
     * This test tests for the case where an empty list is returned if items
     * elements is empty.
     */
    @Test
    public void testGetLabUidsItemsElementEmptyEmptyListReturn() {
        String orderJson = "{\"data\": {\"items\":[]}}";
        List<String> result = JdsCommand.getLabUids(orderJson);
        List<String> expectedResults = new ArrayList<String>();
        assertEquals(expectedResults, result);
    }

    /**
     * Test for {@link JdsCommand#getLabUids(String)}
     * <br><br>
     * This test tests for the case where an empty list is returned if no results
     * elements exist.
     */
    @Test
    public void testGetLabUidsNoResultsElementEmptyListReturn() {
        String orderJson = "{\"data\": {\"items\":[{}]}}";
        List<String> result = JdsCommand.getLabUids(orderJson);
        List<String> expectedResults = new ArrayList<String>();
        assertEquals(expectedResults, result);
    }

    /**
     * Test for {@link JdsCommand#getFirstLab(String)}
     * <br><br>
     * This test tests for the case where the lab is returned as a JSON element.
     *
     * @throws IOException
     */
    @Test
    public void testGetFirstLabLabReturn() throws IOException {
        String labJson = toText("vpr_json/lab_10108V420871.json");
        JsonElement resultJson = JdsCommand.getFirstLab(labJson);
        String resultUid = resultJson.getAsJsonObject().get("uid").toString();
        String expectedUid = "\"urn:va:lab:DOD:0000000003:1000000433\"";
        assertEquals(expectedUid, resultUid);
    }

    /**
     * Test for {@link JdsCommand#getFirstLab(String)}
     * <br><br>
     * This test tests for the case where the data element is missing. Null is
     * returned.
     */
    @Test
    public void testGetFirstLabNoDataElementNullReturn() {
        String labJson = "{}";
        JsonElement resultJson = JdsCommand.getFirstLab(labJson);
        assertNull(resultJson);
    }

    /**
     * Test for {@link JdsCommand#getFirstLab(String)}
     * <br><br>
     * This test tests for the case where the items element is missing. Null is
     * returned.
     */
    @Test
    public void testGetFirstLabNoItemsElementNullReturn() {
        String labJson = "{\"data\": {}}";
        JsonElement resultJson = JdsCommand.getFirstLab(labJson);
        assertNull(resultJson);
    }

    /**
     * Test for {@link JdsCommand#getFirstLab(String)}
     * <br><br>
     * This test tests for the case where the items element is empty. Null is
     * returned.
     */
    @Test
    public void testGetFirstLabItemsElementEmptyNullReturn() {
        String labJson = "{\"data\": {\"items\":[]}}";
        JsonElement resultJson = JdsCommand.getFirstLab(labJson);
        assertNull(resultJson);
    }

    private static String toText(String resource) throws IOException {
        return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
    }

}
