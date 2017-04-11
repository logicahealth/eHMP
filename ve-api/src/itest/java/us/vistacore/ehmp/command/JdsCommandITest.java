package us.vistacore.ehmp.command;

import ch.qos.logback.classic.Level;
import com.google.common.collect.ImmutableList;
import com.google.gson.JsonElement;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
import org.junit.*;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.model.VprDomain;

import java.io.IOException;
import java.util.Collection;

import static org.junit.Assert.assertNotNull;

@RunWith(Parameterized.class)
@Ignore("relies on JDS operations which would work at any time after ODC sync in S54, but in S64 only work after the patient is synchronized")
public class JdsCommandITest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() throws IOException {
        return ImmutableList.<Object[]>builder()
            .add(new Object[]{"10108V420871", VprDomain.LAB})
            .add(new Object[]{"10108V420871", VprDomain.PATIENT})
            .add(new Object[]{"10108V420871", VprDomain.VITAL})
            .add(new Object[]{"10108V420871", VprDomain.ALLERGY})
            .add(new Object[]{"10108V420871", VprDomain.RAD})
            .build();
    }

    /**
     * Parameterized instance variables
     */
    private String pid;
    private VprDomain vprDomain;

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    public JdsCommandITest(String pid, VprDomain vprDomain) {
        this.pid = pid;
        this.vprDomain = vprDomain;
    }

    @Before
    public void setup() {
        Hystrix.reset();
        HystrixRequestContext.initializeContext();
        ITestUtils.setLoggingLevel(Level.ALL);
    }

    @After
    public void tearDown() {
        HystrixRequestContext.getContextForCurrentThread().shutdown();
    }

    @Test
    public void testReturnString() {
        JsonElement json = new JdsCommand(ITestUtils.getJdsConfiguration(), this.pid, this.vprDomain).execute();
        assertNotNull("Data for PID: " + pid + " on domain: " + this.vprDomain.name() + " should not be null.", json);
    }

    @SuppressWarnings("unused")
    @Test
    public void testBadRequest() {
        thrown.expect(HystrixBadRequestException.class);
        JsonElement badpid = new JdsCommand(ITestUtils.getJdsConfiguration(), "badpid", this.vprDomain).execute();
    }

}
