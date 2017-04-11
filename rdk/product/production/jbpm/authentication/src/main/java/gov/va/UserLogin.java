package gov.va;

import java.io.Serializable;

public class UserLogin implements Serializable {
	
	private static final long serialVersionUID = -8619643185096928288L;
	protected String accessCode;
	protected String verifyCode;
	protected String site;
	
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
	public String getSite() {
		return site;
	}
	public void setSite(String site) {
		this.site = site;
	}
}
