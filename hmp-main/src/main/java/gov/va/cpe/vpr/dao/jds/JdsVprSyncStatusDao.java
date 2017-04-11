package gov.va.cpe.vpr.dao.jds;

import gov.va.cpe.vpr.dao.IVprSyncStatusDao;
import gov.va.cpe.vpr.pom.IGenericPOMObjectDAO;
import gov.va.cpe.vpr.pom.jds.JdsOperations;
import gov.va.cpe.vpr.pom.jds.JdsPOMObjectDAO;
import gov.va.cpe.vpr.sync.SyncStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import gov.va.cpe.vpr.sync.SyncStatus.VistaAccountSyncStatus;
import gov.va.cpe.vpr.sync.util.SyncUtils;
import gov.va.hmp.ptselect.PatientSelect;
import gov.va.hmp.ptselect.dao.IPatientSelectDAO;
import gov.va.hmp.util.LoggingUtil;
import gov.va.hmp.util.NullChecker;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

public class JdsVprSyncStatusDao extends JdsPOMObjectDAO<SyncStatus> implements IVprSyncStatusDao {

    static final Logger logger = LoggerFactory.getLogger(JdsVprSyncStatusDao.class);
    private static final String UID_SYNC_STATUS_PREFIX = "urn:va:syncstatus:";
    public static final String SYNC_STATUS_PATIENT_INDEX = "status-pt";
    public static final String SYNC_STATUS_LOADING_INDEX = "status-loading";
    public static final String SYNC_STATUS_LOADED_INDEX = "status-loaded";
    
    private IPatientSelectDAO patientSelectDao;

    @Autowired
    public void setPatientSelectDao(IPatientSelectDAO patientSelectDao) {
        this.patientSelectDao = patientSelectDao;
    }

    public JdsVprSyncStatusDao(IGenericPOMObjectDAO genericDao, JdsOperations jdsTemplate) {
        super(SyncStatus.class, genericDao, jdsTemplate);
    }
    
    /**
     * Retrieve the patient's ICN based on this pid.
     * 
     * @param pid The pid for the patient.
     * @return The ICN for the patient if one exists.
     */
    private String findIcnByPid(String pid) {
        String icn = "";

        PatientSelect ptSelect = patientSelectDao.findOneByPid(pid);
        if ((ptSelect != null) && (NullChecker.isNotNullish(ptSelect.getIcn()))) {
            icn = ptSelect.getIcn();
        }
        
        return icn;
    }
    
    /**
     * A SyncStatus pid will be an ICN if the patient has an ICN - otherwise it will 
     * just be the normal site;dfn pid.
     * 
     * @param pid The pid for the patient (site;dfn)
     * @return The pid to use for sync status - ICN if it exists otherwise the pid itself.
     */
    private String convertPidToSyncStatusPid(String pid) {
        String syncStatusPid = pid;
        
        String icn = findIcnByPid(pid);
        if (NullChecker.isNotNullish(icn)) {
            syncStatusPid = icn;
        }
        
        return syncStatusPid;
    }

    /**
     * This method cleans up the pid and uid in the sync status.  This means that if it is
     * currently set to a site;dfn pid  and the patient has an ICN that we convert it to the icn.
     * 
     * @param syncStatus The syncStatus being checked.
     */
    private void cleanUpSyncStatusIds(SyncStatus syncStatus) {

        // We only do this if the sync status we are working with is a patient sync status.  We should skip
        // operational sync status records and just get out.
        //--------------------------------------------------------------------------------------------------
        if ((syncStatus != null) &&
            (SyncStatus.OPERATIONAL_DATA_STATUS_UID.equals(syncStatus.getUid()))) {
            return;
        }
        
        if ((syncStatus != null) && 
            (NullChecker.isNotNullish(syncStatus.getPid())) &&
            (syncStatus.getPid().contains(";"))) {
            String syncStatusPid = convertPidToSyncStatusPid(syncStatus.getPid());
            syncStatus.setData("pid", syncStatusPid);
            syncStatus.setData("uid", UID_SYNC_STATUS_PREFIX + syncStatusPid.replaceAll(";","\\:"));
        }
    }

    @Override
    public synchronized SyncStatus findOneByPid(String pid) {
        logger.debug("findOneByPid: Entered method.  pid: " + pid);
        SyncStatus stat = null;
        
        // See if the patient has an ICN - if so, then use the ICN to retrieve the status
        //---------------------------------------------------------------------------------
        String syncStatusPid = convertPidToSyncStatusPid(pid);
        logger.debug("findOneByPid: Using syncStatusPid: " + syncStatusPid + " for retriving SyncStatus.");
        stat = getGenericDao().findOneByIndexAndRange(SyncStatus.class, SYNC_STATUS_PATIENT_INDEX, syncStatusPid);
        logger.debug(LoggingUtil.outputSyncStatus("findOneByPid: Retrieved sync status by syncStatusPid: " + syncStatusPid + "; pid: " + pid + "; SyncStatus: ", stat));
        
        return stat;
    }

    @Override
    public int countLoadingPatients() {
        return getGenericDao().count(SYNC_STATUS_LOADING_INDEX);
    }

    @Override
    public int countLoadedPatients() {
        return getGenericDao().count(SYNC_STATUS_LOADED_INDEX);
    }

    @Override
    public synchronized SyncStatus findOneForOperational() {
        logger.debug("findOneForOperational: Entered method.");
        return getGenericDao().findByUID(SyncStatus.class, SyncStatus.OPERATIONAL_DATA_STATUS_UID);
    }

    @Override
    public List<SyncStatus> findAllLoadingPatientStatii() {
        return getGenericDao().findAllByIndex(SyncStatus.class, SYNC_STATUS_LOADING_INDEX);
    }

    @Override
    public List<SyncStatus> findAllPatientStatii() {
        return getGenericDao().findAllByIndex(SyncStatus.class, SYNC_STATUS_PATIENT_INDEX);
    }    

    @Override
    public Page<SyncStatus> findAllPatientStatii(Pageable pageable) {
        return getGenericDao().findAllByIndex(SyncStatus.class, SYNC_STATUS_PATIENT_INDEX, pageable);
    }

    @Override
    public List<String> listLoadingPatientIds() {
        List<String> rslt = new ArrayList<>();
        for(SyncStatus stat: findAllLoadingPatientStatii()) {
            rslt.add(stat.getPid());
        }
        return rslt;
    }

    @Override
    public synchronized void delete(SyncStatus stat) {
        logger.debug("delete (syncStatus): Entered method.");
        super.delete(stat);
    }
    
    @Override
    public synchronized void delete(String pid, String vistaId) {
        logger.debug("delete(pid, vistaId): Entered method with pid: " + pid + "; vistaId: " + vistaId);
        
        String syncStatusPid = convertPidToSyncStatusPid(pid);
        logger.debug("delete: Using syncStatusPid: " + syncStatusPid + " for deleting SyncStatus info.");
        SyncStatus stat = this.findOneByPid(syncStatusPid);
        if (stat != null) {
            logger.debug(LoggingUtil.outputSyncStatus("Retrieved sync status for syncStatusPid: " + syncStatusPid + ": ", stat));
            VistaAccountSyncStatus siteSyncStatus = stat.getVistaAccountSyncStatusForSystemId(vistaId);
            if (siteSyncStatus != null) {
                stat.getSyncStatusByVistaSystemId().remove(vistaId);
                stat = this.save(stat);
                logger.debug(LoggingUtil.outputSyncStatus("Status after save: ", stat));
            }
            else {
                logger.debug("VistaId: " + vistaId + " was not in the sync status.  Nothing to change.");
            }
        }
    }

    @Override
    public synchronized SyncStatus save(SyncStatus syncStatus) {
        logger.debug(LoggingUtil.outputSyncStatus("save: Entered method.", syncStatus));
        
        // Need to fix the pid and uid if it is using the pid rather than the icn.
        //------------------------------------------------------------------------
        cleanUpSyncStatusIds(syncStatus);
        logger.debug(LoggingUtil.outputSyncStatus("save: After cleaning up IDs  SyncStatus: ", syncStatus));
        return super.save(syncStatus);
    }

    /**
     * This method will take the given sync status and merge it with the status that is stored in the database.  
     * 
     * @param syncStatus The sync status to be merged with the one on disk.
     * @return The sync status that was stored.
     */
    @Override
    public synchronized SyncStatus saveMergeSyncStatus(SyncStatus syncStatus) {
        SyncStatus responseSyncStatus = null;
        logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Entered method. Saving Sync Status: ", syncStatus));
        
        // Is this operational data?
        //---------------------------
        if ((syncStatus != null) && (SyncStatus.OPERATIONAL_DATA_STATUS_UID.equals(syncStatus.getUid()))) {
            SyncStatus originalSyncStatus = this.findOneForOperational();
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Original Operational Sync Status: ", originalSyncStatus));
            SyncStatus mergedSyncStatus = SyncUtils.mergeOperationalSyncStatus(originalSyncStatus, syncStatus);
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Merged Operational Sync Status: ", mergedSyncStatus));
            responseSyncStatus = this.save(mergedSyncStatus);
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Saved Operational Sync Status: ", responseSyncStatus));
        }
        else if ((syncStatus != null) && (NullChecker.isNotNullish(syncStatus.getUid())) && (syncStatus.getUid().startsWith(UID_SYNC_STATUS_PREFIX))) {
            cleanUpSyncStatusIds(syncStatus);
            String pid = syncStatus.getUid().substring(UID_SYNC_STATUS_PREFIX.length());
            SyncStatus originalSyncStatus = this.findOneByPid(pid);
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Original Patient Sync Status for pid: " + pid + ": ", originalSyncStatus));
            SyncStatus mergedSyncStatus = SyncUtils.mergePatientSyncStatus(originalSyncStatus, syncStatus);
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Merged Patient Sync Status for pid: " + pid + ": ", mergedSyncStatus));
            responseSyncStatus = this.save(mergedSyncStatus);
            logger.debug(LoggingUtil.outputSyncStatus("saveMergeSyncStatus: Saved Patient Sync Status for pid: " + pid + ": ", responseSyncStatus));
        }
        else {
            logger.error(LoggingUtil.outputSyncStatus("saveMergeSyncStatus:  Received an invalid sync status.", syncStatus));
        }

        return responseSyncStatus;
    }
}
