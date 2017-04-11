package us.vistacore.aps;

import com.google.common.base.Objects;

public class VistaConfiguration {

    private String host;
    private String port;
    private String hashCode;
    private String siteCode;
    private String divisionCode;

    private String name;

    public VistaConfiguration(String name, String host, String port, String hashCode, String siteCode, String divisionCode) {
        this.hashCode = hashCode;
        this.siteCode = siteCode;
        this.divisionCode = divisionCode;
        this.port = port;
        this.host = host;
        this.name = name;
    }

    public VistaConfiguration() { }

    public String getHashCode() {
        return hashCode;
    }

    public void setHashCode(String hashCode) {
        this.hashCode = hashCode;
    }

    public String getSiteCode() {
        return siteCode;
    }

    public void setSiteCode(String sitecode) {
        this.siteCode = sitecode;
    }
    
    public String getDivisionCode() {
        return divisionCode;
    }

    public void setDivisionCode(String divisionCode) {
        this.divisionCode = divisionCode;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("host", this.host)
                .add("port", this.port)
                .add("hashCode", this.hashCode)
                .add("siteCode", this.siteCode)
                .add("divisionCode",  this.divisionCode)
                .toString();
    }

}
