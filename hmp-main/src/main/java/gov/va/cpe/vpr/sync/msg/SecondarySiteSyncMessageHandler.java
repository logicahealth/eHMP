package gov.va.cpe.vpr.sync.msg;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.google.common.collect.ImmutableMap;
import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.IBroadcastService;
import gov.va.cpe.vpr.PatientService;
import gov.va.cpe.vpr.dao.IVprSyncStatusDao;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.SyncStatus;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.hmp.util.LoggingUtil;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.listener.SessionAwareMessageListener;
import org.springframework.jms.support.converter.SimpleMessageConverter;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class SecondarySiteSyncMessageHandler implements SessionAwareMessageListener {

    protected abstract String getSiteId();
    protected abstract String getTimerName();
    protected abstract Logger getLogger();
    protected abstract void setLogger(Logger theLogger);
    protected abstract String getUid(PatientIds patientIds);

    protected MetricRegistry metrics;
    protected IBroadcastService bcSvc;
    protected SimpleMessageConverter messageConverter;
    protected ISyncService syncService;
    protected IVprSyncStatusDao syncStatusDao;
    protected PatientService patientService;
    
    @Autowired
    public void setMetricRegistry(MetricRegistry metrics) {
        this.metrics = metrics;
    }

    @Autowired
    public void setBroadcastService(IBroadcastService bcSvc) {
        this.bcSvc = bcSvc;
    }

    @Autowired
    public void setMessageConverter(SimpleMessageConverter messageConverter) {
        this.messageConverter = messageConverter;
    }

    @Autowired
    public void setSyncService(ISyncService syncService) {
        this.syncService = syncService;
    }

    @Autowired
    public void setSyncStatusDao(IVprSyncStatusDao syncStatusDao) {
        this.syncStatusDao = syncStatusDao;
    }

    @Autowired
    public void setPatientService(PatientService patientService) {
        this.patientService = patientService;
    }
    
    protected abstract List<VistaDataChunk> fetchData(PatientIds patientIds);
    
    @Override
    public void onMessage(Message message, Session session) throws JMSException {
        Timer.Context timerContext = metrics.timer(MetricRegistry.name(getTimerName())).time();

        Map msg = (Map) messageConverter.fromMessage(message);
        Map patientIdMap = (Map) msg.get("patientIds");
        PatientIds patientIds = PatientIds.fromMap(patientIdMap);

        /*   TODO move to VistaVprDataExtractEventStreamDAO
        SyncStatus syncStatus = syncStatusDao.getForPid(patientIds.getPid());

        if (syncStatus == null) {
            syncStatus = new SyncStatus();
            syncStatus.setPatient(patientService.getPatient(patientIds.getPid()));
        }
        String uid = "urn:va:patient:" + getSiteId() + ":" + patientIds.getEdipi();
        syncStatus.addSite(uid, patientIds.getEdipi(), getSiteId());

        syncStatus = syncStatusDao.saveMergeSyncStatus(syncStatus);
        */
        
        List<VistaDataChunk> vistaDataChunks = fetchData(patientIds);
        Map<String, Map<String, Integer>> domainTotals = new HashMap<>();

        if (vistaDataChunks != null) {
            for (VistaDataChunk vistaDataChunk : vistaDataChunks ) {
                Map<String, Integer> currentCounts = domainTotals.get(vistaDataChunk.getDomain());
                if (currentCounts == null) {
                    currentCounts = ImmutableMap.<String, Integer>builder()
                            .put("total", 1)
                            .put("count", 1)
                            .build();
                    domainTotals.put(vistaDataChunk.getDomain(), currentCounts);
                } else {
                    currentCounts = ImmutableMap.<String, Integer>builder()
                            .put("total", currentCounts.get("total") + 1)
                            .put("count", currentCounts.get("count") + 1)
                            .build();
                    domainTotals.put(vistaDataChunk.getDomain(), currentCounts);
                }
                syncService.sendImportVistaDataExtractItemMsg(vistaDataChunk);
            }
        }

        SyncStatus syncStatus = syncStatusDao.findOneByPid(patientIds.getPid());
        getLogger().debug(LoggingUtil.outputSyncStatus("onMessage: Retrieved sync status from JDS - pid: " + patientIds.getPid(), syncStatus));

        // TODO: guard against syncStatus==null
        SyncStatus.VistaAccountSyncStatus vistaAccountSyncStatusForSystemId;
        try {
            vistaAccountSyncStatusForSystemId = syncStatus.getVistaAccountSyncStatusForSystemId(getSiteId());
        } catch (NullPointerException npe) {
            getLogger().error("onMessage: Exception occured. This should never happen.  Failed to find site: " + getSiteId() + " in SyncStatus: " + syncStatus.getUid(), npe);
            throw new IllegalStateException("No site found in " + syncStatus.getUid() + " for Site ID " + getSiteId());
        }
        if (vistaAccountSyncStatusForSystemId == null) {
            getLogger().error("onMessage: This should never happen.  Failed to find site: " + getSiteId() + " in SyncStatus: " + syncStatus.getUid());
            vistaAccountSyncStatusForSystemId = syncStatus.addSite(patientIds.getUid(), patientIds.getEdipi(), getSiteId());
        }

        // Add domains totals and counts
        vistaAccountSyncStatusForSystemId.setDomainExpectedTotals(domainTotals);
        vistaAccountSyncStatusForSystemId.setSyncComplete(true);

        getLogger().debug(LoggingUtil.outputSyncStatus("onMessage: Before storing sync status - pid: " + patientIds.getPid(), syncStatus));
        syncStatus = syncStatusDao.saveMergeSyncStatus(syncStatus);
        getLogger().debug(LoggingUtil.outputSyncStatus("onMessage: After storing sync status - pid: " + patientIds.getPid(), syncStatus));
        broadcastSyncStatus(syncStatus);
        timerContext.stop();
    }
    
    private void broadcastSyncStatus(SyncStatus stat) {
        Map<String, Object> message = new HashMap<String, Object>();
        message.put("eventName", "syncStatusChange");
        message.put("syncStatus", stat.getData());
        bcSvc.broadcastMessage(message);
    }
    
}
