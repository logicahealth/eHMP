package us.vistacore.ehmp.authentication;

public class User {
    private String accessCode;
    private String verifyCode;
    private String siteCode;
    private String divisionCode;
    private String cprsCorTabAccess = "false";
    private String cprsRptTabAccess = "false";

    public User(String accessCode, String verifyCode, String siteCode, String divisionCode) {
        this.accessCode = accessCode;
        this.verifyCode = verifyCode;
        this.siteCode = siteCode;
        this.divisionCode = divisionCode;
    }

    public User(String accessCode, String verifyCode, String siteCode, String divisionCode, String cprsCorTabAccess, String cprsRptTabAccess) {
        this.accessCode = accessCode;
        this.verifyCode = verifyCode;
        this.siteCode = siteCode;
        this.divisionCode = divisionCode;
        this.cprsCorTabAccess = cprsCorTabAccess;
        this.cprsRptTabAccess = cprsRptTabAccess;
    }
    
    public String getHmpUser() {
    	return siteCode + ";" + divisionCode;
    }
    
    public String getHmpPassword() {
    	return accessCode + ";" + verifyCode;
    }
    
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
    
    public String getDivisionCode() {
        return divisionCode;
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

	@Override
	public String toString() {
		return "User [accessCode=" + accessCode + ", verifyCode=" + verifyCode
				+ ", siteCode=" + siteCode + ", divisionCode=" + divisionCode
				+ ", hmpUser=" + this.getHmpUser() + ", hmpPassword=" + this.getHmpPassword()
				+ ", cprsCorTabAccess=" + cprsCorTabAccess
				+ ", cprsRptTabAccess=" + cprsRptTabAccess + "]";
	}

}
