package us.vistacore.ehmp.domain;

import java.io.Serializable;

/**
 * This class encapsulates all of the information necessary to
 * identify a distinct patient on a particular VistA location.
 * Note that although it might not be strictly needed, this
 * class also maintains the Enterprise Patient Identifier to enable better tracking
 * of MVI to VistA requests through the system.
 */
public class VistaPatientIdentity implements Serializable {
    private static final long serialVersionUID = 1L;

    private String enterprisePatientIdentifier;
    private String siteCode;
    private String localId;

    /**
     * Default constructor. All values are set to null
     */
    public VistaPatientIdentity() {
        this(null, null, null);
    }

    /**
     *
     * @param enterprisePatientIdentifier The system-wide unique ID of a patient
     * @param siteCode A particular VistA location
     * @param localId A patient's local identifier value unique within the siteCode
     */
    public VistaPatientIdentity(String enterprisePatientIdentifier, String siteCode, String localId) {
        super();
        this.enterprisePatientIdentifier = enterprisePatientIdentifier;
        this.siteCode = siteCode;
        this.localId = localId;
    }

    public String getEnterprisePatientIdentifier() {
        return enterprisePatientIdentifier;
    }

    public void setEnterprisePatientIdentifier(String enterprisePatientIdentifier) {
        this.enterprisePatientIdentifier = enterprisePatientIdentifier;
    }

    public String getSiteCode() {
        return siteCode;
    }

    public void setSiteCode(String siteCode) {
        this.siteCode = siteCode;
    }

    public String getLocalId() {
        return localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((enterprisePatientIdentifier == null) ? 0 : enterprisePatientIdentifier.hashCode());
        result = prime * result + ((localId == null) ? 0 : localId.hashCode());
        result = prime * result
                + ((siteCode == null) ? 0 : siteCode.hashCode());
        return result;
    }

    /**
     * This method will only return true if all three fields
     * from this VistaPatientId match the corresponding fields
     * on the object being tested.
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        VistaPatientIdentity other = (VistaPatientIdentity) obj;
        if (enterprisePatientIdentifier == null) {
            if (other.enterprisePatientIdentifier != null) {
                return false;
            }
        } else if (!enterprisePatientIdentifier.equals(other.enterprisePatientIdentifier)) {
            return false;
        }
        if (localId == null) {
            if (other.localId != null) {
                return false;
            }
        } else if (!localId.equals(other.localId)) {
            return false;
        }
        if (siteCode == null) {
            if (other.siteCode != null) {
                return false;
            }
        } else if (!siteCode.equals(other.siteCode)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "VistaPatientIdentity [enterprisePatientIdentifier=" + enterprisePatientIdentifier + ", siteCode="
                + siteCode + ", localId=" + localId + "]";
    }
}
