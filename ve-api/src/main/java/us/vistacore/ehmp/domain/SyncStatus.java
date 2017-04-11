package us.vistacore.ehmp.domain;

import java.util.HashMap;
import java.util.Map;

/**
 * Class copied and simplified from gov.va.cpe.vpr.sync.SyncStatus
 */
public class SyncStatus {

    public static final String OPERATIONAL_DATA_STATUS_UID = "urn:va:syncstatus:OPD";

    private String pid;
    private Map<String, VistaAccountSyncStatus> syncStatusByVistaSystemId;

    private boolean forOperational;
    private boolean syncOperationalComplete;
    private VistaAccountSyncStatus operationalSyncStatus;

    public boolean getSyncCompleteForSystemId(String systemId) {
        return syncStatusByVistaSystemId.get(systemId).isSyncComplete();
    }

    public void setSyncComplete(String systemId, boolean syncComplete) {
        syncStatusByVistaSystemId.get(systemId).setSyncComplete(syncComplete);
    }

    public void setDomainExpectedTotals(String systemId, Map<String, Map<String, Integer>> domainExpectedTotals) {
        syncStatusByVistaSystemId.get(systemId).setDomainExpectedTotals(domainExpectedTotals);
    }

    public boolean getForOperational() {
        return pid == null;
    }

    public Map<String, VistaAccountSyncStatus> getSyncStatusByVistaSystemId() {
        return syncStatusByVistaSystemId;
    }

    public String getUid() {
        if (forOperational) {
            return OPERATIONAL_DATA_STATUS_UID;
        } else {
            return (getPid() == null ? null : "urn:va:syncstatus:" + getPid().replaceAll(";","\\:"));
        }
    }

    public void setForOperational(boolean b) {
        forOperational = b;
        operationalSyncStatus = new VistaAccountSyncStatus();
    }

    public String getPid() {
        return pid;
    }

    public VistaAccountSyncStatus getOperationalSyncStatus() {
        return operationalSyncStatus;
    }

    public boolean getSyncOperationalComplete() {
        return syncOperationalComplete;
    }

    public boolean getSyncComplete() {
        if (forOperational || this.syncStatusByVistaSystemId == null) {
            return syncOperationalComplete;
        }
        for (VistaAccountSyncStatus stat : this.syncStatusByVistaSystemId.values()) {
            if (!stat.isSyncComplete()) {
                return false;
            }
        }
        return true;
    }

    public Map<String, Integer> getDomainExpectedTotalsForAllSystemIds() {
        if (syncStatusByVistaSystemId == null) {
            return null;
        }
        Map<String, Integer> rslt = new HashMap<>();
        for (VistaAccountSyncStatus stat: syncStatusByVistaSystemId.values()) {
            for (String domain: stat.getDomainExpectedTotals().keySet()) {
                Integer current = rslt.get(domain);
                rslt.put(domain, (current == null ? 0 : current) + stat.getDomainExpectedTotals().get(domain).get("total"));
            }
        }
        return rslt;
    }

    public Map<String, Integer> getDomainActualTotalsForAllSystemIds() {
        if (syncStatusByVistaSystemId == null) {
            return null;
        }
        Map<String, Integer> rslt = new HashMap<>();
        for (VistaAccountSyncStatus stat: syncStatusByVistaSystemId.values()) {
            for (String domain: stat.getDomainExpectedTotals().keySet()) {
                Integer current = rslt.get(domain);
                rslt.put(domain, (current == null ? 0 : current) + stat.getDomainExpectedTotals().get(domain).get("count"));
            }
        }
        return rslt;
    }

    public VistaAccountSyncStatus getVistaAccountSyncStatusForSystemId(String vistaId) {
        return syncStatusByVistaSystemId.get(vistaId);
    }

    public static class VistaAccountSyncStatus {
        private String patientUid;

        public void setSyncComplete(boolean syncComplete) {
            this.syncComplete = syncComplete;
        }

        public void setPatientUid(String patientUid) {
            this.patientUid = patientUid;
        }

        public void setDfn(String dfn) {
            this.dfn = dfn;
        }

        public void setDomainExpectedTotals(Map<String, Map<String, Integer>> domainExpectedTotals) {
            this.domainExpectedTotals = domainExpectedTotals;
        }

        private String dfn;
        private Map<String, Map<String, Integer>> domainExpectedTotals = new HashMap<>();

        public Map<String, Map<String, Integer>> getDomainExpectedTotals() {
            return domainExpectedTotals;
        }

        private boolean syncComplete = false;

        public String getPatientUid() {
            return patientUid;
        }

        public boolean isSyncComplete() {
            return syncComplete;
        }

        public String getDfn() {
            return dfn;
        }
    }
}
