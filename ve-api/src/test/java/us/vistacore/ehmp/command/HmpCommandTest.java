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
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;

import java.io.IOException;
import java.util.ArrayList;
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
public class HmpCommandTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() throws IOException {
        return ImmutableList.<Object[]>builder()
            .add(new Object[]{toText("vpr_json/med_9E7A-116.json"), "metformin", VprDomain.MED.getId()})
           // .add(new Object[]{toText("vpr_json/patient_0001.json"), VprDomain.PATIENT})
            .build();
    }

    /**
     * parameterized members
     */
    private final String json;
    private final String vprDomain;
    private final String textSearch;

    /**
     * Object under test
     */
    private HmpCommand command;
    private User user;

    public HmpCommandTest(String json, String textSearch, String vprDomain) {
        this.json = json;
        this.vprDomain = vprDomain;
        this.textSearch = textSearch;
        this.user = new User("pu1234", "pu1234!!", "9E7A", "500");
    }

    @Before
    public void prepareForTest() throws CommandException {
        // we must call this to simulate a new request lifecycle running and clearing caches
        HystrixRequestContext.initializeContext();

        // create test object
        this.command = spy(new HmpCommand(this.user, new HmpConfiguration(), new JdsConfiguration(), "9E7A;116", textSearch, vprDomain));
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
        assertThat(command.getCommandGroup(), is(HmpCommand.GROUP_KEY));
        assertThat(command.getCommandKey(), is(HmpCommand.COMMAND_KEY));
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
        new HmpCommand(this.user, null, new JdsConfiguration(), "9E7A;116", "metformin", "MED");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testNullClient() {
        new HmpCommand(this.user, new HmpConfiguration(), new JdsConfiguration(), null, "metformin", "MED");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testNullResultsType() {
        new HmpCommand(this.user, new HmpConfiguration(), new JdsConfiguration(), "9E7A;116", "metforin", null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testNullUser() {
        new HmpCommand(null, new HmpConfiguration(), new JdsConfiguration(), "9E7A;116", "metforin", "MED");
    }

    private static String toText(String resource) throws IOException {
        return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
    }

}
