package us.vistacore.ehmp.model.demographics;

public class PatientAlert  {
    private String title;
    private String description;
    private String frameID;
    private boolean severe;
    private String kind = "ALERT";

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getKind() {
        return kind;
    }

    public boolean isSevere() {
        return severe;
    }

    public String getFrameID() {
        return this.frameID;
    }

}
