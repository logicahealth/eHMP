package gov.va.cpe.vpr.sync.msg;

import com.fasterxml.jackson.databind.JsonNode;
import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.PatientDemographics;
import gov.va.cpe.vpr.UidUtils;
import gov.va.cpe.vpr.pom.IPatientDAO;
import gov.va.cpe.vpr.pom.POMUtils;
import gov.va.cpe.vpr.sync.MessageDestinations;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.cpe.vpr.util.ConnectionBuilder;
import gov.va.hmp.HmpProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataRetrievalFailureException;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import javax.net.ssl.HttpsURLConnection;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;

import static gov.va.cpe.vpr.sync.SyncMessageConstants.*;
import static gov.va.hmp.util.NullChecker.isNullish;

public class SyncCdsMessageHandler extends SecondarySiteSyncMessageHandler implements EnvironmentAware {

    public static final String SITE_ID = "0CD5";
    private static final String TIMER_NAME = MessageDestinations.SYNC_CDS_QUEUE;
    private static Logger LOGGER = LoggerFactory.getLogger(SyncCdsMessageHandler.class);
    
    @Override
    protected String getSiteId() {
        return SITE_ID;
    }

    @Override
    protected String getTimerName() {
        return TIMER_NAME;
    }

    @Override
    protected Logger getLogger() {
        return LOGGER;
    }

    @Override
    protected void setLogger(Logger theLogger) {
        LOGGER = theLogger;
    }
    
    private IPatientDAO patientDao;
    
    @Autowired
    public void setPatientDao(IPatientDAO patientDao) {
        this.patientDao = patientDao;
    }
    
    private String hdrBaseUrl;
    
    @Override
    protected List<VistaDataChunk> fetchData(PatientIds patientIds) {
        PatientDemographics pt = patientDao.findByPid(patientIds.getPid());
        return fetchHdrData("500", pt);
    }
    
    @Override
    public void onMessage(Message message, Session session) throws JMSException {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("SyncCdsMessageHandler.onMessage().  Entering method...");
        }
        super.onMessage(message, session);
    }
        
    private List<VistaDataChunk> fetchHdrData(String division, PatientDemographics pt) {
        List<VistaDataChunk> chunks = new LinkedList<VistaDataChunk>();
        for (String domain : UidUtils.getAllPatientDataDomains()) {
            chunks.addAll(fetchHdrData(division, pt, domain));
        }
        return chunks;
    }
    
    private List<VistaDataChunk> fetchHdrData(String division, PatientDemographics pt, String domain) {
        LOGGER.debug("fetchHdrData: fetching " + domain + " data for patient " + pt.getIcn() + "; request originates from division=" + division + ".");
        List<VistaDataChunk> rslt = new ArrayList<>();
        String composedUrl = hdrBaseUrl + pt.getIcn() + "/" + domain + "?_type=json&max=100&clientName=HMP&excludedAssigningFacility=" + division + "&excludedAssigningAuthority=USVHA&requestId=65756756";
        LOGGER.debug("fetchHdrData: using https connection and URL: " + composedUrl);
        URL url = null;
        InputStream inputstream;
        try {
            url = new URL(composedUrl);
            HttpsURLConnection conn = ConnectionBuilder.createConnection(url);
            inputstream = conn.getInputStream();
        } catch (IOException e) {
            e.printStackTrace();
            return rslt;
        }
        JsonNode node = POMUtils.parseJSONtoNode(inputstream);
        LOGGER.debug("fetchHdrData: json node contents: " + node.toString());
        rslt = createVistaDataChunks(composedUrl, node, domain, pt, null);
        LOGGER.debug("fetchHdrData: rslt contains " + rslt.size() + " chunks.");
        try
		{	
			inputstream.close();
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
		return rslt;
    }

    private List<VistaDataChunk> createVistaDataChunks(String rpcUri, JsonNode jsonResponse, String domain, PatientDemographics pt, Map processorParams) {
        LOGGER.debug("createVistaDataChunks: entering method.");

        List<VistaDataChunk> chunks = new LinkedList<VistaDataChunk>();

        // Check to see if jsonResponse contains an array of sites.
        JsonNode sitesNode = jsonResponse.path("sites");
        if (sitesNode.isArray()) {
            LOGGER.debug("createVistaDataChunks: parsing an array of sites.");
            for (JsonNode site : sitesNode) {
                chunks.addAll(createVistaDataChunks(rpcUri, site, domain, pt, processorParams));
            }
        } else {
            JsonNode itemsNode = jsonResponse.path("data").path("items");
            if (itemsNode.isNull()) {
                String message = "missing 'data.items' node in JSON RPC response";
                LOGGER.warn("createVistaDataChunks: " + message);
                throw new DataRetrievalFailureException(message);
            }

            for (int i = 0; i < itemsNode.size(); i++) {
                LOGGER.debug("createVistaDataChunks: processing chunk " + Integer.toString(i+1) + " of " + itemsNode.size());
                JsonNode item = itemsNode.get(i);
                String vistaId = UidUtils.getSystemIdFromPatientUid(item.path("uid").asText());
                if (processorParams == null) {
                    processorParams = getProcessorParams(vistaId, pt.getPid(), pt.getIcn() != null);
                }
                chunks.add(VistaDataChunk.createVistaDataChunk(vistaId, rpcUri, item, domain, i, itemsNode.size(), pt, processorParams));
            }
        }

        return chunks;
    }

    private Map getProcessorParams(String vistaId, String pid, boolean icn) {
        Map m = new LinkedHashMap();
        m.put(VISTA_ID, vistaId);
        if (icn)
            m.put(PATIENT_ICN, pid);
        else
            m.put(PATIENT_DFN, pid);
        return m;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.hdrBaseUrl = environment.getProperty(HmpProperties.HDR_BASEURL);
        if(hdrBaseUrl==null) {
            hdrBaseUrl = "https://hdrclucds-di.fo-slc.domain.ext/repositories.domain.ext/fpds/GenericObservationRead1/GENERIC_VISTA_LIST_DATA_FILTER/";
        }
    }

    @Override
    protected String getUid(PatientIds patientIds) {
        if (patientIds == null || isNullish(patientIds.getIcn())) {
            throw new IllegalArgumentException("patientIds cannot be null and must have an icn");
        }
        return "urn:va:patient:" + SITE_ID + ":" + patientIds.getIcn();
    }

}
