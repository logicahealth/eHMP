package us.vistacore.ehmp.authorization;

public class AuthorizationAttributes {
    private long timestamp;
    private final String sensitive;
    private final String mayAccess;
    private final String logAccess;
    private final String patientId;
    private final String breakGlassText;

    public AuthorizationAttributes(String patientId, String sensitive, String mayAccess, String logAccess, String breakGlassText) {
        this.patientId = patientId;
        this.sensitive = sensitive;
        this.mayAccess = mayAccess;
        this.logAccess = logAccess;
        this.breakGlassText = breakGlassText;
        this.timestamp = System.currentTimeMillis();
    }

    public String getBreakGlassText() {
        return breakGlassText;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getSensitive() {
        return sensitive;
    }

    public String getMayAccess() {
        return mayAccess;
    }

    public String getLogAccess() {
        return logAccess;
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

    public static String key(String patientId) {
        return patientId;
    }

    public String key() {
        return key(this.patientId);
    }

    @Override
    public String toString() {
        return "AuthorizationAttributes [timestamp=" + timestamp + ", sensitive=" + sensitive + ", mayAccess=" + mayAccess + ", logAccess=" + logAccess + ", patientId=" + patientId + "]";
    }

}
