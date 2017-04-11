package us.vistacore.ehmp.model.demographics;

public class PatientFacility implements Comparable<PatientFacility> {

    private String code;
    private String name;
    private String systemId;
    private String localPatientId;
    private String earliestDate;
    private String latestDate;
    private boolean homeSite;

    public int compareTo(PatientFacility pf) {
        return code.compareTo(pf.getCode());
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getSystemId() {
        return systemId;
    }

    public String getLocalPatientId() {
        return localPatientId;
    }

    public String getEarliestDate() {
        return earliestDate;
    }

    public String getLatestDate() {
        return latestDate;
    }

    public boolean isHomeSite() {
        return homeSite;
    }

    public String toString() {
        return name;
    }

}
