package gov.va.cpe.vpr.sync.msg;

import gov.va.cpe.vpr.PatientDemographics;
import gov.va.cpe.vpr.PidUtils;
import gov.va.cpe.vpr.dao.ISolrDao;
import gov.va.cpe.vpr.dao.IVprSyncErrorDao;
import gov.va.cpe.vpr.dao.IVprSyncStatusDao;
import gov.va.cpe.vpr.pom.IPatientDAO;
import gov.va.cpe.vpr.sync.ISyncService;
import gov.va.cpe.vpr.sync.SyncError;
import gov.va.cpe.vpr.sync.SyncMessageConstants;
import gov.va.cpe.vpr.sync.SyncStatus;
import gov.va.cpe.vpr.sync.vista.IVistaOperationalDataDAO;
import gov.va.cpe.vpr.sync.vista.IVistaVprDataExtractEventStreamDAO;
import gov.va.hmp.util.NullChecker;
import gov.va.jmeadows.util.document.IDodDocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.listener.SessionAwareMessageListener;
import org.springframework.jms.support.converter.SimpleMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import java.util.Map;

@Service
public class ClearPatientMessageHandler implements SessionAwareMessageListener {
    private static Logger log = LoggerFactory.getLogger(ClearPatientMessageHandler.class);

    @Autowired
    private IPatientDAO patientDao;

    @Autowired
    private ISolrDao solrDao;

    private IVprSyncStatusDao vprSyncStatusDao;

    @Autowired
    private IVistaVprDataExtractEventStreamDAO vistaPatientDataService;

    @Autowired

    private IVistaOperationalDataDAO vistaOperationalDataService;

    @Autowired
    private IDodDocumentService dodDocumentService;

    private IVprSyncErrorDao errorDao;

    @Autowired
    public void setErrorDao(IVprSyncErrorDao errorDao) {
        this.errorDao = errorDao;
    }

    @Autowired
    public void setVprSyncStatusDao(IVprSyncStatusDao vprSyncStatusDao) {
        this.vprSyncStatusDao = vprSyncStatusDao;
    }

    private static Logger LOGGER = LoggerFactory.getLogger(ReindexPatientMessageHandler.class);


    @Autowired
    SimpleMessageConverter converter;

    @Autowired
    private ISyncService syncService;

    public void onMessage(Message message, Session session) {
        Map msg = null;
        try {
            msg = (Map) converter.fromMessage(message);
            String pid = (String) msg.get(SyncMessageConstants.PATIENT_ID);
            Assert.hasText(pid, "[Assertion failed] - 'pid' must have text; it must not be null, empty, or blank");

            clearPatient(pid);
        } catch (Exception e) {
            LOGGER.error("Error synching patient data: " + e.getMessage(), e);
            try {
                errorDao.save(new SyncError(message, msg, e));
                session.recover();
            } catch (JMSException e1) {
                LOGGER.error("Exception while saving sync error", e1);
            }
        }
    }

    public void clearPatient(String pid) {
        log.debug("clearPatient: Entered method.  Clearing for pid: " + pid);
        PatientDemographics pt = patientDao.findByPid(pid);

        if (pt == null) {
            log.debug("clearPatient: Patient demographics for this patient did not exist.  No need to unsyncrhonize.  pid: " + pid);
            return;
        }

        deletePatient(pid);
        unsubscribePatient(pt);
        log.debug("clearPatient: End of method.  pid: " + pid);
    }


    private void deletePatient(final String pid) {
        log.debug("deletePatient: Entering method.  pid: " + pid);
        patientDao.deleteByPID(pid);

        syncService.deleteErrorByPatientId(pid);

        solrDao.deleteByQuery("pid:" + pid);

        SyncStatus stat = vprSyncStatusDao.findOneByPid(pid);
        if(stat!=null) {
            vprSyncStatusDao.delete(stat);
        }
        dodDocumentService.deleteDodDocuments(pid);

        log.debug("deletePatient: End of method.  pid: " + pid);
    }

    private void unsubscribePatient(PatientDemographics pt) {
        log.debug("unsubscribePatient: Entering method.  pt: " + ((pt == null) ? "null" : pt.toJSON()));
        
        if ((pt != null) && (NullChecker.isNotNullish(pt.getPid()))) {
            String pid = pt.getPid();
            String vistaId = PidUtils.getVistaId(pid);
            log.debug("unsubscribePatient: Unsubscribing pid: " + pid + "; site: " + vistaId);
            vistaPatientDataService.unsubscribePatient(vistaId, pid, true);
        }

        log.debug("unsubscribePatient: Leaving method.");
    }

    public IPatientDAO getPatientDao() {
        return patientDao;
    }

    public void setPatientDao(IPatientDAO patientDao) {
        this.patientDao = patientDao;
    }

    public ISolrDao getSolrDao() {
        return solrDao;
    }

    public void setSolrDao(ISolrDao solrDao) {
        this.solrDao = solrDao;
    }

    public IVistaVprDataExtractEventStreamDAO getVistaPatientDataService() {
        return vistaPatientDataService;
    }

    public void setVistaPatientDataService(IVistaVprDataExtractEventStreamDAO vistaPatientDataService) {
        this.vistaPatientDataService = vistaPatientDataService;
    }

    public IVistaOperationalDataDAO getVistaOperationalDataService() {
        return vistaOperationalDataService;
    }

    public void setVistaOperationalDataService(IVistaOperationalDataDAO vistaOperationalDataService) {
        this.vistaOperationalDataService = vistaOperationalDataService;
    }

    public ISyncService getSyncService() {
        return syncService;
    }

    public void setSyncService(ISyncService syncService) {
        this.syncService = syncService;
    }

    public IDodDocumentService getDodDocumentService() {
        return dodDocumentService;
    }

    public void setDodDocumentService(IDodDocumentService dodDocumentService) {
        this.dodDocumentService = dodDocumentService;
    }
}
