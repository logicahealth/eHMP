package us.vistacore.ehmp.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

public class HmpConfiguration {

    @JsonProperty
    private String host;

    @JsonProperty
    private String port;

    public HmpConfiguration() { }

    public HmpConfiguration(String host, String port) {
        this.host = host;
        this.port = port;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setPort(String port) {
        this.port = port;
    }
    
    public String getHost() {
        return host;
    }

    public String getPort() {
        return port;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("host", host)
                .add("port", port)
                .toString();
    }

}
