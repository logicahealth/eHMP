package gov.va.cpe.vpr.sync.vista;

import gov.va.cpe.vpr.IBroadcastService;
import gov.va.cpe.vpr.dao.IVprUpdateDao;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.SyncMessageConstants;
import gov.va.cpe.vpr.sync.SyncOnApplicationInit;
import gov.va.cpe.vpr.sync.msg.ErrorLevel;
import gov.va.hmp.HmpProperties;
import gov.va.hmp.healthtime.PointInTime;
import gov.va.hmp.hub.VistaAccount;
import gov.va.hmp.hub.dao.IVistaAccountDao;
import gov.va.hmp.vista.rpc.TimeoutWaitingForRpcResponseException;
import gov.va.hmp.vista.rpc.broker.conn.ServerNotFoundException;
import gov.va.hmp.vista.rpc.broker.conn.ServerUnavailableException;
import gov.va.hmp.vista.rpc.broker.protocol.InternalServerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.util.StringUtils;

import java.util.*;

public class VprUpdateJob implements Runnable, ApplicationListener<ContextClosedEvent> {

    private static Logger LOG = LoggerFactory.getLogger(VprUpdateJob.class);

    private IVistaVprDataExtractEventStreamDAO vistaEventStreamDAO;
    private ISyncService syncService;
    private IBroadcastService bcSvc;
    private IVistaAccountDao vistaAccountDao;
    private IVprUpdateDao lastUpdateDao;
    private String serverId;
    private boolean disabled = false;
    private boolean shuttingDown = false;

    SyncOnApplicationInit syncOnApplicationInit;

    @Autowired
    public void setBroadcastService(IBroadcastService bcSvc) {
        this.bcSvc = bcSvc;
    }

    @Autowired
    public void setSyncOnApplicationInit(SyncOnApplicationInit x) {
        this.syncOnApplicationInit = x;
    }

    @Autowired
    public void setVistaEventStreamDAO(IVistaVprDataExtractEventStreamDAO vistaEventStreamDAO) {
        this.vistaEventStreamDAO = vistaEventStreamDAO;
    }

    @Autowired
    public void setSyncService(ISyncService syncService) {
        this.syncService = syncService;
    }

    @Autowired
    public void setVistaAccountDao(IVistaAccountDao vistaAccountDao) {
        this.vistaAccountDao = vistaAccountDao;
    }

    @Autowired
    public void setLastUpdateDao(IVprUpdateDao lastUpdateDao) {
        this.lastUpdateDao = lastUpdateDao;
    }

    @Required
    public void setServerId(String serverId) {
        this.serverId = serverId;
    }

    public synchronized void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }

    public boolean isDisabled() {
        return disabled || !syncService.isDataStreamEnabled();
    }

    private synchronized void setShuttingDown(boolean shuttingDown) {
        this.shuttingDown = shuttingDown;
    }

    @Override
    public void run() {
        if (isShuttingDown()) return;
        if (isDisabled()) return;
        if (syncOnApplicationInit == null || !syncOnApplicationInit.isDone()) return;

        LOG.trace(this.toString() + ".run()");

        List<VistaAccount> accounts = vistaAccountDao.findAllByVistaIdIsNotNull();
        for (VistaAccount account : accounts) {
            if (!account.isVprAutoUpdate()) continue;

            String vistaId = account.getVistaId();
            checkForUpdates(vistaId, account.getDivision(), accounts.indexOf(account)==0);  // TODO: First account is primary account; Safe assumption?

            vistaEventStreamDAO.processPatientsWithAppointments(vistaId);
        }
    }

    @Override
    public void onApplicationEvent(ContextClosedEvent contextClosedEvent) {
        if (!isShuttingDown()) shutdown();
    }

    public void shutdown() {
        LOG.trace(this.toString() + ".shutdown()");
        setShuttingDown(true);
    }

    public boolean isShuttingDown() {
        return shuttingDown;
    }

    private void checkForUpdates(final String vistaId, String division, boolean isPrimary) {
        LOG.trace(this.toString() + ".checkForUpdates({})", vistaId);

        VprUpdate lastUpdate = lastUpdateDao.findOneBySystemId(vistaId);
        if (lastUpdate == null) {
            lastUpdate = new VprUpdate(vistaId, "0");
        }
        if (StringUtils.isEmpty(lastUpdate.getTimestamp())) {
            lastUpdate.setData("timestamp", "0");
        }

        try {
	        VprUpdateData rslt = vistaEventStreamDAO.fetchUpdates(vistaId, division, lastUpdate.getTimestamp());
	        processChunks(rslt.getChunks());
	        processDeletions(rslt.getUidsToDelete());
	        lastUpdate.setData("timestamp",rslt.getLastUpdate());
	        
	        lastUpdateDao.save(lastUpdate);
	        
	        Map<String, Set<String>> domainsByPatientId = getDomainsByPatientId(rslt.getChunks());
	        
	        syncService.sendUpdateVprCompleteMsg(serverId, vistaId, lastUpdate.getTimestamp(), !domainsByPatientId.isEmpty() ? domainsByPatientId : null);

        } catch (Exception e) {
            if (isFatalException(e)) {
                disableEventStream(vistaId, isPrimary, e);
            }
        }
    }

    private boolean isFatalException(Exception e) {
        return true;
    }

    private void disableEventStream(String vistaId, boolean isPrimary, Exception e) {
        String disabledMsg = "";
//        disableAutomaticUpdates(vistaId);
        if (e instanceof DataRetrievalFailureException) {
            if (e.getCause() instanceof InternalServerException) {
                disabledMsg = "There was an error in VistA while extracting data.";
            }
            LOG.error("Unable to fetch updates from VistA '" + vistaId + "'", e);
        } else if (e instanceof DataAccessResourceFailureException) {
            if (e.getCause() instanceof ServerUnavailableException || e.getCause() instanceof ServerNotFoundException) {
                disabledMsg = e.getCause().getMessage();
            } else if (e.getCause() instanceof TimeoutWaitingForRpcResponseException) {
                disabledMsg = "Data extract from VistA took long.";
            }
            LOG.error("Unable to fetch updates from VistA '" + vistaId + "'", e);
        }else if (e instanceof SynchronizationCredentialsNotFoundException) {
            String msg = "No updates from VistA " + vistaId + " are available. " + e.getMessage();
            LOG.warn(msg);
            disabledMsg = "Synch user credentials could not be found.";
        } else {
            LOG.error("Unable to fetch updates from VistA '" + vistaId + "'", e);
            disabledMsg = "Unexpected error processing updates from VistA.";
        }
        LOG.error(disabledMsg);
        
//        if (isPrimary) {
//            syncService.setDataStreamEnabled(false, disabledMsg, e);
//            Map<String, Object> bcMsg = new HashMap<>();
//            bcMsg.put("eventName", "dataStreamDisabled");
//            bcMsg.put("disabledMsg", disabledMsg);
//            bcSvc.broadcastMessage(bcMsg);
//        }
    }

    /**
     * Disables all streaming (both synching and freshness) from this VistA system until patch can be applied to fix M
     * routine that errored out
     *
     * @param vistaId
     */
    private void disableAutomaticUpdates(String vistaId) {
        List<VistaAccount> vistaAccounts = vistaAccountDao.findAllByVistaId(vistaId);
        for (VistaAccount vistaAccount : vistaAccounts) {
            vistaAccount.setVprAutoUpdate(false);
            vistaAccountDao.save(vistaAccount);
        }
    }

    private void calculateVistaTimeDiff(VprUpdateData data, String vistaId) {
        PointInTime vistaStartTime = data.getStartDateTime();
        PointInTime vistaEndTime = data.getEndDateTime();
        PointInTime localRpcCallStartTime = data.getCallTime();
        long dtval = System.currentTimeMillis();
        Date dt = new Date(dtval);
        PointInTime localNowTime = PointInTime.fromDateFields(dt);

        if (vistaStartTime != null && vistaEndTime != null && localRpcCallStartTime != null) {
            long callStartLatency = vistaStartTime.subtract(localRpcCallStartTime).getMillis();
            long callFinishLatency = localNowTime.subtract(vistaEndTime).getMillis();
            long vistaShift = (callFinishLatency + callStartLatency) / 2;
            long vistaAveragedTime = ((vistaStartTime.toLocalDateTime().toDate().getTime() + vistaEndTime.toLocalDateTime().toDate().getTime()) / 2) + vistaShift;

            long localAveragedTime = (dt.getTime() + localRpcCallStartTime.toLocalDateTime().toDate().getTime()) / 2;
            long calculatedVistaTimeDiff = ((vistaAveragedTime - localAveragedTime + 00000) / 100000);
            calculatedVistaTimeDiff = calculatedVistaTimeDiff * 100000;
            // If it doesn't come out to a 15-minute interval, we fail, fail fail!
            long diffCheck = calculatedVistaTimeDiff / 900000;
            if (diffCheck * 900000 != calculatedVistaTimeDiff) {
                LOG.warn(this.toString() + ".calculateVistaTimeDiff - Diff was not an even 15 minute interval: " + calculatedVistaTimeDiff);
            } else {
                for (VistaAccount vistaAccount : vistaAccountDao.findAllByVistaId(vistaId)) {
                    if (vistaAccount.getCalculatedVistaTimeDiff() != calculatedVistaTimeDiff) {
                        vistaAccount.setCalculatedVistaTimeDiff(calculatedVistaTimeDiff);
                        vistaAccountDao.save(vistaAccount);
                    }
                }
            }
        }
    }

    private void processChunks(List<VistaDataChunk> chunks) {
        for (VistaDataChunk chunk : chunks) {
            try {
                syncService.sendImportVistaDataExtractItemMsg(chunk);
            } catch (Exception e) {
                LOG.warn("unexpected exception sending import message", e);
            }
        }
    }

    private void processDeletions(Set<String> uidsToDelete) {
        for (String uid : uidsToDelete) {
            syncService.sendClearItemMsg(uid);
        }
    }

    private Map<String, Set<String>> getDomainsByPatientId(List<VistaDataChunk> chunks) {
        Map<String, Set<String>> domainsByPatientId = new HashMap<String, Set<String>>();
        for (VistaDataChunk chunk : chunks) {
            String pid = chunk.getPatientId();
            if (!StringUtils.hasText(pid)) continue;
            if (!domainsByPatientId.containsKey(pid)) {
                domainsByPatientId.put(pid, new HashSet<String>());
            }
            domainsByPatientId.get(pid).add(chunk.getDomain());
        }
        return domainsByPatientId;
    }

    private void processExceptions(VprUpdateData data, String vistaId, String serverId) {
        for (Exception e : data.getExceptions()) {
            LOG.error("exception during fetchUpdates() at " + vistaId, e);
            Map<Object, Object> msg = new HashMap<>();
            msg.put(SyncMessageConstants.VISTA_ID, vistaId);
            msg.put(HmpProperties.SERVER_ID, serverId);
            msg.put(SyncMessageConstants.VISTA_LAST_UPDATED, data.getLastUpdate());
            msg.put(SyncMessageConstants.TIMESTAMP, System.currentTimeMillis());
            syncService.errorDuringMsg(msg, e, ErrorLevel.ERROR);
        }
    }
}
