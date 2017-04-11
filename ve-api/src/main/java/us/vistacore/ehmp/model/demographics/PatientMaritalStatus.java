package us.vistacore.ehmp.model.demographics;


public class PatientMaritalStatus {

    private String code;
    private String name;
    private String fromDate;
    private String thruDate;

    public String getFromDate() {
        return fromDate;
    }

    public String getThruDate() {
        return thruDate;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String toString() {
        return getName();
    }
}
