package us.vistacore.ehmp.command;

import com.google.gson.JsonElement;
import com.netflix.hystrix.exception.HystrixRuntimeException;

import org.hamcrest.Matchers;
import org.junit.Test;

import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;

import java.util.concurrent.atomic.AtomicInteger;

import static java.lang.Thread.sleep;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * This class contains test cases which do not access network resources, but must still be considered integration tests because of their long execution time
 */
public class SyncCommandNonNetworkITest {

    @Test
    public void testTimeoutAndTotalExecutionTime() {
        final int secondsToWait = 1;
        final AtomicInteger fallbacks = new AtomicInteger(0);
        SyncCommand testCommand = new SyncCommand(ITestUtils.getUser(), new HmpConfiguration() { }, new JdsConfiguration() { }, "12345", true) {
            @Override
            protected JsonElement run() throws InterruptedException {
                return this.timeoutMethod();
            }

            private JsonElement timeoutMethod() throws InterruptedException {
                sleep(secondsToWait * 1000);
                throw new InterruptedException("Trigger fallback.");
            }

            @Override
            protected JsonElement getFallback() {
                fallbacks.getAndIncrement();
                try {
                    return this.timeoutMethod();
                } catch (InterruptedException e) {
                    throw new HystrixRuntimeException(HystrixRuntimeException.FailureType.COMMAND_EXCEPTION, this.getClass(), "retry limit reached; fallback cancelled.", null, this.getFailedExecutionException());
                }
            }
        };

        JsonElement result = null;
        Exception expected = null;
        try {
            result = testCommand.execute();
        } catch (RuntimeException e) {
            expected = e;
        }

        assertNotNull(expected);
        assertThat(expected, instanceOf(HystrixRuntimeException.class));
        assertNull(result);
        assertThat(fallbacks.get(), Matchers.is(1));
        assertThat(testCommand.getExecutionTimeInMilliseconds(), Matchers.is(greaterThan(secondsToWait * 2 * 1000)));
    }

}
