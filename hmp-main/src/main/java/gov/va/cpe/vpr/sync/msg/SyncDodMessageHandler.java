package gov.va.cpe.vpr.sync.msg;

import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.sync.MessageDestinations;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.jmeadows.IJMeadowsPatientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import java.util.List;

import static gov.va.hmp.util.NullChecker.isNullish;

public class SyncDodMessageHandler extends SecondarySiteSyncMessageHandler {

    public final static String SITE_ID = "DOD";
    public static final String TIMER_NAME = MessageDestinations.SYNC_DOD_QUEUE;
    private static Logger LOGGER = LoggerFactory.getLogger(SyncDodMessageHandler.class);

    private IJMeadowsPatientService jMeadowsPatientService;

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
    
    @Autowired
    public void setJMeadowsPatientService(IJMeadowsPatientService jMeadowsPatientService) {
        this.jMeadowsPatientService = jMeadowsPatientService;
    }

    /**
     * Retrieves patient DoD data from jMeadows.
     * @param patientIds PatientIds instance.
     * @return List of DoD data (mapped as VistaDataChunks).
     */
    @Override
    protected List<VistaDataChunk> fetchData(PatientIds patientIds) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: JMeadows is enabled - checking JMeadows for data now.");
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: pid: " + patientIds.getPid());
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: patient.icn: " + patientIds.getIcn());
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: patient.uid: " + patientIds.getUid());
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: patient.edipi " + patientIds.getEdipi());
        }

        List<VistaDataChunk> vistaDataChunkList = jMeadowsPatientService.fetchDodPatientData(patientIds);

        if (vistaDataChunkList != null) {
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: Received " + vistaDataChunkList.size() + " chunks(items) from JMeadows.");
        } else {
            LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: Received NO chunks(items) from JMeadows.");
        }

        LOGGER.debug("VistaPatientDataService.fetchJMeadowsDodData: JMeadows is enabled - done checking JMeadows for data.");

        return vistaDataChunkList;
    }
    
    @Override
    public void onMessage(Message message, Session session) throws JMSException {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("SyncDodMessageHandler.onMessage().  Entering method...");
        }
        super.onMessage(message, session);
    }

    @Override
    protected String getUid(PatientIds patientIds) {
        if (patientIds == null || isNullish(patientIds.getEdipi())) {
            throw new IllegalArgumentException("patientIds cannot be null and must have an edipi");
        }
        return "urn:va:patient:" + SITE_ID + ":" + patientIds.getEdipi();
    }

}
