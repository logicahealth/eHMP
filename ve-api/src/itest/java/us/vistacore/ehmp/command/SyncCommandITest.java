package us.vistacore.ehmp.command;

import ch.qos.logback.classic.Level;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;

import org.hamcrest.core.IsInstanceOf;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import rx.util.TimeInterval;
import rx.util.functions.Action1;
import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.model.VprDomain;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.*;
import static us.vistacore.ehmp.ITestUtils.getHmpConfiguration;
import static us.vistacore.ehmp.ITestUtils.getJdsConfiguration;

@RunWith(Parameterized.class)
public class SyncCommandITest {

    private static Logger logger = LoggerFactory.getLogger(SyncCommandITest.class);

    @Parameterized.Parameters
    public static Collection<Object[]> data() throws IOException {
        return ImmutableList.<Object[]>builder()
                .add(new Object[]{"10104V248233", 4})  // PATIENT FOUR
//                .add(new Object[]{"10105V001065", 4})  // PATIENT FIVE
                .add(new Object[]{"10106V187557", 4})  // PATIENT SIX
                .add(new Object[]{"9E7A;2", 2}) // PATIENT ZZZRETFIVEFORTYSEVEN
                .build();
    }

    /**
     * Parameterized instance variables
     */
    private String pid;
    private int expectedAllergies;

    public SyncCommandITest(String pid, int expectedAllergies) {
        this.pid = pid;
        this.expectedAllergies = expectedAllergies;
    }

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Before
    public void setup() {
        System.out.println("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        System.out.println("Begin setup for a test on pid: " + this.pid);
        logger.debug("Begin setup for a test on pid: " + this.pid);
        ITestUtils.setLoggingLevel(Level.ALL);
        Hystrix.reset();
        HystrixRequestContext.initializeContext();

        // unsync patient
        new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
        
        // check that syncStatus is not found
        
        JsonObject syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        if (syncStatus != null) {
            System.out.println("This patient was unsynchronized - but still has data - lets try one more time to unsynchronize them.  Pid: " + this.pid);
            logger.debug("This patient was unsynchronized - but still has data - lets try one more time to unsynchronize them.  Pid: " + this.pid);
            new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
            syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        }
        assertNull("Setup Phase: Expected the status to be null.  The patient was just unsynced.", syncStatus);

        // check that no allergies exist for patient
        assertNoData(this.pid, VprDomain.ALLERGY);
        System.out.println("End setup for a test on pid: " + this.pid);
        logger.debug("End setup for a test on pid: " + this.pid);
        System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }

    @After
    public void tearDown() {
        HystrixRequestContext.getContextForCurrentThread().shutdown();
    }
    
    @Test
    @Ignore("This is really not needed.  We are already unsyncing the patient before each test - which is multiple times.")
    public void testMultipleUnsync() {
        System.out.println("Begin testMultipleUnsync on pid: " + this.pid);
        logger.debug("Begin testMultipleUnsync on pid: " + this.pid);
        for (int i = 0; i < 3; i++) {
            JsonElement unsyncResult = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
            if (unsyncResult != null) {
                System.out.println("testMultipleSync: unsyncResult: " + unsyncResult.toString());
            }
            else {
                System.out.println("testMultipleSync: unsyncResult: null");
            }
            assertThat(unsyncResult.getAsJsonObject().get("success").getAsBoolean(), is(true));

            // check that syncstatus is not found
            JsonObject syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
            assertNull("pid " + pid + " should not be synced.", syncStatus);

            // check that no allergies exist for patient
            assertNoData(this.pid, VprDomain.ALLERGY);
        }
        System.out.println("End testMultipleUnsync on pid: " + this.pid);
        logger.debug("End testMultipleUnsync on pid: " + this.pid);
        
    }

    @Test
    public void testMultipleSync() {
        System.out.println("Begin testMultipleSync on pid: " + this.pid);
        logger.debug("Begin testMultipleSync on pid: " + this.pid);
        for (int i = 0; i < 2; i++) {
            SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid);
            List<String> vistaSITestoCheck = syncCommand.getVistaSites(pid);
            JsonElement syncResult = syncCommand.execute();
            assertSyncComplete("testMultipleSync:", syncResult, vistaSITestoCheck);

            // check that allergies exist for patient
            JsonElement allergies = new JdsCommand(getJdsConfiguration(), this.pid, VprDomain.ALLERGY).execute();
            assertThat(allergies.toString(), containsString("\"totalItems\":" + expectedAllergies));
        }
        System.out.println("End testMultipleSync on pid: " + this.pid);
        logger.debug("End testMultipleSync on pid: " + this.pid);
    }

    @Test
    public void testUnsyncSyncCycle() {
        System.out.println("Begin testUnsyncSyncCycle on pid: " + this.pid);
        logger.debug("Begin testUnsyncSyncCycle on pid: " + this.pid);
        // unsync patient
        JsonElement unsyncResult = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
        assertThat(unsyncResult.getAsJsonObject().get("success").getAsBoolean(), is(true));

        // check that no allergies exist for patient
        assertNoData(this.pid, VprDomain.ALLERGY);

        // check that syncstatus is not found
        JsonObject syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        assertNull("pid " + pid + " should not be synced.", syncStatus);

        // sync patient
        SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid);
        List<String> vistaSITestoCheck = syncCommand.getVistaSites(pid);
        JsonElement syncResult = syncCommand.execute();
        assertSyncComplete("testUnsyncSyncCycle:", syncResult, vistaSITestoCheck);

        // check that syncstatus is complete
        syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        assertSyncComplete("testUnsyncSyncCycle:", syncStatus, vistaSITestoCheck);

        // check that allergies exist for patient
        JsonElement allergies = new JdsCommand(getJdsConfiguration(), this.pid, VprDomain.ALLERGY).execute();
        assertThat(allergies.toString(), containsString("\"totalItems\":" + expectedAllergies));

        System.out.println("End testUnsyncSyncCycle on pid: " + this.pid);
        logger.debug("End testUnsyncSyncCycle on pid: " + this.pid);
    }

    @Test
    public void testSyncUnsyncCycle() throws InterruptedException {
        System.out.println("Begin testSyncUnsyncCycle on pid: " + this.pid);
        logger.debug("Begin testSyncUnsyncCycle on pid: " + this.pid);

        // sync patient
        SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid);
        List<String> vistaSITestoCheck = syncCommand.getVistaSites(pid);
        JsonElement syncResult = syncCommand.execute();
        assertSyncComplete("testSyncUnsyncCycle:", syncResult, vistaSITestoCheck);

        // check that syncstatus is complete
        JsonElement syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        assertSyncComplete("testSyncUnsyncCycle:", syncStatus, vistaSITestoCheck);

        // check that allergies exist for patient
        JsonElement allergies = new JdsCommand(getJdsConfiguration(), this.pid, VprDomain.ALLERGY).execute();
        assertThat(allergies.toString(), containsString("\"totalItems\":" + expectedAllergies));

        // unsync patient
        JsonElement unsyncResult = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
        assertThat(unsyncResult.getAsJsonObject().get("success").getAsBoolean(), is(true));

        // check that no allergies exist for patient
        assertNoData(this.pid, VprDomain.ALLERGY);

        // check that syncstatus is not found
        syncStatus = StatusCommand.getSyncStatus(getJdsConfiguration(), this.pid);
        assertNull("pid " + pid + " should not be synced.", syncStatus);

        System.out.println("End testSyncUnsyncCycle on pid: " + this.pid);
        logger.debug("End testSyncUnsyncCycle on pid: " + this.pid);
    }

    @Test
    public void testSync() {
        System.out.println("Begin testSync on pid: " + this.pid);
        logger.debug("Begin testSync on pid: " + this.pid);

        SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid);
        List<String> vistaSITestoCheck = syncCommand.getVistaSites(pid);
        JsonElement syncResult = syncCommand.execute();
        System.out.println("Returned from sync.  SyncResult: " + syncResult.toString());
        assertSyncComplete("testSync:", syncResult, vistaSITestoCheck);
        assertThat(syncResult.toString(), containsString("\"totalItems\":1"));

        // check that allergies exist for patient
        JsonElement allergies = new JdsCommand(getJdsConfiguration(), this.pid, VprDomain.ALLERGY).execute();
        assertThat(allergies.toString(), containsString("\"totalItems\":" + this.expectedAllergies));

        System.out.println("End testSync on pid: " + this.pid);
        logger.debug("End testSync on pid: " + this.pid);
        
    }

    @Test
    @Ignore("This test is really not needed.  We are unsync/sync the patient on every test.")
    public void testUnsync() {
        JsonElement unsyncResult = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid, true).execute();
        assertThat(unsyncResult.getAsJsonObject().get("success").getAsBoolean(), is(true));

        // check that no allergies exist for patient
        assertNoData(this.pid, VprDomain.ALLERGY);
    }

    @Test
    public void testQueuedSync() {
        System.out.println("Begin testQueuedSync on pid: " + this.pid);
        logger.debug("Begin testQueuedSync on pid: " + this.pid);

        new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid)
                .observe()
                .timeInterval()
                .subscribe(new Action1<TimeInterval<JsonElement>>() {
                    @Override
                    public void call(TimeInterval<JsonElement> jsonElementTimeInterval) {
                        logger.debug("queued sync finished (" + jsonElementTimeInterval.getIntervalInMilliseconds() / 1000.0 + "s) : " + jsonElementTimeInterval.getValue().toString());
                    }
                });

        SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), this.pid);
        List<String> vistaSITestoCheck = syncCommand.getVistaSites(pid);
        JsonElement blockingSyncResult = syncCommand.execute();
        logger.debug("blocking sync finished: " + blockingSyncResult.toString());
        assertSyncComplete("testQueuedSync:", blockingSyncResult, vistaSITestoCheck);

        // check that allergies exist for patient
        JsonElement allergies = new JdsCommand(getJdsConfiguration(), this.pid, VprDomain.ALLERGY).execute();
        assertThat(allergies.toString(), containsString("\"totalItems\":" + expectedAllergies));

        System.out.println("End testQueuedSync on pid: " + this.pid);
        logger.debug("End testQueuedSync on pid: " + this.pid);
    }

    @Test
    public void testBadPidSync() {
        System.out.println("Begin testBadPidSync on pid: " + this.pid);
        logger.debug("Begin testBadPidSync on pid: " + this.pid);
        thrown.expect(HystrixBadRequestException.class);
        thrown.expectCause(IsInstanceOf.<Throwable>instanceOf(IllegalArgumentException.class));
        new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), "BADPID").execute();
        System.out.println("End testBadPidSync on pid: " + this.pid);
        logger.debug("End testBadPidSync on pid: " + this.pid);
    }

    @Test
    public void testBadPidUnSync() {
        System.out.println("Begin testBadPidUnSync on pid: " + this.pid);
        logger.debug("Begin testBadPidUnSync on pid: " + this.pid);
        thrown.expect(HystrixBadRequestException.class);
        thrown.expectCause(IsInstanceOf.<Throwable>instanceOf(IllegalArgumentException.class));
        new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), "BADPID", true).execute();
        System.out.println("End testBadPidUnSync on pid: " + this.pid);
        logger.debug("End testBadPidUnSync on pid: " + this.pid);
    }

    @Test
    public void testIsValidPid() {
        System.out.println("Begin testIsValidPid on pid: " + this.pid);
        logger.debug("Begin testIsValidPid on pid: " + this.pid);
        assertTrue(SyncCommand.isValidPid(getJdsConfiguration(), this.pid));
        assertFalse(SyncCommand.isValidPid(getJdsConfiguration(), "BADPID"));
        System.out.println("End testIsValidPid on pid: " + this.pid);
        logger.debug("End testIsValidPid on pid: " + this.pid);
    }

    public void assertNoData(String pid, VprDomain vprDomain) {
        try {
            new JdsCommand(getJdsConfiguration(), pid, vprDomain).execute();
        } catch (HystrixBadRequestException e) {
            return;     // expected exception
        }
        fail();
    }

    private void assertSyncComplete(String sMessage, JsonElement syncResult, List<String> vistaSITestoCheck) {
        if (syncResult != null) {
            System.out.println(sMessage + " syncResult: " + syncResult.toString());
        }
        else {
            System.out.println(sMessage + " syncResult: null");
        }
            
        assertTrue("syncResult should have been a JsonObject.", syncResult.isJsonObject());
        assertTrue("sync should have completed.", SyncCommand.isSyncMarkedCompleted(syncResult.getAsJsonObject(), this.pid, vistaSITestoCheck));
//      assertThat(syncResult.toString(), containsString("\"syncComplete\":true"));
        
    }

}
