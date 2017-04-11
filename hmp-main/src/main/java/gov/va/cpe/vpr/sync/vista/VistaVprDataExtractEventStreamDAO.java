
package gov.va.cpe.vpr.sync.vista;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.collect.ImmutableMap;
import gov.va.cpe.idn.IPatientIdentityService;
import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.*;
import gov.va.cpe.vpr.dao.IVprSyncStatusDao;
import gov.va.cpe.vpr.pom.IPatientDAO;
import gov.va.cpe.vpr.pom.POMUtils;
import gov.va.cpe.vpr.pom.jds.JdsOperations;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.MessageDestinations;
import gov.va.cpe.vpr.sync.SyncMessageConstants;
import gov.va.cpe.vpr.sync.SyncStatus;
import gov.va.cpe.vpr.sync.SyncStatus.VistaAccountSyncStatus;
import gov.va.cpe.vpr.sync.msg.SyncCdsMessageHandler;
import gov.va.cpe.vpr.sync.msg.SyncDasMessageHandler;
import gov.va.cpe.vpr.sync.msg.SyncDodMessageHandler;
import gov.va.cpe.vpr.sync.util.SyncUtils;
import gov.va.cpe.vpr.termeng.jlv.JLVDocDefUtil;
import gov.va.hmp.HmpProperties;
import gov.va.hmp.healthtime.PointInTime;
import gov.va.hmp.hub.dao.IVistaAccountDao;
import gov.va.hmp.ptselect.PatientSelect;
import gov.va.hmp.ptselect.dao.IPatientSelectDAO;
import gov.va.hmp.util.LoggingUtil;
import gov.va.hmp.util.NullChecker;
import gov.va.hmp.vista.rpc.JacksonRpcResponseExtractor;
import gov.va.hmp.vista.rpc.RpcOperations;
import gov.va.hmp.vista.rpc.RpcResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.core.convert.ConversionService;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.jms.core.JmsOperations;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;

import static gov.va.cpe.vpr.sync.vista.SynchronizationRpcConstants.*;
import static gov.va.hmp.vista.util.RpcUriUtils.VISTA_RPC_BROKER_SCHEME;

@Component
public class VistaVprDataExtractEventStreamDAO implements IVistaVprDataExtractEventStreamDAO, EnvironmentAware {

    private static final int DEFAULT_BATCH_SIZE = 1000;
    private static final Logger LOG = LoggerFactory.getLogger(VistaVprDataExtractEventStreamDAO.class);
    public static final String EXTRACT_SCHEMA = "3.001";
	private static final String CRLF = System.getProperty("line.separator");
    private static final Object DOCUMENT_TYPE = "document";

    private RpcOperations synchronizationRpcTemplate;
    private IPatientDAO patientDao;
    private IPatientSelectDAO patientSelectDao;
    private MetricRegistry metricRegistry;
    private ConversionService conversionService;
    private IVprSyncStatusDao syncStatusDao;
    private IBroadcastService bcSvc;
    private IPatientIdentityService vistaPatientIdentityService;
    private ISyncService syncService;
    private Environment environment;
    private JmsOperations jmsTemplate;
    private JdsOperations jdsTemplate;

    private JacksonRpcResponseExtractor jsonExtractor = new JacksonRpcResponseExtractor();
    private int asyncBatchSize;
    private Boolean hdrEnabled;
    private Boolean jmeadowsEnabled;
    private Boolean vlerDasEnabled;

    private IVistaAccountDao vistaAccountDao;

    @Autowired
    public void setVistaAccountDao(IVistaAccountDao vistaAccountDao) {
        this.vistaAccountDao = vistaAccountDao;
    }

    @Autowired
    public void setBroadcastService(IBroadcastService bcSvc) {
        this.bcSvc = bcSvc;
    }

    @Autowired
    public void setSynchronizationRpcTemplate(RpcOperations synchronizationRpcTemplate) {
        this.synchronizationRpcTemplate = synchronizationRpcTemplate;
    }

    @Autowired
    public void setPatientDao(IPatientDAO patientDao) {
        this.patientDao = patientDao;
    }

    @Autowired
    public void setMetricRegistry(MetricRegistry metricRegistry) {
        this.metricRegistry = metricRegistry;
    }

    @Autowired
    public void setPatientSelectDao(IPatientSelectDAO patientSelectDao) {
        this.patientSelectDao = patientSelectDao;
    }
    
    @Autowired
    public void setJdsTemplate(JdsOperations jdsTemplate) {
        this.jdsTemplate = jdsTemplate;
    }

    @Override
    public String fetchVprVersion(String vistaId) {
        return synchronizationRpcTemplate.executeForString(VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_DATA_VERSION_RPC_URI);
    }

    @Override
    public VistaDataChunk fetchPatientDemographicsWithDfn(String vistaId, String ptDfn) {
        return fetchPatientDemographics(vistaId, ptDfn, false);
    }

    @Override
    public VistaDataChunk fetchPatientDemographicsWithIcn(String vistaId, String ptIcn) {
        return fetchPatientDemographics(vistaId, ptIcn, true);
    }

    @Autowired
    public void setSyncService(ISyncService syncService) {
        this.syncService = syncService;
    }

    @Autowired
    public void setConversionService(ConversionService conversionService) {
        this.conversionService = conversionService;
    }

    @Autowired
    public void setSyncStatusDao(IVprSyncStatusDao syncStatusDao) {
        this.syncStatusDao = syncStatusDao;
    }

    @Autowired
    public void setVistaPatientIdentityService(IPatientIdentityService vistaPatientIdentityService)
    {
        this.vistaPatientIdentityService = vistaPatientIdentityService;
    }

    public JmsOperations getJmsTemplate() {
        return jmsTemplate;
    }

    @Autowired
    public void setJmsTemplate(JmsOperations jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void processPatientsWithAppointments(String vistaId) {
        LOG.debug("APPTTRIGGER processPatientsWithAppointments (vistaIs): Entered method for vistaId: " + vistaId);
        RpcResponse response = synchronizationRpcTemplate.execute(VISTA_RPC_BROKER_SCHEME + "://" + vistaId
                + VPR_PATIENT_ACTIVITY_RPC_URI);
        
        if(response == null || response.toString() == null || response.toString().length() == 0) {
            LOG.debug("APPTTRIGGER processPatientsWithAppointments (" + vistaId + "): no appointments");
            return;
        }
        
        JsonNode rpcJson = null;
        
        try {
            rpcJson = jsonExtractor.extractData(response);
        } catch(RuntimeException e) {
            LOG.error("APPTTRIGGER processPatientsWithAppointments(" + vistaId + ") invalid response: " + response);
            return;
        }
        
        LOG.debug("APPTTRIGGER got: " + rpcJson.size() + " patients");
        for(int i = 0; i < rpcJson.size(); i++) {
            JsonNode patient = rpcJson.get(i);
            LOG.debug("APTTRIGGER patient: " + patient);
            String dfn = patient.has("dfn") ? patient.get("dfn").asText() : null;
            String icn = patient.has("icn") ? patient.get("icn").asText() : null;

            if(!NullChecker.isNullish(dfn) && dfn.indexOf(";") != -1) {
                LOG.debug("APPTTRIGGER subscribe to patient dfn=" + dfn);
                subscribePatient(vistaId, dfn, true);
            } else if(!NullChecker.isNullish(icn)) {
                PatientSelect pt = patientSelectDao.findOneByIcn(icn);
                if (pt != null) {
                    vistaId = UidUtils.getSystemIdFromPatientUid(pt.getUid());
                    String pid = pt.getPid();
                    LOG.error("APPTTRIGGER subscribe to patient pid=" + pid);
                    subscribePatient(vistaId, pid, true);
                } else {
                    LOG.warn("APPTRIGGER patient NOT subscribed, could not get patient from icn=" + icn);
                }
            } else {
                LOG.warn("APPTRIGGER patient NOT subscribed, could not find valid dfn or icn in appointment record dfn=" + dfn + " icn=" + icn);
            }
        }
    }


    private VistaDataChunk fetchPatientDemographics(String vistaId, String pid, boolean isIcn) {
        Timer.Context timer = metricRegistry.timer(MetricRegistry.name("vpr.fetch.patient")).time();
        try {
            Map rpcArg = new HashMap();
            rpcArg.put("patientId", (isIcn ? ";" + pid : pid));
            rpcArg.put("domain", "patient");
            rpcArg.put("extractSchema",EXTRACT_SCHEMA);
            RpcResponse response = synchronizationRpcTemplate.execute(VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_GET_VISTA_DATA_JSON_RPC_URI, rpcArg);
            JsonNode json = jsonExtractor.extractData(response);
            JsonNode patientJsonNode = json.path("data").path("items").path(0);
            if (patientJsonNode.isNull())
                throw new DataRetrievalFailureException("missing 'data.items[0]' node in JSON RPC response");
            VistaDataChunk patientChunk = VistaDataChunk.createVistaDataChunk(vistaId, response.getRequestUri(), patientJsonNode, "patient", 0, 1, null, VistaDataChunk.getProcessorParams(vistaId, pid, isIcn));
            patientChunk.getParams().put(SyncMessageConstants.DIVISION, response.getDivision());
            patientChunk.getParams().put(SyncMessageConstants.DIVISION_NAME, response.getDivisionName());

            if (!isIcn)
                patientChunk.setLocalPatientId(pid);

            return patientChunk;
        } catch (RuntimeException e) {
            throw e;
        } finally {
            timer.stop();
        }
    }

    public VistaDataChunk fetchOneByUid(String vistaId, String pid, String uid) {
        Timer.Context timer = metricRegistry.timer(MetricRegistry.name("vpr.fetch.patient")).time();
        String domain = UidUtils.getCollectionNameFromUid(uid);
        PatientDemographics pt = patientDao.findByPid(pid);
        try {
            Map rpcArg = new HashMap();
            rpcArg.put("uid", uid);
            RpcResponse response = synchronizationRpcTemplate.execute(VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_GET_VISTA_DATA_JSON_RPC_URI, rpcArg);
            JsonNode json = jsonExtractor.extractData(response);
            JsonNode jsonNode = json.path("data").path("items").path(0);
            if (jsonNode.isNull())
                throw new DataRetrievalFailureException("missing 'data.items[0]' node in JSON RPC response");
            VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, response.getRequestUri(), jsonNode, domain, 0, 1, pt);

            return chunk;
        } catch (RuntimeException e) {
            throw e;
        } finally {
            timer.stop();
        }
    }

    /**
     * This method unsubscribes a patient for a single site.
     * 
     * @param vistaId The site to unsubscribe
     * @param pid The pid for the patient to unsubscribe
     */
    private void unsubscribePatientForSingleSite(String vistaId, String pid) {
        LOG.debug("unsubscribePatientForSingleSite: Entered method for vistaId: " + vistaId + "; pid:" + pid);
        LOG.debug("unsubscribePatientForSingleSite: Got here by the following trace: " + CRLF + Arrays.toString(Thread.currentThread().getStackTrace()));
        
        Map<String, Object> params = new HashMap<>();
        params.put("hmpSrvId", environment.getProperty(HmpProperties.SERVER_ID));
        params.put("pid", pid);
        String url = VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_STREAM_DELSUB_RPC_URI;
        synchronizationRpcTemplate.executeForJson(url, params);
        syncStatusDao.delete(pid, vistaId);
    }
    
    @Override
    public synchronized void unsubscribePatient(String vistaId, String pid, boolean cascade) {
        LOG.debug("unsubscribePatient (vistaId, pid): Entered method for vistaId: " + vistaId + "; pid:" + pid);
        LOG.debug("unsubscribePatient: Got here by the following trace: " + CRLF + Arrays.toString(Thread.currentThread().getStackTrace()));
        
        if (NullChecker.isNullish(pid)) {
            LOG.warn("unsubscribePatient: pid was null.  No unsubscription will be performed.");
            return;
        }
        
        // Unsubscribe for this site.
        //--------------------------
        if (NullChecker.isNotNullish(vistaId)) {
            LOG.debug("unsubscribePatient: Unsubscribing patient for original request.  site: " + vistaId + "; pid: " + pid);
            unsubscribePatientForSingleSite(vistaId, pid);
        }
        
        if (cascade) {
            // Now lets see if this patient has other sites where they have data and unsubscribe them too.
            //--------------------------------------------------------------------------------------------
            List<SiteAndPid> oaSiteAndPid = getPatientVistaSites(pid);
            if (NullChecker.isNotNullish(oaSiteAndPid)) {
                for (SiteAndPid siteAndPid : oaSiteAndPid) {
                    if ((NullChecker.isNotNullish(siteAndPid.getSite())) &&
                            (NullChecker.isNotNullish(siteAndPid.getPid())) &&
                            (!siteAndPid.getSite().equals(vistaId))) {
                        LOG.debug("unsubscribePatient: Unsubscribing patient for another site.  site: " + siteAndPid.getSite() + "; pid: " + siteAndPid.getPid());
                        unsubscribePatientForSingleSite(siteAndPid.getSite(), siteAndPid.getPid());
                    }
                }
            }
        }
    }

    @Override
    public void unsubscribePatient(String vistaId, PatientDemographics pt, boolean cascade) {
        LOG.debug("unsubscribePatient(vistaId, pt): Entered method for vistaId: " + vistaId + "; pt: " + ((pt == null) ? "null" : pt.toString()));
        LOG.debug("unsubscribePatient: Got here by the following trace: " + CRLF + Arrays.toString(Thread.currentThread().getStackTrace()));
        unsubscribePatient(vistaId, pt.getPid(), cascade);
    }

    /**
     * Return true of this pid is an ICN.   A pid that has a ';' is NOT an ICN.
     * 
     * @param pid The pid to check.
     * @return TRUE if the pid is an icn.
     */
    private static boolean isIcn(String pid) {
        if ((NullChecker.isNotNullish(pid)) && (pid.contains(";"))) {
            return false;
        }
        else if ((NullChecker.isNotNullish(pid))) {
            return true; 
        }
        else {
            return false;
        }
    }

    /**
     * This method is used to subscribe a patient for a single site.
     * 
     * @param vistaId The site being subscribed.
     * @param pid The pid being subscribed
     */
    public synchronized void subscribePatientForSingleSite(String vistaId, String pid) {
        LOG.debug("subscribePatientForSingleSite: Entered method for vistaId: " + vistaId + "; pid: " + pid);

        Map<String, Object> params = new HashMap<>();
        params.put("server", environment.getProperty(HmpProperties.SERVER_ID));
        params.put("command", "putPtSubscription");

        String dfn = PidUtils.getDfn(pid);
        if (StringUtils.hasText(dfn)) {
            params.put("localId", dfn);
        } else {
            throw new IllegalArgumentException("Missing dfn for subscribing patients.");
        }

        SyncStatus stat = syncStatusDao.findOneByPid(pid);
        if ((stat != null) && (stat.getVistaAccountSyncStatusForSystemId(vistaId) != null)) {
            LOG.warn("subscribePatientForSingleSite: subscribePatient called but patient already subscribed; pid={}; vistaId={}; No synchronization for this patient will be triggered.", pid, vistaId);
            return;
        }

        String url = VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_STREAM_API_RPC_URI;
        JsonNode json = synchronizationRpcTemplate.executeForJson(url, params);

        if (json.has("error")) {
            String msg = json.path("error").path("message").asText();
            LOG.error("VistA event stream error: {}", msg);
        } 
    }
    
    @Override
    public synchronized void subscribePatient(String vistaId, String pid, boolean cascade) {
        LOG.debug("subscribePatient: Entered method for vistaId: " + vistaId + "; pid: " + pid);
        LOG.debug("subscribePatient: Got here by the following trace: " + CRLF + Arrays.toString(Thread.currentThread().getStackTrace()));
        
        if (NullChecker.isNullish(pid)) {
            LOG.warn("subscribePatient: pid was null.  No subscription will be performed.");
            return;
        }
        
        // Subscribe for this site.
        //--------------------------
        if (NullChecker.isNotNullish(vistaId)) {
            LOG.debug("subscribePatient: Subscribing patient for original request.  site: " + vistaId + "; pid: " + pid);
            subscribePatientForSingleSite(vistaId, pid);
        }
        
        if (cascade) {
            // Now lets see if this patient has other sites where they have data and subscribe them too.
            //------------------------------------------------------------------------------------------
            List<SiteAndPid> oaSiteAndPid = getPatientVistaSites(pid);
            if (NullChecker.isNotNullish(oaSiteAndPid)) {
                for (SiteAndPid siteAndPid : oaSiteAndPid) {
                    if ((NullChecker.isNotNullish(siteAndPid.getSite())) &&
                            (NullChecker.isNotNullish(siteAndPid.getPid())) &&
                            (!siteAndPid.getSite().equals(vistaId))) {
                        LOG.debug("subscribePatient: Subscribing patient for another site.  site: " + siteAndPid.getSite() + "; pid: " + siteAndPid.getPid());
                        subscribePatientForSingleSite(siteAndPid.getSite(), siteAndPid.getPid());
                    }
                }
            }
        }
    }
    
    private SyncStatus createSyncStatus(String vistaId, PatientDemographics pt) {
        SyncStatus stat = new SyncStatus();
        if (NullChecker.isNotNullish(pt.getIcn())) {
            stat.setData("pid", pt.getIcn());
        }
        else {
            stat.setData("pid", pt.getPid());
        }
        stat.setData("displayName",pt.getDisplayName());
        
        Set<String> qdfns = new HashSet<String>(pt.getPatientIds());
        qdfns.remove(pt.getIcn());
        qdfns.remove(pt.getSsn());
        qdfns.remove(pt.getPid());
        stat.setData("localPatientIds", StringUtils.collectionToCommaDelimitedString(qdfns));

        SyncStatus.VistaAccountSyncStatus vstat = new SyncStatus.VistaAccountSyncStatus();
        vstat.setPatientUid(UidUtils.getPatientUid(vistaId, pt.getLocalPatientIdForSystem(vistaId)));
        vstat.setDfn(pt.getLocalPatientIdForSystem(vistaId));

        Map<String, Object> syncStatusByVistaSystemId = new HashMap<>();
        syncStatusByVistaSystemId.put(vistaId, vstat);

        stat.setData("syncStatusByVistaSystemId", syncStatusByVistaSystemId);
        return stat;
    }

    // It now serves both patient and operational data purposes.
    @Override
    public synchronized VprUpdateData fetchUpdates(String vistaId, String division, String previousLastUpdate) {
        // Synchronized because, in the case where there is a change to patient subscription,
        // either subscribing new or removing a patient subscription,
        // we don't want to collide with status checks.
        // We can safely move this when we move the sync status check elsewhere.

        LOG.debug("fetchUpdates: Entered method: lastUpdate: " + previousLastUpdate + "; vistaId: " + vistaId + "; division: " + division);

        Map<String, Object> params = new HashMap<>();

        params.put("command", "getPtUpdates");
        params.put("lastUpdate", previousLastUpdate);
        params.put("getStatus", true);  // Temp flag for experimentation; check sync statii against VISTA
        params.put("max", asyncBatchSize);
        String version = environment.getProperty(HmpProperties.VERSION);
        params.put("hmpVersion", version);
        params.put("extractSchema",EXTRACT_SCHEMA);

        List<VistaDataChunk> chunks = new ArrayList<VistaDataChunk>();

        params.put("server", environment.getProperty(HmpProperties.SERVER_ID));

        String url = VISTA_RPC_BROKER_SCHEME + "://" + vistaId + VPR_STREAM_API_RPC_URI;
        LOG.debug("fetchUpdates: Calling RPC to retrieve patient data - RPC URL: " + url);
        LoggingUtil.dumpMap(params);

        JsonNode json = synchronizationRpcTemplate.executeForJson(url, params);

        JsonNode data = json.path("data");
        String newlyReceivedUpdate = data.get("lastUpdate").asText();

        ArrayNode items = (ArrayNode) json.findValue("items");

        Map<String, PatientDemographics> patMap = new HashMap<>();
        Map<String, SyncStatus> statMap = new HashMap<>();
        VprUpdateData rslt = new VprUpdateData();
        if (items != null) {
            LOG.debug("fetchUpdates: Processing " + items.size() + " json items.");
        }
        else {
            LOG.debug("fetchUpdates: Processing 0 json items.  The array was null.");
        }
        for (JsonNode item : items) {
            String domainName = item.path("collection").asText();
            int tot = item.path("total").asInt();
            int idx = item.path("seq").asInt();
            String pid = item.path("pid").asText();
            JsonNode object = item.path("object");
            if(domainName.equalsIgnoreCase("syncCommand")) {
                handleSyncCommand(vistaId, chunks, url, item, object);
            } else if (domainName.equalsIgnoreCase("patient") || !StringUtils.hasText(pid)) {   // If the record is basically operational data (not tied to an existing patient)
                if (!item.path("deletes").isMissingNode()) {
                    LOG.debug("fetchUpdates: Processing 'delete' json item.");
                    JsonNode deletesNode = item.path("deletes");
                    for (JsonNode deleteNode : deletesNode) {
                        String uid = deleteNode.get("uid").textValue();
                        rslt.getUidsToDelete().add(uid);
                    }
                } else if (!item.path("error").isMissingNode()) {
                    LOG.debug("fetchUpdates: Processing 'error' json item.");
                    JsonNode errorsNode = item.path("error");
                    for (JsonNode errorNode : errorsNode) {
                        String msg = errorNode.path("error").get("message").textValue();
                        LOG.error("error in VPR update data: " + msg);
                    }
                } else {
                    LOG.debug("fetchUpdates: Processing 'operational data' json item.");
                    handleOperationalDataItem(vistaId, chunks, url, domainName, tot, idx, object, statMap);
                }

            } else {
                LOG.debug("fetchUpdates: Processing 'patient data' json item.");
                handlePatientDataItem(vistaId, division, chunks, url, patMap, item, domainName, tot, idx, pid, object, statMap);
            }
        }

        ArrayNode wpd = (ArrayNode)data.path("waitingPids");
        List<String> pendingPids = new ArrayList<>();
        for(JsonNode wp: wpd) {pendingPids.add(wp.asText());}

        ArrayNode ppd = (ArrayNode)data.path("processingPids");
        List<String> processingPids = new ArrayList<>();
        for(JsonNode pp: ppd) {processingPids.add(pp.asText());}

        for(String pid: pendingPids) {
            SyncStatus stat = statMap.get(pid);
            if(stat==null) {
                stat = syncStatusDao.findOneByPid(pid);
            }
            if(stat!=null && stat.getVistaAccountSyncStatusForSystemId(vistaId) != null) {
                stat.getVistaAccountSyncStatusForSystemId(vistaId).setQueuePosition(pendingPids.indexOf(pid) + 1);
                
                // Use merge and put to prevent over-writing statMap with incomplete syncStatus
                this.mergeAndPutSyncStatus(statMap, pid, stat);
            }
        }

        for(String pid: processingPids) {
            SyncStatus stat = statMap.get(pid);
            if(stat==null) {
                stat = syncStatusDao.findOneByPid(pid);
            }
            if(stat!=null && stat.getVistaAccountSyncStatusForSystemId(vistaId) != null) {
                stat.getVistaAccountSyncStatusForSystemId(vistaId).setQueuePosition(processingPids.indexOf(pid) + 1);
                
                // Use merge and put to prevent over-writing statMap with incomplete syncStatus
                this.mergeAndPutSyncStatus(statMap, pid, stat);
            }
        }


        // If it does a NEW one in the same session as the COMPLETE one, it borks.
        // If NEW and COMPLETE are in different responses, it work sfine.
        for (SyncStatus stat : statMap.values()) {
            LOG.debug(LoggingUtil.outputSyncStatus("fetchUpdates: Storing SyncStatus to database: ", stat));
            syncStatusDao.saveMergeSyncStatus(stat);
            broadcastSyncStatus(stat);
        }

        JsonNode statii = data.get("syncStatii");
        LOG.debug("fetchUpdates: chunks.size(): " + chunks.size());
        LOG.debug("fetchUpdates: statii was " + ((statii == null)?"null":"not null"));
        if (chunks.size() == 0 && statii != null && statii.isArray()) {
            // For now we must check only when the return set is empty;
            // When we are able to implement status "3" (which means VISTA thinks we have gotten all the records) we can check regardless of chunk payload.
            LOG.debug("fetchUpdates: calling SyncUtils.resolveSyncStatusDifferences.");
            SyncUtils.resolveSyncStatusDifferences(syncStatusDao.findAllPatientStatii(), (ArrayNode)statii, syncStatusDao, this, vistaId);
        }
        else {
            LOG.debug("fetchUpdates: NOT calling SyncUtils.resolveSyncStatusDifferences.");
        }

        if (chunks != null) {
            LOG.debug("fetchUpdates: Adding " + chunks.size() + " chunks to the return result.");
        }

        rslt.setChunks(chunks);
        rslt.setLastUpdate(newlyReceivedUpdate);
        LOG.debug("fetchUpdates: setting return result last update to: " + newlyReceivedUpdate);

        return rslt;
    }

    private void handleSyncCommand(String vistaId, List<VistaDataChunk> chunks, String url, JsonNode item, JsonNode object) {
        LOG.debug("handleSyncCommand: Entering method. vistaId: " + vistaId + "; url: " + url);
        String command = object.path("command").textValue();
        LOG.debug("handleSyncCommand: command: " + command);
        if(command.equalsIgnoreCase("deleteDomainForPatient")) {
            String pid = object.path("pid").textValue();
            PatientDemographics dem = patientDao.findByPid(pid);
            VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, url, object, "syncCommand", 0, 0, dem, VistaDataChunk.getProcessorParams(vistaId, dem.getIcn(), true), true, VistaDataChunk.COMMAND);
            chunks.add(chunk);
        } else if(command.equalsIgnoreCase("deleteOperationalDomain")) {
            VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, url, object, "syncCommand", 0, 0, null, VistaDataChunk.getProcessorParams(vistaId, null, false), true, VistaDataChunk.COMMAND);
            chunks.add(chunk);
        }
    }


    private void broadcastSyncStatus(SyncStatus stat) {
        Map<String, Object> message = new HashMap<String, Object>();
        message.put("eventName", "syncStatusChange");
        message.put("syncStatus", stat.getData());
        bcSvc.broadcastMessage(message);
    }

    /**
     * This method will retrieve the patient status information..   It first checks to see if the status is already
     * in the status map that we are tracking.  If it is, then it uses that one.  If it is not, then it checks to
     * see if it is in the database.  If it is not, then it creates one.
     *
     * @param statMap The SyncStatus objects we are tracking as part of this set of data chunks we are processing.
     * @param pid The patient ID.
     * @param pt The patient demographics.
     * @param vistaId The vista site hash code.
     * @return The SyncStatus for this patient.
     */
    private SyncStatus getPtSyncStatus(Map<String, SyncStatus> statMap, String pid, PatientDemographics pt, String vistaId) {
        SyncStatus syncStat = null;

        // First check to see if we have all the data that we are expecting.
        //-------------------------------------------------------------------
        if ((statMap == null) || (NullChecker.isNullish(pid)) || (pt == null)) {
            throw new InvalidDataAccessResourceUsageException("Unable to locate sync status - the pid, pt, or statMap was not available.");
        }

        syncStat = statMap.get(pid);
        if (syncStat == null) {
            // Not in the map, so lets get it from the database.
            //--------------------------------------------------
            LOG.debug("getPtSyncStatus: statMap did NOT contain the syncStatus for pid: " + pid);
            syncStat = syncStatusDao.findOneByPid(pt.getPid());
        }
        else {
            LOG.debug("getPtSyncStatus: statMap contained the syncStatus for pid: " + pid);
        }

        // Not in the map or the database - create it.
        //---------------------------------------------
        if (syncStat == null) {
            LOG.debug("getPtSyncStatus: sync status was not in the map or the database for pid: " + pid + ".  Creating it now from scratch.");
            syncStat = createSyncStatus(vistaId, pt);
        }

        // Now lets verify that there is an entry for the facility that we are processing.
        //---------------------------------------------------------------------------------
        VistaAccountSyncStatus siteSyncStatus = syncStat.getVistaAccountSyncStatusForSystemId(vistaId);
        if (siteSyncStatus == null) {
            syncStat.addSite(pt, vistaId);
            LOG.debug("getPtSyncStatus: SyncStatus did NOT contain an entry for vistaId: " + vistaId + " for pid: " + pid + ".  Adding a new one now.");
        }
        else {
            LOG.debug("getPtSyncStatus: SyncStatus contained an entry for vistaId: " + vistaId + " for pid: " + pid);
        }

        return syncStat;
    }


    private void handlePatientDataItem(String vistaId, String division, List<VistaDataChunk> chunks,
                                       String url, Map<String, PatientDemographics> patMap, JsonNode item,
                                       String domainName, int tot, int idx, String pid, JsonNode object, Map<String, SyncStatus> statMap) {
        LOG.debug("handlePatientDataItem: Entered handlePatientItem method; domainName=" + domainName);
        if (domainName.equals("syncStatus")) {
            // Now, update sync status stuff.
            // This should be the end of this patient's sync stream - so if we have a mishmash, we may want to acknowledge it as complete with errors.
            PatientDemographics pt = patientDao.findByPid(pid);
            if (pt != null) {
                LOG.debug("handlePatientDataItem: Found (non-null) Patient.");
                SyncStatus stat = getPtSyncStatus(statMap, pt.getPid(), pt, vistaId);

                // Set the sync to be completed...  We want to do this after JMeadows - but regardless if JMeadows is successful.
                //----------------------------------------------------------------------------------------------------------------
                stat.setSyncComplete(vistaId, true);

                JsonNode dataNode = POMUtils.parseJSONtoNode(stat.toJSON());
                VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, url, dataNode, "syncStatus", idx, tot, null, VistaDataChunk.getProcessorParams(vistaId, null, false), true);
                syncService.sendImportVistaDataExtractItemMsg(chunk);
                //statMap.put(pt.getPid(), stat);

                LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Completed sync for pid: " + pt.getPid() + "; vistaId: " + vistaId + ".  Saving SyncStatus now: ", stat));
                syncStatusDao.saveMergeSyncStatus(stat);
                statMap.remove(pt.getPid());

                pt.setLastUpdated(PointInTime.now());
                patientDao.save(pt);

                LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Completed sync for pid: " + pt.getPid() + "; vistaId: " + vistaId + ".", stat));

                // Commented out the place the HDR is called in VA code - vor VistaCoreEx We do this
                // differently.
//                if(this.hdrEnabled) {
//                    // TODO: How do I get the correct division?
//                   syncService.sendHdrPatientImportMsg(pid, division, vistaId);
//                }
            }

        } else if (domainName.equals("syncStart")) {
            LOG.debug("handlePatientDataItem: Entered handlePatientItem method.  domainName='syncStart'");
            // Handle initial patient demographic object saving here
            if (object.isNull())
                throw new DataRetrievalFailureException("missing 'data.items[0]' node in JSON RPC response");
            VistaDataChunk patientChunk = VistaDataChunk.createVistaDataChunk(vistaId, url, object, "patient", 0, 1, null, VistaDataChunk.getProcessorParams(vistaId, pid, false));

            LOG.debug("handlePatientDataItem: Just before outputting patientChunk information.");

            try {
                PatientDemographics pt = conversionService.convert(patientChunk, PatientDemographics.class);
                if (pt == null) {
                    throw new InvalidDataAccessResourceUsageException("Unable to convert patientChunk into PatientDemographics object: " + patientChunk);
                }
                LOG.debug("handlePatientDataItem: Demographics converted from Patient Chunk" + CRLF + pt.toString());

                pt = patientDao.save(pt);
                LOG.debug("handlePatientDataItem: Demographics returned from patientDao save method" + CRLF + ((pt == null)?"null":pt.toString()));

                String localPatientId = pt.getLocalPatientIdForSystem(vistaId);
                patientChunk.setLocalPatientId(localPatientId);
                SyncStatus stat = getPtSyncStatus(statMap, pid, pt, vistaId);

                // Use merge and put to prevent over-writing statMap with incomplete syncStatus
                this.mergeAndPutSyncStatus(statMap, pt.getPid(), stat);

                LOG.debug("handlePatientDataItem: Started sync for patient.  pid:" + pid + "; pt.getPid(): " + pt.getPid());
                LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Started sync for pid: " + pid + "; vistaId: " + vistaId + ".  Placing sync status in status map now.", stat));

                // Pull DoD data from JMeadows.
                //---------------------
                if (this.jmeadowsEnabled) {
                    //TODO Need mechanism to retrieve DoD edipi
                    PatientIds patientIds = vistaPatientIdentityService.getPatientIdentifiers(vistaId, pid);

                    //skip jMeadows call if EDIPI is empty
                    if (patientIds != null && !StringUtils.isEmpty(patientIds.getEdipi())) {
                        try {
                            // Create DOD site in syncstatus to track sync completion
                            String siteId = SyncDodMessageHandler.SITE_ID;
                            SyncStatus syncStatus = getPtSyncStatus(statMap, patientIds.getPid(), pt, siteId);
                            String patientUid = "urn:va:patient:" + siteId + ":" + patientIds.getEdipi();
                            syncStatus.getVistaAccountSyncStatusForSystemId(siteId).setPatientUid(patientUid);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Before starting JMeadows sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  Storing sync status now.", syncStatus));
                            syncStatus = syncStatusDao.saveMergeSyncStatus(syncStatus);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Before starting JMeadows sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  After saving.", syncStatus));

                            Map message = ImmutableMap.builder()
                                    .put("patientIds", patientIds.toMap())
                                    .build();
                            getJmsTemplate().convertAndSend(MessageDestinations.SYNC_DOD_QUEUE, message);
                        } catch (Exception e) {
                            LOG.error("An error occurred while retrieving DoD data from jMeadows.", e);
                        }

                    } else LOG.debug("Patient pid:{} does not have an EDIPI, skipping DoD data jMeadows pull", pid);
                }
                else LOG.debug("Not fetching DoD data for patient {}: jMeadows is disabled.", pid);

                // Pull CDS (HDR) data.
                //---------------------
                if (this.hdrEnabled) {
                    LOG.debug("VistaPatientDataService.handlePatientItem: HDR Enabled; beginning HDR data fetch.");
                    PatientIds patientIds = vistaPatientIdentityService.getPatientIdentifiers(vistaId, pid);

                    //skip CDS call if EDIPI is empty
                    if (patientIds != null && !StringUtils.isEmpty(patientIds.getEdipi())) {
                        try {
                            // Create CDS site in syncstatus to track sync completion
                            String siteId = SyncCdsMessageHandler.SITE_ID;
                            SyncStatus syncStatus = getPtSyncStatus(statMap, patientIds.getPid(), pt, siteId);
                            String patientUid = "urn:va:patient:" + siteId + ":" + patientIds.getIcn();
                            syncStatus.getVistaAccountSyncStatusForSystemId(siteId).setPatientUid(patientUid);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Before starting HDR/CDS sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  Storing sync status now.", syncStatus));
                            syncStatusDao.saveMergeSyncStatus(syncStatus);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Before starting HDR/CDS sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  After saving.", syncStatus));

                            Map message = ImmutableMap.builder()
                                    .put("patientIds", patientIds.toMap())
                                    .build();
                            getJmsTemplate().convertAndSend(MessageDestinations.SYNC_CDS_QUEUE, message);
                        } catch (Exception e) {
                            LOG.error("An error occurred while retrieving CDS (HDR) data.", e);
                        }

                    } else LOG.debug("Patient pid:{} does not have an EDIPI, skipping CDS (HDR) data pull", pid);
                }
                else LOG.debug("Not fetching CDS (HDR) data for patient {}: HDR is disabled.", pid);

                // Pull VLER data
                //----------------
                if (this.vlerDasEnabled) {
                    PatientIds patientIds = null;
                    String icn = pt.getIcn();

                    if (!StringUtils.isEmpty(icn)) {
                        // we have an ICN, so just use that to identify the patient
                        patientIds = new PatientIds.Builder().icn(icn).pid(pid).uid(pt.getUid()).build();
                    } else {
                        // no ICN, but we can use the EDIPI instead
                        // TODO Need mechanism to retrieve DoD edipi
                        patientIds = vistaPatientIdentityService.getPatientIdentifiers(vistaId, pid);
                    }

                    if (patientIds != null && (!StringUtils.isEmpty(patientIds.getIcn()) || !StringUtils.isEmpty(patientIds.getEdipi()))) {
                        try {
                            // Create VLER DAS site in syncstatus to track sync completion
                            String siteId = SyncDasMessageHandler.SITE_ID;
                            SyncStatus syncStatus = getPtSyncStatus(statMap, patientIds.getPid(), pt, siteId);
                            String patientUid = "urn:va:patient:" + siteId + ":" + patientIds.getIcn();
                            syncStatus.getVistaAccountSyncStatusForSystemId(siteId).setPatientUid(patientUid);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Before starting VLER DAS sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  Storing sync status now.", syncStatus));
                            syncStatusDao.saveMergeSyncStatus(syncStatus);
                            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: After starting HDR/CDS sync pid: " + patientIds.getPid() + "; vistaId: " + siteId + ".  After saving.", syncStatus));

                            Map message = ImmutableMap.builder()
                                    .put("patientIds", patientIds.toMap())
                                    .build();
                            getJmsTemplate().convertAndSend(MessageDestinations.SYNC_DAS_QUEUE, message);
                        } catch (Throwable t) {
                            LOG.error("An error occurred while retrieving VLER data from DAS", t);
                        }
                    }
                } else {
                    LOG.debug("Not fetching VLER data for patient {}: VlerDas is disabled.", pid);
                }


            } catch(ConversionFailedException e){
                LOG.error("Unable to convert patientChunk into PatientDemographics object: " + patientChunk, e);
            }
        } else if (tot > 0 && idx > 0) {
            LOG.debug("handlePatientDataItem: Entered handlePatientItem method.  domainName: " + domainName + ".  It was NOT 'syncStatus' or 'syncStart'");
            PatientDemographics pt = patMap.get(pid);
            if (pt == null) {
                pt = patientDao.findByPid(pid);
                if (pt == null && item.path("pid") != null) {
                    LOG.warn("JDS should have a record for pid: " + pid + " but it cannot be found; Requesting patient record from VISTA...");
                    VistaDataChunk patientChunk = this.fetchPatientDemographics(vistaId, PidUtils.getDfn(pid), false);
                    pt = conversionService.convert(patientChunk, PatientDemographics.class);
                    if (pt == null) {
                        LOG.error("Cannot find patient by pid: " + pid + " Item data will be skipped for uid: " + item.path("uid").asText(), new DataRetrievalFailureException("Can't find patient by pid: " + pid + " when checking async stream"));
                        return;
                    }
                    LOG.warn("VISTA record for pid: " + pid + " has been recovered and saved to JDS");
                    pt = patientDao.save(pt);
//                        String altPid = UidUtils.getLocalPatientIdFromDomainUid(item.path("uid").asText());
//                        pt = patientDao.findByAnyPid(PidUtils.getPid(null, altPid, vistaId));
//                        if (pt == null) {
//                            throw new DataRetrievalFailureException("Can't find patient by pid: " + pid + " or alternate dfn: " + altPid + " when checking async stream");
//                        }
                }
                if (pt == null) {
                    LOG.error("Cannot find patient by pid: " + pid + " Item data will be skipped for uid: " + item.path("uid").asText(), new DataRetrievalFailureException("Can't find patient by pid: " + pid + " when checking async stream"));
                    return;
                }
                patMap.put(pt.getPid(), pt);
            }
            SyncStatus stat = getPtSyncStatus(statMap, pt.getPid(), pt, vistaId);
            LOG.debug(LoggingUtil.outputSyncStatus("Middle of sync for pid: " + pid + "; vistaId: " + vistaId + "; domainName: " + domainName + ".  Before updating totals.", stat));

            // This should probably be inside the SyncStatus object.
            stat.updateDomainTotal(vistaId, domainName, tot);
            stat.updateDomainCount(vistaId, domainName, idx);

            // Use merge and put to prevent over-writing statMap with incomplete syncStatus
            this.mergeAndPutSyncStatus(statMap, pt.getPid(), stat);

            VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, url, object, domainName, idx, tot, pt, VistaDataChunk.getProcessorParams(vistaId, pt.getLocalPatientIdForSystem(vistaId), false), true);
            
            if (domainName.equals(DOCUMENT_TYPE)) {
                LOG.debug("Found a 'document' chunk - fixing the vuid now: Chunk: " + chunk.objectContentsOutput("chunk"));
                JLVDocDefUtil docDefUtil = new JLVDocDefUtil(jdsTemplate);
                docDefUtil.insertVuidFromDocDefUid(chunk);
                LOG.debug("Found a 'document' chunk - after fixing the vuid: Chunk: " + chunk.objectContentsOutput("chunk"));
            }

            // Let's avoid a fire-hose of broadcast updates, shall we?
            chunk.setAutoUpdate(stat.getSyncComplete());

            LOG.debug("handlePatientDataItem: Just before outputting CHUNK information.");

            LOG.debug(LoggingUtil.outputSyncStatus("handlePatientDataItem: Middle of sync for pid: " + pid + "; vistaId: " + vistaId + "; domainName: " + domainName + ".  After updating totals.", stat));

            chunks.add(chunk);
        }
    }

    private void handleOperationalDataItem(String vistaId, List<VistaDataChunk> chunks, String url, String domainName, int tot, int idx, JsonNode object, Map<String, SyncStatus> statMap) {
    	LOG.debug("handleOperationalDataItem: Entering method.");
        SyncStatus syncStatus = statMap.get("OPD");
        if (syncStatus == null) {
            syncStatus = syncStatusDao.findOneForOperational();
            if (syncStatus == null) {
                syncStatus = new SyncStatus();
            }
            syncStatus.setForOperationalByVistaId(true, vistaId);
            statMap.put("OPD", syncStatus);
        }
        else {
        	syncStatus.setForOperationalByVistaId(true, vistaId);
        }
        
        if (domainName.equals("syncStatus") || domainName.equals("syncStart")) {
            if (domainName.equals("syncStatus")) {
                syncStatus.setSyncOperationalCompleteByVistaId(vistaId, true);
            }
        } else if (tot > 0 && idx > 0) {
            if (object.path("uid").isMissingNode()) {
                LOG.warn("Skipping '" + domainName + "' operational item with missing UID.");
            } else {
                syncStatus.updateOperationalDomainTotal(domainName + ":" + vistaId, tot);
                syncStatus.updateOperationalDomainCount(domainName + ":" + vistaId, idx);
                VistaDataChunk chunk = VistaDataChunk.createVistaDataChunk(vistaId, url, object, domainName + ":" + vistaId, idx, tot, null, VistaDataChunk.getProcessorParams(vistaId, null, false), true);
                chunks.add(chunk);
            }
        }
    }

    @Override
    public void setEnvironment(Environment environment) {
        LOG.debug("setEnvironment: entering setEnvironment method.");
        this.environment = environment;

        this.hdrEnabled = environment.getProperty(HmpProperties.HDR_ENABLED, Boolean.class, false);
        LOG.debug("setEnvironment: hdrEnabled set to " + hdrEnabled);

        this.jmeadowsEnabled = environment.getProperty(HmpProperties.JMEADOWS_ENABLED)!=null?Boolean.parseBoolean(environment.getProperty(HmpProperties.JMEADOWS_ENABLED)):false;
        LOG.debug("setEnvironment: jmeadowsEnabled set to " + jmeadowsEnabled);

        this.vlerDasEnabled = environment.getProperty(HmpProperties.VLER_DAS_ENABLED)!=null?Boolean.parseBoolean(environment.getProperty(HmpProperties.VLER_DAS_ENABLED)):false;
        LOG.debug("VistaPatientDataService.setEnvironment: 777 vlerDasEnabled set to " + vlerDasEnabled);

        this.asyncBatchSize = environment.getProperty(HmpProperties.ASYNC_BATCH_SIZE, Integer.class, DEFAULT_BATCH_SIZE);
        LOG.debug("setEnvironment: asyncBatchSize set to " + this.asyncBatchSize);
    }
    
    /**
     * Using the PID - look up the patient in the patient select area and find the patient's 
     * ICN.
     * 
     * @param pid The pid of the patient.
     * @return The ICN for this patient.
     */
    private String getIcnForPatient(String pid) {
        String sIcn = "";
        
        PatientSelect ptSelect = patientSelectDao.findOneByPid(pid);
        if (ptSelect != null) {
            sIcn = ptSelect.getIcn();
            LOG.debug("getIcnForPatient: Found icn: " + sIcn + " for pid: " + pid);
        }
        else {
            LOG.debug("getIcnForPatient: Did not find any patient select data for pid: " + pid);
        }
        
        return sIcn;
    }
    
    /**
     * This method returns the sites that are known to have data for this patient.
     * 
     * @param pid The pid of the patient.
     * @return The list of patient sites that are known to have data for this patient.
     */
    @Override
    public List<SiteAndPid> getPatientVistaSites(String pid) {
        LOG.debug("getPatientVistaSites: Entered method.  pid: " + pid);

        List<SiteAndPid> oaSiteAndPid = new ArrayList<SiteAndPid>();
        String site = "";

        if (NullChecker.isNotNullish(pid)) {
            String icn = getIcnForPatient(pid);

            if (NullChecker.isNotNullish(icn)) {
                List<PatientSelect> oaPtSelect = patientSelectDao.findAllByIcn(icn);
                if (NullChecker.isNotNullish(oaPtSelect)) {
                    for (PatientSelect ptSelect : oaPtSelect) {
                        if (NullChecker.isNotNullish(ptSelect.getUid())) {
                            site = UidUtils.getSystemIdFromPatientUid(ptSelect.getUid());
                            if (NullChecker.isNotNullish(site)) {
                                SiteAndPid siteAndPid = new SiteAndPid();
                                siteAndPid.setSite(site);
                                siteAndPid.setPid(ptSelect.getPid());
                                oaSiteAndPid.add(siteAndPid);
                            }
                        }
                    }
                }
                else {
                    LOG.debug("getPatientVistaSites: No patients found for this icn: " + icn + " and pid: " + pid);
                }
            }
            else {
                LOG.debug("getPatientVistaSites: No icn existed for pid: " + pid);
            }
        }
        else {
            LOG.debug("getPatientVistaSites: pid was null.  Unable to retrieve sites for this patient.");
        }
        
        if ((NullChecker.isNullish(oaSiteAndPid)) && (NullChecker.isNotNullish(pid))) {
            site = PidUtils.getVistaId(pid);
            if (NullChecker.isNotNullish(site)) {
                SiteAndPid siteAndPid = new SiteAndPid();
                siteAndPid.setPid(pid);
                siteAndPid.setSite(site);
                oaSiteAndPid.add(siteAndPid);
                LOG.debug("getPatientVistaSites: Returning only the site in this pid: " + pid + "; site: " + site);
            }
        }
            
        return oaSiteAndPid;
    }


    /**
     * Merges a new SyncStatus object with the existing entry in statMap (if one exists) and puts the merged SyncStatus in to the statMap object.
     * No value is returned, but the statMap parameter is treated as non-final and modified.
     * 
     * @param statMap the Map to be modified
     * @param pid     the pid of the patient for the syncStatus in the statMap
     * @param newSyncStatus updated SyncStatus to merge with the existing statMap
     */
    private void mergeAndPutSyncStatus(Map<String, SyncStatus> statMap, String pid, SyncStatus newSyncStatus) {
        if (statMap == null) {
            throw new IllegalStateException("statMap cannot be null.");
        }

        SyncStatus oldSyncStatus = statMap.get(pid);
        
        SyncStatus mergedSyncStatus;
        if (oldSyncStatus != null) {
            mergedSyncStatus = SyncUtils.mergePatientSyncStatus(oldSyncStatus, newSyncStatus);
        } else {
            mergedSyncStatus = newSyncStatus;
        }
        
        statMap.put(pid, mergedSyncStatus);
    }
    
}
