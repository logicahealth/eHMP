package us.vistacore.ehmp.model.radiology;

public class Diagnosis {

    private String code;
    private String primary;

    public Diagnosis() {}

    public Diagnosis(String code, String primary) {
        this.code = code;
        this.primary = primary;
    }

    /**
     * @return the code
     */
    public String getCode() {
        return code;
    }

    /**
     * @param code the code to set
     */
    public void setCode(String code) {
        this.code = code;
    }

    /**
     * @return the primary
     */
    public String getPrimary() {
        return primary;
    }

    /**
     * @param primary the primary to set
     */
    public void setPrimary(String primary) {
        this.primary = primary;
    }

}
