package us.vistacore.ehmp.model.radiology;

public class Results {

    private String uid;
    private String summary;
    private String localTitle;

    public Results(String uid, String summary, String localTitle) {
        this.uid = uid;
        this.summary = summary;
        this.localTitle = localTitle;
    }

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
     * @return the localTitle
     */
    public String getLocalTitle() {
        return localTitle;
    }

    /**
     * @param localTitle the localTitle to set
     */
    public void setLocalTitle(String localTitle) {
        this.localTitle = localTitle;
    }
}

