package us.vistacore.ehmp.model.vitals;

import us.vistacore.ehmp.model.TerminologyCode;

import java.util.ArrayList;
import java.util.List;

/**
 * This represents one vitals event data that will be received from VistA.
 *
 * @author Les.Westberg
 *
 */
public class Vitals {

    private String sourceVistaSite;
    private String facilityCode;
    private String facilityName;
    private String high;
    private String kind;
    private String localId;
    private String locationCode;
    private String locationName;
    private String low;
    private String observed;
    private String result;
    private String resulted;
    private String summary;
    private String typeCode;
    private String typeName;
    private String uid;
    private String units;
    private List<NamedVuid> qualifiers;
    private List<TerminologyCode> codes;


    /**
     * Default constructor.
     */
    public Vitals() {
        super();
    }

    /**
     * Return the SourceVistaSite value.
     *
     * @return The SourceVistaSite value.
     */
    public String getSourceVistaSite() {
        return sourceVistaSite;
    }

    /**
     * Set the SourceVistaSite value.
     *
     * @param sourceVistaSite The SourceVistaSite value.
     */
    public void setSourceVistaSite(String sourceVistaSite) {
        this.sourceVistaSite = sourceVistaSite;
    }

    /**
     * Return the FacilityCode value.
     *
     * @return The FacilityCode value.
     */
    public String getFacilityCode() {
        return facilityCode;
    }

    /**
     * Set the FacilityCode value.
     *
     * @param facilityCode The FacilityCode value.
     */
    public void setFacilityCode(String facilityCode) {
        this.facilityCode = facilityCode;
    }

    /**
     * Return the FacilityName value.
     *
     * @return The FacilityName value.
     */
    public String getFacilityName() {
        return facilityName;
    }

    /**
     * Set the FacilityName value.
     *
     * @param facilityName The FacilityName value.
     */
    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    /**
     * Return the High value.
     *
     * @return The High value.
     */
    public String getHigh() {
        return high;
    }

    /**
     * Set the High value.
     *
     * @param high The High value.
     */
    public void setHigh(String high) {
        this.high = high;
    }

    /**
     * Return the Kind value.
     *
     * @return The Kind value.
     */
    public String getKind() {
        return kind;
    }

    /**
     * Set the Kind value.
     *
     * @param kind The Kind value.
     */
    public void setKind(String kind) {
        this.kind = kind;
    }

    /**
     * Return the LocalId value.
     *
     * @return The LocalId value.
     */
    public String getLocalId() {
        return localId;
    }

    /**
     * Set the LocalId value.
     *
     * @param localId The LocalId value.
     */
    public void setLocalId(String localId) {
        this.localId = localId;
    }

    /**
     * Return the LocationCode value.
     *
     * @return The LocationCode value.
     */
    public String getLocationCode() {
        return locationCode;
    }

    /**
     * Set the LocationCode value.
     *
     * @param locationCode The LocationCode value.
     */
    public void setLocationCode(String locationCode) {
        this.locationCode = locationCode;
    }

    /**
     * Return the LocationName value.
     *
     * @return The LocationName value.
     */
    public String getLocationName() {
        return locationName;
    }

    /**
     * Set the LocationName value.
     *
     * @param locationName The LocationName value.
     */
    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    /**
     * Return the Low value.
     *
     * @return The Low value.
     */
    public String getLow() {
        return low;
    }

    /**
     * Set the Low value.
     *
     * @param low The Low value.
     */
    public void setLow(String low) {
        this.low = low;
    }

    /**
     * Return the Observed value.
     *
     * @return The Observed value.
     */
    public String getObserved() {
        return observed;
    }

    /**
     * Set the Observed value.
     *
     * @param observed The Observed value.
     */
    public void setObserved(String observed) {
        this.observed = observed;
    }

    /**
     * Return the Result value.
     *
     * @return The Result value.
     */
    public String getResult() {
        return result;
    }

    /**
     * Set the Result value.
     *
     * @param result The Result value.
     */
    public void setResult(String result) {
        this.result = result;
    }

    /**
     * Return the Resulted value.
     *
     * @return The Resulted value.
     */
    public String getResulted() {
        return resulted;
    }

    /**
     * Set the Resulted value.
     *
     * @param resulted The Resulted value.
     */
    public void setResulted(String resulted) {
        this.resulted = resulted;
    }

    /**
     * Return the Summary value.
     *
     * @return The Summary value.
     */
    public String getSummary() {
        return summary;
    }

    /**
     * Set the Summary value.
     *
     * @param summary The Summary value.
     */
    public void setSummary(String summary) {
        this.summary = summary;
    }

    /**
     * Return the TypeCode value.
     *
     * @return The TypeCode value.
     */
    public String getTypeCode() {
        return typeCode;
    }

    /**
     * Set the TypeCode value.
     *
     * @param typeCode The TypeCode value.
     */
    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }

    /**
     * Return the TypeName value.
     *
     * @return The TypeName value.
     */
    public String getTypeName() {
        return typeName;
    }

    /**
     * Set the TypeName value.
     *
     * @param typeName The TypeName value.
     */
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    /**
     * Return the Uid value.
     *
     * @return The Uid value.
     */
    public String getUid() {
        return uid;
    }

    /**
     * Set the Uid value.
     *
     * @param uid The Uid value.
     */
    public void setUid(String uid) {
        this.uid = uid;
    }

    /**
     * Return the Units value.
     *
     * @return The Units value.
     */
    public String getUnits() {
        return units;
    }

    /**
     * Set the Units value.
     *
     * @param units The Units value.
     */
    public void setUnits(String units) {
        this.units = units;
    }

    public List<NamedVuid> getQualifiers() {
        return qualifiers;
    }

    public void setQualifiers(List<NamedVuid> qualifiers) {
        this.qualifiers = qualifiers;
    }

    public static class NamedVuid {
        private String name;
        private String vuid;

        public NamedVuid(String name, String vuid) {
            this.name = name;
            this.vuid = vuid;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getVuid() {
            return vuid;
        }

        public void setVuid(String vuid) {
            this.vuid = vuid;
        }
    }

    /**
     * Add code to the list of codes.
     * @param code The code to be added to the list.
     */
    public void addCodes(TerminologyCode code) {
        if (codes == null) {
            codes = new ArrayList<TerminologyCode>();
        }
        codes.add(code);
    }

    /**
     * Set the codes list to be the given code list.
     * @param codesList The code list to be set.
     */
    public void setCodesList(List<TerminologyCode> codesList) {
        this.codes = codesList;
    }

    /**
     * Retrieve the list of codes.
     * @return The list of codes
     */
    public List<TerminologyCode> getCodesList() {
        return codes;
    }

}
