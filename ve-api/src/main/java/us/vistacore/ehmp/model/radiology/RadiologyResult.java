package us.vistacore.ehmp.model.radiology;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the data for a single radiology radsList retrieved from Vista.
 * @author josephg
 *
 */
public class RadiologyResult {
    private String uid;
    private String summary;
    private String pid;
    private String kind;
    private String localId;
    private String facilityCode;
    private String facilityName;
    private String typeName;
    private String dateTime;
    private String category;
    private String imagingTypeUid;
    private String locationUid;
    private String hasImages;
    private String imageLocation;
    private String statusName;
    private String name;
    private String locationName;

    @SerializedName("case")
    private String caseId;

    private List<Providers> providers;
    private List<Results> results;
    private String verified;
    private List<Diagnosis> diagnosis;
    private String orderUid;
    private String orderName;
    private String interpretation;
    private String encounterUid;
    private String encounterName;

    /**
     * @return the uid
     */
    public String getUid() {
        return uid;
    }

    /**
     * @param uid the uid to set
     */
    public void setUid(String uid) {
        this.uid = uid;
    }

    /**
     * @return the summary
     */
    public String getSummary() {
        return summary;
    }

    /**
     * @param summary the summary to set
     */
    public void setSummary(String summary) {
        this.summary = summary;
    }

    /**
     * @return the pid
     */
    public String getPid() {
        return pid;
    }

    /**
     * @param pid the pid to set
     */
    public void setPid(String pid) {
        this.pid = pid;
    }

    /**
     * @return the kind
     */
    public String getKind() {
        return kind;
    }

    /**
     * @param kind the kind to set
     */
    public void setKind(String kind) {
        this.kind = kind;
    }

    /**
     * @return the localId
     */
    public String getLocalId() {
        return localId;
    }

    /**
     * @param localId the localId to set
     */
    public void setLocalId(String localId) {
        this.localId = localId;
    }

    /**
     * @return the facilityCode
     */
    public String getFacilityCode() {
        return facilityCode;
    }

    /**
     * @param facilityCode the facilityCode to set
     */
    public void setFacilityCode(String facilityCode) {
        this.facilityCode = facilityCode;
    }

    /**
     * @return the facilityName
     */
    public String getFacilityName() {
        return facilityName;
    }

    /**
     * @param facilityName the facilityName to set
     */
    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    /**
     * @return the typeName
     */
    public String getTypeName() {
        return typeName;
    }

    /**
     * @param typeName the typeName to set
     */
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    /**
     * @return the dateTime
     */
    public String getDateTime() {
        return dateTime;
    }

    /**
     * @param dateTime the dateTime to set
     */
    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * @return the encounterUid
     */
    public String getEncounterUid() {
        return encounterUid;
    }

    /**
     * @param encounterUid the encounterUid to set
     */
    public void setEncounterUid(String encounterUid) {
        this.encounterUid = encounterUid;
    }

    /**
     * @return the provider
     */
    public List<Providers> getProviders() {
        return providers;
    }

    /**
     * @param providers the providers to add
     */
    public void addProviders(Providers providers) {
        if (this.providers == null) {
            this.providers = new ArrayList<Providers>();
        }
        this.providers.add(providers);
    }

    /**
     * @return the results
     */
    public List<Results> getResults() {
        return results;
    }

    /**
     * @param results the results to set
     */
    public void addResults(Results results) {
        if (this.results != null) {
            this.results = new ArrayList<Results>();
        }
        this.results.add(results);
    }

    /**
     * @return the imagingTypeUid
     */
    public String getImagingTypeUid() {
        return imagingTypeUid;
    }

    /**
     * @param imagingTypeUid the imagingTypeUid to set
     */
    public void setImagingTypeUid(String imagingTypeUid) {
        this.imagingTypeUid = imagingTypeUid;
    }

    /**
     * @return the locationUid
     */
    public String getLocationUid() {
        return locationUid;
    }

    /**
     * @param locationUid the locationUid to set
     */
    public void setLocationUid(String locationUid) {
        this.locationUid = locationUid;
    }

    /**
     * @return the hasImages
     */
    public String getHasImages() {
        return hasImages;
    }

    /**
     * @param hasImages the hasImages to set
     */
    public void setHasImages(String hasImages) {
        this.hasImages = hasImages;
    }

    /**
     * @return the imageLocation
     */
    public String getImageLocation() {
        return imageLocation;
    }

    /**
     * @param imageLocation the imageLocation to set
     */
    public void setImageLocation(String imageLocation) {
        this.imageLocation = imageLocation;
    }

    /**
     * @return the verified
     */
    public String getVerified() {
        return verified;
    }

    /**
     * @param verified the verified to set
     */
    public void setVerified(String verified) {
        this.verified = verified;
    }

    /**
     * @return the statusName
     */
    public String getStatusName() {
        return statusName;
    }

    /**
     * @param statusName the statusName to set
     */
    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the diagnosis
     */
    public List<Diagnosis> getDiagnosis() {
        return diagnosis;
    }

    /**
     * @param diagnosis the diagnosis to set
     */
    public void addDiagnosis(Diagnosis diagnosis) {
        if (this.diagnosis != null) {
            this.diagnosis = new ArrayList<Diagnosis>();
        }
        this.diagnosis.add(diagnosis);
    }

    /**
     * @return the locationName
     */
    public String getLocationName() {
        return locationName;
    }

    /**
     * @param locationName the locationName to set
     */
    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    /**
     * @return the caseId
     */
    public String getCaseId() {
        return caseId;
    }

    /**
     * @param caseId the caseId to set
     */
    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    /**
     * @return the orderUid
     */
    public String getOrderUid() {
        return orderUid;
    }

    /**
     * @param orderUid the orderUid to set
     */
    public void setOrderUid(String orderUid) {
        this.orderUid = orderUid;
    }

    /**
     * @return the orderName
     */
    public String getOrderName() {
        return orderName;
    }

    /**
     * @param orderName the orderName to set
     */
    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }

    /**
     * @return the interpretation
     */
    public String getInterpretation() {
        return interpretation;
    }

    /**
     * @param interpretation the interpretation to set
     */
    public void setInterpretation(String interpretation) {
        this.interpretation = interpretation;
    }

    /**
     * @return the encounterName
     */
    public String getEncounterName() {
        return encounterName;
    }

    /**
     * @param encounterName the encounterName to set
     */
    public void setEncounterName(String encounterName) {
        this.encounterName = encounterName;
    }
}
