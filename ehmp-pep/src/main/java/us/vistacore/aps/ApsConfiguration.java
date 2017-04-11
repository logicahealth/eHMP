package us.vistacore.aps;

import com.google.common.base.Objects;

public class ApsConfiguration {

    private String host;
    private String port;
    private String userDelimiter;
    private String authentCacheCapacity;
    private String authentCacheMaxAge;
    private String username;
    private String password;

    public ApsConfiguration() { }

    public ApsConfiguration(String host, String port, String authentCacheCapacity, String authentCacheMaxAge, String userDelimiter, String username, String password) {
        this.host = host;
        this.port = port;
        this.authentCacheCapacity = authentCacheCapacity;
        this.authentCacheMaxAge = authentCacheMaxAge;
        this.userDelimiter = userDelimiter;
        this.username = username;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getAuthentCacheCapacity() {
        return authentCacheCapacity;
    }

    public void setAuthentCacheCapacity(String authentCacheCapacity) {
        this.authentCacheCapacity = authentCacheCapacity;
    }

    public String getAuthentCacheMaxAge() {
        return authentCacheMaxAge;
    }

    public void setAuthentCacheMaxAge(String authentCacheMaxAge) {
        this.authentCacheMaxAge = authentCacheMaxAge;
    }

    public String getUserDelimiter() {
        return userDelimiter;
    }

    public void setUserDelimiter(String userDelimiter) {
        this.userDelimiter = userDelimiter;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("host", host == null ? "null" : host)
                .add("port", port == null ? "null" : port)
                .add("authentCacheCapacity", authentCacheCapacity == null ? "null" : authentCacheCapacity)
                .add("authentCacheMaxAge", authentCacheMaxAge == null ? "null" : authentCacheMaxAge)
                .add("userDelimiter", userDelimiter == null ? "null" : userDelimiter)
                .add("username", username == null ? "null" : username)
                .add("password", password == null ? "null" : password)
                .toString();
    }
}
