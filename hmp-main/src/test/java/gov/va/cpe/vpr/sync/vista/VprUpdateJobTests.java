package gov.va.cpe.vpr.sync.vista;

import gov.va.cpe.vpr.IBroadcastService;
import gov.va.cpe.vpr.dao.IVprUpdateDao;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.SyncOnApplicationInit;
import gov.va.hmp.hub.VistaAccount;
import gov.va.hmp.hub.dao.IVistaAccountDao;
import gov.va.hmp.vista.rpc.RpcHost;
import gov.va.hmp.vista.rpc.TimeoutWaitingForRpcResponseException;
import gov.va.hmp.vista.rpc.broker.conn.ServerUnavailableException;
import gov.va.hmp.vista.rpc.broker.protocol.InternalServerException;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataRetrievalFailureException;

import java.io.InterruptedIOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.sameInstance;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;

public class VprUpdateJobTests {
    static final String MOCK_SERVER_ID = "MOCK_HMP";
    static final String MOCK_VISTA1_ID = "A1B2";
    static final String MOCK_VISTA2_ID = "C3D4";

    static final String MOCK_DIV_1 = "500";
    static final String MOCK_DIV_2 = "600";

    static final String MOCK_VISTA1_TIMESTAMP = "foo";
    static final String MOCK_VISTA2_TIMESTAMP = "0";

    static final String NEW_VISTA1_TIMESTAMP = "foo1";
    static final String NEW_VISTA2_TIMESTAMP = "bar1";

    static final int MOCK_TIMEOUT = 7;

    private VprUpdateJob updateJob;
    private ISyncService mockSyncService;
    private IVistaVprDataExtractEventStreamDAO mockVistaEventStreamDao;
    private IVistaAccountDao mockVistaAccountDao;
    private IBroadcastService mockBroadcastService;
    private SyncOnApplicationInit mockSyncJob;
    private IVprUpdateDao mockLastUpdateDao;

    @Before
    public void setUp() throws Exception {
        mockVistaEventStreamDao = mock(IVistaVprDataExtractEventStreamDAO.class);
        mockSyncService = mock(ISyncService.class);
        when(mockSyncService.isDataStreamEnabled()).thenReturn(true);
        mockBroadcastService = mock(IBroadcastService.class);
        mockVistaAccountDao = mock(IVistaAccountDao.class);
        mockLastUpdateDao = mock(IVprUpdateDao.class);
        mockSyncJob = mock(SyncOnApplicationInit.class);
        when(mockSyncJob.isDone()).thenReturn(Boolean.TRUE);

        updateJob = new VprUpdateJob();
        updateJob.setVistaEventStreamDAO(mockVistaEventStreamDao);
        updateJob.setSyncService(mockSyncService);
        updateJob.setBroadcastService(mockBroadcastService);
        updateJob.setVistaAccountDao(mockVistaAccountDao);
        updateJob.setLastUpdateDao(mockLastUpdateDao);
        updateJob.setServerId(MOCK_SERVER_ID);
        updateJob.setSyncOnApplicationInit(mockSyncJob);
    }

    @Test
    public void testRun() throws Exception {
        List<VistaAccount> mockAccounts = new ArrayList<VistaAccount>();
        mockAccounts.add(createMockVistaAccount(MOCK_VISTA1_ID, MOCK_DIV_1));
        mockAccounts.add(createMockVistaAccount(MOCK_VISTA2_ID, MOCK_DIV_2));

        when(mockVistaAccountDao.findAllByVistaIdIsNotNull()).thenReturn(mockAccounts);
        when(mockLastUpdateDao.findOneBySystemId(MOCK_VISTA1_ID)).thenReturn(new VprUpdate(MOCK_VISTA1_ID, MOCK_VISTA1_TIMESTAMP));
        when(mockLastUpdateDao.findOneBySystemId(MOCK_VISTA2_ID)).thenReturn(null);

        List<VistaDataChunk> mockChunks = new ArrayList<VistaDataChunk>();

        VprUpdateData updatesFromVista1 = new VprUpdateData();
        updatesFromVista1.setLastUpdate(NEW_VISTA1_TIMESTAMP);
        updatesFromVista1.setChunks(mockChunks);

        VprUpdateData updatesFromVista2 = new VprUpdateData();
        updatesFromVista2.setLastUpdate(NEW_VISTA2_TIMESTAMP);
        updatesFromVista2.setChunks(Collections.<VistaDataChunk>emptyList());

//        when(updateJob.vistaPatientDataService.fetchUpdates(MOCK_VISTA1_ID, MOCK_SERVER_ID, MOCK_VISTA1_TIMESTAMP, MOCK_TIMEOUT)).thenReturn(updatesFromVista1);
//        when(updateJob.vistaPatientDataService.fetchUpdates(MOCK_VISTA2_ID, MOCK_SERVER_ID, MOCK_VISTA2_TIMESTAMP, MOCK_TIMEOUT)).thenReturn(updatesFromVista2);
        when(mockVistaEventStreamDao.fetchUpdates(MOCK_VISTA1_ID, MOCK_DIV_1, MOCK_VISTA1_TIMESTAMP)).thenReturn(updatesFromVista1);
        when(mockVistaEventStreamDao.fetchUpdates(MOCK_VISTA2_ID, MOCK_DIV_2, MOCK_VISTA2_TIMESTAMP)).thenReturn(updatesFromVista2);

        // first submit callables
        updateJob.run();

        verify(mockVistaAccountDao).findAllByVistaIdIsNotNull();

        verify(mockLastUpdateDao).findOneBySystemId(MOCK_VISTA1_ID);
        verify(mockVistaEventStreamDao).fetchUpdates(MOCK_VISTA1_ID, MOCK_DIV_1, MOCK_VISTA1_TIMESTAMP);

        verify(mockLastUpdateDao).findOneBySystemId(MOCK_VISTA2_ID);
        verify(mockVistaEventStreamDao).fetchUpdates(MOCK_VISTA2_ID, MOCK_DIV_2, MOCK_VISTA2_TIMESTAMP);

        // then verify updates were fetched
//        updateJob.run();

        verify(mockSyncService).sendUpdateVprCompleteMsg(MOCK_SERVER_ID, MOCK_VISTA1_ID, NEW_VISTA1_TIMESTAMP, null);
        verify(mockSyncService).sendUpdateVprCompleteMsg(MOCK_SERVER_ID, MOCK_VISTA2_ID, NEW_VISTA2_TIMESTAMP, null);
    }

    @Test
    public void testRunDisabled() {
        updateJob.setDisabled(true);

        updateJob.run();

        verifyZeroInteractions(mockVistaEventStreamDao);
        verifyZeroInteractions(mockSyncService);
        verifyZeroInteractions(mockVistaAccountDao);
    }

    @Ignore("We have disabled automatic shutdown - so this test will fail.")
    @Test
    public void testErrorInMRoutineShutsDownAutomaticUpdates() {
        assertExceptionDisablesAutomaticUpdates(new DataRetrievalFailureException("foo", new InternalServerException("something bad happened")));
    }

    @Ignore("We have disabled automatic shutdown - so this test will fail.")
    @Test
    public void testTimeoutInFetchUpdatesShutsDownAutomaticUpdates() {
        assertExceptionDisablesAutomaticUpdates(new DataRetrievalFailureException("foo", new TimeoutWaitingForRpcResponseException(new InterruptedIOException("it timed out"))));
    }

    private void assertExceptionDisablesAutomaticUpdates(Throwable t) {
        List<VistaAccount> mockAccounts = new ArrayList<VistaAccount>();
        mockAccounts.add(createMockVistaAccount(MOCK_VISTA1_ID, MOCK_DIV_1));
        mockAccounts.add(createMockVistaAccount(MOCK_VISTA2_ID, MOCK_DIV_2));

        VprUpdateData updatesFromVista2 = new VprUpdateData();
        updatesFromVista2.setLastUpdate(NEW_VISTA2_TIMESTAMP);
        updatesFromVista2.setChunks(Collections.<VistaDataChunk>emptyList());

        when(mockVistaAccountDao.findAllByVistaIdIsNotNull()).thenReturn(mockAccounts);
        when(mockVistaAccountDao.findAllByVistaId(MOCK_VISTA1_ID)).thenReturn(Collections.singletonList(mockAccounts.get(0)));
        when(mockLastUpdateDao.findOneBySystemId(MOCK_VISTA1_ID)).thenReturn(new VprUpdate(MOCK_VISTA1_ID, MOCK_VISTA1_TIMESTAMP));
        when(mockLastUpdateDao.findOneBySystemId(MOCK_VISTA2_ID)).thenReturn(null);
//        when(updateJob.vistaPatientDataService.fetchUpdates(MOCK_VISTA1_ID, MOCK_SERVER_ID, MOCK_VISTA1_TIMESTAMP, MOCK_TIMEOUT)).thenThrow(t);
//        when(updateJob.vistaPatientDataService.fetchUpdates(MOCK_VISTA2_ID, MOCK_SERVER_ID, MOCK_VISTA2_TIMESTAMP, MOCK_TIMEOUT)).thenReturn(updatesFromVista2);
        when(mockVistaEventStreamDao.fetchUpdates(MOCK_VISTA1_ID, MOCK_DIV_1, MOCK_VISTA1_TIMESTAMP)).thenThrow(t);
        when(mockVistaEventStreamDao.fetchUpdates(MOCK_VISTA2_ID, MOCK_DIV_2, MOCK_VISTA2_TIMESTAMP)).thenReturn(updatesFromVista2);


        // first submit callables
        updateJob.run();


        verify(mockLastUpdateDao).findOneBySystemId(MOCK_VISTA1_ID);
        verify(mockVistaEventStreamDao).fetchUpdates(MOCK_VISTA1_ID, MOCK_DIV_1, MOCK_VISTA1_TIMESTAMP);

        verify(mockLastUpdateDao).findOneBySystemId(MOCK_VISTA2_ID);
        verify(mockVistaEventStreamDao).fetchUpdates(MOCK_VISTA2_ID, MOCK_DIV_2, MOCK_VISTA2_TIMESTAMP);

        
        verify(mockSyncService).sendUpdateVprCompleteMsg(MOCK_SERVER_ID, MOCK_VISTA2_ID, NEW_VISTA2_TIMESTAMP, null);
           // then verify  disabling of vista 1
        updateJob.run();

        // verify disabling of vista 1
        verify(mockVistaAccountDao).findAllByVistaId(MOCK_VISTA1_ID);

        ArgumentCaptor<VistaAccount> accountArg = ArgumentCaptor.forClass(VistaAccount.class);
        verify(mockVistaAccountDao).save(accountArg.capture());
        assertThat(accountArg.getValue().getVistaId(), is(MOCK_VISTA1_ID));
        assertThat(accountArg.getValue().isVprAutoUpdate(), is(false));
        assertThat(accountArg.getValue(), sameInstance(mockAccounts.get(0)));

    }

    @Test
    public void testShutdown() throws InterruptedException {
        updateJob.shutdown();
        assertThat(updateJob.isShuttingDown(), is(true));

        // TODO: test pending tasks have been cancelled?
        verifyZeroInteractions(mockVistaEventStreamDao);
        verifyZeroInteractions(mockSyncService);
        verifyZeroInteractions(mockVistaAccountDao);
    }

    private VistaAccount createMockVistaAccount(String vistaId, String div) {
        VistaAccount a = new VistaAccount();
        a.setVistaId(vistaId);
        a.setDivision(div);
        return a;
    }

}
