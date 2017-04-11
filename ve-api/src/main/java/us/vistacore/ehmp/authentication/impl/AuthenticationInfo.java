package us.vistacore.ehmp.authentication.impl;

import us.vistacore.ehmp.authentication.User;

public class AuthenticationInfo {
    private long timestamp;
    private final User user;

    public AuthenticationInfo(User user) {
        this.user = user;
        this.timestamp = System.currentTimeMillis();
    }

    public User getUser() {
        return user;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public synchronized void touch() {
        timestamp = System.currentTimeMillis();
    }

    public static String key(String accessCode, String siteCode) {
        return accessCode + "|" + siteCode;
    }

    public String key() {
        return key(user.getAccessCode(), user.getSiteCode());
    }

    @Override
    public String toString() {
        return "AuthenticationInfo [timestamp=" + timestamp + ", user=" + user.toString()
                + "]";
    }
}
