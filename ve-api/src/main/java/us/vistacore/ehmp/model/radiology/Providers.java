package us.vistacore.ehmp.model.radiology;

public class Providers {

    private String summary;
    private String providerName;
    private String providerDisplayName;
    private String providerUid;

    public Providers() {}

    public Providers(String summary, String providerName, String providerDisplayName, String providerUid) {
        this.summary = summary;
        this.providerName = providerName;
        this.providerDisplayName = providerDisplayName;
        this.providerUid = providerUid;
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
     * @return the providerName
     */
    public String getProviderName() {
        return providerName;
    }

    /**
     * @param providerName the providerName to set
     */
    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    /**
     * @return the providerDisplayName
     */
    public String getProviderDisplayName() {
        return providerDisplayName;
    }

    /**
     * @param providerDisplayName the providerDisplayName to set
     */
    public void setProviderDisplayName(String providerDisplayName) {
        this.providerDisplayName = providerDisplayName;
    }

    /**
     * @return the providerUid
     */
    public String getProviderUid() {
        return providerUid;
    }

    /**
     * @param providerUid the providerUid to set
     */
    public void setProviderUid(String providerUid) {
        this.providerUid = providerUid;
    }

}
