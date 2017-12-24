package us.vistacore.vxsync.config;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SecurityConfiguration {

	@JsonProperty
	public void setKeystore(String keystore) {
		if(keystore != null && !keystore.equals("")) {
			System.setProperty("javax.net.ssl.keyStore", keystore);
		}
	}

	@JsonProperty
	public void setTruststore(String truststore) {
		if(truststore != null && !truststore.equals("")) {
			System.setProperty("javax.net.ssl.trustStore", truststore);
		}
	}

	@JsonProperty
	public void setKsPassword(String ksPassword) {
		if(ksPassword != null && !ksPassword.equals("")) {
			System.setProperty("javax.net.ssl.keyStorePassword", ksPassword);
		}
	}

	@JsonProperty
	public void setTsPassword(String tsPassword) {
		if(tsPassword != null && !tsPassword.equals("")) {
			System.setProperty("javax.net.ssl.trustStorePassword", tsPassword);
		}
	}

}
