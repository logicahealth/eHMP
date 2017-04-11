package us.vistacore.ehmp.authentication.impl;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VDSConfiguration {
    @JsonProperty
    private String url;

    @JsonProperty
    private String serviceName;

    @JsonProperty
    private String serviceNamespace;

    @JsonProperty
    private int authenticationCacheCapacity;

    @JsonProperty
    private int authenticationCacheMaxAgeSeconds;

    public VDSConfiguration(String url, String serviceName, String serviceNamespace, int authenticationCacheCapacity, int authenticationCacheMaxAgeSeconds) {
        this.url = url;
        this.serviceName = serviceName;
        this.serviceNamespace = serviceNamespace;
        this.authenticationCacheCapacity = authenticationCacheCapacity;
        this.authenticationCacheMaxAgeSeconds = authenticationCacheMaxAgeSeconds;
    }

    public VDSConfiguration() {
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceNamespace() {
        return serviceNamespace;
    }

    public void setServiceNamespace(String serviceNamespace) {
        this.serviceNamespace = serviceNamespace;
    }

    public int getAuthenticationCacheCapacity() {
        return authenticationCacheCapacity;
    }

    public void setAuthenticationCacheCapacity(int authenticationCacheCapacity) {
        this.authenticationCacheCapacity = authenticationCacheCapacity;
    }

    public int getAuthenticationCacheMaxAgeSeconds() {
        return authenticationCacheMaxAgeSeconds;
    }

    public void setAuthenticationCacheMaxAgeSeconds(int authenticationCacheMaxAgeSeconds) {
        this.authenticationCacheMaxAgeSeconds = authenticationCacheMaxAgeSeconds;
    }

    @Override
    public String toString() {
        return "VDSConfiguration [url=" + url + ", serviceName=" + serviceName + ", serviceNamespace="
                + serviceNamespace + ", authenticationCacheCapacity=" + authenticationCacheCapacity
                + ", authenticationCacheMaxAgeSeconds=" + authenticationCacheMaxAgeSeconds + "]";
    }
}
