package us.vistacore.ehmp.model.demographics;

public class PatientDisability {

    private Long id;
    private Long version;
    private String name;
    private boolean serviceConnected;
    private int disPercent;

    public Long getId() {
        return id;
    }

    public Long getVersion() {
        return version;
    }

    public String getName() {
        return name;
    }

    public boolean isServiceConnected() {
        return serviceConnected;
    }

    public int getDisPercent() {
        return disPercent;
    }

}
