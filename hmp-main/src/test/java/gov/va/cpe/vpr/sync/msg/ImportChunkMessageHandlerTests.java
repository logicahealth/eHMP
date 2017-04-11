package gov.va.cpe.vpr.sync.msg;

import com.codahale.metrics.MetricRegistry;
import gov.va.cpe.test.mockito.ReturnsArgument;
import gov.va.cpe.vpr.Encounter;
import gov.va.cpe.vpr.IBroadcastService;
import gov.va.cpe.vpr.UidUtils;
import gov.va.cpe.vpr.dao.RoutingDataStore;
import gov.va.cpe.vpr.frameeng.FrameRunner;
import gov.va.cpe.vpr.pom.IGenericPatientObjectDAO;
import gov.va.cpe.vpr.pom.IPOMObject;
import gov.va.cpe.vpr.pom.IPatientDAO;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.vista.Foo;
import gov.va.cpe.vpr.sync.vista.MockVistaDataChunks;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.core.convert.ConversionService;
import org.springframework.jms.support.converter.SimpleMessageConverter;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyMap;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ImportChunkMessageHandlerTests {
    private ImportChunkMessageHandler importMessageHandler;
    private ConversionService mockConversionService;
    private RoutingDataStore mockRoutingDao;
    private IGenericPatientObjectDAO mockPatientObjectDAO;
    private ISyncService mockSyncService;
    private FrameRunner mockRunner;
    private IBroadcastService mockBroadcastService;
    private SimpleMessageConverter mockMessageConverter;
    private VistaDataChunk mockFragment = MockVistaDataChunks.createFromJson("{\"uid\":\"urn:va:foo:ABCD:1234\",\"foo\":{\"bar\":\"baz\"}}", null, "foo");
    private Session mockSession;

    @Before
    public void setUp() {
        mockConversionService = Mockito.mock(ConversionService.class);
        mockSyncService = Mockito.mock(ISyncService.class);
        mockRoutingDao = Mockito.mock(RoutingDataStore.class);
        mockPatientObjectDAO = Mockito.mock(IGenericPatientObjectDAO.class);
        mockRunner = Mockito.mock(FrameRunner.class);
        mockBroadcastService = Mockito.mock(IBroadcastService.class);
        mockMessageConverter = Mockito.mock(SimpleMessageConverter.class);
        mockFragment.setAutoUpdate(true);
        mockSession = Mockito.mock(Session.class);

        importMessageHandler = new ImportChunkMessageHandler();
        importMessageHandler.setConversionService(mockConversionService);
        importMessageHandler.setRoutingDao(mockRoutingDao);
        importMessageHandler.setPatientObjectDao(mockPatientObjectDAO);
        importMessageHandler.setFrameRunner(mockRunner);
        importMessageHandler.setBroadcastService(mockBroadcastService);
        importMessageHandler.setMessageConverter(mockMessageConverter);
        importMessageHandler.setMetricRegistry(new MetricRegistry());
    }

    @Test
    public void testOnMessage() throws JMSException {
        String testUid = "urn:va:visit:ABCD:42:123";
        LinkedHashMap<String, Serializable> map = new LinkedHashMap<String, Serializable>(3);
        map.put("uid", testUid);
        map.put("bar", "spaz");
        map.put("baz", false);
        Object mockEntity = new Foo(map);

        Message mockMessage = Mockito.mock(Message.class);
        Map msg = new LinkedHashMap();

        when(mockConversionService.convert(msg, VistaDataChunk.class)).thenReturn(mockFragment);
        when(mockConversionService.convert(mockFragment, IPOMObject.class)).thenReturn((IPOMObject) mockEntity);
        when(mockRoutingDao.save(any(IPOMObject.class))).thenAnswer(new ReturnsArgument<Object>());
        when(mockMessageConverter.fromMessage(mockMessage)).thenReturn(msg);

        importMessageHandler.onMessage(mockMessage, mockSession);

        verify(mockConversionService).convert(msg, VistaDataChunk.class);
        verify(mockConversionService).convert(mockFragment, IPOMObject.class);
        verify(mockRoutingDao).save((Foo) mockEntity);
        verify(mockPatientObjectDAO).findByUID(Foo.class, testUid);

        ArgumentCaptor<Map> broadcastMessageCaptor = ArgumentCaptor.forClass(Map.class);
        verify(mockBroadcastService).broadcastMessage(broadcastMessageCaptor.capture());
        assertThat((String) broadcastMessageCaptor.getValue().get("eventName"), is("domainChange"));
        assertThat((String) broadcastMessageCaptor.getValue().get("domain"), is(UidUtils.getDomainNameByUid(testUid)));
        assertThat((String) broadcastMessageCaptor.getValue().get("pid"), is(""));
    }
}
