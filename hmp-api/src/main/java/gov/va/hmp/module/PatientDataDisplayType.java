package gov.va.hmp.module;

public enum PatientDataDisplayType {
    SINGLE("Single Patient"),
    MULTIPLE("Multi-Patient"),
    NONE("Other");

    private String displayName;

    private PatientDataDisplayType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
