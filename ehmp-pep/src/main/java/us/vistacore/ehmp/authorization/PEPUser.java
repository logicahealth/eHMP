package us.vistacore.ehmp.authorization;

public class PEPUser {

    private String accessCode;
    private String verifyCode;
    private String siteCode;
    private String cprsCorTabAccess = "false";
    private String cprsRptTabAccess = "false";

    public String getAccessCode() {
        return accessCode;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    public String getSiteCode() {
        return siteCode;
    }

    public void setSiteCode(String siteCode) {
        this.siteCode = siteCode;
    }

    public String getCprsCorTabAccess() {
        return cprsCorTabAccess;
    }

    public void setCprsCorTabAccess(String cprsCorTabAccess) {
        this.cprsCorTabAccess = cprsCorTabAccess;
    }

    public String getCprsRptTabAccess() {
        return cprsRptTabAccess;
    }

    public void setCprsRptTabAccess(String cprsRptTabAccess) {
        this.cprsRptTabAccess = cprsRptTabAccess;
    }

}
